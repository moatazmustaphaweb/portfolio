import "server-only";

import { cache } from "react";

import { supabaseServer } from "@/lib/supabase/server";

import { withFields } from "./translate";
import { DEFAULT_LOCALE } from "./types";
import type { Locale, PageSection } from "./types";

/**
 * Static page prose — About, Philosophy, Systems, Contact — and the
 * accessibility document page.
 *
 * One query plus one translation resolve per page, whatever its length.
 *
 * The `intro` slug is separated out here rather than in each page, so no page
 * has to remember that the lede is a section with an empty heading. A page
 * asks for what it renders: an intro and a list of sections.
 *
 * ⚠️ EACH LOCALE OWNS ITS OWN SEQUENCE OF SECTIONS (migration 0048), so the
 * first thing this does after the query is CHOOSE one. A section is not a
 * translatable unit; a PAGE is. The Arabic accessibility page writes six headed
 * English subsections as six numbered paragraphs and folds two English sections
 * into one — 7 sections against 14, with nothing missing.
 *
 * Decision 013's fallback therefore resolves PER PAGE: this locale's sequence
 * if the page has one, else the English sequence whole. Per-section fallback is
 * not available and would be wrong — a section has no language-independent name
 * to pair on, so "the sections the Arabic lacks" would be the six items it has
 * already said, served back to the Arabic reader in English underneath their
 * own Arabic text.
 *
 * Nothing marks the language here: an English row carries only an English
 * translation, so `withFields` reports `fieldLocales === 'en'` on its own and
 * `ProseSections` marks it `lang="en"` (decision 053).
 */
export const getPageSections = cache(
  async (
    page: string,
    locale: Locale,
  ): Promise<{ intro?: string; introLang?: Locale; sections: PageSection[] }> => {
    const { data, error } = await supabaseServer
      .from("page_sections")
      .select("*")
      .eq("page", page)
      .order("sort_order");

    if (error) throw new Error(`Failed to load page ${page}: ${error.message}`);

    const all = data ?? [];
    if (all.length === 0) return { sections: [] };

    const requested = all.filter((s) => s.locale === locale);
    const rows =
      requested.length > 0 ? requested : all.filter((s) => s.locale === DEFAULT_LOCALE);
    if (rows.length === 0) return { sections: [] };

    const withText = await withFields("page_section", rows, locale);

    return {
      intro: withText.find((s) => s.slug === "intro")?.fields.body,
      // The intro is lifted out of `sections`, so its language has to come
      // with it or ProseSections cannot mark it (decision 053).
      introLang: withText.find((s) => s.slug === "intro")?.fieldLocales.body,
      sections: withText.filter((s) => s.slug !== "intro"),
    };
  },
);
