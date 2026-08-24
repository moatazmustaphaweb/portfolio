"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { CloseIcon, MenuIcon } from "@/components/layout/MenuIcons";
import type { Locale, NavItem } from "@/lib/content/types";

/**
 * The mobile navigation menu — a burger button and the panel it opens.
 *
 * Added 2026-08-24, task `040240826`, on Moataz's instruction: collapse the
 * whole nav into a burger on mobile, ordered burger · name · space · theme ·
 * language.
 *
 * ── THIS IS WHAT FINALLY FIXES THE HEADER WRAP ──────────────────────────────
 *
 * `028240826` collapsed the theme control from three buttons to one and
 * `029240826` collapsed the locale switch from two to one, taking the header's
 * minimum content width from ~562px to ~482–494px. Both entries recorded the
 * same conclusion: still wider than a 360–430px phone, and **nothing left to
 * remove without menu-izing navigation**. This is that step, and it removes the
 * four nav links from the row entirely rather than shaving them.
 *
 * ── DESKTOP IS UNCHANGED, BY CONSTRUCTION ───────────────────────────────────
 *
 * This component renders the burger and panel only below `md`; `SiteHeader`
 * renders the ordinary `Nav` only from `md` up. Two separate elements with
 * complementary visibility, not one element being restyled — so the desktop
 * header keeps the exact markup and the exact `Nav` it has always had, and
 * nothing about it depends on this file.
 *
 * The cost of that choice, stated plainly: the nav links exist twice in the
 * DOM. `aria-hidden` is NOT used to hide either copy, because `display: none`
 * (which is what `hidden`/`md:hidden` compile to) already removes an element
 * from the accessibility tree. Adding `aria-hidden` on top would be redundant,
 * and adding it to a VISIBLE element would hide real navigation from a screen
 * reader while leaving it on screen.
 *
 * ── STATE ───────────────────────────────────────────────────────────────────
 *
 * Closes on route change — otherwise tapping a link navigates underneath an
 * open panel and the panel stays up over the new page. `usePathname` is the
 * signal; it changes on every client navigation.
 *
 * Closes on Escape, and returns focus to the burger when it does, so a keyboard
 * user is not dropped at the top of the document.
 */
export function MobileMenu({
  items,
  locale,
  navLabel,
  openLabel,
  closeLabel,
}: {
  items: NavItem[];
  locale: Locale;
  /** `ui_strings.nav_main` — names the landmark, same as the desktop nav. */
  navLabel?: string;
  /** `ui_strings.menu_open` */
  openLabel?: string;
  /** `ui_strings.menu_close` */
  closeLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // An item with no label in either locale is a dead end, not a link — the
  // same rule `Nav` applies.
  const labelled = items.filter((item) => item.fields.label);

  /*
   * Close on navigation — otherwise tapping a link navigates underneath an open
   * panel and the panel stays up over the new page.
   *
   * Adjusted DURING RENDER, not in an effect. `useEffect(() => setOpen(false),
   * [pathname])` is the obvious shape and is exactly what
   * `react-hooks/set-state-in-effect` rejects; React's own "You Might Not Need
   * an Effect" gives this instead — store the previous value, compare, and
   * correct in the same pass. React re-runs the component immediately, before
   * touching the DOM, so no extra frame is painted with the menu still open.
   *
   * This also covers back/forward, which an `onClick` on each link would miss.
   */
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Focus goes back where it came from, not to the top of the document.
      buttonRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (labelled.length === 0) return null;

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        /*
         * The name changes with the state — "Open menu" / "Close menu" — so a
         * screen reader hears what the button will DO, not a static "Menu".
         * Both strings come from `ui_strings` (migration 0052); rule 1.
         */
        aria-label={open ? closeLabel : openLabel}
        className="tap-target-44 -ms-1 inline-flex h-8 w-8 items-center justify-center rounded-control text-fg-muted transition-colors hover:text-fg"
      >
        {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {/*
        The panel. `absolute` under the sticky header rather than `fixed`: the
        header is already the positioning context the visitor understands, and a
        fixed panel would need its own scroll-lock to stop the page moving
        behind it. This one is short — four links — so it does not need one.

        `inset-x-0` is symmetric and therefore mirror-safe, the same utility
        `ConsentBanner` uses. Not `inset-inline-0`, which is not a Tailwind
        utility and compiles to nothing (learned the hard way in `039240826`).

        Rendered only when open. An always-present panel toggled with `hidden`
        would keep its links in the tab order on desktop, where this whole
        component is `display: none` anyway — but it would also mean the mobile
        DOM always carries a panel nobody asked for.
      */}
      {open ? (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full border-b border-DEFAULT bg-surface"
        >
          <nav
            aria-label={navLabel}
            className="mx-auto flex max-w-container flex-col px-gutter py-2"
          >
            {labelled.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}${item.route}`}
                className="tap-target-44 flex items-center py-2 text-ui text-fg-muted transition-colors hover:text-fg"
              >
                {item.fields.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
