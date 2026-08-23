import "server-only";

import { cache } from "react";

import { supabaseServer } from "@/lib/supabase/server";

import { resolveMany, resolveManyDetailed, withFields } from "./translate";
import { DEFAULT_LOCALE } from "./types";
import type {
  CoverParagraph,
  CoverSection,
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

/**
 * The card-shaped variant of a cover, by convention: `<public_id>-card`.
 *
 * WHY A CONVENTION AND NOT A COLUMN. `case_files` carries exactly one
 * `cover_media_id`, and the two render sites want different crops of the same
 * artwork — the cover page a full-bleed master, the gallery card a 1.6:1 that
 * `c_fill` will not mangle. A second column (`cover_card_media_id`) would say
 * this explicitly and is the more orthodox answer; it is also a schema change,
 * and this does the same job without one.
 *
 * It fails safe in the direction that matters. The lookup is against our own
 * `media` table, not against Cloudinary, so a missing variant is a null here
 * rather than a 404 in the browser: no row, no variant, card falls back to the
 * cover asset and behaves exactly as it always has. Nothing is required to
 * exist, and no existing case file changes behaviour.
 *
 * Rule 3 is intact — still only a `public_id` in the database, still a named
 * preset building the URL.
 */
async function resolveCoverCard(
  cover: Media | null,
  locale: Locale,
  nda: boolean,
): Promise<Media | null> {
  if (!cover) return null;

  const { data, error } = await supabaseServer
    .from("media")
    .select("*")
    .eq("cloudinary_public_id", `${cover.cloudinary_public_id}-card`)
    .maybeSingle();

  // A failed lookup must not take the page down: the card simply uses the
  // cover asset, which is the pre-existing behaviour.
  if (error || !data) return null;

  const resolved = await resolveMedia([data], locale, nda);
  return resolved.get(data.id) ?? null;
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
   * The summary per case file, for llms.txt and the gallery.
   *
   * The opening slot's FIRST paragraph — `thesis` where a cover has one,
   * `what-it-is` where it does not. Two queries for every card rather than
   * reading the legacy `thesis` field, because that field is being removed and
   * llms.txt would otherwise lose every description silently at cleanup.
   *
   * It also fixes a gap that predates the slot model: Cervello has no thesis
   * field, so llms.txt has been listing it with no description at all.
   */
  const summaryByCaseFile = new Map<string, string>();
  {
    const { data: openingRows } = await supabaseServer
      .from("cover_sections")
      .select("id, case_file_id, slot")
      .in("case_file_id", rows.map((r) => r.id))
      .in("slot", ["thesis", "what-it-is"]);

    // thesis wins where a cover has both; Neobiz carries both slots.
    const opening = new Map<string, string>();
    for (const s of openingRows ?? []) {
      if (s.slot === "thesis" || !opening.has(s.case_file_id)) {
        opening.set(s.case_file_id, s.id);
      }
    }

    const sectionIds = [...opening.values()];
    if (sectionIds.length > 0) {
      /*
       * ⚠️ TWO ROWS NOW SIT AT `sort_order = 0` PER SECTION — one per locale
       * (migration 0046) — so this picks a language rather than a position.
       * Filtering on `sort_order` alone would return both and the winner would
       * depend on row order, which is how an Arabic gallery card would start
       * showing English at random.
       *
       * The locale is chosen per section: this locale's opening paragraph if
       * the cover has one, else the English one (decision 013). The fallback
       * is done here rather than by `resolveMany`, because after 0046 an
       * Arabic paragraph row simply does not exist when the slot has no
       * Arabic — there is no row for the resolver to fall back on.
       */
      const { data: firstParas } = await supabaseServer
        .from("cover_paragraphs")
        .select("id, cover_section_id, sort_order, locale")
        .in("cover_section_id", sectionIds)
        .eq("sort_order", 0);

      const wanted = new Map<string, string>();
      const english = new Map<string, string>();
      for (const p of firstParas ?? []) {
        if (p.locale === locale) wanted.set(p.cover_section_id, p.id);
        if (p.locale === DEFAULT_LOCALE) english.set(p.cover_section_id, p.id);
      }
      // Two maps rather than one written twice: the preference is stated once
      // and cannot depend on the order the rows came back in.
      const chosen = new Map(
        sectionIds
          .map((id) => [id, wanted.get(id) ?? english.get(id)] as const)
          .filter((e): e is readonly [string, string] => Boolean(e[1])),
      );

      const paraFields = await resolveMany("cover_paragraph", [...chosen.values()], locale);
      for (const [caseFileId, sectionId] of opening) {
        const paraId = chosen.get(sectionId);
        const body = paraId ? paraFields.get(paraId)?.body : undefined;
        if (body) summaryByCaseFile.set(caseFileId, body);
      }
    }
  }

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

      if (!row.cover_media_id)
        return { ...row, cover: null, coverCard: null, headline, summary: summaryByCaseFile.get(row.id) };
      const media = await fetchMedia([row.cover_media_id], locale, row.nda);
      const cover = media.get(row.cover_media_id) ?? null;
      assertNotRedacted(cover, row.slug);
      const coverCard = await resolveCoverCard(cover, locale, row.nda);
      assertNotRedacted(coverCard, row.slug);
      return { ...row, cover, coverCard, headline, summary: summaryByCaseFile.get(row.id) };
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
      // Detailed: the case-file title is rendered into the page (053).
      resolveManyDetailed("case_file", [row.id], locale),
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

    const coverCard = await resolveCoverCard(cover, locale, row.nda);
    assertNotRedacted(coverCard, row.slug);

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

    /*
     * Cover slots (0031). Ordered by `sort_order`, which is per case file — a
     * future cover may want role first, then why-it-matters. Nothing here
     * encodes today's order as a rule.
     */
    const { data: sectionRows, error: sectionError } = await supabaseServer
      .from("cover_sections")
      .select("id, slot, sort_order, media_id")
      .eq("case_file_id", row.id)
      .order("sort_order");
    if (sectionError) {
      throw new Error(`Failed to load cover sections for ${slug}: ${sectionError.message}`);
    }

    const sections: CoverSection[] = [];
    if ((sectionRows ?? []).length > 0) {
      const sectionIds = (sectionRows ?? []).map((s) => s.id);
      const { data: allParaRows, error: paraError } = await supabaseServer
        .from("cover_paragraphs")
        .select("id, cover_section_id, sort_order, locale")
        .in("cover_section_id", sectionIds)
        .order("sort_order");
      if (paraError) {
        throw new Error(`Failed to load cover paragraphs for ${slug}: ${paraError.message}`);
      }

      /*
       * ⚠️ EACH LOCALE HAS ITS OWN PARAGRAPH SEQUENCE (migration 0046), so the
       * first thing this does is CHOOSE one. A paragraph is not a translatable
       * unit; a slot is. The UAE cover's `thesis` is 2 paragraphs in English
       * and 3 in Arabic, neither a translation of a row in the other.
       *
       * Decision 013's fallback therefore resolves PER SLOT rather than per
       * paragraph: the Arabic sequence if this slot has one, else the English
       * sequence whole, marked `lang="en"`. The old shape could render a slot
       * half Arabic and half English, which is worse than either.
       *
       * Nothing marks the language here: an English row carries only an
       * English translation, so `resolveManyDetailed` reports
       * `fieldLocales.body === 'en'` on its own (decision 053).
       *
       * The same shape as `loadChapterSections`, deliberately — one rule, both
       * places, so neither can drift from the other.
       */
      type CoverParaRow = NonNullable<typeof allParaRows>[number];
      const bySectionLocale = new Map<string, CoverParaRow[]>();
      for (const p of allParaRows ?? []) {
        const key = `${p.cover_section_id} ${p.locale}`;
        const list = bySectionLocale.get(key) ?? [];
        list.push(p);
        bySectionLocale.set(key, list);
      }
      const paraRows = sectionIds.flatMap(
        (id) =>
          bySectionLocale.get(`${id} ${locale}`) ??
          bySectionLocale.get(`${id} ${DEFAULT_LOCALE}`) ??
          [],
      );

      /*
       * Section images, in ONE query for the whole cover — not one round trip
       * per section. `nda` is stamped from the case file by `fetchMedia`, so
       * the grayscale treatment rides on the row and no call site can forget
       * it (amendment 036).
       */
      /*
       * `resolveManyDetailed` rather than `resolveMany`: the cover needs to
       * know WHICH locale each string came from, so English fallback prose can
       * be marked `dir="ltr" lang="en"` (decision 053). Same one round trip
       * per entity type — the detail was already computed and thrown away.
       */
      const [headingFields, paragraphFields, sectionMedia] = await Promise.all([
        resolveManyDetailed("cover_section", sectionIds, locale),
        resolveManyDetailed("cover_paragraph", paraRows.map((p) => p.id), locale),
        fetchMedia((sectionRows ?? []).map((x) => x.media_id), locale, row.nda),
      ]);

      for (const s of sectionRows ?? []) {
        /*
         * The render-side half of migration 0041's forward trigger. The
         * database refuses to attach a redacted asset here; this refuses to
         * render one if it ever arrives another way.
         */
        const sectionImage = s.media_id ? (sectionMedia.get(s.media_id) ?? null) : null;
        assertNotRedacted(sectionImage, row.slug);

        sections.push({
          id: s.id,
          slot: s.slot,
          media: sectionImage,
          heading: headingFields.get(s.id)?.fields.heading,
          headingLang: headingFields.get(s.id)?.fieldLocales.heading,
          /*
           * A paragraph with no text in THIS locale is omitted, not rendered
           * blank. Decision 013 makes a partial translation normal, and an
           * empty <p> would read as a mistake in the writing.
           *
           * The language travels WITH the text, resolved from the same entry,
           * so a paragraph cannot arrive labelled as the wrong one.
           */
          paragraphs: paraRows
            .filter((p) => p.cover_section_id === s.id)
            .map((p) => {
              const entry = paragraphFields.get(p.id);
              const text = entry?.fields.body;
              if (!text || !text.trim()) return null;
              return { text, lang: entry?.fieldLocales.body ?? locale };
            })
            .filter((p): p is CoverParagraph => p !== null),
        });
      }
    }

    /*
     * The summary. Explicit, not positional — `thesis` if the cover has one,
     * otherwise `what-it-is`. Cervello opens with a description rather than an
     * argument, and under the old model had no summary at all: `llms.txt` and
     * its three metadata sites have been describing it with nothing.
     */
    const summary =
      sections.find((s) => s.slot === "thesis")?.paragraphs[0]?.text ??
      sections.find((s) => s.slot === "what-it-is")?.paragraphs[0]?.text;

    return {
      ...row,
      fields: caseFields.get(row.id)?.fields ?? {},
      fieldLocales: caseFields.get(row.id)?.fieldLocales ?? {},
      cover,
      coverCard,
      headline: null,
      sections,
      summary,
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
