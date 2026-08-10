import "server-only";

import { cache } from "react";

import { supabaseServer } from "@/lib/supabase/server";

import { resolveMany } from "./translate";
import type { Fields, Locale } from "./types";

/**
 * Site settings — name, tagline, email, linkedin_url, cv_url, og_image.
 *
 * Two kinds of value live here:
 *  - locale-independent (URLs, handles) → `settings.value`
 *  - locale-dependent (name, tagline)   → `translations`, field `value`
 *
 * `get()` checks the translation first and falls back to the column, so a
 * caller never needs to know which kind a given key is.
 *
 * Wrapped in React `cache` so a request that renders header, footer and page
 * metadata issues one query, not three.
 */

export type Settings = {
  get(key: string): string | undefined;
  /** Every key present, for debugging and the settings-completeness check. */
  keys(): string[];
};

export const getSettings = cache(async (locale: Locale): Promise<Settings> => {
  const { data, error } = await supabaseServer
    .from("settings")
    .select("id, key, value")
    .order("sort_order");

  if (error) {
    throw new Error(`Failed to load settings: ${error.message}`);
  }

  const rows = data ?? [];
  const translated = await resolveMany(
    "setting",
    rows.map((r) => r.id),
    locale,
  );

  const resolved = new Map<string, string>();
  for (const row of rows) {
    const fields: Fields = translated.get(row.id) ?? {};
    // Locale-specific value wins; the column is the locale-independent fallback.
    const value = fields.value ?? row.value ?? undefined;
    if (value !== undefined) resolved.set(row.key, value);
  }

  return {
    get: (key) => resolved.get(key),
    keys: () => [...resolved.keys()],
  };
});
