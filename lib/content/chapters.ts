import "server-only";

import { cache } from "react";

import { supabaseServer } from "@/lib/supabase/server";

import { resolveMany, withFields } from "./translate";
import type { ChapterDetail, Locale } from "./types";

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

    return {
      ...chapterRow,
      fields: chapterFields.get(chapterRow.id) ?? {},
      hero: media,
      features,
      decisions,
      caseFile: {
        ...caseFileRow,
        fields: caseFileFields.get(caseFileRow.id) ?? {},
        cover: null,
        // The chapter route shows a breadcrumb, not a card.
        headline: null,
      },
    };
  },
);
