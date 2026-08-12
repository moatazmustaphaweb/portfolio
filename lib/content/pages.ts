import "server-only";

import { cache } from "react";

import { supabaseServer } from "@/lib/supabase/server";

import { withFields } from "./translate";
import type { Locale, PageSection } from "./types";

/**
 * Static page prose — About, Philosophy, Systems, Contact.
 *
 * One query plus one translation resolve per page, whatever its length.
 *
 * The `intro` slug is separated out here rather than in each page, so no page
 * has to remember that the lede is a section with an empty heading. A page
 * asks for what it renders: an intro and a list of sections.
 */
export const getPageSections = cache(
  async (
    page: string,
    locale: Locale,
  ): Promise<{ intro?: string; sections: PageSection[] }> => {
    const { data, error } = await supabaseServer
      .from("page_sections")
      .select("*")
      .eq("page", page)
      .order("sort_order");

    if (error) throw new Error(`Failed to load page ${page}: ${error.message}`);

    const rows = data ?? [];
    if (rows.length === 0) return { sections: [] };

    const withText = await withFields("page_section", rows, locale);

    return {
      intro: withText.find((s) => s.slug === "intro")?.fields.body,
      sections: withText.filter((s) => s.slug !== "intro"),
    };
  },
);
