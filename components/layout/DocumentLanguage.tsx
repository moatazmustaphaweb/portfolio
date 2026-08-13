"use client";

import { useEffect, useLayoutEffect } from "react";

import type { Locale } from "@/lib/content/types";

/**
 * Keeps `<html lang>` and `<html dir>` in step with the locale segment.
 *
 * ── THE BUG THIS FIXES ──────────────────────────────────────────────────────
 *
 * `<html>` is rendered by `app/layout.tsx`, which sits ABOVE `[locale]`. That
 * is deliberate and must stay: without a root layout, `notFound()` had no
 * boundary that produced a document and fell through to Next's built-in error
 * shell with no `lang`, no `dir` and none of the 404 copy.
 *
 * But a layout above the changing segment is exactly a layout Next does not
 * re-render. Navigating `/en/x` → `/ar/x` re-renders the locale segment and
 * everything under it; the root layout is shared by both routes, so it is
 * preserved. `getLocale()` there runs once, on the initial server request, and
 * never again.
 *
 * The result was a page whose URL, content and metadata were all Arabic while
 * `<html dir>` still said `ltr` — so every logical property in the system
 * resolved the wrong way and the page did not mirror until a manual reload.
 * Correct on first paint, broken on every in-session switch: precisely the
 * path a bilingual visitor takes, and invisible to anyone testing by loading
 * URLs directly.
 *
 * ── WHY IT LIVES HERE, AND WHY A LAYOUT EFFECT ──────────────────────────────
 *
 * This component renders inside the locale segment, so it re-renders when the
 * locale changes — which is the whole point. It writes to the document rather
 * than rendering anything, because `<html>` is not ours to render from here.
 *
 * A layout effect, not a passive one. Passive effects run AFTER paint, which
 * would show one frame of Arabic content laid out left-to-right on every
 * switch — a smaller version of the same bug rather than a fix. Layout effects
 * run after commit and before paint, so the attribute is already correct by
 * the time anything is drawn.
 *
 * FIRST PAINT IS UNCHANGED. The root layout still emits the right `lang` and
 * `dir` server-side, so on a cold load the values already match and the guards
 * below make this a no-op. Nothing here participates in first paint — the same
 * division of labour the pre-paint theme script has.
 */

/* useLayoutEffect warns when it runs during server rendering, and this is a
 * client component that still renders on the server. Same hook order within
 * each environment, which is what the rule actually protects. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function DocumentLanguage({ locale }: { locale: Locale }) {
  useIsomorphicLayoutEffect(() => {
    const el = document.documentElement;
    const dir = locale === "ar" ? "rtl" : "ltr";

    // Guarded so a cold load, where the server already got this right, does
    // not touch the DOM at all.
    if (el.lang !== locale) el.lang = locale;
    if (el.dir !== dir) el.dir = dir;
  }, [locale]);

  return null;
}
