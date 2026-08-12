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
  OutcomeStatus,
  SiblingLink,
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
  nda: boolean,
): Promise<Map<string, Media>> {
  const withText = await withFields("media", rows, locale);
  return new Map(withText.map((m) => [m.id, { ...m, nda }]));
}

/** Fetch the media referenced by a set of ids, resolved for the locale. */
async function fetchMedia(
  ids: readonly (string | null)[],
  locale: Locale,
  nda: boolean,
): Promise<Map<string, Media>> {
  const present = [...new Set(ids.filter((id): id is string => id !== null))];
  if (present.length === 0) return new Map();

  const { data, error } = await supabaseServer
    .from("media")
    .select("*")
    .in("id", present);

  if (error) throw new Error(`Failed to load media: ${error.message}`);

  return resolveMedia(data ?? [], locale, nda);
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
  const withText = await withFields("case_file", rows, locale);

  /*
   * The headline outcome per case file — the lowest `sort_order` one. Fetched
   * for all of them in one query rather than per card.
   */
  const { data: outcomeRows } = await supabaseServer
    .from("outcomes")
    .select("id, case_file_id, value, status, sort_order")
    .in("case_file_id", rows.map((r) => r.id))
    .order("sort_order");

  type OutcomeRow = NonNullable<typeof outcomeRows>[number];
  const firstOutcome = new Map<string, OutcomeRow>();
  for (const o of outcomeRows ?? []) {
    if (!firstOutcome.has(o.case_file_id)) firstOutcome.set(o.case_file_id, o);
  }

  const outcomeLabels = await resolveMany(
    "outcome",
    [...firstOutcome.values()].map((o) => o.id),
    locale,
  );

  /*
   * Covers are fetched per case file rather than in one batch, because each
   * one carries its owner's `nda` flag. One extra query per card is worth it
   * to make the treatment impossible to forget.
   */
  return Promise.all(
    withText.map(async (row) => {
      const o = firstOutcome.get(row.id);
      const headline = o
        ? {
            value: o.value,
            status: o.status as OutcomeStatus,
            label: outcomeLabels.get(o.id)?.label,
          }
        : null;

      if (!row.cover_media_id) return { ...row, cover: null, headline };
      const media = await fetchMedia([row.cover_media_id], locale, row.nda);
      const cover = media.get(row.cover_media_id) ?? null;
      assertNotRedacted(cover, row.slug);
      return { ...row, cover, headline };
    }),
  );
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
 * Slugs of published case files that have declared targets.
 *
 * The Results Table route exists only for these. Prerendering it for every
 * case file would statically generate pages whose own guard 404s them —
 * Cervello and UAE declare no targets — which is wasted build output that
 * reads, in the build log, exactly like a page that is broken.
 */
export const listCaseFileSlugsWithTargets = cache(async (): Promise<string[]> => {
  const { data, error } = await supabaseServer
    .from("targets")
    .select("case_files!inner(slug, status, sort_order)")
    .eq("case_files.status", "published");

  if (error) throw new Error(`Failed to load target slugs: ${error.message}`);

  const rows = (data ?? []).map(
    (r) => r.case_files as unknown as { slug: string; sort_order: number },
  );
  return [...new Map(rows.map((c) => [c.slug, c])).values()]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => c.slug);
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

    const [chapterRes, outcomeRes, targetRes, handleRes, siblingRes] = await Promise.all([
      supabaseServer
        .from("chapters")
        .select("*")
        .eq("case_file_id", row.id)
        .eq("status", "published")
        .order("kind")
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
      supabaseServer
        .from("entry_handles")
        .select("*")
        .eq("case_file_id", row.id)
        .order("sort_order"),
      supabaseServer
        .from("case_file_siblings")
        .select("*")
        .eq("case_file_id", row.id)
        .order("sort_order"),
    ]);

    for (const res of [chapterRes, outcomeRes, targetRes, handleRes, siblingRes]) {
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
        row.nda,
      ),
    ]);

    const cover = row.cover_media_id
      ? (media.get(row.cover_media_id) ?? null)
      : null;
    assertNotRedacted(cover, row.slug);

    /*
     * Entry handles. The target chapter is resolved HERE rather than in the
     * page, against the chapters already fetched above — a handle pointing at
     * an unpublished chapter must render as text, not as a link to a 404, and
     * a page cannot be trusted to remember that.
     */
    const handleRows = handleRes.data ?? [];
    const handleFields = await resolveMany(
      "entry_handle",
      handleRows.map((h) => h.id),
      locale,
    );
    const chapterBySlugId = new Map(chapters.map((c) => [c.id, c]));

    const handles = handleRows.map((h) => {
      const target = h.target_chapter_id
        ? (chapterBySlugId.get(h.target_chapter_id) ?? null)
        : null;
      const fields = handleFields.get(h.id) ?? {};
      return {
        id: h.id,
        invitation: fields.invitation,
        payoff: fields.payoff,
        target: target ? { slug: target.slug, title: target.fields.title } : null,
      };
    });

    /*
     * Siblings. Published only — the service role bypasses RLS, so the policy
     * on `case_file_siblings` does not protect this query. A link from a live
     * cover to a draft case file would be a dead end.
     */
    const siblingRows = siblingRes.data ?? [];
    let siblings: SiblingLink[] = [];
    if (siblingRows.length > 0) {
      const { data: siblingCaseFiles } = await supabaseServer
        .from("case_files")
        .select("id, slug")
        .in("id", siblingRows.map((s) => s.sibling_id))
        .eq("status", "published");

      const [siblingTitles, siblingNotes] = await Promise.all([
        resolveMany("case_file", (siblingCaseFiles ?? []).map((c) => c.id), locale),
        resolveMany("case_file_sibling", siblingRows.map((s) => s.id), locale),
      ]);

      siblings = siblingRows.flatMap((s) => {
        const target = (siblingCaseFiles ?? []).find((c) => c.id === s.sibling_id);
        if (!target) return [];
        return [
          {
            id: s.id,
            slug: target.slug,
            title: siblingTitles.get(target.id)?.title,
            note: siblingNotes.get(s.id)?.note,
          },
        ];
      });
    }

    return {
      ...row,
      fields: caseFields.get(row.id) ?? {},
      cover,
      headline: null,
      // Split by kind: the numbered narrative, and the standalone pages that
      // sit under this case file without being part of its sequence.
      chapters: chapters
        .filter((c) => c.kind === "chapter")
        .map((c) => ({
          ...c,
          hero: c.hero_media_id ? (media.get(c.hero_media_id) ?? null) : null,
        })),
      pages: chapters
        .filter((c) => c.kind !== "chapter")
        .map((c) => ({
          ...c,
          hero: c.hero_media_id ? (media.get(c.hero_media_id) ?? null) : null,
        })),
      outcomes,
      targets,
      handles,
      siblings,
    };
  },
);
