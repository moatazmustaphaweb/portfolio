"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { LinkIcon } from "@/components/layout/LinkIcon";

/**
 * The copy-link button that sits beside a section heading, and the toast that
 * confirms the copy.
 *
 * Added 2026-08-24, task `039240826`, on Moataz's brief: during the detailed
 * pre-launch review it must be possible to send someone one specific passage
 * rather than describe a whole screen. The recipient lands on the page already
 * scrolled to that section.
 *
 * ── WHAT IT COPIES ──────────────────────────────────────────────────────────
 *
 * An ABSOLUTE url — `https://host/en/work/…/onboarding#context`. Built from
 * `window.location` at click time rather than passed in from the server, so it
 * is correct on localhost, on the `.vercel.app` alias and on the custom domain
 * without the component knowing which it is on, and without depending on
 * `NEXT_PUBLIC_SITE_URL`, which is deliberately unset (`027240826`).
 *
 * `location.href.split("#")[0]` rather than `location.origin + location.pathname`:
 * it preserves a query string if one is ever present, and drops only the hash
 * this button is about to replace.
 *
 * ── WHY THE HEADING KEEPS ITS OWN ID, AND THIS IS A SIBLING ─────────────────
 *
 * The anchor is the `<section id>` that already existed for the contents rail.
 * This button does not own it and does not create it — it only reads the id it
 * is given. That way the URL keeps working with the button removed, and a
 * heading whose id changes cannot silently start copying a dead link.
 *
 * ── CLIPBOARD ───────────────────────────────────────────────────────────────
 *
 * `navigator.clipboard.writeText` needs a secure context (https or localhost).
 * On failure — an old browser, an insecure origin, a denied permission — the
 * catch falls back to selecting nothing and simply does not claim success:
 * the toast is only shown on the resolved promise. A button that says
 * "copied" when it did not is worse than one that appears to do nothing.
 */
/** The store never changes, so nothing ever needs to be notified. */
function subscribeNever(): () => void {
  return () => {};
}
/** On the client, always hydrated by the time this runs. */
function getHydratedSnapshot(): boolean {
  return true;
}
/** On the server, never. */
function getHydratedServerSnapshot(): boolean {
  return false;
}

export function SectionLink({
  targetId,
  label,
  copiedLabel,
}: {
  /** The `id` of the section this links to. Owned by the section, not by this. */
  targetId: string;
  /** `ui_strings.copy_section_link` — the accessible name. */
  label?: string;
  /** `ui_strings.section_link_copied` — the toast text. */
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * "Has this hydrated yet" — `document` does not exist during SSR and a
   * portal needs it.
   *
   * `useSyncExternalStore`, NOT `useState` + `useEffect(() => setMounted(true))`.
   * That shape is exactly what `react-hooks/set-state-in-effect` forbids here,
   * and the project has been through this once already: three of those errors
   * were removed by rewriting onto this hook rather than suppressing the rule
   * (`docs/status.md`, the ESLint-to-zero pass). The store never changes, so
   * `subscribe` is a no-op and the client snapshot is a constant.
   *
   * Server renders `false` and the first client pass renders `false` too, so
   * the two agree and there is no hydration mismatch to paper over.
   */
  const hydrated = useSyncExternalStore(
    subscribeNever,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );

  // A pending timeout that fires after unmount would set state on a dead
  // component. Cleared on unmount and before each new one is scheduled.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copy = useCallback(async () => {
    const base = window.location.href.split("#")[0];
    const url = `${base}#${targetId}`;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Insecure origin, denied permission, or no Clipboard API. Say nothing
      // rather than claim a copy that did not happen.
      return;
    }

    // The hash is updated too, so the address bar agrees with the clipboard and
    // a second copy from the same page is identical. `replaceState` rather than
    // assigning `location.hash`, which would also scroll the page under the
    // reader — the whole point is that they have not moved.
    window.history.replaceState(null, "", url);

    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, [targetId]);

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={label}
        /*
         * 24px box holding a 16px glyph, `rounded-control` — the same 6px
         * radius every other control on the site uses.
         *
         * Dimmed at rest and full strength on hover/focus: always visible, per
         * Moataz's choice, so the feature is discoverable without hovering.
         *
         * `align-middle` and the negative top margin keep the box optically
         * centred on the heading's cap-height rather than its line box.
         *
         * NOT `tap-target-44`. That utility centres a 44px band on the element
         * via `::after`, and a row of headings each with an invisible 44px
         * target would overlap the heading text above and below it. The button
         * sits inline in a heading; 24px is the design's own control size here.
         */
        className="ms-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-control align-middle text-fg-dim transition-colors hover:bg-surface-raised hover:text-fg"
      >
        <LinkIcon className="h-4 w-4" />
      </button>

      {/*
        THE TOAST IS PORTALLED TO <body>, AND THAT IS NOT COSMETIC.

        Rendered inline, it sat INSIDE the <h2> the button lives in, and the
        heading's text content became "ContextParagraph link copied" the moment
        a copy succeeded. That is the heading's accessible name, the text any
        contents rail is built from, and what a reader copies when they select
        the heading. Caught by reading `h2.textContent` after a click, not by
        looking at the page — it looks perfect either way.

        A portal moves the DOM node to <body> while keeping it in this
        component's React tree, so the state and the timer stay exactly where
        they are and the heading holds only its own words.

        `fixed inset-x-0` + `mx-auto` centres it bottom-centre in both
        directions. `inset-x-*` is SYMMETRIC and therefore mirror-safe — the
        same utility `ConsentBanner` already uses. (Not `inset-inline-0`: that
        is not a Tailwind utility and compiles to nothing, while looking more
        correct to anyone reading for logical properties.)

        Wide and mobile both — one element, `max-w` bounded so a long Arabic
        string does not span a desktop viewport.

        `role="status"` + `aria-live="polite"`: the confirmation is announced
        without moving focus, so a keyboard user can tab straight on.

        `pointer-events-none` — it is a message, never a target, and must not
        intercept a click on whatever it covers for those two seconds.

        Opacity only, on `--duration-press-out`, which
        `prefers-reduced-motion: reduce` already zeroes at the token level
        (globals.css). `transitionProperty` is restricted to colour and opacity
        project-wide; nothing here transforms, per decision 048.
      */}
      {hydrated
        ? createPortal(
            <span
              role="status"
              aria-live="polite"
              className={[
                "pointer-events-none fixed inset-x-0 bottom-8 z-50 mx-auto w-fit max-w-[calc(100%-2rem)]",
                "rounded-control border border-strong bg-surface-raised px-4 py-2",
                "text-center text-ui text-fg shadow-none transition-opacity",
                copied ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{ transitionDuration: "var(--duration-press-out)" }}
            >
              {/*
                Empty until a copy succeeds. An `aria-live` region that already
                holds its text announces nothing when it becomes visible — the
                text has to ARRIVE for the announcement to fire.
              */}
              {copied ? copiedLabel : null}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
