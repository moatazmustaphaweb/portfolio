import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

import { Breadcrumb, type Crumb } from "./Breadcrumb";

/**
 * Shared frame for a scaffolded route: breadcrumb, title, and the
 * "in progress" line.
 *
 * Every string arrives resolved — this component looks up only
 * `stub_in_progress` and the breadcrumb's aria-label, both of which are
 * chrome rather than page content.
 *
 * When a page's real content lands it keeps the breadcrumb and title and drops
 * `showStub`. That is the whole migration: Phase 1 becomes filling pages, not
 * creating them.
 */
export async function PageShell({
  locale,
  title,
  crumbs = [],
  showStub = true,
  children,
}: {
  locale: Locale;
  /** Resolved title. Omitted entirely if it failed to resolve. */
  title?: string;
  crumbs?: Crumb[];
  showStub?: boolean;
  children?: React.ReactNode;
}) {
  const ui = await getUiStrings(locale);
  const stub = ui.t("stub_in_progress");

  return (
    <div className="mx-auto max-w-container px-gutter py-section-y">
      <Breadcrumb crumbs={crumbs} locale={locale} label={ui.t("breadcrumb_label")} />

      {/* Omitted rather than rendered empty if the title did not resolve. */}
      {title ? <h1 className="max-w-measure text-title text-fg">{title}</h1> : null}

      {showStub && stub ? (
        <p className="mt-6 max-w-measure text-body text-fg-muted">{stub}</p>
      ) : null}

      {children}
    </div>
  );
}
