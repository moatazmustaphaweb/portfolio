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
  looksLikeDecisionHeading,
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
  isNonHandleLine,
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
import {
  isProseSlot,
  resolveSlot,
  unknownHeadingMessage,
  type Slot,
} from "@/lib/sync/cover-slots";
import {
  isDecisionHeading,
  isProseSlot as isChapterProseSlot,
  resolveSlot as resolveChapterSlot,
  unknownHeadingMessage as unknownChapterHeadingMessage,
  type Slot as ChapterSlot,
} from "@/lib/sync/chapter-slots";
import {
  invalidTagMessage,
  parseImageTag,
  type ImageTag,
  type NotionRun,
} from "@/lib/sync/image-tags";
import { formatImageRef } from "@/lib/content/image-refs";
import { describeDrops, sift, type Sifted } from "@/lib/sync/sift";
import {
  parsePageSections,
  routeToPageKey,
  stripArabicScaffolding,
  type ParsedSection,
} from "@/lib/sync/static-pages";

/**
 * Static pages whose content is ordered prose in Notion.
 *
 * Landing and the Classic Gallery are also `static` by kind, but their copy is
 * `settings` and `ui_strings` — they have no sections, and writing empty rows
 * for them would put a heading-less, body-less section on two finished pages.
 */
const STATIC_PROSE_PAGES = new Set([
  "about",
  "about/philosophy",
  "systems",
  "contact",
]);
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

/*
 * `--only=<substring>` restricts the CHAPTER SECTION pass to matching chapters.
 *
 * The slot model is being rolled out one chapter at a time: nine of the ten
 * chapters carry section headings that are not yet in `chapter_slot_aliases`,
 * and each would fail loudly by design. That is the correct behaviour and it is
 * also a wall of output nobody reads, so the rollout is gated rather than the
 * guard weakened.
 *
 * It gates ONLY the section pass. Everything else about every row syncs exactly
 * as before, so this is never a way to sync "half a site".
 */
const ONLY_ARG = process.argv.find((a) => a.startsWith("--only="));
const ONLY = ONLY_ARG ? ONLY_ARG.slice("--only=".length).toLowerCase() : null;

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

      /*
       * An image tag is NOT prose.
       *
       * Its joined `plain_text` is the literal source — "[cld] … [alt] … [caption] …"
       * — and until now that string was pushed into the section like any other
       * paragraph, so it was being written into `context`, `evidence_note` and
       * `result` as body copy. Tags are read by the chapter section pass, from
       * `readOrderedBlocks().items`, where they keep their structure.
       */
      if (parseImageTag(text as unknown as NotionRun[]).kind !== "prose") continue;

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
 * Identified by TWO things and nothing else: it is a direct child of the page
 * it translates, and its title opens with `النسخة العربية` (or the older bare
 * `العربية` / `Arabic`). Everything after that prefix is a human label —
 * `— نبذة عني`, `— الغلاف (مصر)`, `— الفصل الأول: رحلة فتح الحساب` — which
 * exists to tell the pages apart in Notion's sidebar and carries no meaning
 * here. **Nothing may match on the full title.**
 *
 * A prefix test rather than the containment test this used to do: containment
 * would also claim a child called `ملاحظات العربية` ("Arabic notes"), and
 * silently translating a page from a notes page is worse than not finding one.
 */
async function findArabicChild(
  pageId: string,
): Promise<{ id: string; title: string } | null> {
  const res = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
  for (const block of res.results) {
    const b = block as { type: string; id: string; child_page?: { title: string } };
    if (b.type !== "child_page") continue;
    const raw = (b.child_page?.title ?? "").trim();
    // Compared with any leading emoji removed, so a flag on the page title
    // cannot stop it matching.
    const t = stripLeadingEmoji(raw).toLowerCase();
    /*
     * The terminator is spelled out rather than using `\b`.
     *
     * `\b` is defined against `\w`, which is [A-Za-z0-9_] — Arabic letters are
     * not word characters to it, so there is no boundary after `العربية` and
     * `/^العربية\b/` matches NOTHING. It silently found no Arabic child at all,
     * which looks exactly like a page with no translation.
     */
    if (/^(النسخة العربية|العربية|arabic)($|[\s—–:-])/iu.test(t)) {
      return { id: b.id, title: raw };
    }
  }
  return null;
}

function stripLeadingEmoji(value: string): string {
  return value.replace(/^[\u{1F1E6}-\u{1F1FF}\p{Emoji_Presentation}\s]+/u, "").trim();
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

  // One stripper, shared with the section parser — see stripArabicScaffolding.
  let t = stripArabicScaffolding(pageTitle);
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
/**
 * Decisions in a chapter body, with the near-misses counted.
 *
 * Returns a `Sifted` rather than an array so the caller can tell "there were
 * three decisions" from "there were four and one was unusable" — see
 * lib/sync/sift.ts for why that distinction is load-bearing.
 */
function decisionsFromBody(
  sections: ReadonlyMap<string, string[]>,
): Sifted<{ name: string; body: string }> {
  return sift<[string, string[]], { name: string; body: string }>(
    sections,
    ([heading, lines]) => {
    // "::table" keys hold a heading's table rows, not a separate section — they
    // would otherwise be counted as a second decision with a mangled name.
    if (heading.startsWith("__") || heading.endsWith("::table")) return "skip";

    const parsed = parseDecisionHeading(heading);
    if (parsed) return { keep: { name: parsed.name, body: lines.join("\n\n").trim() } };

    // Announced itself and could not be used — something was meant to be here.
    if (looksLikeDecisionHeading(heading)) {
      return {
        drop: {
          what: heading,
          why: "opens as a decision but has no name after the separator",
        },
      };
    }

      // Objective, Context, Result and friends. Never a candidate.
      return "skip";
    },
  );
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

/* ------------------------------------------------------- cover slot model */

/**
 * One block of a page: a heading and everything under it until the next.
 *
 * `lines` is PROSE ONLY and is what every existing consumer reads — the cover
 * slot pass and `parsePageSections`. `items` is the same content in document
 * order WITH image tags kept in place, which is what the chapter section pass
 * needs: a figure has to render between the two paragraphs it was written
 * between, and a prose-only list has already thrown that position away.
 */
type BodyItem =
  | { kind: "prose"; text: string }
  | { kind: "image"; tag: ImageTag }
  /*
   * A table, in its DOCUMENT POSITION. `tables` below keeps collecting them in
   * a separate bucket for the existing consumers, but that bucket has no idea
   * where the table sat relative to the prose — and on the comparison pages the
   * table is the page, so putting it back in the wrong place is not a detail.
   */
  | { kind: "table"; grid: string[][] }
  | { kind: "invalid"; problems: string[]; cld: string | null };

type OrderedBlock = {
  heading: string;
  level: 0 | 1 | 2 | 3;
  lines: string[];
  items: BodyItem[];
  tables: string[][][];
};

/**
 * The sections of one cover, resolved to slots.
 *
 * Level 1 is the page's own H1 — the document title. Its paragraphs are
 * authoring notes ("Status: Draft v1. Written from interview, 6 Aug 2026.") and
 * must never publish, so the whole block is skipped rather than becoming a slot.
 * Level 0 is anything before the first heading; also skipped.
 */
function resolveCoverSections(
  coverTitle: string,
  blocks: readonly OrderedBlock[],
  aliases: ReadonlyMap<string, string>,
): {
  sections: { slot: Slot; heading: string; paragraphs: string[] }[];
  failures: string[];
} {
  const sections: { slot: Slot; heading: string; paragraphs: string[] }[] = [];
  const failures: string[] = [];
  const seen = new Map<string, string>();

  for (const block of blocks) {
    if (block.level < 2 || !block.heading) continue;

    const r = resolveSlot(block.heading, aliases);
    if (!r.ok) {
      // GUARD 1 — unrecognised heading. Never discarded, never guessed.
      failures.push(unknownHeadingMessage(coverTitle, r));
      continue;
    }

    // GUARD 2 — duplicate slot. The database enforces this too, via
    // unique (case_file_id, slot); caught here so the message names both
    // headings rather than surfacing as a Postgres constraint error.
    const already = seen.get(r.slot);
    if (already !== undefined) {
      failures.push(
        `${coverTitle}: two sections both resolve to slot "${r.slot}" — ` +
          `${JSON.stringify(already)} and ${JSON.stringify(block.heading)}. ` +
          `Neither was written. This is the overwrite the slot model exists to ` +
          `prevent: the old code kept whichever came last, silently.`,
      );
      continue;
    }
    seen.set(r.slot, block.heading);

    sections.push({
      slot: r.slot,
      heading: block.heading,
      paragraphs: block.lines.map((l) => l.trim()).filter(Boolean),
    });
  }

  return { sections, failures };
}

/**
 * Write one cover's slots.
 *
 * Arabic is resolved through the SAME alias table, independently — `ما هو`
 * resolves to `what-it-is` on its own merits. So Arabic no longer pairs with
 * English by position, and a cover whose Arabic has three sections to English's
 * four is no longer a refusal: the three attach to their own slots and the
 * fourth simply has no Arabic. Decision 013's fallback applies per slot instead
 * of all-or-nothing.
 *
 * Paragraph pairing WITHIN a slot stays positional, and keeps its guard.
 */
async function writeCoverSections(opts: {
  rowTitle: string;
  caseFileId: string;
  enBlocks: readonly OrderedBlock[];
  arBlocks: readonly OrderedBlock[] | null;
  aliases: ReadonlyMap<string, string>;
}): Promise<string | null> {
  const { rowTitle, caseFileId, enBlocks, arBlocks, aliases } = opts;

  const en = resolveCoverSections(rowTitle, enBlocks, aliases);
  const ar = arBlocks
    ? resolveCoverSections(`${rowTitle} (ar)`, arBlocks, aliases)
    : { sections: [], failures: [] };

  for (const f of [...en.failures, ...ar.failures]) fail(rowTitle, f);
  if (en.failures.length > 0 || ar.failures.length > 0) return null;

  const prose = en.sections.filter((s) => isProseSlot(s.slot));

  // GUARD 3 — a slot that was written and left empty. An ABSENT slot is silent
  // and correct; an empty one is a heading with nothing under it, which is a
  // mistake worth reporting rather than a shape worth supporting.
  for (const s of prose) {
    if (s.paragraphs.length === 0) {
      notice(rowTitle,
        `${rowTitle}: slot "${s.slot}" (heading ${JSON.stringify(s.heading)}) has a ` +
          "heading but no paragraphs. Written as an empty slot — it will render " +
          "its heading and nothing else.",
      );
    }
  }

  /*
   * GUARD 4 — a cover with no prose is malformed. But "malformed" and "not
   * written yet" are different things and the guard has to tell them apart.
   *
   * The four mini case files (EAST, PideTaxi, Kshemam, AAM) are placeholders:
   * a title, no headings, no content in either language. Failing them would be
   * a guard crying wolf on every run, which is how guards get ignored — and
   * this one exists to be believed.
   *
   * So the test is not "did any prose resolve" but "did this page OFFER any
   * sections and none of them became prose". A page with no sections at all is
   * an unwritten draft and says so by saying nothing.
   */
  const offeredSections = enBlocks.filter((b) => b.level >= 2 && b.heading).length;
  if (offeredSections === 0) return null;

  if (prose.length === 0) {
    fail(rowTitle,
      `${rowTitle}: ${offeredSections} section(s) on the page and not one resolved to a ` +
        "prose slot. A cover made only of tables and lists is malformed.",
    );
    return null;
  }

  const arBySlot = new Map(ar.sections.map((s) => [s.slot, s]));

  const shape =
    `slots [${prose.map((s) => `${s.slot}(${s.paragraphs.length}¶${arBySlot.has(s.slot) ? "+ar" : ""})`).join(" · ")}]` +
    ` claimed [${en.sections.filter((s) => !isProseSlot(s.slot)).map((s) => s.slot).join(" · ") || "—"}]`;

  if (DRY_RUN) return shape;

  /*
   * ⚠️ UPSERT, NOT REPLACE — and the reason is `cover_sections.media_id`.
   *
   * This pass used to delete every section for the case file and re-insert.
   * That is fine for content re-derived from Notion on each run, and fatal for
   * a column that is NOT: an image chosen by hand would have been silently
   * dropped by the next sync. A column on a table that is deleted and
   * re-inserted every run is a column that loses its data.
   *
   * Preserving `media_id` across the delete was rejected. That leaves a read
   * and a restore as two things free to disagree, and whoever next edits the
   * write path forgets the second half — the same shape as a grid that kept
   * both tracks after losing a child. Upserting on the existing
   * `unique (case_file_id, slot)` means the row is never deleted, so there is
   * nothing to preserve and nothing to forget. The failure is unrepresentable.
   *
   * THE COST, PAID BELOW: delete-all removed a slot that left Notion for free.
   * Upsert does not, so a departed slot would linger with stale text and render.
   * The delete that follows the upsert is derived from the SAME array that
   * drove it — one list, used twice, in one function.
   */
  const writtenSlots = prose.map((s) => s.slot);

  for (const [i, section] of prose.entries()) {
    const { data: sectionRow, error } = await (await db())
      .from("cover_sections")
      .upsert(
        { case_file_id: caseFileId, slot: section.slot, sort_order: i },
        { onConflict: "case_file_id,slot" },
      )
      .select("id, media_id").single();

    if (error || !sectionRow) {
      fail(rowTitle, `${rowTitle}: slot "${section.slot}" — ${error?.message ?? "upsert returned no row"}`);
      continue;
    }

    /*
     * The role card takes the FULL WIDTH of the cover and has no two-thirds
     * column to put an image beside, so `CoverSections` ignores `media_id` on
     * this slot. Ignoring it silently would be the worse half: an image
     * attached by hand would simply never appear, and nothing would say why.
     */
    if (section.slot === "role" && sectionRow.media_id) {
      notice(rowTitle,
        `${rowTitle}: the "role" slot has an image attached (media_id set), and ` +
          "the role card renders full width with no image column — so it is NOT " +
          "rendered. Attach it to another slot, or say the role card should take " +
          "an image inside its own box.",
      );
    }

    /*
     * Paragraphs ARE replaced, per section. They carry nothing that is not
     * re-derived from Notion, so there is nothing to preserve — and their
     * translations go first, the polymorphic-orphan trap every other pass
     * documents, because `translations` has no foreign key to cascade.
     */
    const { data: oldParas } = await (await db())
      .from("cover_paragraphs").select("id").eq("cover_section_id", sectionRow.id);
    if (oldParas && oldParas.length > 0) {
      await (await db()).from("translations").delete()
        .eq("entity_type", "cover_paragraph").in("entity_id", oldParas.map((x) => x.id));
      await (await db()).from("cover_paragraphs").delete().eq("cover_section_id", sectionRow.id);
    }

    const arSection = arBySlot.get(section.slot);

    // The heading, as written, in each language that has one.
    await upsertTranslations("cover_section", sectionRow.id, "en", { heading: section.heading });
    if (arSection) {
      await upsertTranslations("cover_section", sectionRow.id, "ar", { heading: arSection.heading });
    }

    /*
     * Paragraphs pair by position within the slot, and only when the counts
     * match — the same rule and the same reasoning as everywhere else. Where
     * they differ the Arabic paragraphs are skipped and reported rather than
     * attached one row off.
     */
    const pairParagraphs =
      arSection !== undefined &&
      arSection.paragraphs.length > 0 &&
      arSection.paragraphs.length === section.paragraphs.length;

    if (arSection && arSection.paragraphs.length > 0 && !pairParagraphs) {
      notice(rowTitle,
        `${rowTitle}: slot "${section.slot}" has ${section.paragraphs.length} paragraph(s) ` +
          `in English and ${arSection.paragraphs.length} in Arabic. Arabic paragraphs ` +
          "skipped for this slot — pairing by position across different counts would " +
          "attach the wrong paragraph to the wrong place. The heading still synced.",
      );
    }

    for (const [j, text] of section.paragraphs.entries()) {
      const { data: paraRow, error: paraError } = await (await db())
        .from("cover_paragraphs")
        .insert({ cover_section_id: sectionRow.id, sort_order: j })
        .select("id").single();

      if (paraError || !paraRow) {
        fail(rowTitle, `${rowTitle}: slot "${section.slot}" paragraph ${j + 1} — ${paraError?.message ?? "no row"}`);
        continue;
      }

      await upsertTranslations("cover_paragraph", paraRow.id, "en", { body: text });
      if (pairParagraphs) {
        await upsertTranslations("cover_paragraph", paraRow.id, "ar", {
          body: arSection.paragraphs[j],
        });
      }
    }
  }

  /*
   * THE COST OF UPSERTING, PAID. A slot removed from Notion is no longer
   * overwritten by anything, so without this it lingers with stale text and
   * renders. `writtenSlots` is the same array the upsert loop iterated — one
   * list, used twice, so the set kept and the set written cannot disagree.
   *
   * Cascades take the paragraphs; their translations and the section's own go
   * first, because `translations` has no foreign key to follow.
   */
  const { data: staleSections } = await (await db())
    .from("cover_sections")
    .select("id, slot")
    .eq("case_file_id", caseFileId)
    .not("slot", "in", `(${writtenSlots.join(",")})`);

  if (staleSections && staleSections.length > 0) {
    const staleIds = staleSections.map((x) => x.id);
    const { data: staleParas } = await (await db())
      .from("cover_paragraphs").select("id").in("cover_section_id", staleIds);
    if (staleParas && staleParas.length > 0) {
      await (await db()).from("translations").delete()
        .eq("entity_type", "cover_paragraph").in("entity_id", staleParas.map((x) => x.id));
    }
    await (await db()).from("translations").delete()
      .eq("entity_type", "cover_section").in("entity_id", staleIds);
    await (await db()).from("cover_sections").delete().in("id", staleIds);

    notice(rowTitle,
      `${rowTitle}: removed ${staleSections.length} section(s) no longer in Notion — ` +
        staleSections.map((x) => x.slot).join(" · ") +
        ". Any image attached to them is detached with them.",
    );
  }

  return shape;
}

/* ----------------------------------------------------- chapter slot model */

type ChapterParagraph =
  | { kind: "prose"; text: string }
  | { kind: "image"; tag: ImageTag }
  | { kind: "table"; grid: string[][] };

type ChapterSection = {
  slot: ChapterSlot;
  heading: string;
  paragraphs: ChapterParagraph[];
};

/**
 * The sections of one chapter, resolved to slots.
 *
 * Level 1 is the page's own H1 — the document title, with authoring notes
 * beneath it ("Status: Draft v1 — written from interview, 6 Aug 2026."). Those
 * are notes to Moataz and must never publish, so the block is skipped rather
 * than becoming a slot. Level 0 is anything before the first heading.
 */
function resolveChapterSections(
  chapterTitle: string,
  blocks: readonly OrderedBlock[],
  aliases: ReadonlyMap<string, string>,
): { sections: ChapterSection[]; failures: string[] } {
  const sections: ChapterSection[] = [];
  const failures: string[] = [];
  const seen = new Map<string, string>();

  for (const block of blocks) {
    if (block.level < 2 || !block.heading) continue;

    /*
     * GUARD 0 — decision headings are not sections.
     *
     * `Decision · The language fight`, `القرار الأول · …` are parsed into the
     * `decisions` table by their own pass. A chapter carries several, so
     * resolving them to a slot would hit unique (chapter_id, slot) on the
     * second one and fail a chapter that is written correctly.
     *
     * Their image tags are collected all the same — a decision is prose in the
     * decisions table, and the figures written beneath it still belong to the
     * chapter. They attach to the section that precedes them.
     */
    if (isDecisionHeading(block.heading)) {
      const images = block.items.filter((i) => i.kind === "image");
      const last = sections[sections.length - 1];
      if (last) {
        for (const item of images) {
          if (item.kind === "image") last.paragraphs.push({ kind: "image", tag: item.tag });
        }
      }
      for (const item of block.items) {
        if (item.kind === "invalid") {
          failures.push(
            invalidTagMessage(chapterTitle, {
              kind: "invalid",
              cld: item.cld,
              problems: item.problems,
            }),
          );
        }
      }
      continue;
    }

    const r = resolveChapterSlot(block.heading, aliases);
    if (!r.ok) {
      // GUARD 1 — unrecognised heading. Never discarded, never guessed.
      failures.push(unknownChapterHeadingMessage(chapterTitle, r));
      continue;
    }

    // GUARD 2 — duplicate slot. The database enforces this too, via
    // unique (chapter_id, slot); caught here so the message names both
    // headings rather than surfacing as a Postgres constraint error.
    const already = seen.get(r.slot);
    if (already !== undefined) {
      failures.push(
        `${chapterTitle}: two sections both resolve to slot "${r.slot}" — ` +
          `${JSON.stringify(already)} and ${JSON.stringify(block.heading)}. ` +
          `Neither was written.`,
      );
      continue;
    }
    seen.set(r.slot, block.heading);

    const paragraphs: ChapterParagraph[] = [];
    for (const item of block.items) {
      if (item.kind === "prose") {
        const text = item.text.trim();
        if (text) paragraphs.push({ kind: "prose", text });
      } else if (item.kind === "image") {
        paragraphs.push({ kind: "image", tag: item.tag });
      } else if (item.kind === "table") {
        paragraphs.push({ kind: "table", grid: item.grid });
      } else {
        // GUARD 3 — an unusable tag fails the chapter. See invalidTagMessage:
        // a media row with no alt renders as nothing at all, silently.
        failures.push(
          invalidTagMessage(chapterTitle, {
            kind: "invalid",
            cld: item.cld,
            problems: item.problems,
          }),
        );
      }
    }

    sections.push({ slot: r.slot, heading: block.heading, paragraphs });
  }

  return { sections, failures };
}

/**
 * Upsert one media row and its alt + caption, for ONE locale.
 *
 * Keyed on `cloudinary_public_id`, which is unique, so re-running matches the
 * existing row and never duplicates. The public ID is used verbatim: spaces,
 * dots, parentheses and apostrophes all resolve at Cloudinary and slugifying
 * here would break every one of them.
 *
 * `redacted` is written false, always. Amendment 036 supersedes 027 — these are
 * design files carrying dummy data, the NDA treatment is a grayscale signal
 * driven by `case_files.nda`, and `redacted = true` would additionally force
 * the non-cropping `redacted` preset (decision 028) for no reason.
 */
async function upsertMedia(tag: ImageTag, locale: "en" | "ar"): Promise<string | null> {
  const { data, error } = await (await db())
    .from("media")
    .upsert(
      { cloudinary_public_id: tag.cld, redacted: false },
      { onConflict: "cloudinary_public_id" },
    )
    .select("id")
    .single();

  if (error || !data) return null;

  await upsertTranslations("media", data.id, locale, {
    alt: tag.alt,
    caption: tag.caption,
  });

  return data.id;
}

/**
 * Write one chapter's slots, its paragraphs, and the media they reference.
 *
 * Arabic resolves through the SAME alias table, independently — `ما صمّمته`
 * resolves to `what-i-designed` on its own merits — so a chapter whose Arabic
 * has six sections to English's seven is not a refusal. The six attach to their
 * own slots and the seventh simply has no Arabic. Decision 013's fallback
 * applies per slot rather than all-or-nothing.
 *
 * ⚠️ English and Arabic reference DIFFERENT SCREENS, and that is the point of
 * pairing paragraphs by position rather than by image. Chapter One shares only
 * 4 of 16 public IDs between locales: an Arabic reader sees the Arabic
 * screenshot in the same place the English reader sees the English one. One
 * `chapter_paragraphs` row therefore holds `[image:A]` for `en` and
 * `[image:B]` for `ar`, which is correct and not a mismatch.
 */
async function writeChapterSections(opts: {
  rowTitle: string;
  chapterId: string;
  enBlocks: readonly OrderedBlock[];
  arBlocks: readonly OrderedBlock[] | null;
  aliases: ReadonlyMap<string, string>;
}): Promise<string | null> {
  const { rowTitle, chapterId, enBlocks, arBlocks, aliases } = opts;

  const en = resolveChapterSections(rowTitle, enBlocks, aliases);
  const ar = arBlocks
    ? resolveChapterSections(`${rowTitle} (ar)`, arBlocks, aliases)
    : { sections: [], failures: [] };

  for (const f of [...en.failures, ...ar.failures]) fail(rowTitle, f);
  if (en.failures.length > 0 || ar.failures.length > 0) return null;

  const prose = en.sections.filter((s) => isChapterProseSlot(s.slot));

  // A page that offered no sections is an unwritten draft and says so by
  // saying nothing. The same distinction the cover pass draws, for the same
  // reason: a guard that fires on every placeholder gets ignored.
  const offered = enBlocks.filter((b) => b.level >= 2 && b.heading && !isDecisionHeading(b.heading)).length;
  if (offered === 0 || prose.length === 0) return null;

  const countImages = (ss: readonly ChapterSection[]) =>
    ss.reduce((n, s) => n + s.paragraphs.filter((p) => p.kind === "image").length, 0);

  const shape =
    `slots [${prose
      .map((s) => {
        const imgs = s.paragraphs.filter((p) => p.kind === "image").length;
        const tbl = s.paragraphs.filter((p) => p.kind === "table").length;
        return `${s.slot}(${s.paragraphs.length}¶${imgs ? `/${imgs}img` : ""}${tbl ? `/${tbl}tbl` : ""})`;
      })
      .join(" · ")}] images en:${countImages(en.sections)} ar:${countImages(ar.sections)}`;

  if (DRY_RUN) return shape;

  /*
   * Replace wholesale, translations first — the polymorphic-orphan trap every
   * other pass documents. `translations` has no foreign key to cascade, so
   * deleting the rows alone would orphan their text and every re-sync would
   * accumulate another dead set.
   *
   * `media` rows are NOT deleted. They are keyed on the public ID, shared
   * between locales and potentially between chapters, and deleting them here
   * would break another chapter's reference to the same screen.
   */
  const { data: oldSections } = await (await db())
    .from("chapter_sections").select("id").eq("chapter_id", chapterId);

  if (oldSections && oldSections.length > 0) {
    const sectionIds = oldSections.map((x) => x.id);
    const { data: oldParas } = await (await db())
      .from("chapter_paragraphs").select("id").in("chapter_section_id", sectionIds);
    if (oldParas && oldParas.length > 0) {
      const paraIds = oldParas.map((x) => x.id);
      /*
       * Cell translations first. `chapter_table_cells` cascades from the
       * paragraph, but `translations` has no foreign key to cascade — the same
       * polymorphic-orphan trap every other pass documents. Deleting the cells
       * alone would strand their text and every re-sync would leave another
       * dead set behind.
       */
      const { data: oldCells } = await (await db())
        .from("chapter_table_cells").select("id").in("chapter_paragraph_id", paraIds);
      if (oldCells && oldCells.length > 0) {
        await (await db()).from("translations").delete()
          .eq("entity_type", "chapter_table_cell").in("entity_id", oldCells.map((x) => x.id));
      }
      await (await db()).from("translations").delete()
        .eq("entity_type", "chapter_paragraph").in("entity_id", paraIds);
    }
    await (await db()).from("translations").delete()
      .eq("entity_type", "chapter_section").in("entity_id", sectionIds);
    await (await db()).from("chapter_sections").delete().eq("chapter_id", chapterId);
  }

  const arBySlot = new Map(ar.sections.map((x) => [x.slot, x]));

  /**
   * Render one paragraph to the text stored for a locale.
   *
   * Tables never reach here — they own cells rather than a body, and the caller
   * handles them before this point. Returning null rather than throwing keeps a
   * future third kind from taking a page down.
   */
  const bodyFor = async (para: ChapterParagraph, locale: "en" | "ar"): Promise<string | null> => {
    if (para.kind === "prose") return para.text;
    if (para.kind !== "image") return null;
    const mediaId = await upsertMedia(para.tag, locale);
    if (!mediaId) {
      fail(rowTitle, `${rowTitle}: could not write media row for ${JSON.stringify(para.tag.cld)}`);
      return null;
    }
    return formatImageRef(mediaId);
  };

  for (const [i, section] of prose.entries()) {
    const { data: sectionRow, error } = await (await db())
      .from("chapter_sections")
      .insert({ chapter_id: chapterId, slot: section.slot, sort_order: i })
      .select("id").single();

    if (error || !sectionRow) {
      fail(rowTitle, `${rowTitle}: slot "${section.slot}" — ${error?.message ?? "insert returned no row"}`);
      continue;
    }

    const arSection = arBySlot.get(section.slot);

    await upsertTranslations("chapter_section", sectionRow.id, "en", { heading: section.heading });
    if (arSection) {
      await upsertTranslations("chapter_section", sectionRow.id, "ar", { heading: arSection.heading });
    }

    /*
     * Paragraphs pair by position within the slot, and only when the counts
     * match. Where they differ the Arabic is skipped and reported rather than
     * attached one row off — which, with images in the sequence, would put an
     * Arabic screenshot under an English paragraph about a different screen.
     */
    const pair =
      arSection !== undefined &&
      arSection.paragraphs.length > 0 &&
      arSection.paragraphs.length === section.paragraphs.length;

    if (arSection && arSection.paragraphs.length > 0 && !pair) {
      notice(rowTitle,
        `${rowTitle}: slot "${section.slot}" has ${section.paragraphs.length} paragraph(s) ` +
          `in English and ${arSection.paragraphs.length} in Arabic. Arabic skipped for ` +
          "this slot — pairing by position across different counts would attach the " +
          "wrong paragraph, and with figures in the sequence it would also show the " +
          "wrong screenshot. The heading still synced.",
      );
    }

    for (const [j, para] of section.paragraphs.entries()) {
      const { data: paraRow, error: paraError } = await (await db())
        .from("chapter_paragraphs")
        .insert({
          chapter_section_id: sectionRow.id,
          sort_order: j,
          kind: para.kind === "table" ? "table" : "prose",
        })
        .select("id").single();

      if (paraError || !paraRow) {
        fail(rowTitle, `${rowTitle}: slot "${section.slot}" paragraph ${j + 1} — ${paraError?.message ?? "no row"}`);
        continue;
      }

      /*
       * A TABLE is cells, not a body.
       *
       * The Arabic counterpart is written only when this position pairs AND the
       * Arabic paragraph is also a table. A table paired against a paragraph is
       * a structural mismatch, not a translation, and writing it would put
       * Arabic prose into a grid cell.
       */
      if (para.kind === "table") {
        const arPara = pair && arSection ? arSection.paragraphs[j] : undefined;
        const arGrid = arPara?.kind === "table" ? arPara.grid : null;

        if (arPara && arPara.kind !== "table") {
          notice(rowTitle,
            `${rowTitle}: slot "${section.slot}" position ${j + 1} is a table in English and ` +
              `${arPara.kind} in Arabic. Arabic not written for this position — the shapes ` +
              "do not correspond and pairing them would put prose into a grid cell.",
          );
        }
        if (arGrid && (arGrid.length !== para.grid.length ||
            arGrid[0]?.length !== para.grid[0]?.length)) {
          notice(rowTitle,
            `${rowTitle}: slot "${section.slot}" table is ${para.grid.length}x${para.grid[0]?.length} ` +
              `in English and ${arGrid.length}x${arGrid[0]?.length} in Arabic. Arabic cells not ` +
              "written — a different grid is a different table, and pairing by index would " +
              "scatter its text across the wrong columns.",
          );
        }
        const useAr =
          arGrid &&
          arGrid.length === para.grid.length &&
          arGrid[0]?.length === para.grid[0]?.length;

        for (const [r, cells] of para.grid.entries()) {
          for (const [c, text] of cells.entries()) {
            const { data: cellRow, error: cellError } = await (await db())
              .from("chapter_table_cells")
              .insert({
                chapter_paragraph_id: paraRow.id,
                row_idx: r,
                col_idx: c,
                // Row 0 is the header row, matching what SectionTable renders.
                is_header: r === 0,
              })
              .select("id").single();

            if (cellError || !cellRow) {
              fail(rowTitle, `${rowTitle}: slot "${section.slot}" table cell ${r},${c} — ${cellError?.message ?? "no row"}`);
              continue;
            }

            await upsertTranslations("chapter_table_cell", cellRow.id, "en", { text });
            if (useAr) {
              await upsertTranslations("chapter_table_cell", cellRow.id, "ar", {
                text: arGrid[r][c] ?? "",
              });
            }
          }
        }
        continue;
      }

      const enBody = await bodyFor(para, "en");
      if (enBody !== null) {
        await upsertTranslations("chapter_paragraph", paraRow.id, "en", { body: enBody });
      }

      if (pair && arSection) {
        const arPara = arSection.paragraphs[j];
        // A prose position must not take an Arabic table.
        if (arPara.kind !== "table") {
          const arBody = await bodyFor(arPara, "ar");
          if (arBody !== null) {
            await upsertTranslations("chapter_paragraph", paraRow.id, "ar", { body: arBody });
          }
        }
      }
    }
  }

  return shape;
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
 * A page's blocks in document order, with heading text intact.
 *
 * `readBody` canonicalises headings to field names and returns a Map — correct
 * for a cover, where "My role" IS a field, and wrong for a static page, where
 * "What that year actually taught me" is a sentence to render. This keeps the
 * words and the order.
 */
async function readOrderedBlocks(pageId: string): Promise<OrderedBlock[]> {
  /*
   * `level` records which heading tag introduced the block, and the cover pass
   * depends on it. A cover opens with an H1 carrying the page title and, beneath
   * it, authoring notes — "Status: Draft v1. Written from interview, 6 Aug 2026."
   * Those are notes to Moataz, not content, and they must never publish. An H1 is
   * the document title; H2 and H3 introduce sections. Level 0 is the synthetic
   * block holding anything before the first heading.
   */
  const blocks: OrderedBlock[] = [
    { heading: "", level: 0, lines: [], items: [], tables: [] },
  ];
  let cursor: string | undefined;

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
        quote?: { rich_text: { plain_text: string }[] };
      };

      const headingText =
        b.heading_1?.rich_text ?? b.heading_2?.rich_text ?? b.heading_3?.rich_text;
      if (headingText) {
        blocks.push({
          heading: headingText.map((t) => t.plain_text).join("").trim(),
          level: b.heading_1 ? 1 : b.heading_2 ? 2 : 3,
          lines: [],
          items: [],
          tables: [],
        });
        continue;
      }

      /*
       * Tables are captured, not skipped. On the comparison pages the table is
       * the page — "The differences, decision by decision" is a grid, and
       * dropping it would have synced two pages of preamble around a hole.
       */
      if (b.type === "table") {
        const grid = await readTable((block as unknown as { id: string }).id);
        if (grid.length > 0) {
          blocks[blocks.length - 1].tables.push(grid);
          blocks[blocks.length - 1].items.push({ kind: "table", grid });
        }
        continue;
      }

      const prose =
        b.paragraph?.rich_text ??
        b.bulleted_list_item?.rich_text ??
        b.numbered_list_item?.rich_text ??
        b.quote?.rich_text;
      if (!prose) continue;

      /*
       * An image tag paragraph is recorded as an `image` item and is kept OUT
       * of `lines`. Existing callers therefore see exactly what they saw
       * before, minus the raw "[cld] …" source that was previously reaching
       * them as prose.
       */
      const parsed = parseImageTag(prose as unknown as NotionRun[]);
      const target = blocks[blocks.length - 1];

      if (parsed.kind === "tag") {
        target.items.push({ kind: "image", tag: parsed.tag });
        continue;
      }
      if (parsed.kind === "invalid") {
        target.items.push({ kind: "invalid", problems: parsed.problems, cld: parsed.cld });
        continue;
      }

      const text = prose.map((t) => t.plain_text).join("").trim();
      if (text) {
        target.lines.push(text);
        target.items.push({ kind: "prose", text });
      }
    }

    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return blocks.filter((b) => b.heading || b.lines.length > 0 || b.items.length > 0);
}

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

  /*
   * The slot aliases, loaded once. A DRY RUN needs them too — resolving a
   * heading is exactly what a dry run is for, and it writes nothing.
   */
  const coverAliases = new Map<string, string>();
  {
    const { data, error } = await (await db()).from("cover_slot_aliases").select("heading_norm, slot");
    if (error) {
      console.error(`Could not load cover_slot_aliases: ${error.message}`);
      process.exit(1);
    }
    for (const row of data ?? []) coverAliases.set(row.heading_norm, row.slot);
  }

  /* Chapter slots use their own alias table and their own vocabulary. */
  const chapterAliases = new Map<string, string>();
  {
    const { data, error } = await (await db()).from("chapter_slot_aliases").select("heading_norm, slot");
    if (error) {
      console.error(`Could not load chapter_slot_aliases: ${error.message}`);
      process.exit(1);
    }
    for (const row of data ?? []) chapterAliases.set(row.heading_norm, row.slot);
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

      /*
       * Slots ARE resolved in a dry run, and their shape printed. Resolving a
       * heading is precisely what a dry run is for — it is where an
       * unrecognised heading should surface, before anything is written. The
       * call returns before it writes, so this stays read-only.
       */
      const dryEn = await readOrderedBlocks(row.id);
      const dryArabic = await findArabicChild(row.id);
      const dryAr = dryArabic ? await readOrderedBlocks(dryArabic.id) : null;
      const dryShape = await writeCoverSections({
        rowTitle: row.title,
        caseFileId: `dry-run:${caseFile}`,
        enBlocks: dryEn,
        arBlocks: dryAr,
        aliases: coverAliases,
      });
      if (dryShape) console.log(`  cover ${caseFile}: ${dryShape}`);
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

    /*
     * The slot model (0031). Written alongside the legacy thesis/role/reflection
     * fields above, NOT instead of them — the old rows are removed in a separate
     * migration once the site is verified rendering from the new tables, so that
     * a failure here cannot take the covers down.
     */
    const enBlocks = await readOrderedBlocks(row.id);
    const arBlocks = arabic ? await readOrderedBlocks(arabic.id) : null;
    const shape = await writeCoverSections({
      rowTitle: row.title,
      caseFileId: data.id,
      enBlocks,
      arBlocks,
      aliases: coverAliases,
    });

    // GUARD 6 — the resolved shape of every cover, printed every run. A section
    // disappearing then shows as a line that CHANGED, rather than as nothing at
    // all; absence being invisible is what hid Cervello's opening for months.
    if (shape) console.log(`  cover ${caseFile}: ${shape}`);
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
    let arDecisions: Sifted<{ name: string; body: string }> = {
      kept: [],
      dropped: [],
      found: 0,
    };
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
     * Chapter sections — the slot model (migration 0035), and the images with it.
     *
     * This runs IN ADDITION to the `CHAPTER_FIELDS` writes above rather than
     * replacing them. The old fields still feed everything that reads them
     * today; the sections carry the passages those fields have no key for, and
     * every image tag on the page. Removing the fields is a separate change
     * with its own blast radius, and doing both at once would make a rendering
     * regression impossible to attribute.
     */
    /*
     * Sections apply to EVERY chapter-like row, document pages included.
     *
     * They were gated to `kind = 'chapter'` while `chapter_paragraphs` could
     * only hold text or an image marker: all three document pages carry a
     * table, and migrating them would have dropped it silently. Migration 0038
     * gave a paragraph a `table` kind, so the reason is gone and so is the gate.
     *
     * That unblocked the accessibility page's 18 image tags per locale — 36,
     * the largest image payload on the site.
     */
    const sectionsApply =
      !ONLY || `${caseFile}/${slug}`.toLowerCase().includes(ONLY) || row.title.toLowerCase().includes(ONLY);

    if (sectionsApply) {
      const enBlocks = await readOrderedBlocks(row.id);
      const arBlocks = arabic ? await readOrderedBlocks(arabic.id) : null;
      const sectionShape = await writeChapterSections({
        rowTitle: row.title,
        chapterId: data.id,
        enBlocks,
        arBlocks,
        aliases: chapterAliases,
      });
      if (sectionShape) console.log(`      sections ${sectionShape}`);
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
    const enSift = decisionsFromBody(body);
    const enDecisions = enSift.kept;
    if (enDecisions.length > 0 || arDecisions.kept.length > 0) {
      decisionReport.push({
        chapter: `${caseFile}/${slug}`,
        en: enDecisions.length,
        ar: arDecisions.kept.length,
        names: enDecisions.map((d) => d.name),
      });
    }

    /*
     * A dropped candidate on EITHER side refuses the pairing.
     *
     * An English drop is reported too, and it is the more serious of the two:
     * a decision that announced itself and could not be read is content
     * missing from the published page, not merely from the translation.
     */
    for (const [side, s] of [["English", enSift], ["Arabic", arDecisions]] as const) {
      if (s.dropped.length > 0) {
        notice(row.title, describeDrops(`${row.title}: ${side} decisions`, s));
      }
    }

    const { data: oldDecisions } = await (await db())
      .from("decisions").select("id").eq("chapter_id", data.id);
    if (oldDecisions && oldDecisions.length > 0) {
      await (await db()).from("translations").delete()
        .eq("entity_type", "decision").in("entity_id", oldDecisions.map((d) => d.id));
      await (await db()).from("decisions").delete().eq("chapter_id", data.id);
    }

    /*
     * Length equality AND completeness on both sides. Equality alone is what
     * let the UAE handles through: three parsed of four found matched
     * English's three, and the guard passed on a list that had lost an item.
     */
    const decisionsComplete = enSift.dropped.length === 0 && arDecisions.dropped.length === 0;
    const pairArabic =
      decisionsComplete &&
      arDecisions.kept.length > 0 &&
      arDecisions.kept.length === enDecisions.length;

    if (arDecisions.kept.length > 0 && !pairArabic && decisionsComplete) {
      notice(row.title,
        `${row.title}: ${enDecisions.length} decision(s) in English but ` +
          `${arDecisions.kept.length} in Arabic. Arabic skipped — pairing by position ` +
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
        const ar = arDecisions.kept[i];
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

      /*
       * Every selected line IS a candidate here — unlike a chapter body, these
       * lines were already chosen as the rows of the outcomes table. So a row
       * whose label is empty after stripping the marker is a genuine drop, not
       * something that was never a row, and it must be counted rather than
       * skipped past: four rows in, three out, English has three, and the old
       * length check would have paired every note one row off.
       */
      const arSift = sift<string, { label: string; note: string | null }>(
        arSelection.lines,
        (arLine) => {
        const [arLabelCell, arNoteCell] = arLine.split(CELL_SEP);
        // Strip any marker from the Arabic label; the status is English-side.
        const label = arLabelCell.replace(/\[[^\]]+\]/, "").trim();
        if (!label) {
          return {
            drop: {
              what: arLine.replace(new RegExp(CELL_SEP, "g"), " | "),
              why: "label cell is empty once the status marker is removed",
            },
          };
        }
          return { keep: { label, note: arNoteCell?.trim() || null } };
        },
      );

      if (arSift.dropped.length > 0) {
        notice(row.title,
          describeDrops(
            `${row.title}: Arabic ${isTargets ? "targets" : "outcomes"} table`,
            arSift,
          ),
        );
      } else {
        arabicItems.push(...arSift.kept);
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
      // Prefix test, not a full parse: a line that announces itself as a
      // sibling is not a handle even when its own syntax is malformed.
      // Both loops use the same exclusion so they cannot drift.
      if (isNonHandleLine(line)) continue; // siblings + cross-cutting; handled above

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
      /*
       * The Arabic handles heading, matched by PREFIX across its real spellings.
       *
       * The script looked only for `ثلاث طرق للدخول` ("three ways in", a literal
       * translation of the English heading). Notion actually uses `ثلاثة مداخل`
       * ("three entries") — and on Neobiz, `ثلاثة مداخل لقراءة هذا الملف`
       * ("three ways into reading this file"). Neither matched, so ALL TWELVE
       * Arabic entry handles were written, sat in Notion, and never synced.
       *
       * Prefix-matched for the same reason the child page is: the tail is a
       * human label that varies per page and means nothing to the sync. The
       * literal translation is kept as an accepted spelling so nothing that
       * did match before stops matching now.
       */
      const AR_HANDLE_HEADINGS = ["ثلاثة مداخل", "ثلاث طرق للدخول", "three ways in"];
      const handlesKey = [...arBody.keys()].find((key) =>
        AR_HANDLE_HEADINGS.some((h) => key.trim().startsWith(h)),
      );
      const arLines = handlesKey ? (arBody.get(handlesKey) ?? []) : [];
      /*
       * Sibling lines are removed BEFORE anything is counted.
       *
       * The Arabic loop had no sibling exclusion, so the `ملف شقيق:` note under
       * this heading counted as a handle line that failed to parse — which is
       * what put UAE at "4 lines, 3 parsed" and made its Arabic unpairable.
       * The completeness check below must measure candidates, not raw lines,
       * or a correctly-skipped sibling reads as a dropped handle forever.
       */
      const arCandidates = arLines.filter((l) => !isNonHandleLine(l));
      for (const line of arCandidates) {
        const h = parseEntryHandle(line, "ar");
        if (h) arabicHandles.push({ invitation: h.invitation, payoff: h.payoff });
      }

      /*
       * An Arabic page that exists but yields no handles is reported.
       *
       * Silence here is ambiguous in the one way that matters: it means either
       * "Moataz has not written the Arabic handles yet" — his work — or "the
       * heading is spelled differently and the lookup missed" — a bug. Those
       * need opposite responses, and without this notice they are the same
       * empty result. The headings actually searched are named, so the answer
       * is readable from the notice rather than requiring a trip to Notion.
       */
      if (arLines.length === 0) {
        notice(row.title,
          `${row.title}: Arabic page found, but no entry-handle list under ` +
            `${AR_HANDLE_HEADINGS.map((h) => `"${h}"`).join(" / ")}. Either the ` +
            "handles are not written in Arabic yet, or they sit under a " +
            "different heading. Headings present: " +
            `${[...arBody.keys()].filter((k) => k !== "__h1__").join(" · ") || "(none)"}`,
        );
      } else if (arabicHandles.length > 0 && arabicHandles.length !== arCandidates.length) {
        /*
         * SOME lines parsed and some did not, which is the dangerous shape.
         *
         * The handles are paired with English BY POSITION, and that pairing is
         * only valid if the Arabic list is complete. Drop the second of four
         * lines and the third Arabic handle silently lands under the second
         * English one — wrong words, on the cover, with nothing to indicate it.
         * A count that happens to match English after a drop is worse than a
         * count that does not, because the guard below will accept it.
         */
        /*
         * The offending lines are named, not just counted.
         *
         * "4 lines, 3 parsed" says something is wrong and nothing about what.
         * The line that failed is the whole answer — it is either a real handle
         * with a separator the parser does not know (fix the parser) or a stray
         * paragraph that was never a handle (fix nothing, or the page). Those
         * are opposite responses and a count cannot tell them apart.
         */
        const unparsed = arCandidates.filter((l) => !parseEntryHandle(l, "ar"));
        notice(row.title,
          `${row.title}: ${arCandidates.length} Arabic handle line(s) but only ` +
            `${arabicHandles.length} parsed. Arabic skipped — pairing by position ` +
            "from an incomplete list would attach the wrong text to the wrong handle.\n" +
            unparsed
              .map((l, i) => `      unparsed ${i + 1}: ${JSON.stringify(l.slice(0, 160))}`)
              .join("\n"),
        );
        arabicHandles.length = 0;
      } else if (arabicHandles.length === 0) {
        // Found the list, parsed nothing from it. The line is shown because the
        // only way this happens is a separator the parser does not know, and
        // the separator is invisible in a count.
        notice(row.title,
          `${row.title}: Arabic entry-handle list found (${arCandidates.length} line(s)) ` +
            "but none parsed — no recognised separator. First line: " +
            `${JSON.stringify(arCandidates[0]?.slice(0, 120) ?? "")}`,
        );
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

  /* ---- Pass 5: static pages → page_sections (0021) ---------------------- */

  for (const row of rows) {
    /*
     * ⚠️ COMPARISON AND ACCESSIBILITY PAGES NO LONGER WRITE HERE.
     *
     * They moved onto the slot model (migrations 0035 and 0038), which carries
     * their prose, their table and — on the accessibility page — 18 image tags
     * per locale that `page_sections` had no way to hold.
     *
     * Their rows are RETIRED rather than left in place. Two representations of
     * one page's prose diverge the moment either is edited, and the stale one
     * has no reader to notice: `getPageSections` is called from five places and
     * only the chapter route ever asked for these three keys. Leaving them
     * would be leaving a second, silently ageing copy of the same page.
     */
    /*
     * ⚠️ ACCESSIBILITY IS STILL HERE ON PURPOSE, AND SHOULD LEAVE.
     *
     * The comparison pages have migrated, so writing them here too would leave
     * a second copy of their prose ageing quietly beside the live one.
     *
     * The accessibility page has NOT migrated: its Arabic page has one image
     * tag sharing a paragraph with prose, and the tag guard refuses the whole
     * page rather than drop that sentence. Retiring its rows while it is
     * refused would blank the page. It keeps writing here until the Notion
     * paragraph is split, and then this clause goes.
     */
    const isProsePage = row.kind === "static" || row.kind === "accessibility";
    if (!isProsePage || !row.route) continue;
    const pageKey = routeToPageKey(row.route);
    if (!pageKey) continue;

    /*
     * Comparison and accessibility pages are ordered prose too, and reuse this
     * path rather than getting one of their own. They already have `chapters`
     * rows for routing and cover links; what they lacked was anywhere for
     * their words to live. Keyed by their full route, so the chapter route can
     * look them up by the same path it already knows.
     *
     * Landing and the gallery are `static` by kind but draw from `settings`
     * and `ui_strings`; they have no ordered prose and must not be given empty
     * section rows.
     */
    if (row.kind === "static" && !STATIC_PROSE_PAGES.has(pageKey)) continue;

    const blocks = await readOrderedBlocks(row.id);
    const enPage = parsePageSections(blocks, row.title);
    const { intro, sections } = enPage;

    if (sections.length === 0 && !intro) {
      notice(row.title, `${row.title}: no prose found on the page. Nothing written.`);
      continue;
    }

    /* Arabic, paired by POSITION — the same rule outcomes and handles use. */
    const arabic: { intro: string; sections: ParsedSection[] } = {
      intro: "",
      sections: [],
    };
    const arabicChild = await findArabicChild(row.id);
    if (arabicChild) {
      const arBlocks = await readOrderedBlocks(arabicChild.id);
      const parsedAr = parsePageSections(arBlocks, arabicChild.title);

      /*
       * Completeness before equality. A block that produced nothing is not
       * automatically harmful — but a side that shed one while the other did
       * not can still arrive at the same count, and then the length check
       * below passes on two lists that no longer describe the same page.
       */
      const pageDrops = [
        ["English", enPage] as const,
        ["Arabic", parsedAr] as const,
      ].filter(([, s]) => s.dropped.length > 0);

      if (pageDrops.length > 0) {
        for (const [side, s] of pageDrops) {
          notice(row.title,
            describeDrops(`${row.title}: ${side} page blocks`, {
              kept: s.sections,
              dropped: s.dropped,
              found: s.sections.length + s.dropped.length,
            }),
          );
        }
      } else if (
        parsedAr.sections.length > 0 &&
        parsedAr.sections.length !== sections.length
      ) {
        /*
         * The headings are printed, not just the counts.
         *
         * This notice used to say only "Arabic has 7 to English's 6", which is
         * true and unactionable — it cannot distinguish "one section is not
         * translated yet" (Moataz's work) from "the parser split the Arabic
         * differently" (a bug). The second is what had been happening on every
         * static page, undetected, because both look identical at the level of
         * a count. Showing both lists makes the extra or missing one obvious.
         */
        notice(
          row.title,
          `${row.title}: Arabic has ${parsedAr.sections.length} section(s) to ` +
            `English's ${sections.length}. Arabic skipped — pairing by position ` +
            "across different counts would attach the wrong text to the wrong section.\n" +
            `      EN: ${sections.map((s) => s.heading || "(untitled)").join(" · ")}\n` +
            `      AR: ${parsedAr.sections.map((s) => s.heading || "(untitled)").join(" · ")}`,
        );
      } else {
        arabic.intro = parsedAr.intro;
        arabic.sections = parsedAr.sections;
      }
    }

    if (DRY_RUN) {
      console.log(
        `  page ${pageKey}: ${sections.length} section(s)` +
          `${intro ? " + intro" : ""}` +
          `${arabic.sections.length > 0 ? `, ar ${arabic.sections.length}` : ""}`,
      );
      continue;
    }

    /*
     * Replace wholesale, translations first. `translations` is polymorphic
     * with nothing to cascade, so deleting rows alone orphans their text and
     * every re-sync accumulates another dead set.
     */
    const { data: doomed } = await (await db())
      .from("page_sections")
      .select("id")
      .eq("page", pageKey);

    if (doomed && doomed.length > 0) {
      await (await db())
        .from("translations")
        .delete()
        .eq("entity_type", "page_section")
        .in("entity_id", doomed.map((d) => d.id));
    }
    await (await db()).from("page_sections").delete().eq("page", pageKey);

    /*
     * The intro is a section too, with an empty heading and sort_order -1. It
     * renders as an unheaded lede; giving it a row keeps one code path for
     * page copy rather than a special field on a table that has no other.
     */
    const toWrite: {
      slug: string;
      heading: string;
      body: string;
      order: number;
      kind: "prose" | "table";
    }[] = [];
    if (intro) {
      toWrite.push({ slug: "intro", heading: "", body: intro, order: -1, kind: "prose" });
    }
    sections.forEach((s, i) =>
      toWrite.push({
        slug: s.slug,
        heading: s.heading,
        body: s.body,
        order: i,
        kind: s.kind,
      }),
    );

    let written = 0;
    for (const item of toWrite) {
      const { data, error: dbError } = await (await db())
        .from("page_sections")
        .insert({
          page: pageKey,
          slug: item.slug,
          sort_order: item.order,
          kind: item.kind,
        })
        .select("id")
        .single();

      if (dbError || !data) {
        fail(row.title, dbError?.message ?? "insert returned no row");
        continue;
      }

      await upsertTranslations("page_section", data.id, "en", {
        ...(item.heading ? { heading: item.heading } : {}),
        body: item.body,
      });

      const ar =
        item.slug === "intro"
          ? arabic.intro
            ? { heading: "", body: arabic.intro }
            : null
          : arabic.sections[item.order] ?? null;

      if (ar?.body) {
        await upsertTranslations("page_section", data.id, "ar", {
          ...(ar.heading ? { heading: ar.heading } : {}),
          body: ar.body,
        });
      }

      written++;
    }

    updated.push(`${row.title} → ${written} section(s)`);
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
   * Pages still without a write path. The four prose pages are handled in
   * Pass 5; what remains is comparison and accessibility pages, plus static
   * rows whose copy lives in `settings`/`ui_strings` rather than sections.
   *
   * Listed rather than dropped: a row appearing in neither the synced list nor
   * the skipped list looks like it worked.
   */
  const unhandledRows = rows.filter((r) => {
    if (r.kind === "comparison" || r.kind === "accessibility") return true;
    if (r.kind !== "static") return false;
    const key = r.route ? routeToPageKey(r.route) : null;
    return !key || !STATIC_PROSE_PAGES.has(key);
  });

  console.log("\nSKIPPED — build tasks and derived pages:\n");
  for (const s of skipped) console.log(`  - ${s}`);

  if (unhandledRows.length > 0) {
    console.log("\nNOT YET IMPLEMENTED — comparison, accessibility and chrome pages:\n");
    for (const r of unhandledRows) {
      console.log(`  - ${r.title}  (${r.kind}, route ${r.route ?? "none"})`);
    }
    console.log(
      "\n  Landing and the gallery draw from settings/ui_strings and are complete.\n" +
        "  Comparison and accessibility pages still need a write path.\n",
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
