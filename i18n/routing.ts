import { defineRouting } from "next-intl/routing";

import { DEFAULT_LOCALE, LOCALES } from "@/lib/content/types";

/**
 * Locale routing. The locale is always in the URL — never cookie-only — so
 * every page is shareable, indexable, and legible to an AI reader in both
 * languages (architecture Part 2).
 *
 * `localePrefix: "always"` means /en/work and /ar/work, never a bare /work.
 * A prefix-less default would give the English version two URLs and split its
 * search ranking.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});
