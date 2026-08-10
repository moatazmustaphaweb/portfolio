import "server-only";

import { cache } from "react";

import { supabaseServer } from "@/lib/supabase/server";

import { resolveMany } from "./translate";
import type { Locale } from "./types";

/**
 * UI strings — every interface word on the site.
 *
 * This is what makes the site bilingual rather than "translated content inside
 * an English interface". No component may contain a user-facing literal; it
 * calls `t(key)` instead.
 *
 * A missing key returns `undefined`, never the key itself. Rendering
 * `read_more` to a visitor is worse than rendering nothing, and the error
 * handling rule in docs/conventions.md says to omit the element.
 */

export type UiStrings = {
  t(key: string): string | undefined;
  /** Present keys — used by the seed-completeness check in scripts/. */
  keys(): string[];
};

export const getUiStrings = cache(async (locale: Locale): Promise<UiStrings> => {
  const { data, error } = await supabaseServer.from("ui_strings").select("id, key");

  if (error) {
    throw new Error(`Failed to load ui_strings: ${error.message}`);
  }

  const rows = data ?? [];
  const translated = await resolveMany(
    "ui_string",
    rows.map((r) => r.id),
    locale,
  );

  const resolved = new Map<string, string>();
  for (const row of rows) {
    const label = translated.get(row.id)?.label;
    if (label !== undefined) resolved.set(row.key, label);
  }

  return {
    t: (key) => resolved.get(key),
    keys: () => [...resolved.keys()],
  };
});
