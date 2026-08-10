import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

/**
 * next-intl request config.
 *
 * Note the empty `messages`. next-intl is used here ONLY for locale routing and
 * detection — every human-readable string comes from Supabase via
 * `lib/content/ui.ts`, per rule 1. There are deliberately no message JSON files
 * in this repo; adding them would create a second, competing source of truth
 * for copy.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return { locale, messages: {} };
});
