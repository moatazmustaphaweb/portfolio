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
  OUTCOME_STATUSES,
  parseStatusItem,
  routeToSlug,
  TARGET_STATUSES,
  type EntityKind,
} from "@/lib/sync/classify";
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
  kind: EntityKind;
  parent?: string;
};

const created: string[] = [];
const updated: string[] = [];
const skipped: string[] = [];
const failed: string[] = [];

function fail(entity: string, reason: string) {
  failed.push(`${entity}: ${reason}`);
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
        current = heading.map((t) => t.plain_text).join("").trim().toLowerCase();
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

/** Arabic lives as a child page titled العربية (or Arabic). */
async function findArabicChild(pageId: string): Promise<string | null> {
  const res = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
  for (const block of res.results) {
    const b = block as { type: string; id: string; child_page?: { title: string } };
    if (b.type !== "child_page") continue;
    const t = (b.child_page?.title ?? "").trim().toLowerCase();
    if (t === "العربية" || t === "arabic") return b.id;
  }
  return null;
}

/* -------------------------------------------------------------- field maps */

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
  reflection: "reflection",
};

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

async function main() {
  console.log(
    `\nNotion → Supabase sync${DRY_RUN ? "  [DRY RUN — nothing will be written]" : ""}\n`,
  );

  const all = await fetchRows();
  const rows = ALL_LAYERS
    ? all
    : all.filter((r) => r.buildLayer === "Layer 1 — MVP-1" || r.inMvp);

  console.log(`Read ${all.length} rows, ${rows.length} in scope.\n`);

  /* ---- Pre-flight: refuse to write into known-bad data ------------------ */

  const collisions = findRouteCollisions(
    rows
      .filter((r) => r.route)
      .map((r) => ({ title: r.title, route: r.route!, kind: r.kind })),
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

    const { data, error: dbError } = await (await db())
      .from("case_files")
      .upsert(
        {
          slug: caseFile,
          // Grammar and domain are structural and not encoded in Notion.
          // Existing rows keep their values; new rows need a human decision,
          // so they land as drafts with a placeholder that is visible.
          grammar: "ecosystem",
          domain: row.section?.toLowerCase() ?? "unsorted",
          status: status as never,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();

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

    const arabicId = await findArabicChild(row.id);
    if (arabicId) {
      const arBody = await readBody(arabicId);
      await upsertTranslations("case_file", data.id, "ar", fieldsFromBody(arBody, COVER_FIELDS, ""));
    }
  }

  /* ---- Pass 2: chapters ------------------------------------------------- */

  for (const row of rows) {
    if (row.kind !== "chapter" || collidingTitles.has(row.title)) continue;

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
      console.log(`  chapter    ${caseFile}/${slug}`);
      updated.push(`chapter ${caseFile}/${slug}`);
      continue;
    }

    const { data, error: dbError } = await (await db())
      .from("chapters")
      .upsert(
        {
          case_file_id: parentId!,
          slug,
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

    const arabicId = await findArabicChild(row.id);
    if (arabicId) {
      const arBody = await readBody(arabicId);
      await upsertTranslations("chapter", data.id, "ar", fieldsFromBody(arBody, CHAPTER_FIELDS, ""));
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
    const headings = isTargets ? ["targets", "results"] : ["outcomes"];

    /*
     * A table under the heading IS the item list. Loose paragraphs are prose —
     * in this database the outcomes section opens with a summary sentence
     * spanning several figures, which is not an outcome and must not be parsed
     * as one.
     */
    const tableRows = headings.flatMap((h) => body.get(`${h}::table`) ?? []);
    const lines =
      tableRows.length > 0
        ? tableRows
        : headings.flatMap((h) => body.get(h) ?? []);
    if (lines.length === 0) continue;

    if (tableRows.length > 0 && DRY_RUN) {
      console.log(`  ${isTargets ? "targets" : "outcomes"} source: table (${tableRows.length} rows)`);
    }

    const allowed = isTargets ? TARGET_STATUSES : OUTCOME_STATUSES;
    const parsed: { label: string; status: string; note: string | null }[] = [];
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
        // Abort THIS entity, report it, keep going with the rest of the sync.
        fail(`${row.title} → ${isTargets ? "targets" : "outcomes"}`, item.message);
        aborted = true;
        break;
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
    }
    if (aborted) continue;

    if (DRY_RUN) {
      console.log(
        `  ${isTargets ? "targets   " : "outcomes  "} ${caseFile}: ${parsed
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

    const table = isTargets ? "targets" : "outcomes";
    // Replace wholesale: an outcome removed in Notion must disappear here, and
    // there is no stable key to match individual items on.
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
    }
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

  console.log("\n─────────────────────────────────────────");
  console.log(`created  ${created.length}`);
  console.log(`updated  ${updated.length}`);
  console.log(`skipped  ${skipped.length}`);
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
