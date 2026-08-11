import Link from "next/link";

import { getUiStrings } from "@/lib/content/ui";
import { DEFAULT_LOCALE } from "@/lib/content/types";

/**
 * 404 — SCAFFOLD, but functionally complete.
 *
 * Every string comes from ui_strings. Note the locale problem: a not-found
 * boundary does not receive route params, so the locale cannot be read from
 * the URL here. It falls back to the default rather than guessing, and the
 * Arabic 404 is a known gap to close when the layout can pass it down.
 *
 * "No dead ends" is a non-negotiable, so this always offers a way back.
 */
export default async function NotFound() {
  const ui = await getUiStrings(DEFAULT_LOCALE);

  return (
    <div className="mx-auto max-w-container px-gutter py-section-y-hero">
      {ui.t("not_found_title") ? (
        <h1 className="max-w-measure text-title text-fg">{ui.t("not_found_title")}</h1>
      ) : null}
      {ui.t("not_found_body") ? (
        <p className="mt-6 max-w-measure text-body text-fg-muted">
          {ui.t("not_found_body")}
        </p>
      ) : null}
      {ui.t("not_found_cta") ? (
        <Link
          href={`/${DEFAULT_LOCALE}/work`}
          className="mt-10 inline-flex h-control-h items-center rounded-control border border-strong px-4 text-ui text-fg transition-colors hover:border-fg"
        >
          {ui.t("not_found_cta")}
        </Link>
      ) : null}
    </div>
  );
}
