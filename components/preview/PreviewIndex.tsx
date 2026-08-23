import Link from "next/link";

import {
  CHROME,
  DRAFT_CASE_FILE_LAYER,
  DRAFT_CASE_FILE_SECTION,
  DRAFT_CASE_FILE_SLUGS,
  NON_ROUTES,
  STUB_ROUTES,
  type StubRoute,
} from "@/components/preview/preview-stubs";
import type { Locale } from "@/lib/content/types";
import { dirForLocale } from "@/lib/content/types";

/**
 * ⚠️ PREVIEW SCAFFOLDING. See `preview-stubs.ts`. Nothing here renders with
 * the flag off.
 *
 * The site map — every page the project plans, built and unbuilt, at the route
 * it will live on, grouped by build layer and section, each row linking to the
 * route. This is the deliverable: the sequence, and whether the pages connect.
 *
 * ── WHAT IS NOT DONE HERE, DELIBERATELY ────────────────────────────────────
 * The real header and footer are untouched. Navigation comes from Supabase
 * (rules 1 and 2) and this page is a local tool; adding a link to it in the
 * nav would put preview scaffolding one flag-flip away from the live shell.
 * The map is the map. The nav stays as it is.
 *
 * ── RTL ────────────────────────────────────────────────────────────────────
 * Layout mirrors from the locale; every utility is logical, including the
 * `ps-6` indent on nested chapter rows. Scaffolding labels and route strings
 * are English and carry `lang="en" dir="ltr"` on the element that holds them.
 * Page names that come from the DATABASE are in the locale's language and are
 * marked from `fieldLocales`, the same way every other page marks them — never
 * by sniffing the characters.
 */

/** Scaffolding and route strings: English inside an Arabic document. */
const EN = { lang: "en", dir: "ltr" } as const;

/**
 * Notion page names, draft slugs and the non-route names are English, so they
 * are marked as English text the same way an untranslated field would be.
 * Caught by querying the running `/ar` page rather than by reading this file:
 * every one of them rendered unmarked, and `The Door — Step 1: Word Cards`
 * inside `dir="rtl"` resolves its colon and dash to the wrong side.
 */
const NAME_EN: Locale = "en";

/** A page that exists and renders from the database. */
export type BuiltEntry = {
  name: string;
  /** Which locale supplied `name`, when it came from the content layer. */
  nameLocale?: Locale;
  /** The full path including the locale segment. */
  path: string;
  /** 1 for a chapter or sub-route sitting under a case file. */
  depth: 0 | 1;
};

type RowState = "built" | "draft" | "not-built" | "not-a-page";

const STATE_LABEL: Record<RowState, string> = {
  built: CHROME.stateBuilt,
  draft: CHROME.stateDraft,
  "not-built": CHROME.stateNotBuilt,
  "not-a-page": CHROME.stateNotAPage,
};

/**
 * One row.
 *
 * The state is a pill carrying its own label — never colour alone, and
 * `min-w-pill` so the column reads as one shape (tokens, status pills).
 */
function Row({
  state,
  name,
  nameLocale,
  route,
  href,
  depth = 0,
}: {
  state: RowState;
  name: string;
  nameLocale?: Locale;
  route: string;
  href?: string;
  depth?: 0 | 1;
}) {
  const inner = (
    <>
      <span
        className="inline-flex min-w-pill shrink-0 justify-center rounded-pill border border-DEFAULT px-3 py-1 font-mono text-micro uppercase text-fg-muted"
        {...EN}
      >
        {STATE_LABEL[state]}
      </span>
      <span
        className="min-w-0 text-ui text-fg"
        lang={nameLocale}
        dir={nameLocale ? dirForLocale(nameLocale) : undefined}
      >
        {name}
      </span>
      <span className="min-w-0 text-meta text-fg-dim sm:ms-auto sm:text-end" {...EN}>
        {route}
      </span>
    </>
  );

  const className = [
    "flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-subtle py-3",
    depth === 1 ? "ps-6" : "",
    href ? "transition-colors hover:bg-surface" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

function GroupHeading({ children }: { children: string }) {
  return (
    <h2 className="mt-14 max-w-measure text-h3 text-fg" {...EN}>
      {children}
    </h2>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h3 className="mt-8 font-mono text-label uppercase text-fg-dim" {...EN}>
      {children}
    </h3>
  );
}

/**
 * Groups the stub routes by layer, then section, preserving the order they are
 * declared in — which is Notion's order. Built from the array rather than from
 * a second hand-written list of layer names, so a route added to
 * `preview-stubs.ts` appears here with nothing else to update.
 */
function groupStubs(routes: readonly StubRoute[]) {
  const layers: { layer: string; sections: { section: string; routes: StubRoute[] }[] }[] =
    [];
  for (const route of routes) {
    let layer = layers.find((l) => l.layer === route.layer);
    if (!layer) {
      layer = { layer: route.layer, sections: [] };
      layers.push(layer);
    }
    let section = layer.sections.find((s) => s.section === route.section);
    if (!section) {
      section = { section: route.section, routes: [] };
      layer.sections.push(section);
    }
    section.routes.push(route);
  }
  return layers;
}

export function PreviewIndex({
  locale,
  built,
}: {
  locale: Locale;
  built: readonly BuiltEntry[];
}) {
  const grouped = groupStubs(STUB_ROUTES);

  return (
    <div className="mx-auto max-w-container px-gutter py-section-y">
      <p
        className="inline-flex rounded-pill border border-DEFAULT bg-surface px-3 py-1 font-mono text-label uppercase text-fg-muted"
        {...EN}
      >
        {CHROME.kicker}
      </p>

      <h1 className="mt-5 max-w-measure text-title text-fg" {...EN}>
        {CHROME.indexTitle}
      </h1>

      <p className="mt-6 max-w-measure text-body text-fg-muted" {...EN}>
        {CHROME.indexLede}
      </p>

      {/* ── Built ─────────────────────────────────────────────────────────── */}
      <GroupHeading>{CHROME.builtHeading}</GroupHeading>
      <div className="mt-6 border-b border-subtle">
        {built.map((entry) => (
          <Row
            key={entry.path}
            state="built"
            name={entry.name}
            nameLocale={entry.nameLocale}
            route={entry.path}
            href={entry.path}
            depth={entry.depth}
          />
        ))}
      </div>

      {/* ── Draft case files ──────────────────────────────────────────────── */}
      <GroupHeading>{DRAFT_CASE_FILE_LAYER}</GroupHeading>
      <SectionHeading>{DRAFT_CASE_FILE_SECTION}</SectionHeading>
      <p className="mt-4 max-w-measure text-body-sm text-fg-dim" {...EN}>
        {CHROME.draftNotice}
      </p>
      <div className="mt-6 border-b border-subtle">
        {DRAFT_CASE_FILE_SLUGS.map((slug) => (
          <Row
            key={slug}
            state="draft"
            name={slug}
            nameLocale={NAME_EN}
            route={`/${locale}/work/${slug}`}
            href={`/${locale}/work/${slug}`}
          />
        ))}
      </div>

      {/* ── Unbuilt, by layer and section ─────────────────────────────────── */}
      {grouped.map((layer) => (
        <div key={layer.layer}>
          <GroupHeading>{layer.layer}</GroupHeading>
          {layer.sections.map((section) => (
            <div key={section.section}>
              <SectionHeading>{section.section}</SectionHeading>
              <div className="mt-4 border-b border-subtle">
                {section.routes.map((route) => {
                  const path = `/${locale}/${route.segments.join("/")}`;
                  /*
                   * A route with several entries — the Door — lists each of
                   * them, all pointing at the one route it actually is, and
                   * all showing that same route. The repetition is the point:
                   * four steps, one URL. The sequence is what is being judged,
                   * so it is shown rather than collapsed into a single row.
                   */
                  return route.entries.map((entry, i) => (
                    <Row
                      key={entry.name}
                      state="not-built"
                      name={entry.name}
                      nameLocale={NAME_EN}
                      route={route.template}
                      href={path}
                      depth={i === 0 ? 0 : 1}
                    />
                  ));
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* ── Planned surfaces that are not pages ───────────────────────────── */}
      <GroupHeading>{CHROME.nonRouteHeading}</GroupHeading>
      <div className="mt-6 border-b border-subtle">
        {NON_ROUTES.map((item) => (
          <Row
            key={item.name}
            state="not-a-page"
            name={item.name}
            nameLocale={NAME_EN}
            route={`${item.where} · ${item.layer}`}
          />
        ))}
      </div>
    </div>
  );
}
