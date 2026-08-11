/**
 * Verifies that the seed migration files still reproduce the database.
 *
 *   npm run check:seed-drift
 *
 * This exists because the drift already happened once: transcribing the seed
 * into apply_migration silently substituted ASCII for typographic characters,
 * and the committed migration stopped reproducing the live data. A migration
 * file that no longer reproduces the database is worse than no file, because
 * it gets trusted.
 *
 * Parses the `strings(key, context, en, ar)` VALUES tuples out of the seed SQL
 * and compares them field by field against `ui_strings` + `translations`.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { supabaseServer } from "@/lib/supabase/server";
import type { Locale } from "@/lib/content/types";

const SEED_FILES = [
  "supabase/migrations/0003_seed_site_chrome.sql",
  "supabase/migrations/0005_seed_footer_link_labels.sql",
  "supabase/migrations/0009_seed_consent_and_privacy_copy.sql",
  "supabase/migrations/0012_seed_stub_and_page_strings.sql",
];
const CORRECTIONS = [
  "supabase/migrations/0006_arabic_review_corrections.sql",
  "supabase/migrations/0011_arabic_privacy_copy_corrections.sql",
];

type Expected = { key: string; en: string; ar: string };

/** Split a SQL VALUES tuple into its single-quoted fields. */
function parseTuple(line: string): string[] | null {
  const fields: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] !== "'") {
      i++;
      continue;
    }
    i++;
    let value = "";
    while (i < line.length) {
      if (line[i] === "'" && line[i + 1] === "'") {
        value += "'";
        i += 2;
        continue;
      }
      if (line[i] === "'") {
        i++;
        break;
      }
      value += line[i];
      i++;
    }
    fields.push(value);
  }
  /*
   * Return whatever was found; callers decide how many fields they need.
   * This used to require 4, which silently discarded every 2-field correction
   * tuple — so the corrections files were parsed into nothing and the check
   * only passed because the base seed had been edited directly. A checker that
   * quietly skips its own input is worse than no checker.
   */
  return fields.length > 0 ? fields : null;
}

/**
 * Extract the `strings(key, context, en, ar)` tuples from a seed file.
 *
 * Tuples may span several lines — 0009 wraps long copy — so the block is
 * joined before matching rather than parsed line by line. A line-based parser
 * silently skipped the wrapped tuples and reported them as missing from the
 * migrations, which is a false positive that would erode trust in this check.
 */
async function parseSeed(file: string): Promise<Expected[]> {
  const sql = await readFile(path.join(process.cwd(), file), "utf8");
  const out: Expected[] = [];

  const start = sql.indexOf("with strings(key, context, en, ar) as (values");
  if (start === -1) return out;

  const rest = sql.slice(start);
  const end = rest.search(/^\)\s*,?\s*upsert_keys/m);
  const block = end === -1 ? rest : rest.slice(0, end);

  // Strip comment lines so a commented-out tuple is not picked up.
  const cleaned = block
    .split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .join("\n");

  // A tuple is four single-quoted SQL strings ('' escapes a quote) in parens.
  const q = "'(?:[^']|'')*'";
  const tupleRe = new RegExp(`\\(\\s*${q}\\s*,\\s*${q}\\s*,\\s*${q}\\s*,\\s*${q}\\s*\\)`, "g");

  for (const match of cleaned.matchAll(tupleRe)) {
    const fields = parseTuple(match[0]);
    if (!fields || fields.length < 4) continue;
    const [key, , en, ar] = fields;
    out.push({ key, en, ar });
  }

  return out;
}

/** Later corrections override the base seed's Arabic. */
async function parseCorrections(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const file of CORRECTIONS) await parseOneCorrection(file, map);
  return map;
}

async function parseOneCorrection(file: string, map: Map<string, string>): Promise<void> {
  const sql = await readFile(path.join(process.cwd(), file), "utf8");
  let inBlock = false;

  for (const raw of sql.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("--")) continue;
    if (/^from \(values/.test(line)) {
      inBlock = true;
      continue;
    }
    if (!inBlock) continue;
    if (/^\) as v/.test(line)) {
      inBlock = false;
      continue;
    }
    const fields = parseTuple(line);
    if (fields && fields.length >= 2) map.set(fields[0], fields[1]);
  }
}

async function main() {
  const expected = new Map<string, Expected>();
  for (const file of SEED_FILES) {
    for (const row of await parseSeed(file)) expected.set(row.key, row);
  }

  const corrections = await parseCorrections();
  for (const [key, ar] of corrections) {
    const row = expected.get(key);
    if (row) row.ar = ar;
  }

  const { data: keys, error } = await supabaseServer
    .from("ui_strings")
    .select("id, key");
  if (error) throw new Error(error.message);

  const { data: rows, error: tErr } = await supabaseServer
    .from("translations")
    .select("entity_id, locale, value")
    .eq("entity_type", "ui_string")
    .eq("field", "label")
    .in("entity_id", (keys ?? []).map((k) => k.id));
  if (tErr) throw new Error(tErr.message);

  const actual = new Map<string, Partial<Record<Locale, string>>>();
  const idToKey = new Map((keys ?? []).map((k) => [k.id, k.key]));
  for (const row of rows ?? []) {
    const key = idToKey.get(row.entity_id);
    if (!key) continue;
    const entry = actual.get(key) ?? {};
    entry[row.locale] = row.value;
    actual.set(key, entry);
  }

  const problems: string[] = [];

  for (const [key, exp] of expected) {
    const got = actual.get(key);
    if (!got) {
      problems.push(`${key}: in migration files but NOT in the database`);
      continue;
    }
    if (got.en !== exp.en) {
      problems.push(`${key} [en]\n    file: ${JSON.stringify(exp.en)}\n    db:   ${JSON.stringify(got.en)}`);
    }
    if (got.ar !== exp.ar) {
      problems.push(`${key} [ar]\n    file: ${JSON.stringify(exp.ar)}\n    db:   ${JSON.stringify(got.ar)}`);
    }
  }

  for (const key of actual.keys()) {
    if (!expected.has(key)) {
      problems.push(`${key}: in the database but NOT in any migration file — a rebuild would lose it`);
    }
  }

  console.log(`Parsed ${expected.size} strings from migrations, ${actual.size} in the database.`);

  if (problems.length === 0) {
    console.log("No drift. The migration files reproduce the database.\n");
    process.exit(0);
  }

  console.error(`\n${problems.length} drift problem(s):\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error("");
  process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
