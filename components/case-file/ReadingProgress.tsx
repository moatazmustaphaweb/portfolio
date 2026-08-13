"use client";

import { useEffect, useState } from "react";

/**
 * Reading progress — a hairline that fills as the page scrolls.
 *
 * From `CaseLinear.dc.html`, where it sits directly under the sticky header.
 * The linear view is the one page long enough to lose your place in: a whole
 * case file end to end. Everywhere else it would be noise.
 *
 * `aria-hidden` and no `role="progressbar"`: this reports scroll position,
 * which assistive technology already conveys, and announcing a percentage that
 * changes on every scroll tick would be actively hostile.
 *
 * Respects reduced motion by simply not animating — the width is set directly,
 * and `--duration` is 0ms under `prefers-reduced-motion` anyway.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="sticky top-0 z-40 -mt-px h-px w-full bg-transparent"
    >
      <div className="h-px bg-fg" style={{ width: `${progress}%` }} />
    </div>
  );
}
