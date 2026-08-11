/**
 * Writes docs/ui-strings-review.md from the live database.
 *
 *   npm run export:ui-strings
 *
 * Generated rather than hand-written on purpose: transcribing these by hand is
 * how the typographic drift between the seed migration and the database got in
 * (see supabase/migrations/README.md). Re-run after applying corrections and
 * the document is true again.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { supabaseServer } from "@/lib/supabase/server";
import { DEFAULT_LOCALE, type Locale } from "@/lib/content/types";

const OUT = path.join(process.cwd(), "docs", "ui-strings-review.md");

/**
 * Review notes. Maintained by hand — update or delete entries as they are
 * resolved. Keyed by ui_strings.key.
 */
const NOTES: Record<string, string> = {
  objective: "**Collision** — same Arabic as `target`",
  target: "**Collision** — same Arabic as `objective`",
  outcome: "**Collision** — same Arabic as `result`",
  result: "**Collision** — same Arabic as `outcome`",
  redacted_notice: "**NDA translated** — convention says it stays Latin",
  form_sending: "**Length** — button grows mid-interaction vs `form_submit`",
  form_email: "**Length** — 3.4× English",
  status_achieved: "Register — verb, not adjective",
  status_missed: "Register — verb, not adjective",
  status_projected: "**Register** — reads 'expected'; carries decision-007 weight",
  status_not_measurable: "Length — longest of the three status pills",
  reflection: "**Register** — reads contemplative/devotional",
  skip_to_content: "Register — imperative with a diacritic, unusual in UI",
  case_file: "Register — reads clinical/legal in Arabic",
  read_linear: "Length — 20 → 27",
  lang_en: "By design — labelled in its own script in both locales",
  lang_ar: "By design — labelled in its own script in both locales",
  linkedin: "Brand name — stays Latin in Arabic",
};

const PREAMBLE = `# docs/ui-strings-review.md — Arabic UI String Review

> **Generated** by \`npm run export:ui-strings\` from the live database.
> Do not hand-edit: apply corrections to the database, then regenerate.
> Sent for review 2026-08-11.

Every interface word on the site. No component may contain a user-facing
literal — these are the strings they resolve instead (rule 1).

**Register target:** modern professional Arabic — the tone of a well-made Gulf
banking product. Not classical/newspaper, not casual.

**Convention:** technical and brand terms (Governance, Compliance, OTP, OCR,
RTL, KYC, NDA, LinkedIn) stay in English inside Arabic text rather than being
forced into Arabic equivalents.

---

## Flagged before review

### Collisions — two English concepts on one Arabic word

| Arabic | Used for | Why it matters |
|---|---|---|
| \`الهدف\` | \`target\` (Target) **and** \`objective\` (Objective) | They collide in the same place: Results Table columns are Target/Outcome, chapter beats are Objective/Result |
| \`النتيجة\` | \`outcome\` (Outcome) **and** \`result\` (Result) | Same — an Arabic reader sees the same two words in two different structures |

### Convention breach

\`redacted_notice\` translates **NDA** to "اتفاقية سرية". By the convention above
it should stay Latin: \`محجوب بموجب NDA\`.

### Length risk

Character count is a rough proxy for Arabic — treat these as "measure it",
not "it's broken".

| Key | English | Arabic | Note |
|---|---|---|---|
| \`form_submit\` → \`form_sending\` | 4 → 8 | 5 → 13 | Worst case: the **same button** resizes mid-interaction |
| \`form_email\` | 5 | 17 | Largest ratio, 3.4× |
| status pills | 6–14 | 5–15 | Vary 3× **against each other** in one table column |
| \`read_linear\` | 20 | 27 | |
| \`redacted_notice\` | 18 | 24 | |
| \`home\` | 4 | 8 | |
| \`error_cta\` | 9 | 13 | |

### Register — where I was unsure, most doubt first

1. \`reflection\` → **تأمّل** — reads contemplative, almost devotional. You want a
   professional retrospective. Consider "مراجعة" or "خلاصة".
2. \`status_projected\` → **متوقّع** — reads "expected", which quietly over-claims
   versus "projected/forecast". Carries decision-007 weight. Consider
   "مُستهدَف" or "تقديري".
3. \`status_achieved\` / \`status_missed\` → **تحقّق / لم يتحقّق** are verbs; a status
   chip usually reads better as an adjective: محقَّق / غير محقَّق.
4. \`skip_to_content\` → **تخطَّ إلى المحتوى** — imperative carrying a diacritic,
   unusual in UI chrome. Consider "انتقل إلى المحتوى".
5. \`case_file\` → **ملف حالة** — reads clinical/legal, closer to a patient or
   court file than a design case study.

### Not bugs

\`lang_en\` is "English" and \`lang_ar\` is "العربية" in **both** locales — each
language is labelled in its own script so the switch is legible whichever
locale you are in.

---

## The strings
`;

async function main() {
  const { data: keys, error: keysError } = await supabaseServer
    .from("ui_strings")
    .select("id, key")
    .order("key");

  if (keysError) throw new Error(`Failed to load ui_strings: ${keysError.message}`);

  const ids = (keys ?? []).map((k) => k.id);
  const { data: rows, error: rowsError } = await supabaseServer
    .from("translations")
    .select("entity_id, locale, value")
    .eq("entity_type", "ui_string")
    .eq("field", "label")
    .in("entity_id", ids);

  if (rowsError) throw new Error(`Failed to load translations: ${rowsError.message}`);

  const byEntity = new Map<string, Partial<Record<Locale, string>>>();
  for (const row of rows ?? []) {
    const entry = byEntity.get(row.entity_id) ?? {};
    entry[row.locale] = row.value;
    byEntity.set(row.entity_id, entry);
  }

  // Escape pipes so a string containing "|" cannot break the table.
  const cell = (value: string | undefined) =>
    value === undefined ? "—" : value.replace(/\|/g, "\\|");

  const lines: string[] = [
    "| key | English | Arabic | Flag |",
    "|---|---|---|---|",
  ];

  let missing = 0;
  for (const { id, key } of keys ?? []) {
    const t = byEntity.get(id) ?? {};
    if (!t.ar || !t.en) missing++;
    lines.push(
      `| \`${key}\` | ${cell(t.en)} | ${cell(t.ar)} | ${NOTES[key] ?? ""} |`,
    );
  }

  const total = (keys ?? []).length;
  const footer = [
    "",
    "---",
    "",
    `**${total} strings.** ${
      missing === 0
        ? "Every one present in both locales."
        : `⚠️ ${missing} missing a locale — the English fallback (decision 013) covers them, but they should be completed.`
    }`,
    "",
    "To apply corrections: update the database, then re-run",
    "`npm run export:ui-strings` so this document stays true. The seed migration",
    "`supabase/migrations/0003_seed_site_chrome.sql` must be updated to match, or",
    "a rebuild from scratch will reintroduce the old strings.",
    "",
  ];

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, PREAMBLE + "\n" + lines.join("\n") + footer.join("\n"), "utf8");

  console.log(`Wrote ${OUT}`);
  console.log(`${total} strings, ${missing} incomplete.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
