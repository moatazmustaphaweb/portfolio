import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getChapter } from "@/lib/content/chapters";
import { getPageSections } from "@/lib/content/pages";
import { getUiStrings } from "@/lib/content/ui";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/lib/content/types";
import { dirForLocale } from "@/lib/content/types";

/**
 * Systems — composed from `SystemsEssay.dc.html` (Direction B).
 *
 * ⚠️ TWO DIRECTIONS EXIST and this picks one. `Systems.dc.html` is the
 * documentation version — token table, component states with stable/beta/
 * review pills, a versioned changelog. `SystemsEssay.dc.html` is the essay
 * that argues and points at evidence, and carries a banner offering the other.
 *
 * Direction B is built because **it is the one the content supports.** The
 * Notion page is an essay — "What I've actually built", "Working inside a
 * system I didn't own", "The patterns that repeat across the work". There is
 * no token table, no component inventory and no changelog anywhere in the
 * database, so Direction A would be a designed shell around nothing.
 *
 * Not a preference. If Moataz wants Direction A, it needs content first.
 *
 * The evidence cards are resolved through `getChapter`, so a link appears only
 * when there is a published chapter behind it.
 */
/**
 * ISR window (decision 009). Next requires this to be a literal — an imported
 * constant fails the build with "Invalid segment configuration export".
 * See lib/content/revalidate.ts for why 300.
 */
export const revalidate = 300;

/**
 * The page's own lede becomes its preview description — the first real
 * sentence of the page, not the site-wide tagline.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const [{ intro }, ui] = await Promise.all([
    getPageSections("systems", l),
    getUiStrings(l),
  ]);
  return pageMetadata({
    locale: l,
    path: "/systems",
    title: ui.t("page_systems"),
    description: intro,
  });
}

/**
 * The chapters each argument section offers as evidence.
 *
 * ── KEYED BY SECTION SLUG, NOT BY POSITION ──────────────────────────────────
 *
 * This was a flat array zipped against the sections by index, and `filter()`
 * COMPACTS — so an unresolvable chapter did not leave a hole, it shifted every
 * later card up onto an argument that does not support it. Unpublishing
 * Cervello put Egypt's accessibility chapter under the paragraph about the
 * Cervello design system.
 *
 * The index was never a real relationship, only a coincidence of ordering that
 * held while both lists were full. A section's evidence is now named by the
 * section's own slug, so the binding is stated rather than inferred and cannot
 * slip: if a chapter cannot be resolved, THAT section renders without a card
 * and no other section is affected.
 *
 * `page_sections.slug` is the key because it already exists, is stable, and is
 * the only identifier the page and the database agree on — no schema change,
 * no new column, nothing to migrate. Its one weakness is that the slug derives
 * from the heading, so renaming a heading in Notion breaks the binding — and
 * it breaks SAFELY, to no card, with a warning in development (see below).
 *
 * A section may name more than one chapter. `what-ive-actually-built` argues
 * two things and its prose points at both, so it gets both cards; flattening
 * them into a positional list is what let them bleed into the next section.
 */
const EVIDENCE: Record<string, readonly { caseFile: string; chapter: string }[]> = {
  "what-ive-actually-built": [
    { caseFile: "cervello", chapter: "method" },
    { caseFile: "cervello", chapter: "permission-architecture" },
  ],
  "working-inside-a-system-i-didnt-own": [
    { caseFile: "egypt-acquisition", chapter: "accessibility" },
  ],
  // "the-patterns-that-repeat-across-the-work" names no chapter. Its argument
  // is drawn from all of them, and a card would have to pick one arbitrarily.
};

export default async function Systems({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const [{ intro, sections }, ui, resolvedBySlug] = await Promise.all([
    getPageSections("systems", l),
    getUiStrings(l),
    /*
     * Resolved per section, and the section slug is carried through the whole
     * way. Nothing downstream re-derives which section a card belongs to, so
     * there is no step at which the association can be lost.
     */
    (async () => {
      const entries = await Promise.all(
        Object.entries(EVIDENCE).map(async ([sectionSlug, pointers]) => {
          const cards = await Promise.all(
            pointers.map(async (e) => {
              const chapter = await getChapter(e.caseFile, e.chapter, l);
              // Unresolvable — unpublished, renamed, or the parent case file
              // withdrawn. This section loses THIS card and nothing else.
              if (!chapter?.fields.title) return null;
              return {
                href: `/${l}/work/${e.caseFile}/${e.chapter}`,
                title: chapter.fields.title,
                caseFile: chapter.caseFile.fields.title,
              };
            }),
          );
          return [sectionSlug, cards.filter((c) => c !== null)] as const;
        }),
      );
      return new Map(entries);
    })(),
  ]);

  /*
   * A binding that names a section which no longer exists is a silent failure:
   * the card simply never renders, and the page looks intentional. Warned in
   * development only — it is an authoring mistake, not a runtime error, and it
   * must never take a page down in production.
   */
  if (process.env.NODE_ENV !== "production") {
    const present = new Set(sections.map((s) => s.slug));
    for (const slug of Object.keys(EVIDENCE)) {
      if (!present.has(slug)) {
        console.warn(
          `[systems] EVIDENCE names section "${slug}", which is not on the page. ` +
            "A heading was probably renamed in Notion; its evidence card is not rendering.",
        );
      }
    }
  }

  const [lastSection, ...rest] = [...sections].reverse();
  const argument = rest.reverse();
  const close = sections.length > 1 ? lastSection : undefined;

  return (
    <div className="mx-auto max-w-prose px-gutter py-section-y">
      <Breadcrumb
        locale={l}
        label={ui.t("breadcrumb_label")}
        crumbs={[
          { label: ui.t("home") ?? "", href: "/" },
          { label: ui.t("page_systems") ?? "" },
        ]}
      />

      {ui.t("page_systems") ? (
        <p className="font-mono text-label uppercase text-fg-dim">
          {ui.t("page_systems")}
        </p>
      ) : null}

      <h1 className="mt-4 max-w-measure text-title text-fg">
        {ui.t("page_systems")}
      </h1>

      {intro ? (
        <p className="mt-6 max-w-measure whitespace-pre-line text-lead text-fg-body">
          {intro}
        </p>
      ) : null}

      {argument.map((section) => {
        // By slug. `i` is deliberately no longer in scope — reintroducing a
        // positional lookup here is exactly the bug this replaced.
        const cards = resolvedBySlug.get(section.slug) ?? [];
        return section.fields.body ? (
          <section key={section.id} className="mt-14 border-t border-DEFAULT pt-10">
            {section.fields.heading ? (
              <h2
                className="mb-5 max-w-measure text-h3 text-fg"
                lang={section.fieldLocales.heading}
                dir={section.fieldLocales.heading ? dirForLocale(section.fieldLocales.heading) : undefined}
              >
                {section.fields.heading}
              </h2>
            ) : null}
            <p
              className="max-w-measure whitespace-pre-line text-body text-fg-body"
              lang={section.fieldLocales.body}
              dir={section.fieldLocales.body ? dirForLocale(section.fieldLocales.body) : undefined}
            >
              {section.fields.body}
            </p>

            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="mt-6 flex max-w-measure items-center gap-4 rounded-panel border border-DEFAULT bg-surface p-card-p transition-colors hover:border-strong"
              >
                <span className="flex min-w-0 flex-col gap-1">
                  {ui.t("evidence") ? (
                    <span className="font-mono text-micro uppercase text-fg-dim">
                      {ui.t("evidence")}
                    </span>
                  ) : null}
                  <span className="text-statement text-fg">{card.title}</span>
                  {card.caseFile ? (
                    <span className="text-meta text-fg-muted">{card.caseFile}</span>
                  ) : null}
                </span>
                <span
                  aria-hidden="true"
                  className="ms-auto text-ui text-fg-muted rtl:rotate-180"
                >
                  →
                </span>
              </Link>
            ))}
          </section>
        ) : null;
      })}

      {/* The closing section is set as a statement, as the design draws it. */}
      {close?.fields.body ? (
        <section className="mt-14 border-t border-DEFAULT pt-10">
          {close.fields.heading ? (
            <h2
              className="mb-4 font-mono text-label uppercase text-fg-dim"
              lang={close.fieldLocales.heading}
              dir={close.fieldLocales.heading ? dirForLocale(close.fieldLocales.heading) : undefined}
            >
              {close.fields.heading}
            </h2>
          ) : null}
          <p
            className="max-w-measure whitespace-pre-line text-statement text-fg"
            lang={close.fieldLocales.body}
            dir={close.fieldLocales.body ? dirForLocale(close.fieldLocales.body) : undefined}
          >
            {close.fields.body}
          </p>
        </section>
      ) : null}

      <nav aria-label={ui.t("nav_onward")} className="mt-18 flex flex-wrap gap-6 border-t border-DEFAULT pt-8">
        {[
          { label: ui.t("page_work"), href: `/${l}/work` },
          { label: ui.t("page_philosophy"), href: `/${l}/about/philosophy` },
          { label: ui.t("page_contact"), href: `/${l}/contact` },
        ].map((link) =>
          link.label ? (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-2 text-ui text-fg-muted transition-colors hover:text-fg"
            >
              {link.label}
              <span aria-hidden="true" className="rtl:rotate-180">
                →
              </span>
            </Link>
          ) : null,
        )}
      </nav>
    </div>
  );
}
