import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProseSections } from "@/components/layout/ProseSections";
import { getChapter } from "@/lib/content/chapters";
import { getPageSections } from "@/lib/content/pages";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * Systems.
 *
 * The page's own claim is "I don't design screens, I design the rules that
 * produce them" — and its second line concedes that the sentence is easy to
 * say and hard to prove. So the page points at evidence rather than repeating
 * the claim, and the evidence is chapters that already exist.
 *
 * Those chapters are RESOLVED, not hardcoded links. `getChapter` returns null
 * for anything unpublished, so a link appears only when there is something
 * behind it. The "Coming" section makes the same promise about the
 * open-source system — "this page will link to it when it exists, not before"
 * — and gets no placeholder for exactly that reason.
 */
/**
 * ISR window (decision 009). Next requires this to be a literal — an imported
 * constant fails the build with "Invalid segment configuration export".
 * See lib/content/revalidate.ts for why 300.
 */
export const revalidate = 300;

/**
 * The chapters this page offers as evidence.
 *
 * Content pointers, kept in one place and resolved through the query layer so
 * an unpublished or renamed chapter drops out of the page instead of becoming
 * a broken link.
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

  const [{ intro, sections }, ui, evidence] = await Promise.all([
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

  const links = evidence.filter((e): e is NonNullable<typeof e> => e !== null);

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
        <h1 className="max-w-measure text-title text-fg">{ui.t("page_systems")}</h1>
      ) : null}

      <ProseSections intro={intro} sections={sections} />

      {/*
        The evidence, as links. The prose names these chapters; this is what
        makes them reachable.
      */}
      {links.length > 0 ? (
        <ul className="mt-14 flex flex-col gap-px overflow-hidden rounded-panel border border-DEFAULT bg-border">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex flex-col gap-1 bg-surface p-card-p transition-colors hover:bg-surface-raised"
              >
                <span className="text-statement text-fg">{link.title}</span>
                {link.caseFile ? (
                  <span className="font-mono text-micro uppercase text-fg-dim">
                    {link.caseFile}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <nav className="mt-18 flex flex-wrap gap-3 border-t border-DEFAULT pt-8">
        {[
          { label: ui.t("page_work"), href: `/${l}/work` },
          { label: ui.t("page_philosophy"), href: `/${l}/about/philosophy` },
          { label: ui.t("page_contact"), href: `/${l}/contact` },
        ].map((link) =>
          link.label ? (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex h-control-h items-center rounded-control border border-DEFAULT px-4 text-ui text-fg-muted transition-colors hover:border-strong hover:text-fg"
            >
              {link.label}
            </Link>
          ) : null,
        )}
      </nav>
    </div>
  );
}
