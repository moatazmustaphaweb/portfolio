"use client";

import { useMemo, useState } from "react";

import type { CaseFile, Locale } from "@/lib/content/types";

import { ProjectCard } from "./ProjectCard";

export type DomainOption = { value: string; label: string };

/**
 * The filterable grid.
 *
 * Client-side because filtering must be instant — a round trip to re-sort four
 * cards would be slower than the interaction it serves. The cards themselves
 * are rendered on the server and passed through as elements, so no content or
 * URL-building logic crosses into the client bundle.
 *
 * The grid deliberately applies no visual treatment of its own: no shared
 * filter, no hover-saturate, no overlay. The NDA contrast between a grey card
 * and a colour one is a feature of this page, and anything applied uniformly
 * across the grid would flatten it.
 */
export function ProjectGrid({
  caseFiles,
  locale,
  domains,
  labels,
  ndaLabel,
  statusLabels,
}: {
  caseFiles: CaseFile[];
  locale: Locale;
  domains: DomainOption[];
  labels: { all?: string; filterBy?: string; noResults?: string };
  ndaLabel?: string;
  statusLabels: Record<string, string | undefined>;
}) {
  const [domain, setDomain] = useState<string | null>(null);

  const visible = useMemo(
    () => (domain ? caseFiles.filter((c) => c.domain === domain) : caseFiles),
    [caseFiles, domain],
  );

  /*
   * A filter bar offering one option is furniture, not a control. With four
   * case files across two domains it earns its place; if the published set
   * ever collapses to a single domain it disappears on its own.
   */
  const showFilters = domains.length > 1;

  return (
    <>
      {showFilters ? (
        <div
          role="group"
          aria-label={labels.filterBy}
          className="mt-10 flex flex-wrap gap-2"
        >
          <FilterButton
            active={domain === null}
            onClick={() => setDomain(null)}
            label={labels.all}
          />
          {domains.map((d) => (
            <FilterButton
              key={d.value}
              active={domain === d.value}
              onClick={() => setDomain(d.value)}
              label={d.label}
            />
          ))}
        </div>
      ) : null}

      {visible.length === 0 ? (
        labels.noResults ? (
          <p className="mt-10 text-body text-fg-muted">{labels.noResults}</p>
        ) : null
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((caseFile) => (
            <ProjectCard
              key={caseFile.id}
              caseFile={caseFile}
              locale={locale}
              ndaLabel={ndaLabel}
              statusLabel={
                caseFile.headline ? statusLabels[caseFile.headline.status] : undefined
              }
            />
          ))}
        </ul>
      )}
    </>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label?: string;
}) {
  // No label, no button — a filter with no name is unusable.
  if (!label) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "h-control-h-sm rounded-pill border px-4 text-ui transition-colors",
        active
          ? "border-fg text-fg"
          : "border-DEFAULT text-fg-muted hover:border-strong hover:text-fg",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
