"use client";

import { useSyncExternalStore } from "react";

import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  setConsent,
  subscribeConsent,
} from "@/lib/analytics/consent";

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
 * If you are wiring something new and reach for this to gate it, stop: the
 * question is whether the new thing needs consent on its own merits, not
 * whether this banner happens to exist.
 *
 * Design constraints, all deliberate and all specced in `ConsentBanner.dc.html`:
 *   - decline is exactly as prominent as accept. Same size, same weight, same
 *     visual hierarchy. A banner where "no" is harder to click than "yes" is
 *     not consent, and this site's positioning cannot survive that
 *   - nothing GA-related loads before an explicit accept. No script, no cookie
 *   - the choice persists, so the banner does not reappear
 *   - dismissing is NOT consent. There is no X — only two explicit answers
 *
 * State comes from `useSyncExternalStore` over `lib/analytics/consent`. The
 * banner renders only when the snapshot is exactly `null` — asked, unanswered,
 * in a browser. `"unknown"` (server and hydration) renders nothing, which is
 * what keeps it from flashing at people who already answered.
 */
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
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );

  // Every string is a prop from `ui_strings`. If the copy has not resolved in
  // either locale, no banner — better silent than an unlabelled dialog.
  if (!enabled || consent !== null) return null;
  if (!message || !accept || !decline) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={message}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-DEFAULT bg-surface"
    >
      {/*
        Row on desktop, stacked on narrow — the two layouts the spec draws. The
        buttons stay side by side when stacked and keep their size rather than
        shrinking, because the Arabic message wraps to three lines and the
        actions must not compress to absorb it.
      */}
      <div className="mx-auto flex max-w-container flex-col gap-4 px-gutter py-5 sm:flex-row sm:items-center">
        <p className="flex-1 text-body-sm text-fg-body">{message}</p>

        {/*
          Equal weight, deliberately. Decline comes first in the DOM so it is
          also first in the tab order — the cheaper action to reach by keyboard.

          `min-h-[44px]` rather than `h-control-h-sm`: the spec calls for 44px
          here, and these are the one-shot decision buttons where a mis-tap
          costs the most.
        */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setConsent("denied")}
            className="min-h-[44px] min-w-control flex-1 rounded-control border border-strong px-4 text-ui text-fg transition-colors hover:border-fg sm:flex-initial"
          >
            {decline}
          </button>
          <button
            type="button"
            onClick={() => setConsent("granted")}
            className="min-h-[44px] min-w-control flex-1 rounded-control border border-strong px-4 text-ui text-fg transition-colors hover:border-fg sm:flex-initial"
          >
            {accept}
          </button>
        </div>
      </div>
    </div>
  );
}
