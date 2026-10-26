"use client";

import { useEffect, useRef, useState } from "react";
import { HeroMark } from "@/components/brand/HeroMark";
import { MOTION_LAYER } from "@/lib/motion/flag";

/**
 * The Home hero mark as Moataz's Lottie (decision 062, an exception to
 * motion-system §8 and perf-budget's one-runtime rule, Home hero only).
 *
 * - Server render and first client render are the static `HeroMark`, so the
 *   server HTML is unchanged and nothing waits on JS.
 * - The Lottie runtime (lottie-web light, SVG renderer) is dynamically imported
 *   only when `MOTION_LAYER` is on AND `prefers-reduced-motion` is not `reduce`.
 *   Flag off or reduced motion: the static mark stays, the chunk never loads.
 * - Colour: every fill/stroke the renderer writes is overridden to
 *   `currentColor` in CSS (globals.css, `.hero-mark-motion`), so the accent and
 *   the opacity come from the caller exactly as for the static mark. Stroke
 *   shapes stay strokes and fill shapes stay fills: only the colour changes.
 * - Playback: once, then hold on the last frame. The asset is Moataz's mark
 *   drawn by trim paths (end 0 to 100 by frame 144) while the stroke thins
 *   from 20 to 6 (by frame 180); the final frame is the complete mark.
 */
const HOLD_FRAME = 239;

export function HeroMarkMotion({ className }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!MOTION_LAYER) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    let anim: { destroy: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const [{ default: lottie }, res] = await Promise.all([
        import("lottie-web/build/player/lottie_light"),
        fetch("/motion/hero-mark.json"),
      ]);
      if (!res.ok || cancelled || !box.current) return;
      const data = await res.json();
      if (cancelled || !box.current) return;
      const a = lottie.loadAnimation({
        container: box.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: data,
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      anim = a;
      a.addEventListener("DOMLoaded", () => {
        if (cancelled) return;
        setLive(true);
        a.playSegments([0, HOLD_FRAME], true);
      });
    })().catch(() => {
      /* Any failure leaves the static mark in place. */
    });

    // Reduced motion switched on mid-session: drop back to the static mark.
    const onChange = () => {
      if (mq.matches) {
        anim?.destroy();
        anim = null;
        setLive(false);
      }
    };
    mq.addEventListener("change", onChange);

    return () => {
      cancelled = true;
      mq.removeEventListener("change", onChange);
      anim?.destroy();
    };
  }, []);

  return (
    <div className={`${className ?? ""} relative`} aria-hidden="true">
      {/* The static mark reserves the box; the Lottie overlays it. */}
      <HeroMark className={`h-auto w-full ${live ? "invisible" : ""}`} />
      <div
        ref={box}
        className={`hero-mark-motion absolute inset-0 ${live ? "" : "invisible"}`}
      />
    </div>
  );
}
