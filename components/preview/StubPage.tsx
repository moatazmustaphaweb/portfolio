import Link from "next/link";

import {
  CHROME,
  PREVIEW_INDEX_SEGMENT,
  type StubEntry,
} from "@/components/preview/preview-stubs";
import type { Locale } from "@/lib/content/types";

/**
 * ⚠️ PREVIEW SCAFFOLDING. See `preview-stubs.ts` for why this exists and why
 * it carries literal strings. Nothing here renders with the flag off.
 *
 * One unbuilt page, standing at its route. It is styled from the same tokens
 * as the rest of the site — deliberately, because the point is to judge shape
 * and sequence, and a debug page would be judged as a debug page.
 *
 * It is not styled to LOOK finished. The state is stated at the top in a pill,
 * the notice says plainly that the page does not exist, and the Purpose is
 * labelled as a Purpose rather than set as prose. A stub that reads like a
 * page is the failure mode here.
 *
 * ── RTL ────────────────────────────────────────────────────────────────────
 * Layout mirrors from the locale, through `dir` on `<html>`; every utility
 * below is logical. Every string in this component is English scaffolding or
 * an English Purpose, so each text-bearing element carries `lang="en"
 * dir="ltr"` — marked on the ELEMENT, never on a container, so the layout is
 * never forced out of the locale's direction (decision 053).
 *
 * No arrow glyphs. Directional glyphs are content and live in `ui_strings`
 * (rtl-guard); this module may not add rows there, so it uses none.
 *
 * Spacing is on the 8-step scale. Tailwind's spacing scale is REPLACED here,
 * so an off-scale utility silently produces nothing.
 */

/** Every scaffolding string on this page is English inside an Arabic document. */
const EN = { lang: "en", dir: "ltr" } as const;

export type StubPageProps = {
  locale: Locale;
  /** The page's name in Notion, or a route name where several entries share one. */
  title: string;
  /** The route as Notion states it — dynamic parameters intact. */
  template: string;
  /** The URL actually being served, where it differs from the template. */
  servedPath?: string;
  layer: string;
  section: string;
  entries: readonly StubEntry[];
  /** The served path substitutes an invented value into the template. */
  exampleSlug?: boolean;
  /** An extra state note — a draft case file, for instance. */
  notice?: string;
  /** A note about the route itself, above the entries. */
  routeNote?: string;
};

/** One label/value pair in the metadata block. Label above value, no rail. */
function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-subtle pt-4">
      <dt className="font-mono text-micro uppercase text-fg-dim" {...EN}>
        {label}
      </dt>
      <dd className="mt-1 text-meta text-fg-body" {...EN}>
        {value}
      </dd>
    </div>
  );
}

export function StubPage({
  locale,
  title,
  template,
  servedPath,
  layer,
  section,
  entries,
  exampleSlug = false,
  notice,
  routeNote,
}: StubPageProps) {
  const showServed = Boolean(servedPath && servedPath !== template);

  return (
    <div className="mx-auto max-w-prose px-gutter py-section-y">
      <Link
        href={`/${locale}/${PREVIEW_INDEX_SEGMENT}`}
        className="font-mono text-label uppercase text-fg-dim transition-colors hover:text-fg"
        {...EN}
      >
        {CHROME.backToIndex}
      </Link>

      <p className="mt-6 flex flex-wrap items-center gap-3">
        <span
          className="inline-flex rounded-pill border border-DEFAULT bg-surface px-3 py-1 font-mono text-label uppercase text-fg-muted"
          {...EN}
        >
          {CHROME.kicker}
        </span>
        {/*
          The state, as a labelled pill. `min-w-pill` per the tokens' status-pill
          rule, and never colour alone — the word IS the signal.
        */}
        <span
          className="inline-flex min-w-pill justify-center rounded-pill border border-strong px-3 py-1 font-mono text-label uppercase text-fg"
          {...EN}
        >
          {CHROME.notBuiltHeading}
        </span>
      </p>

      <h1 className="mt-5 max-w-measure text-title text-fg" {...EN}>
        {title}
      </h1>

      <p className="mt-6 max-w-measure text-body-sm text-fg-muted" {...EN}>
        {CHROME.stubNotice}
      </p>

      {notice ? (
        <p className="mt-4 max-w-measure text-body-sm text-fg-muted" {...EN}>
          {notice}
        </p>
      ) : null}

      {/*
        Route, layer, section. A description list: three label/value pairs whose
        relationship is semantic, and `dl` states it without a second list to
        keep in step.
      */}
      <dl className="mt-10 flex flex-col gap-4">
        <Meta label={CHROME.routeLabel} value={template} />
        {showServed ? (
          <div className="border-t border-subtle pt-4">
            <dt className="font-mono text-micro uppercase text-fg-dim" {...EN}>
              {CHROME.servedLabel}
            </dt>
            <dd className="mt-1 text-meta text-fg-muted" {...EN}>
              {servedPath}
            </dd>
            {exampleSlug ? (
              <dd className="mt-2 max-w-measure text-body-sm text-fg-dim" {...EN}>
                {CHROME.exampleSlugNotice}
              </dd>
            ) : null}
          </div>
        ) : null}
        <Meta label={CHROME.layerLabel} value={layer} />
        <Meta label={CHROME.sectionLabel} value={section} />
      </dl>

      {routeNote ? (
        <p className="mt-10 font-mono text-label uppercase text-fg-dim" {...EN}>
          {routeNote}
        </p>
      ) : null}

      {/*
        The Purpose. His words, verbatim, and labelled as a Purpose rather than
        set as the page's own prose — the label is what stops it reading as
        finished copy.

        The label and the text are the same object, so there is no second list
        that can fall out of step with this one. `/door` renders four of these,
        in his order.
      */}
      {entries.map((entry) => (
        <section key={entry.name} className="mt-10 border-t border-DEFAULT pt-8">
          {/*
            The name again ONLY where it is not already the h1. A single-entry
            route sets its own name as the title, and repeating it here printed
            the same line twice — the failure `docs/learn.md` records as
            OBJECTIVE rendering twice, both copies correct in isolation. Caught
            in a screenshot, not in the DOM.
          */}
          {entries.length > 1 ? (
            <h2 className="max-w-measure text-section text-fg" {...EN}>
              {entry.name}
            </h2>
          ) : null}
          <p
            className={`font-mono text-micro uppercase text-fg-dim ${
              entries.length > 1 ? "mt-4" : ""
            }`}
            {...EN}
          >
            {CHROME.purposeLabel}
          </p>
          {entry.purpose ? (
            <p className="mt-2 max-w-measure text-lead text-fg-body" {...EN}>
              {entry.purpose}
            </p>
          ) : (
            <p className="mt-2 max-w-measure text-body text-fg-dim" {...EN}>
              {CHROME.noPurposeNotice}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
