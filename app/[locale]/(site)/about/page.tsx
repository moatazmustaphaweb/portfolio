import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProseSections } from "@/components/layout/ProseSections";
import { getPageSections } from "@/lib/content/pages";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * About.
 *
 * The chronology is the argument, so the section order from Notion is the
 * order here: Now → Before → The Artist's Book → What that year taught me.
 * A reader who starts at the top arrives at the deaf-school year already
 * knowing what it produced, which is the only way that section reads as
 * evidence rather than biography.
 *
 * Nothing is summarised or reordered on this page. The sections carry their
 * own headings from the database.
 */
/**
 * ISR window (decision 009). Next requires this to be a literal — an imported
 * constant fails the build with "Invalid segment configuration export".
 * See lib/content/revalidate.ts for why 300.
 */
export const revalidate = 300;

export default async function About({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const [{ intro, sections }, ui] = await Promise.all([
    getPageSections("about", l),
    getUiStrings(l),
  ]);

  return (
    <div className="mx-auto max-w-prose px-gutter py-section-y">
      <Breadcrumb
        locale={l}
        label={ui.t("breadcrumb_label")}
        crumbs={[
          { label: ui.t("home") ?? "", href: "/" },
          { label: ui.t("page_about") ?? "" },
        ]}
      />

      {ui.t("page_about") ? (
        <h1 className="max-w-measure text-title text-fg">{ui.t("page_about")}</h1>
      ) : null}

      <ProseSections intro={intro} sections={sections} />

      {/*
        The "Elsewhere" section already names these in prose. These are the
        same destinations as actual links — the section says where to go, this
        makes going there possible without the address bar.
      */}
      <nav className="mt-18 flex flex-wrap gap-3 border-t border-DEFAULT pt-8">
        {[
          { label: ui.t("page_philosophy"), href: `/${l}/about/philosophy` },
          { label: ui.t("page_work"), href: `/${l}/work` },
          { label: ui.t("page_systems"), href: `/${l}/systems` },
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
