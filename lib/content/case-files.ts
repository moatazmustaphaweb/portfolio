import "server-only";

import { cache } from "react";

import { supabaseServer } from "@/lib/supabase/server";

import { resolveMany, withFields } from "./translate";
import type {
  CaseFile,
  CaseFileDetail,
  Locale,
  Media,
  MediaRow,
} from "./types";

/**
 * Case files — the gallery and cover queries.
 *
 * Every query filters `status = 'published'`. The service role bypasses RLS, so
 * that filter is the actual enforcement here, not a belt-and-braces duplicate
 * of the policy — omitting it would publish drafts.
 */

/**
 * Covers travel outside the site — into LinkedIn and WhatsApp link previews —
 * where they cannot be recalled. A redacted asset must never end up there
 * (decision 028).
 *
 * This throws rather than returning null. A silently-dropped cover looks like
 * a missing image and gets ignored; a thrown error gets fixed. The database
 * has a trigger enforcing the same rule, so this is defence in depth against
 * a writer that bypasses it.
 */
function assertNotRedacted(cover: Media | null, slug: string): void {
  if (cover?.redacted) {
    throw new Error(
      `Case file "${slug}" has a redacted image (${cover.cloudinary_public_id}) ` +
        "as its cover. Covers are shared into link previews outside our " +
        "control and must use non-NDA imagery only — see decision 028.",
    );
  }
}

/** Attach resolved alt/caption to media rows. Returns a lookup by media id. */
async function resolveMedia(
  rows: readonly MediaRow[],
  locale: Locale,
): Promise<Map<string, Media>> {
  const withText = await withFields("media", rows, locale);
  return new Map(withText.map((m) => [m.id, m]));
}

/** Fetch the media referenced by a set of ids, resolved for the locale. */
async function fetchMedia(
  ids: readonly (string | null)[],
  locale: Locale,
): Promise<Map<string, Media>> {
  const present = [...new Set(ids.filter((id): id is string => id !== null))];
  if (present.length === 0) return new Map();

  const { data, error } = await supabaseServer
    .from("media")
    .select("*")
    .in("id", present);

  if (error) throw new Error(`Failed to load media: ${error.message}`);

  return resolveMedia(data ?? [], locale);
}

/** The Classic Gallery: every published case file, with cover and copy. */
export const listCaseFiles = cache(async (locale: Locale): Promise<CaseFile[]> => {
  const { data, error } = await supabaseServer
    .from("case_files")
    .select("*")
    .eq("status", "published")
    .order("sort_order");

  if (error) throw new Error(`Failed to load case files: ${error.message}`);

  const rows = data ?? [];
  const [withText, media] = await Promise.all([
    withFields("case_file", rows, locale),
    fetchMedia(
      rows.map((r) => r.cover_media_id),
      locale,
    ),
  ]);

  return withText.map((row) => {
    const cover = row.cover_media_id
      ? (media.get(row.cover_media_id) ?? null)
      : null;
    assertNotRedacted(cover, row.slug);
    return { ...row, cover };
  });
});

/** Slugs for `generateStaticParams`. */
export const listCaseFileSlugs = cache(async (): Promise<string[]> => {
  const { data, error } = await supabaseServer
    .from("case_files")
    .select("slug")
    .eq("status", "published")
    .order("sort_order");

  if (error) throw new Error(`Failed to load case file slugs: ${error.message}`);
  return (data ?? []).map((r) => r.slug);
});

/**
 * One case file with its chapters, outcomes and targets — everything the
 * cover route needs, in four queries rather than one per child row.
 *
 * Returns null for an unknown or unpublished slug so the route can call
 * notFound() rather than throwing.
 */
export const getCaseFile = cache(
  async (slug: string, locale: Locale): Promise<CaseFileDetail | null> => {
    const { data: row, error } = await supabaseServer
      .from("case_files")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw new Error(`Failed to load case file ${slug}: ${error.message}`);
    if (!row) return null;

    const [chapterRes, outcomeRes, targetRes] = await Promise.all([
      supabaseServer
        .from("chapters")
        .select("*")
        .eq("case_file_id", row.id)
        .eq("status", "published")
        .order("sort_order"),
      supabaseServer
        .from("outcomes")
        .select("*")
        .eq("case_file_id", row.id)
        .order("sort_order"),
      supabaseServer
        .from("targets")
        .select("*")
        .eq("case_file_id", row.id)
        .order("sort_order"),
    ]);

    for (const res of [chapterRes, outcomeRes, targetRes]) {
      if (res.error) {
        throw new Error(`Failed to load case file ${slug}: ${res.error.message}`);
      }
    }

    const chapterRows = chapterRes.data ?? [];

    const [caseFields, chapters, outcomes, targets, media] = await Promise.all([
      resolveMany("case_file", [row.id], locale),
      withFields("chapter", chapterRows, locale),
      withFields("outcome", outcomeRes.data ?? [], locale),
      withFields("target", targetRes.data ?? [], locale),
      fetchMedia(
        [row.cover_media_id, ...chapterRows.map((c) => c.hero_media_id)],
        locale,
      ),
    ]);

    const cover = row.cover_media_id
      ? (media.get(row.cover_media_id) ?? null)
      : null;
    assertNotRedacted(cover, row.slug);

    return {
      ...row,
      fields: caseFields.get(row.id) ?? {},
      cover,
      chapters: chapters.map((c) => ({
        ...c,
        hero: c.hero_media_id ? (media.get(c.hero_media_id) ?? null) : null,
      })),
      outcomes,
      targets,
    };
  },
);
