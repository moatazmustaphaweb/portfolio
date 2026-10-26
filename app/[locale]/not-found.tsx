import { hasLocale } from "next-intl";
import { locale as rootLocale } from "next/root-params";

import { NotFoundView } from "@/components/layout/NotFoundView";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/content/types";

/**
 * 404 for `notFound()` thrown inside a locale route — a case file whose
 * detail does not load, a Results route with no targets.
 *
 * Renders inside `app/[locale]/layout.tsx`, the root layout since task
 * 003261026, so `<html lang dir>`, the fonts, the skip link and the
 * SiteHeader are already there. A not-found boundary receives no params; the
 * locale comes from `next/root-params`, which reads the route segment rather
 * than request headers, so this does not make anything dynamic.
 *
 * Unmatched URLs do not come here: they go to `app/global-not-found.tsx`.
 */
export default async function LocaleNotFound() {
  const requested = await rootLocale();
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return <NotFoundView locale={locale} header={false} />;
}
