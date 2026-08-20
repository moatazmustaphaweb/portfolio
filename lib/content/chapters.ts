import "server-only";

import { cache } from "react";

import { supabaseServer } from "@/lib/supabase/server";

import { referencedMediaIds, splitBody } from "./image-refs";
import { resolveMany, resolveManyDetailed, withFields } from "./translate";
import { DEFAULT_LOCALE } from "./types";
import type {
  ChapterBlock,
  ChapterDetail,
  ChapterSection,
  ChapterWithDecisions,
  Locale,
  Media,
} from "./types";

/**
 * Chapters — the chapter route, and the params for static generation.
 *
 * A chapter is only reachable when it AND its parent case file are published;
 * the join below enforces that server-side, mirroring the RLS policy.
 */

/** `[caseFile, chapter]` pairs for `generateStaticParams`. */
export const listChapterParams = cache(
  async (): Promise<{ caseFile: string; chapter: string }[]> => {
    const { data, error } = await supabaseServer
      .from("chapters")
      .select("slug, sort_order, case_files!inner(slug, status)")
      .eq("status", "published")
      .eq("case_files.status", "published")
      .order("sort_order");

    if (error) throw new Error(`Failed to load chapter params: ${error.message}`);

    return (data ?? []).map((row) => ({
      caseFile: (row.case_files as unknown as { slug: string }).slug,
      chapter: row.slug,
    }));
  },
);

/**
 * Every chapter of one case file, with bodies and decisions — the Linear View.
 *
 * Deliberately NOT `getChapter` in a loop. That would issue seven separate
 * round trips for Egypt and re-resolve the same case file each time; this
 * takes two queries and two translation resolves regardless of length.
 *
 * `kind = 'chapter'` only. Comparison and accessibility pages are reachable
 * from the cover but are not part of the sequence (amendment 033), and a
 * "read start to finish" that silently included them would misrepresent the
 * case file's shape.
 *
 * Returns null for an unknown or unpublished case file.
 */
export const listChapterBodies = cache(
  async (
    caseFileSlug: string,
    locale: Locale,
  ): Promise<ChapterWithDecisions[] | null> => {
    const { data: caseFileRow, error: caseFileError } = await supabaseServer
      .from("case_files")
      .select("id")
      .eq("slug", caseFileSlug)
      .eq("status", "published")
      .maybeSingle();

    if (caseFileError) {
      throw new Error(`Failed to load ${caseFileSlug}: ${caseFileError.message}`);
    }
    if (!caseFileRow) return null;

    const { data: chapterRows, error: chapterError } = await supabaseServer
      .from("chapters")
      .select("*")
      .eq("case_file_id", caseFileRow.id)
      .eq("kind", "chapter")
      .eq("status", "published")
      .order("sort_order");

    if (chapterError) {
      throw new Error(`Failed to load chapters: ${chapterError.message}`);
    }

    const chapters = chapterRows ?? [];
    if (chapters.length === 0) return [];

    const { data: decisionRows, error: decisionError } = await supabaseServer
      .from("decisions")
      .select("*")
      .in("chapter_id", chapters.map((c) => c.id))
      .order("sort_order");

    if (decisionError) {
      throw new Error(`Failed to load decisions: ${decisionError.message}`);
    }

    const [withText, decisions] = await Promise.all([
      withFields("chapter", chapters, locale),
      withFields("decision", decisionRows ?? [], locale),
    ]);

    const byChapter = new Map<string, typeof decisions>();
    for (const d of decisions) {
      const list = byChapter.get(d.chapter_id) ?? [];
      list.push(d);
      byChapter.set(d.chapter_id, list);
    }

    return withText.map((c) => ({ ...c, decisions: byChapter.get(c.id) ?? [] }));
  },
);

/**
 * The slots of one chapter, with their prose and their figures resolved.
 *
 * ⚠️ THE ORDER OF WORK MATTERS. Bodies are read first, the media ids they
 * reference are collected across the WHOLE chapter, and every media row is then
 * fetched in ONE query. Resolving each figure as it is met would issue one
 * round trip per image — sixteen on Chapter One, per locale, on every render —
 * which is exactly the per-request cost `docs/design/perf-budget` exists to
 * prevent.
 *
 * NDA is stamped from the owning case file here, the same way the hero already
 * does it, so no component prop carries it and no call site can omit it
 * (amendment 036).
 */
async function loadChapterSections(
  chapterId: string,
  locale: Locale,
  nda: boolean,
): Promise<ChapterSection[]> {
  const { data: sectionRows, error } = await supabaseServer
    .from("chapter_sections")
    .select("id, slot, sort_order")
    .eq("chapter_id", chapterId)
    .order("sort_order");

  if (error) throw new Error(`Failed to load chapter sections: ${error.message}`);
  if (!sectionRows || sectionRows.length === 0) return [];

  const { data: paraRows, error: paraError } = await supabaseServer
    .from("chapter_paragraphs")
    .select("id, chapter_section_id, sort_order, kind")
    .in("chapter_section_id", sectionRows.map((s) => s.id))
    .order("sort_order");

  if (paraError) throw new Error(`Failed to load chapter paragraphs: ${paraError.message}`);

  /*
   * Table cells for every table paragraph on this chapter, in ONE query.
   *
   * Same reasoning as the media fetch below: a query per table would be one
   * round trip per grid, and the accessibility page has one with 42 cells.
   */
  const tableParaIds = (paraRows ?? []).filter((p) => p.kind === "table").map((p) => p.id);
  const cellsByPara = new Map<string, { row: number; col: number; id: string }[]>();
  if (tableParaIds.length > 0) {
    const { data: cellRows, error: cellError } = await supabaseServer
      .from("chapter_table_cells")
      .select("id, chapter_paragraph_id, row_idx, col_idx")
      .in("chapter_paragraph_id", tableParaIds)
      .order("row_idx")
      .order("col_idx");
    if (cellError) throw new Error(`Failed to load table cells: ${cellError.message}`);
    for (const c of cellRows ?? []) {
      const list = cellsByPara.get(c.chapter_paragraph_id) ?? [];
      list.push({ row: c.row_idx, col: c.col_idx, id: c.id });
      cellsByPara.set(c.chapter_paragraph_id, list);
    }
  }

  /*
   * Detailed resolution: the body text AND the locale that supplied it. A
   * paragraph that fell back is English inside an Arabic document and has to be
   * marked as such — see decision 053 and `FieldLocales`.
   */
  const cellIds = [...cellsByPara.values()].flat().map((c) => c.id);
  const [sectionFields, paraFields, cellFields] = await Promise.all([
    resolveManyDetailed("chapter_section", sectionRows.map((s) => s.id), locale),
    resolveManyDetailed("chapter_paragraph", (paraRows ?? []).map((p) => p.id), locale),
    resolveManyDetailed("chapter_table_cell", cellIds, locale),
  ]);

  /**
   * Reassemble one table into the string `SectionTable` expects.
   *
   * ⚠️ This is the guarantee that the migrated table renders IDENTICALLY. There
   * is no second table renderer: the cells go back into the same
   * tab-and-newline shape `page_sections` produced, and the same component
   * draws it. The markup cannot drift because there is nothing to drift from.
   */
  const tableBody = (paraId: string): { body: string; lang: Locale } => {
    const cells = cellsByPara.get(paraId) ?? [];
    const grid: string[][] = [];
    let sawFallback = false;
    for (const c of cells) {
      const entry = cellFields.get(c.id);
      (grid[c.row] ??= [])[c.col] = entry?.fields.text ?? "";
      if ((entry?.fieldLocales.text ?? locale) !== locale) sawFallback = true;
    }
    return {
      body: grid.map((row) => [...row].map((x) => x ?? "").join("\t")).join("\n"),
      // One language for the whole grid: a table half-served by the fallback is
      // not a mixed-language table, it is an untranslated one.
      lang: sawFallback ? DEFAULT_LOCALE : locale,
    };
  };

  /* Every media id this chapter references, in one pass, then one query. */
  const bodies = (paraRows ?? [])
    .filter((p) => p.kind !== "table")
    .map((p) => paraFields.get(p.id)?.fields.body)
    .filter((b): b is string => Boolean(b));

  const mediaIds = referencedMediaIds(bodies);
  const mediaById = new Map<string, Media>();

  if (mediaIds.length > 0) {
    const { data: mediaRows } = await supabaseServer
      .from("media")
      .select("*")
      .in("id", mediaIds);

    const resolved = await withFields("media", mediaRows ?? [], locale);
    for (const m of resolved) mediaById.set(m.id, { ...m, nda });
  }

  const bySection = new Map<string, ChapterBlock[]>();
  for (const para of paraRows ?? []) {
    if (para.kind === "table") {
      const t = tableBody(para.id);
      if (t.body.trim()) {
        const blocks = bySection.get(para.chapter_section_id) ?? [];
        blocks.push({ kind: "table", body: t.body, lang: t.lang });
        bySection.set(para.chapter_section_id, blocks);
      }
      continue;
    }

    const entry = paraFields.get(para.id);
    const body = entry?.fields.body;
    if (!body) continue;

    // The language of THIS paragraph, which is the page's locale unless the
    // fallback supplied it.
    const lang: Locale = entry?.fieldLocales.body ?? locale;

    const blocks = bySection.get(para.chapter_section_id) ?? [];
    for (const part of splitBody(body)) {
      blocks.push(
        part.kind === "text"
          ? { kind: "prose", text: part.text, lang }
          : { kind: "image", media: mediaById.get(part.mediaId) ?? null },
      );
    }
    bySection.set(para.chapter_section_id, blocks);
  }

  return sectionRows.map((row) => {
    const entry = sectionFields.get(row.id);
    return {
      id: row.id,
      slot: row.slot,
      heading: entry?.fields.heading,
      headingLang: entry?.fieldLocales.heading ?? locale,
      blocks: bySection.get(row.id) ?? [],
    };
  });
}

/**
 * One chapter with its parent and features.
 *
 * Returns null when either the chapter or its case file is missing or
 * unpublished, so the route calls notFound() rather than rendering a partial.
 */
export const getChapter = cache(
  async (
    caseFileSlug: string,
    chapterSlug: string,
    locale: Locale,
  ): Promise<ChapterDetail | null> => {
    const { data: caseFileRow, error: caseFileError } = await supabaseServer
      .from("case_files")
      .select("*")
      .eq("slug", caseFileSlug)
      .eq("status", "published")
      .maybeSingle();

    if (caseFileError) {
      throw new Error(`Failed to load ${caseFileSlug}: ${caseFileError.message}`);
    }
    if (!caseFileRow) return null;

    const { data: chapterRow, error: chapterError } = await supabaseServer
      .from("chapters")
      .select("*")
      .eq("case_file_id", caseFileRow.id)
      .eq("slug", chapterSlug)
      .eq("status", "published")
      .maybeSingle();

    if (chapterError) {
      throw new Error(`Failed to load chapter ${chapterSlug}: ${chapterError.message}`);
    }
    if (!chapterRow) return null;

    const { data: featureRows, error: featureError } = await supabaseServer
      .from("features")
      .select("*")
      .eq("chapter_id", chapterRow.id)
      .order("sort_order");

    if (featureError) {
      throw new Error(`Failed to load features: ${featureError.message}`);
    }

    /*
     * Siblings for prev/next. Only `kind = 'chapter'` participates: a
     * comparison or accessibility page is reachable from the cover but is not
     * part of the sequence (amendment 033), so it must not appear as
     * "next chapter".
     */
    const { data: siblingRows } = await supabaseServer
      .from("chapters")
      .select("id, slug, sort_order")
      .eq("case_file_id", caseFileRow.id)
      .eq("kind", "chapter")
      .eq("status", "published")
      .order("sort_order");

    const { data: decisionRows, error: decisionError } = await supabaseServer
      .from("decisions")
      .select("*")
      .eq("chapter_id", chapterRow.id)
      .order("sort_order");

    if (decisionError) {
      throw new Error(`Failed to load decisions: ${decisionError.message}`);
    }

    const [chapterFields, caseFileFields, features, decisions, media, sections] = await Promise.all([
      resolveMany("chapter", [chapterRow.id], locale),
      resolveMany("case_file", [caseFileRow.id], locale),
      withFields("feature", featureRows ?? [], locale),
      withFields("decision", decisionRows ?? [], locale),
      (async () => {
        if (!chapterRow.hero_media_id) return null;
        const { data } = await supabaseServer
          .from("media")
          .select("*")
          .eq("id", chapterRow.hero_media_id)
          .maybeSingle();
        if (!data) return null;
        const [resolved] = await withFields("media", [data], locale);
        // NDA travels from the owning case file, not the image.
        return { ...resolved, nda: caseFileRow.nda };
      })(),
      loadChapterSections(chapterRow.id, locale, caseFileRow.nda),
    ]);

    const siblings = siblingRows ?? [];
    const index = siblings.findIndex((c) => c.id === chapterRow.id);
    const prevRow = index > 0 ? siblings[index - 1] : null;
    const nextRow =
      index !== -1 && index < siblings.length - 1 ? siblings[index + 1] : null;

    const neighbourTitles = await resolveMany(
      "chapter",
      [prevRow?.id, nextRow?.id].filter((v): v is string => Boolean(v)),
      locale,
    );

    return {
      ...chapterRow,
      fields: chapterFields.get(chapterRow.id) ?? {},
      // 1-based for display; index is -1 for a comparison or accessibility
      // page, which is not part of the sequence and shows no indicator.
      position: { current: index + 1, total: siblings.length },
      sections,
      prev: prevRow
        ? { slug: prevRow.slug, title: neighbourTitles.get(prevRow.id)?.title }
        : null,
      next: nextRow
        ? { slug: nextRow.slug, title: neighbourTitles.get(nextRow.id)?.title }
        : null,
      hero: media,
      features,
      decisions,
      caseFile: {
        ...caseFileRow,
        fields: caseFileFields.get(caseFileRow.id) ?? {},
        cover: null,
        coverCard: null,
        // The chapter route shows a breadcrumb, not a card.
        headline: null,
      },
    };
  },
);
