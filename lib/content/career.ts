import "server-only";

import { cache } from "react";

import { supabaseServer } from "@/lib/supabase/server";

import { resolveManyDetailed } from "./translate";
import type { FieldLocales, Fields, Locale } from "./types";

/**
 * The About page's career timeline.
 *
 * Added 2026-08-24, task `043240826`, against migrations 0053–0055. `CLAUDE.md`
 * has carried this gap since the LLM read test named it: the About design has
 * had a timeline component since before the site existed, and it was never built
 * because there was nothing to put in it.
 *
 * ── WHAT IS DELIBERATELY ABSENT ─────────────────────────────────────────────
 *
 * **Employer names.** Moataz asked for the domain, the title, the dates, the
 * city and the country — and nothing else. There is no `employer` column in
 * `career_roles` to read, so this file cannot leak one by accident. Rule 6 keeps
 * client identity out of the repo, and a timeline is exactly where a name would
 * otherwise creep in.
 *
 * ── FIELDS ──────────────────────────────────────────────────────────────────
 *
 * `title`, `domain`, `city` and `country` are TRANSLATIONS, not columns. "Madrid"
 * is "مدريد" and "Spain" is "إسبانيا"; storing them as columns would have forced
 * the Arabic page to render Latin place names — the same defect decision 053
 * exists to prevent one layer up.
 *
 * `resolveManyDetailed`, not `resolveMany`: a role whose Arabic is missing falls
 * back to English (decision 013), and unmarked English inside a `dir="rtl"`
 * document lays out as Arabic. The renderer needs to know which language each
 * field actually came from. This is the mistake `020230826` fixed on sibling
 * notes; it is not repeated here.
 *
 * Wrapped in React `cache` so one request issues one query.
 */

export type CareerRole = {
  id: string;
  /** ISO date. The row's own start; formatting is the renderer's business. */
  started: string;
  /** ISO date, or null when the role is current. */
  ended: string | null;
  /** `title`, `domain`, `city`, `country` — all translated. */
  fields: Fields;
  /** Which locale supplied each field. Decision 053. */
  fieldLocales: FieldLocales;
};

export const getCareerRoles = cache(
  async (locale: Locale): Promise<CareerRole[]> => {
    const { data, error } = await supabaseServer
      .from("career_roles")
      .select("id, started, ended, sort_order")
      /*
       * Rows are per-locale (0053, following 0045/0046/0048/0049), so this
       * filters rather than resolving one shared row per language. A locale
       * that has no rows yet renders no timeline — which is correct and is
       * exactly the state the table ships in.
       */
      .eq("locale", locale)
      .order("sort_order");

    if (error) {
      throw new Error(`Failed to load career roles: ${error.message}`);
    }

    const rows = data ?? [];
    if (rows.length === 0) return [];

    const translated = await resolveManyDetailed(
      "career_role",
      rows.map((r) => r.id),
      locale,
    );

    return rows.map((row) => {
      const t = translated.get(row.id);
      return {
        id: row.id,
        started: row.started,
        ended: row.ended,
        fields: t?.fields ?? {},
        fieldLocales: t?.fieldLocales ?? {},
      };
    });
  },
);
