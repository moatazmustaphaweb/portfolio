import "server-only";

import type { Metadata } from "next";

import { getSettings } from "@/lib/content/settings";
import type { Locale } from "@/lib/content/types";
import { LOCALES } from "@/lib/content/types";

import { siteUrl } from "./site";

/**
 * Per-page metadata.
 *
 * This site's entire distribution model is a pasted link — into LinkedIn, into
 * a WhatsApp thread, into a recruiter's ATS. Until now every page emitted the
 * same `og:title` ("Moataz Mustapha") and the same description, so sharing a
 * specific case file showed the site name and told the recipient nothing.
 *
 * Every page gets:
 *  - a title that names the page, suffixed with the site name
 *  - a description taken from the page's own first real sentence
 *  - a canonical URL, and `alternates.languages` for the other locale, so the
 *    two language versions do not compete as duplicate content
 *
 * `og:image` stays whatever `settings.og_image` provides — still NULL, and a
 * launch-gate blocker. Omitted rather than substituted (the fallback rule).
 */

/** Trim a body of prose to something a preview card will not truncate badly. */
function toDescription(text?: string, max = 200): string | undefined {
  if (!text) return undefined;
  const flat = text.replace(/\s+/g, " ").trim();
  if (!flat) return undefined;
  if (flat.length <= max) return flat;
  // Cut at a sentence end if there is one in range, otherwise at a word.
  const window = flat.slice(0, max);
  const stop = Math.max(window.lastIndexOf(". "), window.lastIndexOf("۔ "));
  const cut = stop > max * 0.5 ? stop + 1 : window.lastIndexOf(" ");
  return `${flat.slice(0, cut > 0 ? cut : max).trim()}…`;
}

/**
 * Build metadata for one page.
 *
 * `path` is the locale-less route ("/work/cervello"), so the canonical and the
 * language alternates are derived rather than passed in twice.
 */
export async function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: Locale;
  path: string;
  /** The page's own name. Omitted → falls back to the site name alone. */
  title?: string;
  /** Raw prose; trimmed here. */
  description?: string;
}): Promise<Metadata> {
  const settings = await getSettings(locale);
  const siteName = settings.get("name");
  const ogImage = settings.get("og_image");

  /*
   * The separator is a MIDDOT, not an em dash.
   *
   * Decision 058 removed the em dash from everything a visitor reads, and this
   * line is read three times on every page: <title>, og:title and
   * twitter:title. It is the browser tab, the search result and the link
   * preview, which makes it the most-seen string on the site and the one place
   * the sweep of the CONTENT could never have reached, because it is composed
   * in code.
   *
   * A grep of the served HTML is what found it. 182 em dashes across 58 routes
   * with the database already at zero, three per page, constant — a shape that
   * says chrome rather than prose. See docs/learn.md Part 5.
   */
  const resolvedTitle = title && siteName ? `${title} · ${siteName}` : (title ?? siteName);

  const resolvedDescription =
    toDescription(description) ??
    settings.get("description") ??
    settings.get("tagline");

  const base = siteUrl();
  const canonical = `${base}/${locale}${path}`;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${base}/${l}${path}`]),
      ),
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      siteName: siteName ?? undefined,
      locale,
      type: "article",
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: resolvedDescription,
    },
  };
}
