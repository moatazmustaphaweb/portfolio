import "server-only";

import { cache } from "react";

import { supabaseServer } from "@/lib/supabase/server";

import { resolveMany, withFields } from "./translate";
import type { ChapterDetail, ChapterWithDecisions, Locale } from "./types";

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

    const [chapterFields, caseFileFields, features, decisions, media] = await Promise.all([
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
