"use client";

import { useEffect, useState } from "react";

/**
 * Consent banner for Google Analytics.
 *
 * ⚠️ THIS GATES GOOGLE ANALYTICS AND NOTHING ELSE.
 *
 * The site's own Supabase analytics run regardless of the choice here, and
 * that is correct rather than a loophole: they are anonymous, session-scoped,
 * store no IP, set no cookie, and cannot follow anyone between visits. There
 * is nothing to consent to. Someone who declines GA is still counted in our
 * own store, with geography.
 *
 * If you are wiring something new and reach for this hook to gate it, stop:
 * the question is whether the new thing needs consent on its own merits, not
 * whether this banner happens to exist.
 *
 * Design constraints, all deliberate:
 *   - decline is exactly as prominent as accept. Same size, same weight, same
 *     visual hierarchy. A banner where "no" is harder to click than "yes" is
 *     not consent, and this site's positioning cannot survive that
 *   - nothing GA-related loads before an explicit accept. No script, no cookie
 *   - the choice persists in localStorage, so the banner does not reappear
 *   - dismissing is NOT consent. There is no X — only two explicit answers
 */

const STORAGE_KEY = "ga_consent";

export type Consent = "granted" | "denied";

export function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

/** Fired when the visitor answers, so GA can load without a page reload. */
export const CONSENT_EVENT = "ga-consent-change";

export function ConsentBanner({
  message,
  accept,
  decline,
  enabled,
}: {
  message?: string;
  accept?: string;
  decline?: string;
  /** False when NEXT_PUBLIC_GA_ID is unset — nothing to consent to. */
  enabled: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    // Rendered only after mount: the answer lives in localStorage, which the
    // server cannot see, so server-rendering a banner would flash it at people
    // who already answered.
    if (readConsent() === null) setVisible(true);
  }, [enabled]);

  function answer(choice: Consent) {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Private browsing: the choice applies to this page view and the banner
      // returns next visit. Failing closed — no consent stored means no GA.
    }
    setVisible(false);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
  }

  // Every string is a prop from `ui_strings`. If the copy has not resolved in
  // either locale, no banner — better silent than an unlabelled dialog.
  if (!visible || !message || !accept || !decline) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={message}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-DEFAULT bg-surface"
    >
      {/*
        Row on desktop, stacked on narrow — the two layouts `ConsentBanner.dc.html`
        specs out. The buttons stay side by side when stacked and keep their
        size rather than shrinking, because the Arabic message wraps to three
        lines and the actions must not compress to absorb it.
      */}
      <div className="mx-auto flex max-w-container flex-col gap-4 px-gutter py-5 sm:flex-row sm:items-center">
        <p className="flex-1 text-body-sm text-fg-body">{message}</p>

        {/*
          Equal weight, deliberately. Decline comes first in the DOM so it is
          also first in the tab order — the cheaper action to reach by keyboard.

          `min-h-[44px]` rather than `h-control-h`: the spec calls for 44px, and
          `--control-h` is 40px. See docs/status.md — the design's own
          accessibility page mandates a 44px minimum target, so the token and
          the rule disagree sitewide. Fixed here because this is the one place
          the spec states it outright; the token is Moataz's call.
        */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => answer("denied")}
            className="min-h-[44px] flex-1 min-w-control rounded-control border border-strong px-4 text-ui text-fg transition-colors hover:border-fg sm:flex-initial"
          >
            {decline}
          </button>
          <button
            type="button"
            onClick={() => answer("granted")}
            className="min-h-[44px] flex-1 min-w-control rounded-control border border-strong px-4 text-ui text-fg transition-colors hover:border-fg sm:flex-initial"
          >
            {accept}
          </button>
        </div>
      </div>
    </div>
  );
}
