/**
 * The consent store.
 *
 * Consent lives in `localStorage`, which is an external store React does not
 * own — so it is read through `useSyncExternalStore` rather than copied into
 * component state inside an effect. That is not a lint workaround: the old
 * shape (`useState` + `useEffect` + `setState`) meant two components each kept
 * their own copy of the same fact, synchronised by a custom DOM event, and a
 * cascading render on every mount. One store, two subscribers, no copies.
 *
 * ── The three-state snapshot ────────────────────────────────────────────────
 *
 * `getServerSnapshot()` returns `"unknown"`, not `null`. The distinction is
 * load-bearing:
 *
 *   "unknown"  the server, and the hydration pass. Render no banner.
 *   null       the browser, and nobody has answered. Render the banner.
 *   granted    load GA.
 *   denied     do not.
 *
 * Collapsing "unknown" into `null` would server-render the banner and flash it
 * at every visitor who already answered. React uses `getServerSnapshot` for
 * SSR and for the hydration render, then immediately re-renders with
 * `getSnapshot` — so the markup matches on hydration and the banner appears
 * only once the browser has actually been consulted.
 */

export type Consent = "granted" | "denied";

/** `"unknown"` is the server's answer; `null` means asked and unanswered. */
export type ConsentSnapshot = Consent | null | "unknown";

const STORAGE_KEY = "ga_consent";

const listeners = new Set<() => void>();
let cache: Consent | null = null;
let primed = false;

function readNow(): Consent | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

/**
 * Another tab answered. Re-read and notify only on an actual change, so a
 * `storage` event for an unrelated key cannot cause a render.
 */
function onStorage(event: StorageEvent) {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  const next = readNow();
  if (next === cache) return;
  cache = next;
  primed = true;
  emit();
}

export function subscribeConsent(onChange: () => void): () => void {
  listeners.add(onChange);
  // One window listener for any number of subscribers.
  if (listeners.size === 1) window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/**
 * Must return a referentially stable value between changes — a fresh object
 * here would loop React forever. It returns a string union, so that is free.
 */
export function getConsentSnapshot(): ConsentSnapshot {
  if (!primed) {
    cache = readNow();
    primed = true;
  }
  return cache;
}

export function getConsentServerSnapshot(): ConsentSnapshot {
  return "unknown";
}

/**
 * Record the visitor's answer.
 *
 * The in-memory cache is set FIRST and independently of the write. Private
 * browsing can reject `localStorage`, and when it does the choice must still
 * hold for this page view — the banner should not reappear the moment it is
 * dismissed. It returns next visit instead, which is the documented
 * fail-closed behaviour: no stored consent means no GA.
 */
export function setConsent(choice: Consent): void {
  cache = choice;
  primed = true;
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Intentionally empty — see above.
  }
  emit();
}
