import type { MetadataRoute } from "next";

import {
  listCaseFiles,
  listCaseFileSlugsWithTargets,
} from "@/lib/content/case-files";
import { listChapterParams } from "@/lib/content/chapters";
import { LOCALES, type Locale } from "@/lib/content/types";
import { siteUrl } from "@/lib/seo/site";

/**
 * sitemap.xml
 *
 * Every URL is emitted once per locale with `alternates.languages` pointing at
 * its counterpart, so a crawler understands `/en/work/x` and `/ar/work/x` are
 * the same page in two languages rather than duplicate content. Getting this
 * wrong is the standard way a bilingual site competes with itself in search.
 *
 * Routes come from the database, so the sitemap cannot drift from what is
 * actually published — an unpublished case file is absent by construction
 * rather than by remembering to remove it.
 */

/** Static routes that exist for every locale. */
const STATIC_ROUTES = [
  "",
  "/work",
  "/systems",
  "/about",
  "/about/philosophy",
  "/contact",
] as const;

function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap[number] {
  const base = siteUrl();
  return {
    url: `${base}/${LOCALES[0]}${path}`,
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((locale: Locale) => [locale, `${base}/${locale}${path}`]),
      ),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [caseFiles, chapters, withTargets] = await Promise.all([
    listCaseFiles(LOCALES[0]),
    listChapterParams(),
    listCaseFileSlugsWithTargets(),
  ]);

  return [
    ...STATIC_ROUTES.map((path) =>
      entry(path, path === "" ? "weekly" : "monthly", path === "" ? 1 : 0.8),
    ),
    ...caseFiles.map((cf) => entry(`/work/${cf.slug}`, "monthly", 0.9)),
    ...chapters.map((c) =>
      entry(`/work/${c.caseFile}/${c.chapter}`, "monthly", 0.7),
    ),

    /*
     * The two route families the sitemap was missing. Both are real pages a
     * crawler should reach: the linear view is the printable whole-case-file
     * read, and the results table is where the metric discipline actually
     * lives. `/results` is emitted only for case files that declare targets —
     * the same list `generateStaticParams` uses, so the sitemap cannot list a
     * URL that 404s.
     */
    ...caseFiles.map((cf) => entry(`/work/${cf.slug}/all`, "monthly", 0.6)),
    ...withTargets.map((slug) => entry(`/work/${slug}/results`, "monthly", 0.7)),
  ];
}
