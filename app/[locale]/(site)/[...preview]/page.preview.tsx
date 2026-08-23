import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PreviewIndex, type BuiltEntry } from "@/components/preview/PreviewIndex";
import { StubPage } from "@/components/preview/StubPage";
import {
  CHROME,
  PREVIEW_DISABLED_SENTINEL,
  PREVIEW_INDEX_SEGMENT,
  PREVIEW_STUBS_ENABLED,
  findStubRoute,
  stubCatchAllPaths,
} from "@/components/preview/preview-stubs";
import { getCaseFile, listCaseFileSlugs } from "@/lib/content/case-files";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * ⚠️ PREVIEW SCAFFOLDING — LOCAL ONLY.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Every unbuilt route in the plan, plus the site map at `/[locale]/preview`,
 * served from one catch-all. Read `components/preview/preview-stubs.ts` first;
 * it carries the reasoning and the flag.
 *
 * ── THE FILE IS CALLED `page.preview.tsx`, AND THAT IS THE GATE ────────────
 *
 * Next does not treat this as a page unless `preview.tsx` is in
 * `pageExtensions`, and `next.config.mjs` only adds it when
 * `NEXT_PUBLIC_PREVIEW_STUBS` is set. With the flag off this route DOES NOT
 * EXIST — not a 404, not a match, nothing. That is the only shape that makes
 * the flag-off state byte-identical, and it is not decoration:
 *
 *   As a plain `page.tsx`, with `dynamicParams = false` and no real path
 *   declared, this catch-all still answered 404 — and turned every unmatched
 *   URL on the site from a missing ROUTE into a missing PARAM, which Next
 *   renders inside `<html id="__next_error__">`. No `lang`, no `dir`, no font
 *   variables, on every 404 in both locales in production. Measured across two
 *   clean builds. The reasoning is in `next.config.mjs`.
 *
 * Renaming this file back to `page.tsx` reintroduces that. Do not.
 *
 * ── WHY A CATCH-ALL, AND NOT A FILE PER ROUTE ──────────────────────────────
 *
 * One gated file rather than twenty. Each stub route would otherwise need its
 * own `page.preview.tsx`, all of them rendering the same component from the
 * same array, and the array is already the single source both this file and
 * the index read.
 *
 * ── MEASURED, NOT ASSUMED ──────────────────────────────────────────────────
 *
 * Three things about this were established against a running server rather
 * than reasoned about, and two of them are the opposite of what they look like:
 *
 * 1. `generateStaticParams` returning an EMPTY array does not mean "no paths".
 *    Next 16.3 dev stops enforcing `dynamicParams = false` and this catch-all
 *    answers 200 for every unmatched URL on the site, `/en/nonexistent-xyz`
 *    included. Hence the sentinel: the disabled state declares exactly one
 *    path, and this page 404s it.
 *
 * 2. Fall-through into a catch-all depends on WHERE the match fails, and the
 *    two cases look alike from outside:
 *
 *      `/en/work/east` — `work/[caseFile]` REJECTS the param, because it
 *      declares `dynamicParams = false` and `east` is unpublished. The subtree
 *      short-circuits; this file never sees the request even when it declares
 *      that exact path. So the draft case files are handled in
 *      `work/[caseFile]/page.tsx`, the only place that can serve them.
 *
 *      `/en/work/uae-acquisition/cut/example-cut` — the param RESOLVES and no
 *      child route matches `cut/…`. That falls through, and this file serves
 *      it. So Cuts need no route file of their own and must not get one: a real
 *      `cut/[cut]/page.tsx` was written, and WITH THE FLAG OFF it turned every
 *      `/work/<slug>/cut/<anything>` from the designed 404 into Next's
 *      `<html id="__next_error__">` shell in dev, because a param miss inside a
 *      matched subtree renders the error shell rather than the root not-found.
 *      Measured both ways; the file was deleted.
 *
 * 3. Static routes keep winning. `/en/systems` still resolves to the real
 *    Systems page with `/en/systems/open-source` declared here.
 */

/** No path exists but the ones named below. This is the whole guarantee. */
export const dynamicParams = false;

export function generateStaticParams() {
  if (!PREVIEW_STUBS_ENABLED) {
    // See PREVIEW_DISABLED_SENTINEL: an empty array would turn this catch-all
    // into a 200 for every unmatched URL on the site.
    return [{ preview: [PREVIEW_DISABLED_SENTINEL] }];
  }
  return stubCatchAllPaths().map((segments) => ({ preview: [...segments] }));
}

/**
 * Never indexed and never unfurled. Belt and braces: with the flag off these
 * pages do not exist at all, and with it on they exist only on a machine
 * running `next dev` with the variable set.
 */
export const metadata = {
  robots: { index: false, follow: false },
};

/**
 * The built half of the map.
 *
 * Page names come from `ui_strings` and case-file and chapter titles from the
 * content layer, so rule 1 still holds for every row that describes a page
 * which really exists — the literal-string exception is scoped to the pages
 * that do not.
 *
 * `/results` is listed per case file only where it resolves: that route is
 * generated from `listCaseFileSlugsWithTargets`, so a case file claiming no
 * targets has no results route, and a row for it would be a link to a 404 on
 * the one page whose whole job is saying what exists.
 */
async function buildBuiltEntries(locale: Locale): Promise<BuiltEntry[]> {
  const [ui, slugs] = await Promise.all([getUiStrings(locale), listCaseFileSlugs()]);

  const entries: BuiltEntry[] = [];
  const push = (name: string | undefined, path: string, depth: 0 | 1 = 0) => {
    if (name) entries.push({ name, path, depth });
  };

  push(ui.t("home"), `/${locale}`);
  push(ui.t("page_work"), `/${locale}/work`);

  const details = await Promise.all(slugs.map((slug) => getCaseFile(slug, locale)));

  slugs.forEach((slug, i) => {
    const detail = details[i];
    if (!detail) return;
    entries.push({
      name: detail.fields.title ?? slug,
      nameLocale: detail.fieldLocales.title as Locale | undefined,
      path: `/${locale}/work/${slug}`,
      depth: 0,
    });

    for (const chapter of [...detail.chapters, ...detail.pages]) {
      entries.push({
        name: chapter.fields.title ?? chapter.slug,
        nameLocale: chapter.fieldLocales.title as Locale | undefined,
        path: `/${locale}/work/${slug}/${chapter.slug}`,
        depth: 1,
      });
    }

    push(ui.t("read_linear"), `/${locale}/work/${slug}/all`, 1);
    if (detail.targets.length > 0) {
      push(ui.t("results_table"), `/${locale}/work/${slug}/results`, 1);
    }
  });

  push(ui.t("page_about"), `/${locale}/about`);
  push(ui.t("page_philosophy"), `/${locale}/about/philosophy`);
  push(ui.t("page_systems"), `/${locale}/systems`);
  push(ui.t("page_contact"), `/${locale}/contact`);

  return entries;
}

export default async function PreviewCatchAll({
  params,
}: {
  params: Promise<{ locale: string; preview: string[] }>;
}) {
  const { locale, preview } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  // The flag is off. The only declared path is the sentinel, and it is not a
  // page.
  if (!PREVIEW_STUBS_ENABLED) notFound();

  if (preview.length === 1 && preview[0] === PREVIEW_INDEX_SEGMENT) {
    return <PreviewIndex locale={l} built={await buildBuiltEntries(l)} />;
  }

  const route = findStubRoute(preview);
  // Unreachable while `generateStaticParams` and `findStubRoute` read the same
  // array — which is the point of them reading the same array.
  if (!route) notFound();

  return (
    <StubPage
      locale={l}
      title={route.routeName ?? route.entries[0].name}
      template={route.template}
      servedPath={`/${l}/${route.segments.join("/")}`}
      layer={route.layer}
      section={route.section}
      entries={route.entries}
      exampleSlug={route.exampleSlug}
      routeNote={route.entries.length > 1 ? CHROME.doorNote : undefined}
    />
  );
}
