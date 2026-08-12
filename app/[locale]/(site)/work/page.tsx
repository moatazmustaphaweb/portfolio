import { setRequestLocale } from "next-intl/server";

import { ProjectGrid, type DomainOption } from "@/components/gallery/ProjectGrid";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { listCaseFiles } from "@/lib/content/case-files";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * Classic Gallery — the hub, and the link that gets sent to recruiters.
 *
 * `listCaseFiles` filters `status = 'published'`, so the four draft mini case
 * files cannot appear here. That is enforced in the query rather than in this
 * page: a filter written at a call site is a filter that gets forgotten on the
 * next surface that lists case files.
 */

/** Maps a `case_files.domain` value to its `ui_strings` key. */
const DOMAIN_LABEL_KEYS: Record<string, string> = {
  banking: "domain_banking",
  "smart-things": "domain_smart_things",
  ai: "domain_ai",
  branding: "domain_branding",
};

/**
 * ISR window (decision 009). Next requires this to be a literal — an imported
 * constant fails the build with "Invalid segment configuration export".
 * See lib/content/revalidate.ts for why 300.
 */
export const revalidate = 300;

export default async function Gallery({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;

  const [caseFiles, ui] = await Promise.all([listCaseFiles(l), getUiStrings(l)]);

  /*
   * Resolve each domain's label once, and attach it to the case file so the
   * card never sees a raw database value. `smart-things` is an identifier, not
   * a word anybody should read.
   */
  const withDomainLabels = caseFiles.map((c) => ({
    ...c,
    fields: {
      ...c.fields,
      domainLabel: ui.t(DOMAIN_LABEL_KEYS[c.domain] ?? "") ?? "",
    },
  }));

  // Only domains that actually have published work — an empty filter is a lie
  // about what is behind it.
  const domains: DomainOption[] = [...new Set(caseFiles.map((c) => c.domain))]
    .map((value) => ({ value, label: ui.t(DOMAIN_LABEL_KEYS[value] ?? "") ?? "" }))
    .filter((d) => d.label);

  return (
    <div className="mx-auto max-w-container px-gutter py-section-y">
      <Breadcrumb
        locale={l}
        label={ui.t("breadcrumb_label")}
        crumbs={[
          { label: ui.t("home") ?? "", href: "/" },
          { label: ui.t("page_work") ?? "" },
        ]}
      />

      {ui.t("page_work") ? (
        <h1 className="text-title text-fg">{ui.t("page_work")}</h1>
      ) : null}

      {/*
        The intro line is deliberately NOT seeded — it is copy, and copy is
        written rather than generated. The page renders correctly without it
        and gains it the moment a `gallery_intro` translation exists.
      */}
      {ui.t("gallery_intro") ? (
        <p className="mt-5 max-w-measure text-body text-fg-muted">
          {ui.t("gallery_intro")}
        </p>
      ) : null}

      <ProjectGrid
        caseFiles={withDomainLabels}
        locale={l}
        domains={domains}
        ndaLabel={ui.t("nda_label")}
        labels={{
          all: ui.t("all"),
          filterBy: ui.t("filter_by"),
          noResults: ui.t("no_results"),
        }}
        statusLabels={{
          projected: ui.t("status_projected"),
          achieved: ui.t("status_achieved"),
          "not-measurable": ui.t("status_not_measurable"),
        }}
      />
    </div>
  );
}
