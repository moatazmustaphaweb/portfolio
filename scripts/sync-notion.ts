/**
 * Notion → Supabase sync. Task 0.4, per docs/sync-contract.md.
 *
 *   npm run sync:notion -- --dry-run     report every create/update/skip, write nothing
 *   npm run sync:notion                  apply
 *   npm run sync:notion -- --all         include layers beyond MVP-1
 *
 * Requires NOTION_API_KEY. The classification and parsing rules live in
 * lib/sync/classify.ts and are covered by `npm run test:sync`, which needs no
 * credentials — run that first if you change behaviour.
 *
 * FAILURE POLICY (contract): a missing status marker or an unparseable title
 * aborts THAT entity and reports it. The rest of the sync continues. Partial or
 * guessed data is never written. Deletions are never propagated.
 */

import { Client, isFullPage } from "@notionhq/client";

import {
  classifyTitle,
  findEmptyMvpRows,
  findRouteCollisions,
  findStatusContradictions,
  parseDecisionHeading,
  OUTCOME_STATUSES,
  parseStatusItem,
  routeToSlug,
  selectItemLines,
  TARGET_STATUSES,
  type EntityKind,
} from "@/lib/sync/classify";
import {
  normalizeTitle,
  parseEntryHandle,
  parseSiblingLine,
  resolveHandleTarget,
  type ChapterRef,
} from "@/lib/sync/handles";
import {
  replaceEntryHandles,
  replaceSiblings,
  type HandleWrite,
  type SiblingWrite,
} from "@/lib/sync/write-handles";
/*
 * Imported lazily inside the write paths. A --dry-run writes nothing, so it
 * must not require the service-role key just to preview — and the top-level
 * import would otherwise throw about Supabase before the clearer message about
 * a missing NOTION_API_KEY ever printed.
 */
type SupabaseServer = typeof import("@/lib/supabase/server")["supabaseServer"];

let _db: SupabaseServer | null = null;
async function db(): Promise<SupabaseServer> {
  if (!_db) _db = (await import("@/lib/supabase/server")).supabaseServer;
  return _db;
}

const DATA_SOURCE_ID = "7a8ab2e1-08d1-4286-a4df-f2e87b85c219";

/** ASCII unit separator — cannot occur in Notion prose. */
const CELL_SEP = "\u001f";

const DRY_RUN = process.argv.includes("--dry-run");
const ALL_LAYERS = process.argv.includes("--all");

const notionKey = process.env.NOTION_API_KEY;
if (!notionKey) {
  console.error(
    "NOTION_API_KEY is not set.\n" +
      "Create an internal integration at notion.so/my-integrations, share the\n" +
      "'Portfolio — Pages & Content' database with it, and put the key in .env.local.",
  );
  process.exit(1);
}

const notion = new Client({ auth: notionKey });

/* ------------------------------------------------------------------ report */

type Row = {
  id: string;
  title: string;
  route: string | null;
  section: string | null;
  contentReady: string | null;
  inMvp: boolean;
  buildLayer: string | null;
  bilingual: string | null;
  order: number | null;
  kind: EntityKind;
  parent?: string;
};

const created: string[] = [];
const updated: string[] = [];
const skipped: string[] = [];
const failed: string[] = [];
const notices: string[] = [];
const allClaims: { text: string; status: string; source: string }[] = [];
const decisionReport: { chapter: string; en: number; ar: number; names: string[] }[] = [];

function fail(entity: string, reason: string) {
  failed.push(`${entity}: ${reason}`);
}

/**
 * Titles of rows outside MVP-1. Populated once scope is known.
 *
 * Reporting is gated on this rather than each call site remembering: a notice
 * about content deliberately parked for a later layer costs attention and buys
 * nothing, and `--all` puts those rows in front of every check. Failures are
 * NOT gated — if a parked row is genuinely being written and the write breaks,
 * that is still a broken write.
 */
const parkedTitles = new Set<string>();

function notice(rowTitle: string, message: string) {
  if (parkedTitles.has(rowTitle)) return;
  notices.push(message);
}

/* ------------------------------------------------------------ notion reads */

function plainText(prop: unknown): string | null {
  const p = prop as { type?: string; rich_text?: { plain_text: string }[]; title?: { plain_text: string }[] };
  if (p?.type === "title") return p.title?.map((t) => t.plain_text).join("") || null;
  if (p?.type === "rich_text") return p.rich_text?.map((t) => t.plain_text).join("") || null;
  return null;
}

function selectName(prop: unknown): string | null {
  const p = prop as { type?: string; select?: { name: string } | null; status?: { name: string } | null };
  if (p?.type === "select") return p.select?.name ?? null;
  if (p?.type === "status") return p.status?.name ?? null;
  return null;
}

function numberProp(prop: unknown): number | null {
  const p = prop as { type?: string; number?: number | null };
  return p?.type === "number" && typeof p.number === "number" ? p.number : null;
}

function checkbox(prop: unknown): boolean {
  const p = prop as { type?: string; checkbox?: boolean };
  return p?.type === "checkbox" ? Boolean(p.checkbox) : false;
}

/**
 * Turn a Notion API failure into a message that says what to actually do.
 *
 * "Bad key" and "key is fine but the database was never shared with the
 * integration" are the two common setup failures, and they look nearly
 * identical from the API — one is a 401, the other a 404 object_not_found.
 * The second is the one that costs an hour, because the token is obviously
 * valid and the natural conclusion is that the ID is wrong.
 */
function explainNotionError(err: unknown): string {
  const e = err as { code?: string; status?: number; message?: string };

  if (e?.code === "unauthorized" || e?.status === 401) {
    return (
      "Notion rejected the API key (401 unauthorized).\n" +
      "  The key itself is wrong, expired, or revoked.\n" +
      "  Fix: regenerate it at notion.so/my-integrations and update NOTION_API_KEY."
    );
  }

  if (e?.code === "object_not_found" || e?.status === 404) {
    return (
      "Notion authenticated the key, but cannot see the database (404 object_not_found).\n" +
      "  This almost always means the integration was created but never CONNECTED\n" +
      "  to the database — a separate step from creating the key.\n" +
      "  Fix: open 'Portfolio — Pages & Content' in Notion → ••• menu → Connections\n" +
      "       → add your integration. Then re-run.\n" +
      `  (Data source: ${DATA_SOURCE_ID})`
    );
  }

  if (e?.code === "restricted_resource" || e?.status === 403) {
    return (
      "Notion allowed the key but refused the operation (403 restricted_resource).\n" +
      "  The integration is connected but lacks read capability.\n" +
      "  Fix: notion.so/my-integrations → your integration → Capabilities → Read content."
    );
  }

  if (e?.code === "rate_limited" || e?.status === 429) {
    return "Notion rate-limited the sync (429). Wait a minute and re-run — the sync is idempotent.";
  }

  return `Notion request failed${e?.code ? ` (${e.code})` : ""}: ${e?.message ?? String(err)}`;
}

async function fetchRows(): Promise<Row[]> {
  const rows: Row[] = [];
  let cursor: string | undefined;

  do {
    let res;
    try {
      res = await notion.dataSources.query({
        data_source_id: DATA_SOURCE_ID,
        start_cursor: cursor,
        page_size: 100,
      });
    } catch (err) {
      throw new Error(explainNotionError(err));
    }

    for (const page of res.results) {
      if (!isFullPage(page)) continue;
      const props = page.properties as Record<string, unknown>;

      const title = plainText(props["Page"]) ?? "";
      const classification = classifyTitle(title);

      rows.push({
        id: page.id,
        title,
        route: plainText(props["Route"]),
        section: selectName(props["Section"]),
        contentReady: selectName(props["Content ready"]),
        inMvp: checkbox(props["In MVP-1"]),
        buildLayer: selectName(props["Build Layer"]),
        bilingual: selectName(props["Bilingual"]),
        order: numberProp(props["Order"]),
        kind: classification.kind,
        parent: classification.parent,
      });
    }

    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return rows;
}

/**
 * Read the rows of a Notion table block as `[cell, cell, …]` per row.
 * The header row is dropped.
 */
async function readTable(tableId: string): Promise<string[][]> {
  const rows: string[][] = [];
  const res = await notion.blocks.children.list({ block_id: tableId, page_size: 100 });

  for (const [i, block] of res.results.entries()) {
    const b = block as { type: string; table_row?: { cells: { plain_text: string }[][] } };
    if (b.type !== "table_row" || !b.table_row) continue;
    if (i === 0) continue; // header row
    const cells = b.table_row.cells.map((c) => c.map((t) => t.plain_text).join("").trim());
    if (cells.some((c) => c)) rows.push(cells);
  }
  return rows;
}

/**
 * Read a page body as a flat list of headings and the text under each.
 * Contract Step 3 maps headings to translation fields.
 *
 * Tables are captured separately from prose. Outcomes and targets in this
 * database are written as TABLES — label in one column, source note in
 * another — not as the bullet lists the contract assumed. A heading's loose
 * paragraphs are its prose; its table rows are its items.
 */
async function readBody(pageId: string): Promise<Map<string, string[]>> {
  const sections = new Map<string, string[]>();
  let current = "__intro__";
  let cursor: string | undefined;
  const tables = new Map<string, string[][]>();

  do {
    const res = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const block of res.results) {
      const b = block as {
        type: string;
        heading_1?: { rich_text: { plain_text: string }[] };
        heading_2?: { rich_text: { plain_text: string }[] };
        heading_3?: { rich_text: { plain_text: string }[] };
        paragraph?: { rich_text: { plain_text: string }[] };
        bulleted_list_item?: { rich_text: { plain_text: string }[] };
        numbered_list_item?: { rich_text: { plain_text: string }[] };
      };

      if ((b as { type: string }).type === "table") {
        const rows = await readTable((b as unknown as { id: string }).id);
        const existing = tables.get(current) ?? [];
        tables.set(current, [...existing, ...rows]);
        continue;
      }

      const heading =
        b.heading_1?.rich_text ?? b.heading_2?.rich_text ?? b.heading_3?.rich_text;
      if (heading) {
        const text = heading.map((t) => t.plain_text).join("");
        // The first H1 is the content title, not a section.
        if (b.heading_1 && !sections.has("__h1__")) {
          sections.set("__h1__", [text.trim()]);
        }
        // Decision headings keep their raw form — the name is part of the
        // heading and lowercasing would corrupt it.
        current = parseDecisionHeading(text) ? text.trim() : canonicalHeading(text);
        if (!sections.has(current)) sections.set(current, []);
        continue;
      }

      const text =
        b.paragraph?.rich_text ??
        b.bulleted_list_item?.rich_text ??
        b.numbered_list_item?.rich_text;
      if (!text) continue;

      const line = text.map((t) => t.plain_text).join("").trim();
      if (!line) continue;

      const list = sections.get(current) ?? [];
      list.push(line);
      sections.set(current, list);
    }

    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  /*
   * Table rows are stored under a "heading::table" key. Keeping them separate
   * from prose is what lets the outcomes parser use the table as the item list
   * and treat a loose summary sentence above it as prose — rather than reading
   * that sentence as an outcome, which is what it did before.
   */
  for (const [heading, rows] of tables) {
    sections.set(
      `${heading}::table`,
      // A unit separator, not a pipe: the cells must stay individually
      // recoverable, and a pipe can legitimately appear in prose.
      rows.map((cells) => cells.join(CELL_SEP)),
    );
  }

  return sections;
}

/**
 * Find the Arabic child page.
 *
 * The contract says the child is titled `العربية` (or `Arabic`) and the
 * matcher tested for exactly that. The live pages are titled
 * `النسخة العربية — الغلاف`, `النسخة العربية — النتائج` and so on, so nothing
 * matched and NO ARABIC SYNCED AT ALL — silently, because a missing Arabic
 * translation is indistinguishable from "not written yet" (decision 013 makes
 * that the normal state, which is exactly what hid this).
 *
 * Now matched by containment, which is robust to the trailing section name.
 */
async function findArabicChild(
  pageId: string,
): Promise<{ id: string; title: string } | null> {
  const res = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
  for (const block of res.results) {
    const b = block as { type: string; id: string; child_page?: { title: string } };
    if (b.type !== "child_page") continue;
    const raw = (b.child_page?.title ?? "").trim();
    const t = raw.toLowerCase();
    if (t.includes("العربية") || t.includes("arabic")) return { id: b.id, title: raw };
  }
  return null;
}

/**
 * The Arabic content title.
 *
 * Prefer an H1 inside the content. Where there is none, fall back to the Notion
 * page title with its scaffolding stripped — `النسخة العربية — الفصل الأول: X`
 * carries the real title after the colon, and using it beats falling back to
 * English (decision 013 would hide the gap as "not translated yet").
 */
function arabicTitleFrom(sections: ReadonlyMap<string, string[]>, pageTitle: string): string {
  const h1 = sections.get("__h1__")?.[0];
  if (h1) return h1;

  let t = pageTitle.replace(/^[\u{1F1E6}-\u{1F1FF}\p{Emoji}\s]+/u, "").trim();
  t = t.replace(/^النسخة العربية\s*[—–-]\s*/, "").trim();
  const colon = t.indexOf(":");
  if (colon !== -1) t = t.slice(colon + 1).trim();
  return t;
}

/* -------------------------------------------------------------- field maps */

/**
 * Arabic headings → the canonical English heading key.
 *
 * The Arabic child pages use Arabic headings (`## الأطروحة`, `## دوري`,
 * `## النتائج`), and the field map was English-only — so every Arabic heading
 * failed to match and NO Arabic prose synced at all. It failed silently
 * because decision 013 makes a missing Arabic translation the normal state,
 * which is precisely what disguised it.
 *
 * Normalised when the body is read, so everything downstream sees one key.
 */
const HEADING_SYNONYMS: Record<string, string> = {
  // Cover
  "الأطروحة": "thesis",
  "دوري": "role",
  "خلاصة": "reflection",
  "تأمّل": "reflection",
  "النتائج": "outcomes",
  // Chapter
  "الغاية": "objective",
  "الهدف": "objective",
  "السياق": "context",
  "القرار": "decision",
  "الدليل": "evidence",
  "النتيجة": "result",
  "المعالم": "milestone",
  "الخلاصة": "milestone",
};

function canonicalHeading(raw: string): string {
  const trimmed = raw.trim();
  return HEADING_SYNONYMS[trimmed] ?? trimmed.toLowerCase();
}

const CHAPTER_FIELDS: Record<string, string> = {
  objective: "objective",
  context: "context",
  decision: "decision",
  evidence: "evidence_note",
  result: "result",
  milestone: "milestone",
  close: "milestone",
};

const COVER_FIELDS: Record<string, string> = {
  thesis: "thesis",
  role: "role",
  // Covers are written with "My role", not "Role". The heading flexes.
  "my role": "role",
  reflection: "reflection",
  /*
   * "Status, honestly" is where a cover states plainly what it can and cannot
   * claim — Cervello's says it has no numbers. Mapped to `reflection` because
   * that is the cover's reflective field and it renders in the right place.
   *
   * Without this the section is simply absent, and a cover that has chosen to
   * state an honest absence instead shows nothing at all — which reads as an
   * oversight rather than the deliberate position it is.
   */
  "status, honestly": "reflection",
  "الحالة، بصراحة": "reflection",
};

/**
 * Decision blocks in document order: heading name + the prose beneath it.
 * `readBody` keys sections by canonical heading, so the raw heading is
 * preserved under `__headings__` to reconstruct order and names.
 */
function decisionsFromBody(
  sections: ReadonlyMap<string, string[]>,
): { name: string; body: string }[] {
  const out: { name: string; body: string }[] = [];
  for (const [heading, lines] of sections) {
    // "::table" keys hold a heading's table rows, not a separate section — they
    // would otherwise be counted as a second decision with a mangled name.
    if (heading.startsWith("__") || heading.endsWith("::table")) continue;
    const parsed = parseDecisionHeading(heading);
    if (!parsed) continue;
    out.push({ name: parsed.name, body: lines.join("\n\n").trim() });
  }
  return out;
}

function fieldsFromBody(
  sections: Map<string, string[]>,
  map: Record<string, string>,
  title: string,
): Record<string, string> {
  const fields: Record<string, string> = { title };
  for (const [heading, lines] of sections) {
    const field = map[heading];
    if (!field) continue;
    const value = lines.join("\n\n").trim();
    if (value) fields[field] = value;
  }
  return fields;
}

/* ------------------------------------------------------------------ writes */

async function upsertTranslations(
  entityType: string,
  entityId: string,
  locale: "en" | "ar",
  fields: Record<string, string>,
) {
  const rows = Object.entries(fields)
    .filter(([, v]) => v && v.trim())
    .map(([field, value]) => ({
      entity_type: entityType as never,
      entity_id: entityId,
      locale,
      field,
      value,
    }));
  if (rows.length === 0) return;

  const { error } = await (await db())
    .from("translations")
    .upsert(rows, { onConflict: "entity_type,entity_id,locale,field" });
  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------------------- main */

/**
 * Is this row part of MVP-1?
 *
 * The single definition of "in scope", used both to choose what to sync and —
 * more importantly — to decide what may be REPORTED. Two Notion fields carry
 * it, and either counts: the explicit `In MVP-1` checkbox, and a build layer
 * of `Layer 1 — MVP-1` for rows where the checkbox was never ticked.
 */
function isMvp(row: { buildLayer?: string | null; inMvp: boolean }): boolean {
  return row.buildLayer === "Layer 1 — MVP-1" || row.inMvp;
}

async function main() {
  console.log(
    `\nNotion → Supabase sync${DRY_RUN ? "  [DRY RUN — nothing will be written]" : ""}\n`,
  );

  const all = await fetchRows();
  const rows = ALL_LAYERS ? all : all.filter(isMvp);
  for (const r of all) if (!isMvp(r)) parkedTitles.add(r.title);

  console.log(`Read ${all.length} rows, ${rows.length} in scope.\n`);

  /* ---- Pre-flight: refuse to write into known-bad data ------------------ */

  /*
   * Checks run over MVP-1 only, whatever `--all` widened the SYNC to. A row
   * parked outside this release must not be able to report a problem against
   * a row that ships in it — that is attention spent on content nobody is
   * building.
   */
  const collisions = findRouteCollisions(
    rows
      .filter((r) => r.route)
      .map((r) => ({
        title: r.title,
        route: r.route!,
        kind: r.kind,
        inMvp: isMvp(r),
      })),
  );

  const collidingTitles = new Set<string>();
  if (collisions.size > 0) {
    console.log("ROUTE COLLISIONS — these rows will NOT be synced:\n");
    for (const [route, titles] of collisions) {
      console.log(`  ${route}`);
      for (const t of titles) {
        console.log(`    - ${t}`);
        collidingTitles.add(t);
      }
      fail(route, `claimed by ${titles.length} rows of the same kind`);
    }
    console.log(
      "\n  Two rows writing to one slug would overwrite each other, and which\n" +
        "  one wins depends on iteration order. Fix in Notion — see\n" +
        "  docs/sync-contract.md known issue 1.\n",
    );
  }

  const empties = findEmptyMvpRows(rows);  // kind is on Row, so skips are excluded
  if (empties.length > 0) {
    console.log("FLAGGED IN MVP-1 BUT NOT READY — synced as draft:\n");
    for (const e of empties) console.log(`  - ${e}`);
    console.log("");
  }

  /* ---- Pass 1: case files ---------------------------------------------- */

  const caseFileIdBySlug = new Map<string, string>();

  for (const row of rows) {
    if (row.kind !== "case_file" || collidingTitles.has(row.title)) continue;

    const { caseFile, error } = routeToSlug(row.route);
    if (error || !caseFile) {
      fail(row.title, error ?? "could not derive a slug from Route");
      continue;
    }

    const status = row.contentReady === "Done" ? "published" : "draft";

    if (DRY_RUN) {
      console.log(`  case_file  ${caseFile}  (${status})`);
      updated.push(`case_file ${caseFile}`);
      // Record it so chapter parent resolution below is simulated too. Without
      // this the dry run reports chapters as syncable when a real run would
      // fail them for a missing parent — the dry run would be lying.
      caseFileIdBySlug.set(caseFile, `dry-run:${caseFile}`);
      continue;
    }

    /*
     * `grammar`, `domain` and `nda` are NOT in Notion and are NOT managed by
     * this sync. They are structural and editorial: grammar picks the
     * LivingMap layout, domain drives the gallery filter, nda drives the
     * visual treatment.
     *
     * An upsert including them would reset every one on each run — which is
     * exactly what happened before: `domain` was being written as the Notion
     * Section ("work") for every case file, making the gallery filter useless.
     *
     * So: existing rows have only `status` updated. New rows get placeholders
     * and are reported, because a placeholder nobody is told about is a
     * placeholder that ships.
     */
    const { data: existing } = await (await db())
      .from("case_files").select("id").eq("slug", caseFile).maybeSingle();

    let data: { id: string } | null = existing ?? null;
    let dbError: { message: string } | null = null;

    if (existing) {
      const res = await (await db())
        .from("case_files")
        .update({ status: status as never })
        .eq("id", existing.id)
        .select("id")
        .single();
      data = res.data;
      dbError = res.error;
    } else {
      const res = await (await db())
        .from("case_files")
        .insert({
          slug: caseFile,
          grammar: "ecosystem",
          domain: "unsorted",
          status: status as never,
        })
        .select("id")
        .single();
      data = res.data;
      dbError = res.error;
      if (res.data) {
        notice(row.title,
          `${row.title}: new case file "${caseFile}" created with placeholder ` +
            "grammar=ecosystem and domain=unsorted. Both need setting — grammar " +
            "picks the LivingMap layout, domain drives the gallery filter.",
        );
      }
    }

    if (dbError || !data) {
      fail(row.title, dbError?.message ?? "upsert returned no row");
      continue;
    }

    caseFileIdBySlug.set(caseFile, data.id);
    updated.push(`case_file ${caseFile}`);

    const body = await readBody(row.id);
    await upsertTranslations(
      "case_file",
      data.id,
      "en",
      fieldsFromBody(body, COVER_FIELDS, row.title.replace(/^.*—\s*/, "")),
    );

    const arabic = await findArabicChild(row.id);
    if (arabic) {
      const arBody = await readBody(arabic.id);
      await upsertTranslations(
        "case_file",
        data.id,
        "ar",
        fieldsFromBody(arBody, COVER_FIELDS, arabicTitleFrom(arBody, arabic.title)),
      );
    }
  }

  /* ---- Pass 2: chapters ------------------------------------------------- */

  for (const row of rows) {
    /*
     * Comparison and Accessibility pages live under a case file and share the
     * chapter route shape, so they are stored as chapters with a `kind`
     * (amendment 033). They are excluded from the numbered narrative and the
     * linear view, but everything else about them is a chapter.
     */
    const isChapterLike =
      row.kind === "chapter" || row.kind === "comparison" || row.kind === "accessibility";
    if (!isChapterLike || collidingTitles.has(row.title)) continue;

    const { caseFile, slug, error } = routeToSlug(row.route);
    if (error || !caseFile || !slug) {
      fail(row.title, error ?? "could not derive a slug from Route");
      continue;
    }

    const parentId = caseFileIdBySlug.get(caseFile);
    if (!parentId) {
      fail(
        row.title,
        `parent case file "${caseFile}" was not synced — the chapter cannot be ` +
          "written without it. Usually a knock-on from a route collision above.",
      );
      continue;
    }

    if (DRY_RUN) {
      console.log(`  ${row.kind.padEnd(9)} ${caseFile}/${slug}`);
      updated.push(`chapter ${caseFile}/${slug}`);
      continue;
    }

    const { data, error: dbError } = await (await db())
      .from("chapters")
      .upsert(
        {
          case_file_id: parentId!,
          slug,
          // The Order property is the single source of truth for sequence.
          // Chapter numbers inside H1 headings and any implied ordering in
          // route names are incidental and deliberately ignored.
          sort_order: row.order ?? 0,
          kind: (row.kind === "chapter" ? "chapter" : row.kind) as never,
          status: (row.contentReady === "Done" ? "published" : "draft") as never,
        },
        { onConflict: "case_file_id,slug" },
      )
      .select("id")
      .single();

    if (dbError || !data) {
      fail(row.title, dbError?.message ?? "upsert returned no row");
      continue;
    }

    updated.push(`chapter ${caseFile}/${slug}`);

    const body = await readBody(row.id);
    await upsertTranslations(
      "chapter",
      data.id,
      "en",
      fieldsFromBody(body, CHAPTER_FIELDS, row.title.replace(/^.*\/\s*/, "")),
    );

    const arabic = await findArabicChild(row.id);
    let arDecisions: { name: string; body: string }[] = [];
    if (arabic) {
      const arBody = await readBody(arabic.id);
      await upsertTranslations(
        "chapter",
        data.id,
        "ar",
        fieldsFromBody(arBody, CHAPTER_FIELDS, arabicTitleFrom(arBody, arabic.title)),
      );
      arDecisions = decisionsFromBody(arBody);
    }

    /*
     * Decisions — an ORDERED LIST per chapter (amendment 032).
     *
     * Replaced wholesale, translations first: same polymorphic-orphan trap as
     * outcomes and targets.
     *
     * Arabic is paired BY POSITION, and only when the counts match. Where they
     * differ the Arabic is skipped and reported — egypt-acquisition/workflow
     * has one decision in English and three in Arabic because the Arabic
     * genuinely splits what the English combines, and pairing those by index
     * would attach the wrong Arabic to the wrong decision.
     */
    const enDecisions = decisionsFromBody(body);
    if (enDecisions.length > 0 || arDecisions.length > 0) {
      decisionReport.push({
        chapter: `${caseFile}/${slug}`,
        en: enDecisions.length,
        ar: arDecisions.length,
        names: enDecisions.map((d) => d.name),
      });
    }

    const { data: oldDecisions } = await (await db())
      .from("decisions").select("id").eq("chapter_id", data.id);
    if (oldDecisions && oldDecisions.length > 0) {
      await (await db()).from("translations").delete()
        .eq("entity_type", "decision").in("entity_id", oldDecisions.map((d) => d.id));
      await (await db()).from("decisions").delete().eq("chapter_id", data.id);
    }

    const pairArabic =
      arDecisions.length > 0 && arDecisions.length === enDecisions.length;
    if (arDecisions.length > 0 && !pairArabic) {
      notice(row.title,
        `${row.title}: ${enDecisions.length} decision(s) in English but ` +
          `${arDecisions.length} in Arabic. Arabic skipped — pairing by position ` +
          "across different counts would attach the wrong Arabic to the wrong decision.",
      );
    }

    for (const [i, d] of enDecisions.entries()) {
      const { data: dec } = await (await db())
        .from("decisions").insert({ chapter_id: data.id, sort_order: i })
        .select("id").single();
      if (!dec) continue;

      await upsertTranslations("decision", dec.id, "en", {
        name: d.name,
        ...(d.body ? { body: d.body } : {}),
      });

      if (pairArabic) {
        const ar = arDecisions[i];
        await upsertTranslations("decision", dec.id, "ar", {
          name: ar.name,
          ...(ar.body ? { body: ar.body } : {}),
        });
      }
    }

    /*
     * Features, per contract Step 3. Replaced wholesale, translations first —
     * same polymorphic-orphan trap as outcomes and targets.
     */
    const featureLines = body.get("features") ?? body.get("features::table") ?? [];
    const { data: oldFeatures } = await (await db())
      .from("features").select("id").eq("chapter_id", data.id);
    if (oldFeatures && oldFeatures.length > 0) {
      await (await db()).from("translations").delete()
        .eq("entity_type", "feature").in("entity_id", oldFeatures.map((f) => f.id));
      await (await db()).from("features").delete().eq("chapter_id", data.id);
    }
    for (const [i, line] of featureLines.entries()) {
      const label = line.split(CELL_SEP)[0]?.trim();
      if (!label) continue;
      const { data: feat } = await (await db())
        .from("features").insert({ chapter_id: data.id, sort_order: i }).select("id").single();
      if (feat) await upsertTranslations("feature", feat.id, "en", { label });
    }
  }

  /* ---- Pass 3: outcomes and targets — decision 007 ---------------------- */

  for (const row of rows) {
    if (collidingTitles.has(row.title)) continue;
    if (row.kind !== "case_file" && row.kind !== "targets") continue;

    const { caseFile } = routeToSlug(row.route);
    if (!caseFile) continue;

    const body = await readBody(row.id);
    const isTargets = row.kind === "targets";
    const selection = selectItemLines(body, isTargets);
    const lines = selection.lines;

    if (selection.source === "none") {
      /*
       * No table is often the correct, deliberate answer, and saying so is a
       * senior move rather than an omission.
       *
       *   Cervello  — "Status, honestly": the cloud version shipped, but the
       *               numbers belong to the customers who run it.
       *   Neobiz    — designed and internally validated, not built. It makes
       *               design claims only; any completion-time or conversion
       *               figure belongs to the Egypt web case file.
       *
       * Both state that on the cover, and a cover that declares its position
       * has answered the question. The notice fires only where there is
       * NEITHER a table NOR a statement — a silence that could equally mean
       * "a table exists under a heading we do not know", which is the case
       * worth catching. A check that fires on correct data gets ignored.
       */
      const declaresPosition = Boolean(
        body.get("reflection")?.length ||
          body.get("status, honestly")?.length ||
          body.get("why it matters anyway")?.length,
      );

      if (!declaresPosition) {
        notice(row.title,
          isTargets
            ? `${row.title}: no targets table and no statement about their absence. ` +
              "Either declare the limits in prose or add the table."
            : `${row.title}: no outcomes table under Outcomes/Results/النتائج, and ` +
              "no statement about the absence. Either state plainly that this case " +
              "file has no numbers, or check the table is under a known heading. " +
              "Its gallery card will show a title and no outcome line.",
        );
      }
      continue;
    }

    if (DRY_RUN) {
      console.log(
        `  ${isTargets ? "targets " : "outcomes"} source: ${selection.source} (${lines.length} rows)`,
      );
    }

    const allowed = isTargets ? TARGET_STATUSES : OUTCOME_STATUSES;
    const parsed: { label: string; status: string; note: string | null }[] = [];
    const badRows: string[] = [];
    let aborted = false;

    for (const line of lines) {
      /*
       * Table form: column 1 carries the label AND the status marker, column 2
       * is the note (contract Step 3). Splitting first matters — parsing the
       * joined row would fold the delimiter and the note into the label's
       * trailing text.
       *
       * Prose form (no separator present) still parses as `label [status] — note`.
       */
      const [labelCell, noteCell] = line.split(CELL_SEP);

      const item = parseStatusItem(labelCell, allowed);
      if (item instanceof Error) {
        /*
         * Collect EVERY bad row before aborting the entity, rather than
         * stopping at the first. Reporting one row at a time turns fixing a
         * table into a fix-resync-fix loop; one pass should say everything
         * that needs a marker.
         */
        badRows.push(item.message);
        aborted = true;
        continue;
      }

      /*
       * The note is not decoration. A figure marked [achieved] on prototype
       * evidence is defensible only because the note says so — the marker
       * records whether it happened, the note records how it is known.
       */
      parsed.push({
        ...item,
        note: (noteCell?.trim() || item.note) ?? null,
      });

      allClaims.push({ text: item.label, status: item.status, source: row.title });
    }
    if (aborted) {
      fail(
        `${row.title} → ${isTargets ? "targets" : "outcomes"}`,
        `${badRows.length} row(s) need a status marker:\n` +
          badRows.map((b) => `      - ${b}`).join("\n"),
      );
      continue;
    }

    if (DRY_RUN) {
      console.log(
        `  ${isTargets ? "targets " : "outcomes"} ${caseFile}: ${parsed
          .map((p) => `[${p.status}]`)
          .join(" ")}`,
      );
      continue;
    }

    const parentId = caseFileIdBySlug.get(caseFile);
    if (!parentId) {
      fail(row.title, `parent case file "${caseFile}" was not synced`);
      continue;
    }

    /*
     * Parse the Arabic table the same way, so the loop below can pair by
     * position. Status markers are read from the English table only — the
     * marker is the fact, and the Arabic side must not be able to disagree
     * with it.
     */
    const arabicItems: { label: string; note: string | null }[] = [];
    const arabic = await findArabicChild(row.id);
    if (arabic) {
      const arBody = await readBody(arabic.id);
      const arSelection = selectItemLines(arBody, isTargets);
      for (const arLine of arSelection.lines) {
        const [arLabelCell, arNoteCell] = arLine.split(CELL_SEP);
        // Strip any marker from the Arabic label; the status is English-side.
        const label = arLabelCell.replace(/\[[^\]]+\]/, "").trim();
        if (label) arabicItems.push({ label, note: arNoteCell?.trim() || null });
      }
      if (arabicItems.length > 0 && arabicItems.length !== parsed.length) {
        notice(row.title,
          `${row.title}: Arabic ${isTargets ? "targets" : "outcomes"} table has ` +
            `${arabicItems.length} rows but English has ${parsed.length}. Arabic skipped ` +
            "for the mismatched rows — pairing by position across different lengths " +
            "would attach the wrong note to the wrong figure.",
        );
        arabicItems.length = 0;
      }
    }

    const table = isTargets ? "targets" : "outcomes";
    /*
     * Replace wholesale: an outcome removed in Notion must disappear here, and
     * there is no stable key to match individual items on.
     *
     * The translations MUST go first. `translations` is polymorphic, so it has
     * no foreign key to cascade — deleting the rows alone orphans their
     * translations, and every re-sync then accumulates another dead set. That
     * happened on the second run: 11 targets became 22 entity_ids, half of them
     * pointing at rows that no longer exist.
     */
    const { data: doomed } = await (await db())
      .from(table)
      .select("id")
      .eq("case_file_id", parentId);

    if (doomed && doomed.length > 0) {
      await (await db())
        .from("translations")
        .delete()
        .eq("entity_type", isTargets ? "target" : "outcome")
        .in("entity_id", doomed.map((d) => d.id));
    }

    await (await db()).from(table).delete().eq("case_file_id", parentId);

    for (const [i, item] of parsed.entries()) {
      const insert = isTargets
        ? { case_file_id: parentId, status: item.status as never, sort_order: i }
        : {
            case_file_id: parentId,
            value: item.label,
            status: item.status as never,
            sort_order: i,
          };

      const { data, error: dbError } = await (await db())
        .from(table)
        .insert(insert as never)
        .select("id")
        .single();

      if (dbError || !data) {
        fail(row.title, dbError?.message ?? "insert returned no row");
        continue;
      }

      await upsertTranslations(
        isTargets ? "target" : "outcome",
        data.id,
        "en",
        isTargets
          ? { target: item.label, ...(item.note ? { note: item.note } : {}) }
          : { label: item.label, ...(item.note ? { note: item.note } : {}) },
      );

      /*
       * Arabic, matched by POSITION in the table. Outcomes and targets have no
       * stable key of their own, so row order is the only correspondence
       * available — which is why the Arabic table must have the same rows in
       * the same order as the English one.
       *
       * If the counts differ the Arabic is skipped for this entity and
       * reported: pairing row 3 of one table with row 3 of a differently
       * ordered table would silently attach the wrong note to the wrong figure.
       */
      const arItem = arabicItems[i];
      if (arItem) {
        await upsertTranslations(
          isTargets ? "target" : "outcome",
          data.id,
          "ar",
          isTargets
            ? { target: arItem.label, ...(arItem.note ? { note: arItem.note } : {}) }
            : { label: arItem.label, ...(arItem.note ? { note: arItem.note } : {}) },
        );
      }
    }
  }

  /* ---- Pass 4: entry handles and siblings (0017) ------------------------ */

  /*
   * Re-reads each cover's body rather than reusing Pass 3's copy. Pass 3 bails
   * out early for a cover with no outcomes table — which is Neobiz and
   * Cervello — and folding this in there would have silently skipped their
   * handles for a reason that has nothing to do with handles.
   */
  const caseFileTitles = new Map<string, string>();
  {
    const { data: titleRows } = await (await db())
      .from("translations")
      .select("entity_id, value")
      .eq("entity_type", "case_file")
      .eq("locale", "en")
      .eq("field", "title");
    const { data: cfRows } = await (await db()).from("case_files").select("id, slug");
    for (const t of titleRows ?? []) {
      const slug = (cfRows ?? []).find((c) => c.id === t.entity_id)?.slug;
      if (slug) caseFileTitles.set(normalizeTitle(t.value), slug);
    }
  }

  for (const row of rows) {
    if (collidingTitles.has(row.title)) continue;
    if (row.kind !== "case_file") continue;

    const { caseFile } = routeToSlug(row.route);
    if (!caseFile) continue;

    const { data: parent } = await (await db())
      .from("case_files")
      .select("id")
      .eq("slug", caseFile)
      .maybeSingle();
    if (!parent) continue;

    const body = await readBody(row.id);
    /*
     * No "Three ways in" block is not a gap and is not reported. Entry handles
     * are editorial: a cover without them is complete, and the living map
     * below lists every chapter regardless. Absence gets rendered, not flagged
     * — the same rule siblings follow.
     */
    const lines = body.get("three ways in") ?? body.get("ثلاث طرق للدخول") ?? [];
    if (lines.length === 0) continue;

    /* Chapters, for resolving each handle's pointer. */
    const { data: chapterRows } = await (await db())
      .from("chapters")
      .select("id, slug, sort_order, kind")
      .eq("case_file_id", parent.id);

    const chapterRefs: (ChapterRef & { id: string })[] = [];
    for (const ch of chapterRows ?? []) {
      const { data: t } = await (await db())
        .from("translations")
        .select("value")
        .eq("entity_type", "chapter")
        .eq("entity_id", ch.id)
        .eq("locale", "en")
        .eq("field", "title")
        .maybeSingle();
      chapterRefs.push({
        id: ch.id,
        slug: ch.slug,
        title: t?.value ?? "",
        sortOrder: ch.sort_order,
        isChapter: ch.kind === "chapter",
      });
    }

    const handles: HandleWrite[] = [];
    const unresolved: string[] = [];
    const siblings: SiblingWrite[] = [];
    const seenSiblings = new Set<string>();

    /*
     * Siblings are searched across the WHOLE cover, not just under the handles
     * heading. UAE happens to put its declaration there; Egypt and Neobiz put
     * theirs elsewhere on the page, and scanning one section found UAE's and
     * silently missed both of the others — a parser looking in one place and
     * reporting nothing about the places it did not look.
     */
    for (const section of body.values()) {
      for (const line of section) {
        const sib = parseSiblingLine(line);
        if (!sib) continue;

        for (const title of sib.titles) {
          const slug = caseFileTitles.get(normalizeTitle(title));
          if (!slug) {
            notice(
              row.title,
              `${row.title}: sibling "${title}" matches no case file. Not written — ` +
                "a link to nothing is a dead end.",
            );
            continue;
          }
          const { data: sibRow } = await (await db())
            .from("case_files")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();
          // The pair is unique in the schema; a title repeated across two
          // declarations is one link, not a constraint violation.
          if (sibRow && !seenSiblings.has(sibRow.id)) {
            seenSiblings.add(sibRow.id);
            siblings.push({ siblingId: sibRow.id, note: sib.note });
          }
        }
      }
    }

    for (const line of lines) {
      if (parseSiblingLine(line)) continue; // handled above

      const parsedHandle = parseEntryHandle(line);
      if (!parsedHandle) continue;

      const targetSlug = resolveHandleTarget(parsedHandle.pointer, chapterRefs);
      const target = chapterRefs.find((c) => c.slug === targetSlug);
      if (parsedHandle.pointer && !target) {
        unresolved.push(parsedHandle.pointer);
      }

      handles.push({
        invitation: parsedHandle.invitation,
        payoff: parsedHandle.payoff,
        targetChapterId: target?.id ?? null,
      });
    }

    /* Arabic, paired by position — same rule as outcomes. */
    const arabicHandles: { invitation: string; payoff: string }[] = [];
    const arabicChild = await findArabicChild(row.id);
    if (arabicChild) {
      const arBody = await readBody(arabicChild.id);
      const arLines =
        arBody.get("ثلاث طرق للدخول") ?? arBody.get("three ways in") ?? [];
      for (const line of arLines) {
        const h = parseEntryHandle(line);
        if (h) arabicHandles.push({ invitation: h.invitation, payoff: h.payoff });
      }
      if (arabicHandles.length > 0 && arabicHandles.length !== handles.length) {
        notice(row.title,
          `${row.title}: Arabic has ${arabicHandles.length} entry handle(s) to ` +
            `English's ${handles.length}. Arabic skipped — pairing by position ` +
            "would attach the wrong text to the wrong handle.",
        );
        arabicHandles.length = 0;
      }
    }

    if (unresolved.length > 0) {
      notice(row.title,
        `${row.title}: ${unresolved.length} entry handle pointer(s) name no ` +
          `chapter and render as text — ${unresolved.join(" · ")}`,
      );
    }

    if (DRY_RUN) {
      console.log(
        `  entry handles ${caseFile}: ${handles.length} (${
          handles.filter((h) => h.targetChapterId).length
        } linked), siblings: ${siblings.length}`,
      );
      continue;
    }

    const hRes = await replaceEntryHandles(
      (await db()) as never,
      upsertTranslations,
      parent.id,
      handles,
      arabicHandles,
    );
    if (hRes.error) fail(`${row.title} → entry handles`, hRes.error);

    const sRes = await replaceSiblings(
      (await db()) as never,
      upsertTranslations,
      parent.id,
      siblings,
    );
    if (sRes.error) fail(`${row.title} → siblings`, sRes.error);
  }

  /* ---- Decisions, features, and cross-page consistency ------------------ */

  if (allClaims.length > 0) {
    const contradictions = findStatusContradictions(allClaims);
    if (contradictions.length > 0) {
      console.log("\n⚠️  STATUS CONTRADICTIONS — the same claim, two answers:\n");
      for (const c of contradictions) {
        console.log(`  "${c.claim}"`);
        for (const v of c.conflicting) console.log(`    [${v.status}]  ${v.source}`);
        fail(
          `contradiction: "${c.claim.slice(0, 60)}"`,
          c.conflicting.map((v) => `[${v.status}] in ${v.source}`).join(" vs "),
        );
      }
      console.log("");
    }
  }

  if (decisionReport.length > 0) {
    console.log("\nDECISIONS FOUND (parsed, NOT written — schema change pending):\n");
    for (const d of decisionReport) {
      const flag = d.en !== d.ar && d.ar > 0 ? `  ⚠️ EN ${d.en} / AR ${d.ar}` : "";
      console.log(`  ${d.chapter}: ${d.en} en, ${d.ar} ar${flag}`);
      for (const n of d.names) console.log(`      · ${n}`);
    }
    console.log("");
  }

  /* ---- Skips, and gaps -------------------------------------------------- */

  for (const row of rows) {
    if (row.kind === "skip") {
      skipped.push(`${row.title} — ${classifyTitle(row.title).reason}`);
    }
  }

  /*
   * Static pages (Landing, About, Contact, 404, …) map to ui_strings scoped by
   * route per contract Step 1. NOT IMPLEMENTED yet — reported rather than
   * silently dropped, because a row that appears in neither the synced list nor
   * the skipped list looks like it worked.
   */
  const staticRows = rows.filter(
    (r) => r.kind === "static" || r.kind === "comparison" || r.kind === "accessibility",
  );

  console.log("\nSKIPPED — build tasks and derived pages:\n");
  for (const s of skipped) console.log(`  - ${s}`);

  if (staticRows.length > 0) {
    console.log("\nNOT YET IMPLEMENTED — static, comparison and accessibility pages:\n");
    for (const r of staticRows) {
      console.log(`  - ${r.title}  (${r.kind}, route ${r.route ?? "none"})`);
    }
    console.log(
      "\n  These map to ui_strings scoped by route (contract Step 1). Listed here\n" +
        "  so they are visibly absent rather than quietly missing.\n",
    );
  }

  /* ---- Summary ---------------------------------------------------------- */

  if (notices.length > 0) {
    console.log("\nNOTICES — not failures, but check them:\n");
    for (const n of notices) console.log(`  • ${n}`);
  }

  console.log("\n─────────────────────────────────────────");
  console.log(`created  ${created.length}`);
  console.log(`updated  ${updated.length}`);
  console.log(`skipped  ${skipped.length}`);
  console.log(`notices  ${notices.length}`);
  console.log(`failed   ${failed.length}`);

  if (failed.length > 0) {
    console.log("\nFAILURES — nothing was written for these:\n");
    for (const f of failed) console.log(`  ✗ ${f}`);
  }

  if (DRY_RUN) {
    console.log("\nDry run: nothing was written.\n");
  } else if (failed.length === 0) {
    console.log("\nSync complete.\n");
  } else {
    console.log(
      "\nSync completed with failures. Fix them in Notion and re-run — the sync\n" +
        "is idempotent, so re-running is always safe.\n",
    );
  }

  // A run that failed anything exits non-zero so CI or a wrapper notices.
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("\nSync aborted:", err instanceof Error ? err.message : err);
  process.exit(1);
});
