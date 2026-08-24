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

/** What the page is actually painted as. Always one of two. */
export type Theme = "light" | "dark";

/**
 * What the visitor chose. `system` is the default and is NOT a third painted
 * state — it is the absence of a choice, which is why choosing it CLEARS the
 * stored value rather than storing the string "system".
 *
 * Storing a third value would mean every reader — the pre-paint script, this
 * store, any future consumer — has to resolve it, and any one of them getting
 * that wrong is a flash. An absent key already means "follow the OS" to all of
 * them, so there is nothing to resolve and nothing to get wrong.
 */
export type ThemeChoice = "system" | Theme;

const LIGHT_QUERY = "(prefers-color-scheme: light)";

const listeners = new Set<() => void>();
let cache: Theme | null = null;
let choiceCache: ThemeChoice | null = null;
let osCache: Theme | null = null;
let observer: MutationObserver | null = null;
let media: MediaQueryList | null = null;

/** Explicit choice first, OS preference second. Mirrors the pre-paint script. */
function resolve(): Theme {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "light" || explicit === "dark") return explicit;
  return resolveOs();
}

/**
 * The raw OS preference, ignoring any explicit choice — unlike `resolve()`,
 * which an explicit `data-theme` overrides. `ThemeToggle` needs this even
 * when a choice IS explicit, to order its cycle: task `031240826`.
 */
function resolveOs(): Theme {
  return window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

/**
 * The choice, read from the document rather than from storage.
 *
 * `data-theme` is present only for an explicit override — the pre-paint script
 * sets it from `localStorage` and only then. So its absence IS "system", and
 * the same MutationObserver that tracks the resolved theme tracks the choice.
 * No second source of truth, no storage read on every render.
 */
function resolveChoice(): ThemeChoice {
  const explicit = document.documentElement.getAttribute("data-theme");
  return explicit === "light" || explicit === "dark" ? explicit : "system";
}

/** Keeps mobile browser chrome in step with whatever is now painted. */
function syncThemeColor(theme: Theme): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#ffffff" : "#000000");
}

function refresh() {
  const nextTheme = resolve();
  const nextChoice = resolveChoice();
  const nextOs = resolveOs();
  if (nextTheme === cache && nextChoice === choiceCache && nextOs === osCache) return;
  // The OS flipping under a `system` choice repaints the page, so the browser
  // chrome has to follow it too — not only explicit changes.
  if (nextTheme !== cache) syncThemeColor(nextTheme);
  cache = nextTheme;
  choiceCache = nextChoice;
  // Recomputed even when an explicit choice masks it visually — the OS can
  // still flip underneath a pinned light/dark, and ThemeToggle's cycle order
  // needs to notice, or the icon it shows next goes stale silently.
  osCache = nextOs;
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

/** The visitor's choice — `system` unless they overrode it. */
export function getChoiceSnapshot(): ThemeChoice {
  if (choiceCache === null) choiceCache = resolveChoice();
  return choiceCache;
}

/** `null` on the server for the same reason the theme is: it is not knowable. */
export function getChoiceServerSnapshot(): ThemeChoice | null {
  return null;
}

/**
 * The raw OS preference, regardless of any explicit choice.
 *
 * Added for `ThemeToggle`'s cycle order (task `031240826`): from `system`,
 * the toggle offers whichever colour the OS is NOT currently showing first —
 * the one visit hasn't seen — then the OS's own colour pinned explicitly,
 * then back to `system`. That ordering needs to know the OS preference even
 * while an explicit choice is masking it from `getThemeSnapshot()`.
 */
export function getSystemPreferenceSnapshot(): Theme {
  if (osCache === null) osCache = resolveOs();
  return osCache;
}

/** `null` on the server for the same reason the other two are. */
export function getSystemPreferenceServerSnapshot(): Theme | null {
  return null;
}

/**
 * Apply a choice.
 *
 * `light` / `dark` write the attribute and persist, so they beat the OS —
 * the precedence `docs/design/tokens.md` specifies. `system` REMOVES both the
 * attribute and the stored key, which hands the decision back to the CSS
 * media query that was always there underneath. Nothing stores "system".
 *
 * The MutationObserver picks the attribute change up and notifies
 * subscribers, but the caches are set here too, so a caller that changes the
 * theme while nothing is mounted still leaves the store correct.
 */
export function setThemeChoice(next: ThemeChoice): void {
  const el = document.documentElement;

  if (next === "system") {
    el.removeAttribute("data-theme");
    try {
      localStorage.removeItem("theme");
    } catch {
      // Private browsing can reject writes; the removal still applies to this
      // page view, which is what the visitor asked for.
    }
  } else {
    el.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Persistence lost, theme still applied for this page view.
    }
  }

  choiceCache = next;
  cache = resolve();
  syncThemeColor(cache);

  for (const listener of listeners) listener();
}
