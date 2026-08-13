import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getChapter } from "@/lib/content/chapters";
import { getPageSections } from "@/lib/content/pages";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

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
 * The chapters this page offers as evidence, in the order its argument makes
 * them. Content pointers, resolved through the query layer so a renamed or
 * unpublished chapter drops out rather than 404ing.
 */
const EVIDENCE = [
  { caseFile: "cervello", chapter: "method" },
  { caseFile: "cervello", chapter: "permission-architecture" },
  { caseFile: "egypt-acquisition", chapter: "accessibility" },
] as const;

export default async function Systems({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const [{ intro, sections }, ui, resolved] = await Promise.all([
    getPageSections("systems", l),
    getUiStrings(l),
    Promise.all(
      EVIDENCE.map(async (e) => {
        const chapter = await getChapter(e.caseFile, e.chapter, l);
        if (!chapter?.fields.title) return null;
        return {
          href: `/${l}/work/${e.caseFile}/${e.chapter}`,
          title: chapter.fields.title,
          caseFile: chapter.caseFile.fields.title,
        };
      }),
    ),
  ]);

  const evidence = resolved.filter((e): e is NonNullable<typeof e> => e !== null);

  /*
   * The design pairs each argument section with one evidence card. Sections
   * and evidence are independent lists of different lengths, so they are
   * zipped by index and any surplus section simply renders without a card —
   * better than repeating a link to pad the pattern out.
   */
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

      {argument.map((section, i) => {
        const card = evidence[i];
        return section.fields.body ? (
          <section key={section.id} className="mt-14 border-t border-DEFAULT pt-10">
            {section.fields.heading ? (
              <h2 className="mb-5 max-w-measure text-h3 text-fg">
                {section.fields.heading}
              </h2>
            ) : null}
            <p className="max-w-measure whitespace-pre-line text-body text-fg-body">
              {section.fields.body}
            </p>

            {card ? (
              <Link
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
            ) : null}
          </section>
        ) : null;
      })}

      {/* The closing section is set as a statement, as the design draws it. */}
      {close?.fields.body ? (
        <section className="mt-14 border-t border-DEFAULT pt-10">
          {close.fields.heading ? (
            <h2 className="mb-4 font-mono text-label uppercase text-fg-dim">
              {close.fields.heading}
            </h2>
          ) : null}
          <p className="max-w-measure whitespace-pre-line text-statement text-fg">
            {close.fields.body}
          </p>
        </section>
      ) : null}

      <nav className="mt-18 flex flex-wrap gap-6 border-t border-DEFAULT pt-8">
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
