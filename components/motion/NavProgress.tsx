"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { MOTION_LAYER } from "@/lib/motion/flag";

import {
  cancelLift,
  commitLift,
  finishLift,
  liftHasSignalRegion,
  liftTarget,
  readMs,
  startLift,
} from "./lift";
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
 * one quote under it. Both go the moment the route commits. The `open` move
 * is the exception (065 item 3): see OPEN below.
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
 * ── OPEN: GALLERY CARD → COVER (decision 065, superseding 064's mechanism) ─
 * A click on a gallery card (`data-nav-open` on its link) from `/work` to a
 * cover is `open`, not `zoom-in`. The click itself is the answer: in this
 * handler, before any network, `startLift` (lift.ts) lifts the card's visual
 * into a fixed layer and grows it toward the cover's position while the
 * gallery darkens and drifts. On commit the view transition hands the layer
 * over to the cover's real visual (`case-cover`, globals.css). No loader at
 * 300ms during this move: only if the route is still pending at
 * `--duration-nav-open` + `--duration-nav-open-signal-grace` does a small
 * mark appear, in the space above or below the picture, never over it; the
 * 2.5s quote goes there too. A card with no visual, or none of it visible,
 * falls back to `zoom-in`. A second click on the same card during its lift
 * is ignored; any other navigation, back, or the 15s ceiling reverses the
 * lift and restores the card.
 */

type NavKind = "resolve" | "zoom-in" | "open" | "zoom-out" | "pop" | "cut";
type Place = "main" | "lift";

const APPEAR_MS = 100; // below this a commit shows nothing
const LOADER_MS = 300;
const QUOTE_MS = 2500;
const CEILING_MS = 15000;
const COMPLETE_MS = 320; // 150 complete + 150 fade + a frame
const CLEAR_NAV_MS = 900; // the navigation ceiling (tokens.md, 900ms)

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
    /** `main`: centred over <main>. `lift`: beside the lifted picture (065). */
    place: Place;
  }>({ phase: "off", quote: null, place: "main" });

  // Imperative state: none of it renders.
  const st = useRef({
    pending: false,
    kind: "nav" as "nav" | "task",
    startedAt: 0,
    timers: [] as number[],
    /** The loader and quote timers, rescheduled when a navigation replaces another. */
    waitTimers: [] as number[],
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

    const setLoader = (phase: "off" | "mark", place?: Place) =>
      setLoaderState((prev) =>
        prev.phase === phase && (place === undefined || prev.place === place)
          ? prev
          : // Hiding keeps the quote and the place, so it fades out where it was.
            {
              phase,
              quote: phase === "off" ? prev.quote : null,
              place: place ?? prev.place,
            },
      );
    const showQuote = (place: Place) => {
      const list = quotesRef.current;
      if (list.length === 0) return;
      setLoaderState({
        phase: "quote",
        quote: list[nextQuoteIndex(list.length)] ?? null,
        place,
      });
    };

    const clearWaitTimers = () => {
      s.waitTimers.forEach((t) => window.clearTimeout(t));
      s.waitTimers = [];
    };
    const clearTimers = () => {
      s.timers.forEach((t) => window.clearTimeout(t));
      s.timers = [];
      clearWaitTimers();
    };

    /*
     * The loader and the quote (063 items 3–4). During `open` (065 item 3)
     * nothing shows at 300ms: the picture is the answer. Only once the lift
     * has settled and a further grace has passed does a small mark appear,
     * in the space the lift left beside the picture; the quote follows it
     * there. A lift with no such space shows nothing but the hairline.
     */
    const scheduleWait = (open: boolean) => {
      clearWaitTimers();
      setLoader("off");
      if (!motionAllowed()) return;
      if (!open) {
        s.waitTimers.push(window.setTimeout(() => setLoader("mark", "main"), LOADER_MS));
        s.waitTimers.push(window.setTimeout(() => showQuote("main"), QUOTE_MS));
        return;
      }
      if (!liftHasSignalRegion()) return;
      const signalAt =
        readMs("--duration-nav-open", 650) + readMs("--duration-nav-open-signal-grace", 600);
      s.waitTimers.push(window.setTimeout(() => setLoader("mark", "lift"), signalAt));
      s.waitTimers.push(
        window.setTimeout(() => showQuote("lift"), Math.max(QUOTE_MS, signalAt)),
      );
    };

    const setBar = (state: "idle" | "pending" | "done") => {
      const el = bar.current;
      if (el) el.dataset.state = state;
    };

    const start = (kind: "nav" | "task", open = false) => {
      if (s.pending) {
        // A navigation that interrupts a form wait, or replaces another
        // navigation, takes the bar over and restarts the wait feedback.
        if (kind === "nav") {
          s.kind = "nav";
          scheduleWait(open);
        }
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
        scheduleWait(open);
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
      // The ceiling: a navigation that never committed puts the card back.
      if (silent) cancelLift(true);
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
      // Any new navigation (another link, back) reverses a running lift.
      cancelLift(true);
      let open = false;
      if (motionAllowed()) {
        let kind: NavKind = how === "pop" ? "pop" : classify(location.pathname, to.pathname);
        if (
          kind === "zoom-in" &&
          origin?.hasAttribute("data-nav-open") &&
          isGalleryToCover(location.pathname, to.pathname) &&
          startLift(origin, to.pathname)
        ) {
          kind = "open";
          open = true;
        }
        root.dataset.nav = kind;
        // The old snapshot is taken at this scroll position and the new page
        // lands at the top; the CSS moves the old image back by this much so
        // it leaves from where the reader was looking.
        root.style.setProperty("--nav-old-shift", `${-window.scrollY}px`);
      }
      s.focusOnCommit = true;
      start("nav", open);
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
      // A second click on a card that is already lifting: the lift and the
      // route are already under way. Next's own handler still runs.
      const lifting = liftTarget();
      if (lifting !== null && lifting === url.pathname.replace(/\/+$/, "")) return;
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
        // On the lift's destination the hand-over begins; anywhere else the
        // lift goes at once.
        commitLift(location.pathname);
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
          // Before the attribute drops: the layer's hide rule keys off it.
          finishLift();
          delete root.dataset.nav;
          root.style.removeProperty("--nav-old-shift");
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
      cancelLift(false);
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
        <NavLoader
          phase={loader.phase}
          quote={loader.quote}
          place={loader.place}
          lang={lang}
          dir={dir}
        />
      ) : null}
    </>
  );
}
