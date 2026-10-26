"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { MOTION_LAYER } from "@/lib/motion/flag";

import { NavLoader, nextQuoteIndex, prefetchLoader } from "./NavLoader";
import { registerPendingListener } from "./pending";

/**
 * Navigation feedback (decision 063). Mounted once, in `app/[locale]/layout.tsx`.
 *
 * ── THE HAIRLINE (not flagged: feedback, not choreography) ────────────────
 * A 2px accent bar at the top of the viewport. It starts on the click that
 * begins an internal navigation, grows along the reading direction
 * (`transform-origin` flips under `[dir=rtl]`, globals.css), trickles toward
 * 85% on a CSS keyframe and, on commit, completes to 100% and fades in 150ms.
 * It is invisible for its first 100ms, so a commit faster than that (a cached
 * route) shows nothing at all. CSS transform and opacity only; the element's
 * state is a data attribute written directly, so no React render sits between
 * the click and the first frame.
 *
 * ── DETECTION, WITHOUT TOUCHING THE LINKS ─────────────────────────────────
 * START: one capturing `click` listener on the document (it runs before
 * next/link's own handler) for a same-origin `<a href>` with no target, no
 * download, no modifier key, and a different path or query; plus `popstate`.
 * A keyboard Enter on a link is a click, so keyboard navigation is covered.
 * END: `usePathname()` / `useSearchParams()` changing, i.e. the commit. Also on
 * mount, because a locale switch remounts this layout mid-navigation.
 * A 15s ceiling resets a navigation that never commits (a download, a blocked
 * route), so the bar can never stick.
 *
 * ── THE LOADER AND QUOTES (`MOTION_LAYER`, off under reduced motion) ──────
 * Pending past 300ms: Moataz's mark over `<main>` (`NavLoader`). Past 2500ms:
 * one quote under it. Both go the moment the route commits.
 *
 * ── PAGE TRANSITIONS (`MOTION_LAYER`, off under reduced motion) ──────────
 * The kind of move is decided here, from the two URLs, and written to
 * `html[data-nav]` before React starts the view transition; globals.css keys
 * every `::view-transition-*` animation off it. Without the attribute every
 * view transition is a cut, so a transition this file did not start (a form,
 * a refresh) never animates the page. Prev/next chapter links add their own
 * `nav-forward` / `nav-back` types for the pan (the chapter page).
 * After the commit, focus moves to the destination `h1` (motion-system §10),
 * only when a click, a key or history started the navigation.
 *
 * ── OPEN: GALLERY CARD → COVER (decision 064) ────────────────────────────
 * A click on a gallery card (`data-nav-open` on its link) from `/work` to a
 * cover is `open`, not `zoom-in`: the new `<main>` is revealed by a clip that
 * starts at the clicked card and grows to the viewport. The card's rectangle
 * is read here, at the click, clamped to the visible area below the header,
 * and written to `<html>` in the NEW main's own coordinate space: that page
 * lands at scroll 0, so its snapshot sits at `<main>`'s document top, and the
 * card's viewport position minus that origin is where the clip starts. The
 * rect is physical (`getBoundingClientRect`), and so is `clip-path: inset()`,
 * so nothing here depends on `dir`. A card scrolled entirely out of the
 * visible area has no rectangle to open from and falls back to `zoom-in`.
 * Known limit: a scroll DURING a slow navigation is not re-read; the clip
 * starts where the card was at the click, as `--nav-old-shift` already does.
 */

type NavKind = "resolve" | "zoom-in" | "open" | "zoom-out" | "pop" | "cut";

const APPEAR_MS = 100; // below this a commit shows nothing
const LOADER_MS = 300;
const QUOTE_MS = 2500;
const CEILING_MS = 15000;
const COMPLETE_MS = 320; // 150 complete + 150 fade + a frame
const CLEAR_NAV_MS = 900; // the navigation ceiling (tokens.md, 900ms)

/** Written for `open` only; every one is removed with `data-nav`. */
const OPEN_PROPS = [
  "--nav-open-x0",
  "--nav-open-y0",
  "--nav-open-x1",
  "--nav-open-y1",
  "--nav-open-y-end",
] as const;

function segments(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

/** Gallery → cover → chapter is a descent; the reverse is an ascent. */
function classify(from: string, to: string): NavKind {
  const a = segments(from);
  const b = segments(to);
  // The locale switch mirrors the whole layout: a cut, never a cross-fade.
  if (a[0] !== b[0]) return "cut";
  const x = a.slice(1);
  const y = b.slice(1);
  if (x[0] === "work" && y[0] === "work") {
    if (y.length > x.length && x.every((s, i) => y[i] === s)) return "zoom-in";
    if (x.length > y.length && y.every((s, i) => x[i] === s)) return "zoom-out";
  }
  return "resolve";
}

/** `/<locale>/work` → `/<locale>/work/<slug>`: the gallery opening a cover. */
function isGalleryToCover(from: string, to: string): boolean {
  const x = segments(from).slice(1);
  const y = segments(to).slice(1);
  return x.length === 1 && x[0] === "work" && y.length === 2 && y[0] === "work";
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Writes the clicked card's rectangle for the `open` reveal, in the new
 * `<main>` snapshot's coordinates (see the header comment). Returns false when
 * there is nothing visible to open from, and writes nothing.
 */
function writeOpenRect(root: HTMLElement, card: Element): boolean {
  const main = document.getElementById("main");
  if (!main) return false;
  const vw = root.clientWidth;
  const vh = window.innerHeight;
  const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
  const floor = clamp(headerBottom, 0, vh);
  const r = card.getBoundingClientRect();
  const x0 = clamp(r.left, 0, vw);
  const x1 = clamp(r.right, 0, vw);
  const y0 = clamp(r.top, floor, vh);
  const y1 = clamp(r.bottom, floor, vh);
  if (x1 - x0 < 1 || y1 - y0 < 1) return false;
  // Where the new <main> will sit: its document position, at scroll 0.
  const m = main.getBoundingClientRect();
  const originX = m.left + window.scrollX;
  const originY = m.top + window.scrollY;
  const px = (n: number) => `${Math.round(n * 100) / 100}px`;
  root.style.setProperty("--nav-open-x0", px(x0 - originX));
  root.style.setProperty("--nav-open-y0", px(y0 - originY));
  root.style.setProperty("--nav-open-x1", px(x1 - originX));
  root.style.setProperty("--nav-open-y1", px(y1 - originY));
  // The reveal ends at the viewport's bottom edge, not at the bottom of a
  // page several screens tall, so the rectangle grows evenly on all sides.
  root.style.setProperty("--nav-open-y-end", px(vh - originY));
  return true;
}

function clearOpenRect(root: HTMLElement) {
  OPEN_PROPS.forEach((p) => root.style.removeProperty(p));
}

function motionAllowed(): boolean {
  return (
    MOTION_LAYER &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function NavProgress({
  quotes,
  lang,
  dir,
}: {
  /** `wait_quote_N`, resolved on the server, in key order. May be empty. */
  quotes: string[];
  lang: string;
  dir: "ltr" | "rtl";
}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const query = search.toString();

  const bar = useRef<HTMLDivElement>(null);
  // Read by the listener effect without re-subscribing it.
  const quotesRef = useRef(quotes);
  useEffect(() => {
    quotesRef.current = quotes;
  }, [quotes]);
  const [loader, setLoaderState] = useState<{
    phase: "off" | "mark" | "quote";
    quote: string | null;
  }>({ phase: "off", quote: null });

  // Imperative state: none of it renders.
  const st = useRef({
    pending: false,
    kind: "nav" as "nav" | "task",
    startedAt: 0,
    timers: [] as number[],
    completeTimer: 0,
    clearNavTimer: 0,
    busy: null as HTMLElement | null,
    tasks: 0,
    focusOnCommit: false,
    committed: "",
  });
  const ctl = useRef<{ settle: (navigated: boolean) => void } | null>(null);

  useEffect(() => {
    const s = st.current;
    const root = document.documentElement;
    s.committed = location.pathname + location.search;

    const setLoader = (phase: "off" | "mark") =>
      setLoaderState((prev) =>
        prev.phase === phase
          ? prev
          : // Hiding keeps the quote, so it fades out with the overlay.
            { phase, quote: phase === "off" ? prev.quote : null },
      );
    const showQuote = () => {
      const list = quotesRef.current;
      if (list.length === 0) return;
      setLoaderState({ phase: "quote", quote: list[nextQuoteIndex(list.length)] ?? null });
    };

    const clearTimers = () => {
      s.timers.forEach((t) => window.clearTimeout(t));
      s.timers = [];
    };

    const setBar = (state: "idle" | "pending" | "done") => {
      const el = bar.current;
      if (el) el.dataset.state = state;
    };

    const start = (kind: "nav" | "task") => {
      if (s.pending) {
        // A navigation that interrupts a form wait takes the bar over.
        if (kind === "nav") s.kind = "nav";
        return;
      }
      window.clearTimeout(s.completeTimer);
      s.pending = true;
      s.kind = kind;
      s.startedAt = performance.now();
      const el = bar.current;
      if (el) {
        el.style.removeProperty("--nav-from");
        // From `done` to `pending` swaps the animation and restarts it.
        setBar("pending");
      }
      if (kind === "nav") {
        s.busy = document.getElementById("main");
        s.busy?.setAttribute("aria-busy", "true");
        // Opening a project from the gallery has no loader (Moataz, 2026-10-26):
        // the opening is the answer to the click; the hairline is enough.
        if (motionAllowed() && root.dataset.nav !== "open") {
          s.timers.push(window.setTimeout(() => setLoader("mark"), LOADER_MS));
          s.timers.push(window.setTimeout(showQuote, QUOTE_MS));
        }
      }
      s.timers.push(window.setTimeout(() => end(true), CEILING_MS));
    };

    const end = (silent = false) => {
      if (!s.pending) return;
      s.pending = false;
      clearTimers();
      s.busy?.removeAttribute("aria-busy");
      s.busy = null;
      setLoader("off");
      const el = bar.current;
      if (!el) return;
      if (silent || performance.now() - s.startedAt < APPEAR_MS) {
        setBar("idle");
        return;
      }
      // Complete from wherever the trickle got to. One style read, not a loop.
      const m = /matrix\(([^,]+)/.exec(getComputedStyle(el).transform);
      const from = m ? Number.parseFloat(m[1]) : 0.85;
      el.style.setProperty("--nav-from", String(Number.isFinite(from) ? from : 0.85));
      setBar("done");
      s.completeTimer = window.setTimeout(() => setBar("idle"), COMPLETE_MS);
    };

    const beginNav = (to: URL, how: "push" | "pop", origin?: HTMLAnchorElement) => {
      window.clearTimeout(s.clearNavTimer);
      clearOpenRect(root);
      if (motionAllowed()) {
        let kind: NavKind = how === "pop" ? "pop" : classify(location.pathname, to.pathname);
        if (
          kind === "zoom-in" &&
          origin?.hasAttribute("data-nav-open") &&
          isGalleryToCover(location.pathname, to.pathname) &&
          writeOpenRect(root, origin)
        ) {
          kind = "open";
        }
        root.dataset.nav = kind;
        // The old snapshot is taken at this scroll position and the new page
        // lands at the top; the CSS moves the old image back by this much so
        // it leaves from where the reader was looking.
        root.style.setProperty("--nav-old-shift", `${-window.scrollY}px`);
      }
      s.focusOnCommit = true;
      start("nav");
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as Element | null;
      const a = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(a.href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;
      // Hash-only, or the page already showing: nothing will commit.
      if (url.pathname === location.pathname && url.search === location.search) return;
      // A file or an API route is not a page; the bar would wait on nothing.
      if (url.pathname.startsWith("/api/") || /\.[a-z0-9]+$/i.test(url.pathname)) return;
      beginNav(url, "push", a);
    };

    const onPop = () => {
      const now = location.pathname + location.search;
      if (now === s.committed) return; // a hash change
      beginNav(new URL(location.href), "pop");
    };

    const unregister = registerPendingListener((delta) => {
      s.tasks = Math.max(0, s.tasks + delta);
      if (delta === 1) start("task");
      else if (s.tasks === 0 && s.pending && s.kind === "task") end();
    });

    ctl.current = {
      settle: (navigated) => {
        s.committed = location.pathname + location.search;
        if (s.kind === "nav") end();
        if (navigated && s.focusOnCommit) {
          // After the commit's layout: the destination heading takes focus
          // without scrolling, so keyboard and screen-reader users land on
          // the page they asked for rather than on the link they left.
          requestAnimationFrame(() => {
            const h = document.querySelector<HTMLElement>("#main h1");
            if (!h) return;
            if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1");
            h.focus({ preventScroll: true });
          });
        }
        s.focusOnCommit = false;
        // Hold `data-nav` past the longest move, then drop it, so a later
        // transition nobody classified is a cut.
        window.clearTimeout(s.clearNavTimer);
        s.clearNavTimer = window.setTimeout(() => {
          delete root.dataset.nav;
          root.style.removeProperty("--nav-old-shift");
          clearOpenRect(root);
        }, CLEAR_NAV_MS);
      },
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    const cancelPrefetch = motionAllowed() ? prefetchLoader() : () => {};

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      cancelPrefetch();
      unregister();
      clearTimers();
      window.clearTimeout(s.completeTimer);
      s.busy?.removeAttribute("aria-busy");
      s.busy = null;
      s.pending = false;
      ctl.current = null;
    };
  }, []);

  // The commit. Runs on mount too: a locale switch remounts this component
  // mid-navigation, and whatever the previous instance started must settle.
  const first = useRef(true);
  useEffect(() => {
    const navigated = !first.current;
    first.current = false;
    ctl.current?.settle(navigated);
  }, [pathname, query]);

  return (
    <>
      <div ref={bar} className="nav-progress" data-state="idle" aria-hidden="true" />
      {MOTION_LAYER ? (
        <NavLoader phase={loader.phase} quote={loader.quote} lang={lang} dir={dir} />
      ) : null}
    </>
  );
}
