"use client";

import { useEffect, useRef } from "react";

/**
 * The navigation loader (decision 063, item 3, an exception to motion-system
 * §5.1/§5.3): Moataz's mark, drawn by its own trim paths, over `<main>` only,
 * when a navigation is still pending after 300ms. Behind `MOTION_LAYER`;
 * `NavProgress` never mounts this under reduced motion or with the flag off.
 *
 * - Runtime: lottie-web light, the same chunk the Home hero uses (decision
 *   062). `prefetchLoader()` warms the chunk and the JSON on idle after first
 *   paint, so the first show is instant; nothing loads with the flag off.
 * - Colour: strokes and fills take `currentColor` (`--color-fg-muted`) in CSS,
 *   `.nav-loader-mark` in globals.css. It is a loader, not the accent hero.
 * - Loop: play frames 0 to 180 (the draw), fade the drawn mark out, jump back
 *   to frame 0 (an empty frame: every trim end starts at 0) and play again.
 *   Event driven, `complete` plus one timeout: no per-frame JavaScript.
 * - Hide: the overlay fades in 150ms the moment the route commits and the
 *   animation is paused. It never pads to finish a cycle.
 * - Quote: after 2.5s, one of Moataz's own sentences (`wait_quote_N`), rotated
 *   per show through sessionStorage. None seeded, none rendered.
 */

const DRAW_END = 180;
const STORE_KEY = "wait_quote_index";

type LottieAnim = {
  playSegments: (segments: [number, number], force?: boolean) => void;
  goToAndStop: (frame: number, isFrame?: boolean) => void;
  pause: () => void;
  destroy: () => void;
  addEventListener: (name: string, cb: () => void) => void;
};
type LottiePlayer = {
  loadAnimation: (params: Record<string, unknown>) => LottieAnim;
};

let loading: Promise<[LottiePlayer, unknown]> | null = null;

function loadLoader(): Promise<[LottiePlayer, unknown]> {
  if (!loading) {
    loading = Promise.all([
      import("lottie-web/build/player/lottie_light").then(
        (m) => m.default as unknown as LottiePlayer,
      ),
      fetch("/motion/loader.json").then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<unknown>;
      }),
    ]);
    // A failed load may be retried on the next show; nothing is shown meanwhile.
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

/** Warm the chunk and the JSON on idle. Safe to call more than once. */
export function prefetchLoader(): () => void {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  const run = () => {
    loadLoader().catch(() => {});
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(run, { timeout: 4000 });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(run, 2000);
  return () => window.clearTimeout(id);
}

/** The next quote index for this tab, rotating per show. */
export function nextQuoteIndex(count: number): number {
  let i = 0;
  try {
    const raw = window.sessionStorage.getItem(STORE_KEY);
    const prev = raw === null ? -1 : Number.parseInt(raw, 10);
    i = Number.isFinite(prev) ? (prev + 1) % count : 0;
    window.sessionStorage.setItem(STORE_KEY, String(i));
  } catch {
    /* Storage blocked: the first quote, every time. */
  }
  return i;
}

export function NavLoader({
  phase,
  quote,
  lang,
  dir,
}: {
  /** off: hidden. mark: the loader. quote: the loader plus one sentence. */
  phase: "off" | "mark" | "quote";
  /** Chosen by NavProgress when the quote phase begins. */
  quote: string | null;
  lang: string;
  dir: "ltr" | "rtl";
}) {
  const box = useRef<HTMLDivElement>(null);
  const anim = useRef<LottieAnim | null>(null);
  const cycleTimer = useRef<number | null>(null);
  const shown = phase !== "off";

  // The fade between loops is a data attribute, not React state: it changes
  // twice per cycle and nothing else in the tree depends on it.
  const setCycling = (on: boolean) => {
    if (box.current) box.current.dataset.cycling = String(on);
  };

  // Build the animation once, on first show.
  useEffect(() => {
    if (!shown || anim.current) return;
    let cancelled = false;
    loadLoader()
      .then(([lottie, data]) => {
        if (cancelled || anim.current || !box.current) return;
        const a = lottie.loadAnimation({
          container: box.current,
          renderer: "svg",
          loop: false,
          autoplay: false,
          // A copy: lottie mutates the data it is given.
          animationData: JSON.parse(JSON.stringify(data)),
          rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
        });
        anim.current = a;
        a.addEventListener("DOMLoaded", () => {
          if (!cancelled && box.current?.dataset.live === "true") {
            a.playSegments([0, DRAW_END], true);
          }
        });
        a.addEventListener("complete", () => {
          if (box.current?.dataset.live !== "true") return;
          // Fade the drawn mark, then restart from the empty frame.
          setCycling(true);
          cycleTimer.current = window.setTimeout(() => {
            cycleTimer.current = null;
            a.goToAndStop(0, true);
            setCycling(false);
            if (box.current?.dataset.live === "true") {
              a.playSegments([0, DRAW_END], true);
            }
          }, readMs("--duration-loader-cycle-out", 250));
        });
      })
      .catch(() => {
        /* No loader. The hairline still carries the wait. */
      });
    return () => {
      cancelled = true;
    };
  }, [shown]);

  // Start from the empty frame on every show; pause on hide.
  useEffect(() => {
    const a = anim.current;
    if (cycleTimer.current !== null) {
      window.clearTimeout(cycleTimer.current);
      cycleTimer.current = null;
    }
    setCycling(false);
    if (!a) return;
    if (shown) {
      a.playSegments([0, DRAW_END], true);
    } else {
      a.pause();
    }
  }, [shown]);

  useEffect(
    () => () => {
      if (cycleTimer.current !== null) window.clearTimeout(cycleTimer.current);
      anim.current?.destroy();
      anim.current = null;
    },
    [],
  );

  return (
    <div className="nav-loader" data-show={shown} aria-hidden="true">
      <div
        ref={box}
        className="nav-loader-mark"
        data-live={shown}
      />
      {phase !== "mark" && quote ? (
        <p
          lang={lang}
          dir={dir}
          className="nav-loader-quote text-body text-fg-muted"
        >
          {quote}
        </p>
      ) : null}
    </div>
  );
}

/** Reads a millisecond token from :root, so a retime is a token edit. */
function readMs(token: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  return raw.endsWith("ms") ? n : raw.endsWith("s") ? n * 1000 : n;
}
