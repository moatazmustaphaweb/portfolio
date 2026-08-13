/**
 * The theme store.
 *
 * The resolved theme is not React state — it is a fact about the document,
 * written by the pre-paint script in `app/layout.tsx` before React exists, and
 * changed afterwards by the toggle. Reading it through `useSyncExternalStore`
 * says that plainly, instead of copying it into component state in an effect
 * and forcing a second render on every mount.
 *
 * ── Two inputs, one answer ──────────────────────────────────────────────────
 *
 * `data-theme` on <html>  an explicit choice. Wins when present.
 * `prefers-color-scheme`  the OS preference. Decides when there is no choice.
 *
 * Both are subscribed to: a MutationObserver for the attribute, and the media
 * query for the OS. That second one is new — before this, changing the OS
 * appearance while the page was open left the toggle's label stale until
 * reload, because nothing was listening.
 *
 * ⚠️ This store does NOT decide the theme at first paint. The inline script in
 * the root layout does, before any CSS or JS has run, which is what prevents a
 * flash of the wrong theme. Nothing here should ever be given that job — by
 * the time this module executes, first paint has happened.
 */

export type Theme = "light" | "dark";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

const listeners = new Set<() => void>();
let cache: Theme | null = null;
let observer: MutationObserver | null = null;
let media: MediaQueryList | null = null;

/** Explicit choice first, OS preference second. Mirrors the pre-paint script. */
function resolve(): Theme {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

function refresh() {
  const next = resolve();
  if (next === cache) return;
  cache = next;
  for (const listener of listeners) listener();
}

export function subscribeTheme(onChange: () => void): () => void {
  listeners.add(onChange);

  // One observer and one media listener however many components subscribe.
  if (listeners.size === 1) {
    observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    media = window.matchMedia(LIGHT_QUERY);
    media.addEventListener("change", refresh);
  }

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = null;
      media?.removeEventListener("change", refresh);
      media = null;
    }
  };
}

/** Stable between changes — a string union, so referential equality is free. */
export function getThemeSnapshot(): Theme {
  if (cache === null) cache = resolve();
  return cache;
}

/**
 * `null` on the server, and therefore during hydration.
 *
 * The server cannot know the theme: it is in `localStorage` or the visitor's
 * OS. Returning null lets the toggle render an empty label in the SSR markup
 * and fill it in immediately after — which is what the old
 * `suppressHydrationWarning` was papering over. There is no mismatch to
 * suppress now, because both passes agree.
 */
export function getThemeServerSnapshot(): Theme | null {
  return null;
}

/**
 * Apply a theme.
 *
 * Writes the attribute, persists the choice, and keeps the `theme-color` meta
 * in step so mobile browser chrome matches. The MutationObserver picks the
 * attribute change up and notifies subscribers — but the cache is set here
 * too, so a caller that toggles while nothing is mounted still leaves the
 * store correct.
 */
export function setTheme(next: Theme): void {
  cache = next;
  document.documentElement.setAttribute("data-theme", next);

  try {
    localStorage.setItem("theme", next);
  } catch {
    // Private browsing can reject writes. The theme still applies for this
    // page view; only persistence is lost.
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", next === "light" ? "#ffffff" : "#000000");

  for (const listener of listeners) listener();
}
