/**
 * The lift (decision 065): gallery card → case-file cover, answered on the
 * click rather than on the route.
 *
 * ── PHASE 1, THE LIFT (on the click, before any network) ──────────────────
 * `startLift` clones the card's visual (`[data-nav-open-visual]`: the image
 * wrapper, or the component cover's wrapper) into a fixed layer at its exact
 * `getBoundingClientRect()`, with the card's radius, and hides the original
 * (`visibility`, so the card keeps its box). In the same task it starts three
 * WAAPI animations:
 *   - the layer: `transform` from the card's rect to the TARGET rect, one
 *     uniform scale, so the picture never distorts. The target is the content
 *     column's inline extent at this viewport (the gallery's own
 *     `max-w-container px-gutter` box, the same box the cover sits in), at
 *     the header's bottom plus `--nav-open-offset`, with the height from the
 *     visual's own aspect ratio. Compositor-only. The radius runs down to 0
 *     as a separate (main-thread) animation, so it cannot demote the
 *     transform from the compositor.
 *   - a backdrop under the layer and above the page: a black scrim fading in
 *     (`opacity`), so the gallery darkens in both themes.
 *   - the gallery's page container drifting up `--nav-open-drift`
 *     (`transform` on the container; its content is never transformed on its
 *     own, 065 item 4). The container is replaced at the commit, so its
 *     animation goes with it and never reaches the cover page.
 * Every rect is physical (`getBoundingClientRect`) and so is `transform`, so
 * nothing here reads or depends on `dir`.
 *
 * ── PHASE 2, THE HAND-OVER (on commit) ───────────────────────────────────
 * While `html[data-nav="open"]` is set, globals.css names the layer
 * `case-cover` and the cover page's visual wrapper (`[data-case-cover]`)
 * `case-cover` too. The layer and the backdrop lose their names (and hide)
 * the moment `<main>` no longer holds a gallery card, which is true in the
 * new state only, so each state has exactly one `case-cover`. The view
 * transition then morphs the layer, from wherever the lift has got to, into
 * the cover visual's real rect. `liftTransitionReady` (called from the
 * `site-main` ViewTransition's `onUpdate`, i.e. once the pseudo-elements
 * exist) retimes that morph to the lift's remaining time on an ease-out curve
 * when the commit lands mid-flight, so the motion continues rather than
 * restarting from rest.
 *
 * If the cover's own image has not loaded by the commit, a copy of the lifted
 * visual is placed inside the cover wrapper (`.nav-open-fallback`) and fades
 * out when the real image loads: the picture never blanks.
 *
 * ── CANCEL ────────────────────────────────────────────────────────────────
 * Any other navigation during the lift (another link, back, the 15s ceiling)
 * reverses the layer, the scrim and the drift to rest in
 * `--duration-nav-open-cancel` and restores the card.
 */

type LiftState = {
  /** The destination path, as the link resolved it. */
  to: string;
  visual: HTMLElement;
  column: HTMLElement | null;
  layer: HTMLElement;
  backdrop: HTMLElement;
  from: { x: number; y: number };
  radius: number;
  duration: number;
  move: Animation;
  round: Animation;
  dim: Animation;
  drift: Animation | null;
  phase: "lift" | "handover" | "cancel";
};

let active: LiftState | null = null;

const SIGNAL_PROPS = ["--nav-open-signal-top", "--nav-open-signal-h"] as const;
/** Below this the region above or below the image holds no signal. */
const SIGNAL_MIN_PX = 120;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const px = (n: number) => `${Math.round(n * 100) / 100}px`;

function rootVar(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

/** A millisecond token from :root, so a retime is a token edit. */
export function readMs(token: string, fallback: number): number {
  const raw = rootVar(token);
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return fallback;
  return raw.endsWith("ms") ? n : raw.endsWith("s") ? n * 1000 : n;
}

/** A length token resolved to px, through a probe so rem and vh resolve. */
function readPx(token: string, fallback: number): number {
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;inline-size:0;block-size:var(${token})`;
  document.body.append(probe);
  const h = probe.getBoundingClientRect().height;
  probe.remove();
  return Number.isFinite(h) && h > 0 ? h : fallback;
}

function readEase(token: string, fallback: string): string {
  return rootVar(token) || fallback;
}

function normalise(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/** The path a lift is heading to, or null when none is running. */
export function liftTarget(): string | null {
  return active && active.phase === "lift" ? active.to : null;
}

/**
 * Lifts the clicked card's visual. Returns false, and changes nothing, when
 * the card has no visual or none of it is visible below the header; the
 * caller then falls back to the plain descend.
 */
export function startLift(link: HTMLAnchorElement, to: string): boolean {
  const visual = link.querySelector<HTMLElement>("[data-nav-open-visual]");
  if (!visual) return false;

  const root = document.documentElement;
  const vw = root.clientWidth;
  const vh = window.innerHeight;
  const headerBottom = clamp(
    document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0,
    0,
    vh,
  );

  const r = visual.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return false;
  const visibleW = Math.min(r.right, vw) - Math.max(r.left, 0);
  const visibleH = Math.min(r.bottom, vh) - Math.max(r.top, headerBottom);
  if (visibleW < 1 || visibleH < 1) return false;

  // The content column: the gallery's own container, inside its padding.
  // `getComputedStyle` returns physical padding, which matches the physical
  // rect, so this is correct in both directions.
  const column = link.closest<HTMLElement>(".max-w-container");
  const box = (column ?? document.getElementById("main") ?? root).getBoundingClientRect();
  const cs = column ? getComputedStyle(column) : null;
  const colLeft = box.left + (cs ? Number.parseFloat(cs.paddingLeft) || 0 : 0);
  const colRight = box.right - (cs ? Number.parseFloat(cs.paddingRight) || 0 : 0);
  const targetW = Math.max(colRight - colLeft, r.width);
  const scale = targetW / r.width;
  const targetH = r.height * scale;
  // Where the cover's visual will sit, roughly: under the breadcrumb, kicker
  // and title. Capped on a short viewport so the picture stays in view.
  const offset = Math.min(readPx("--nav-open-offset", 256), (vh - headerBottom) * 0.35);
  const targetTop = headerBottom + offset;

  const linkStyle = getComputedStyle(link);
  const outer = Number.parseFloat(linkStyle.borderTopLeftRadius) || 0;
  const border = Number.parseFloat(linkStyle.borderTopWidth) || 0;
  const radius = Math.max(0, outer - border);

  // Build the layer from a clone taken BEFORE the original is hidden.
  const clone = visual.cloneNode(true) as HTMLElement;
  clone.removeAttribute("data-nav-open-visual");
  clone.style.removeProperty("visibility");
  clone.querySelectorAll("img").forEach((img) => {
    // Already decoded on the card; never deferred inside the layer.
    img.loading = "eager";
    img.decoding = "sync";
  });

  const backdrop = document.createElement("div");
  backdrop.className = "nav-open-backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  const layer = document.createElement("div");
  layer.className = "nav-open-lift";
  layer.setAttribute("aria-hidden", "true");
  layer.style.width = px(r.width);
  layer.style.height = px(r.height);
  layer.style.borderRadius = px(radius);
  layer.style.transform = `translate(${px(r.left)}, ${px(r.top)})`;
  layer.append(clone);

  document.body.append(backdrop, layer);
  // Same task as the append: the card and the layer never paint together.
  visual.style.visibility = "hidden";

  const duration = readMs("--duration-nav-open", 650);
  const ease = readEase("--ease-nav-open", "cubic-bezier(0.65, 0, 0.35, 1)");
  const recede = readEase("--ease-nav-open-recede", "cubic-bezier(0.2, 0.8, 0.2, 1)");

  const move = layer.animate(
    [
      { transform: `translate(${px(r.left)}, ${px(r.top)}) scale(1)` },
      { transform: `translate(${px(colLeft)}, ${px(targetTop)}) scale(${scale})` },
    ],
    { duration, easing: ease, fill: "forwards" },
  );
  // The layer's radius is pre-scale, so it reaches 0 as the picture grows
  // into the cover, which has none.
  const round = layer.animate(
    [{ borderRadius: px(radius) }, { borderRadius: "0px" }],
    { duration, easing: ease, fill: "forwards" },
  );
  const dim = backdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration,
    easing: recede,
    fill: "forwards",
  });
  // Resolved to px here: a `var()` inside a WAAPI keyframe is not portable.
  const driftPx = readPx("--nav-open-drift", 32);
  const drift = column
    ? column.animate(
        [{ transform: "none" }, { transform: `translateY(${px(-driftPx)})` }],
        { duration, easing: recede, fill: "forwards" },
      )
    : null;

  // The region a slow route's signal may use: below the picture if it ends
  // inside the viewport with room to spare, else between the header and the
  // picture. Neither: no signal, the hairline carries the wait alone.
  const bottom = targetTop + targetH;
  clearSignalRegion();
  if (vh - bottom >= SIGNAL_MIN_PX) {
    root.style.setProperty("--nav-open-signal-top", px(bottom));
    root.style.setProperty("--nav-open-signal-h", px(vh - bottom));
  } else if (targetTop - headerBottom >= SIGNAL_MIN_PX) {
    root.style.setProperty("--nav-open-signal-top", px(headerBottom));
    root.style.setProperty("--nav-open-signal-h", px(targetTop - headerBottom));
  }

  active = {
    to: normalise(to),
    visual,
    column,
    layer,
    backdrop,
    from: { x: r.left, y: r.top },
    radius,
    duration,
    move,
    round,
    dim,
    drift,
    phase: "lift",
  };
  return true;
}

/** True when a lift has room for the slow-route signal. */
export function liftHasSignalRegion(): boolean {
  return document.documentElement.style.getPropertyValue("--nav-open-signal-h") !== "";
}

function clearSignalRegion() {
  const root = document.documentElement;
  SIGNAL_PROPS.forEach((p) => root.style.removeProperty(p));
}

/** Removes everything a lift added and restores the card. Idempotent. */
function teardown(L: LiftState) {
  L.move.cancel();
  L.round.cancel();
  L.dim.cancel();
  L.drift?.cancel();
  L.layer.remove();
  L.backdrop.remove();
  // Restored even after a hand-over: a gallery kept by the router cache must
  // not come back with a blank card.
  L.visual.style.removeProperty("visibility");
  if (active === L) {
    active = null;
    clearSignalRegion();
  }
}

/**
 * Reverses a lift that will not land (another navigation, back, the ceiling)
 * and restores the card. `animated: false` removes it at once.
 */
export function cancelLift(animated: boolean) {
  const L = active;
  if (!L || L.phase === "cancel") return;
  if (L.phase === "handover" || !animated) {
    teardown(L);
    return;
  }
  L.phase = "cancel";
  active = null;
  clearSignalRegion();
  // A layer on its way back must not answer to the shared name: a second
  // card lifted meanwhile would make two `case-cover`s, and the browser skips
  // a transition with a duplicate name.
  L.layer.style.setProperty("view-transition-name", "none");
  L.backdrop.style.setProperty("view-transition-name", "none");

  const ms = readMs("--duration-nav-open-cancel", 200);
  const ease = readEase("--ease-nav-open-recede", "ease-out");
  // From wherever each animation has got to: read once, then hand to WAAPI.
  const layerNow = getComputedStyle(L.layer).transform;
  const radiusNow = getComputedStyle(L.layer).borderTopLeftRadius;
  const dimNow = getComputedStyle(L.backdrop).opacity;
  const driftNow = L.column ? getComputedStyle(L.column).transform : "none";
  L.move.cancel();
  L.round.cancel();
  L.dim.cancel();
  L.drift?.cancel();
  const opts: KeyframeAnimationOptions = { duration: ms, easing: ease, fill: "forwards" };
  const back = [
    L.layer.animate(
      [
        { transform: layerNow },
        { transform: `translate(${px(L.from.x)}, ${px(L.from.y)}) scale(1)` },
      ],
      opts,
    ),
    L.layer.animate([{ borderRadius: radiusNow }, { borderRadius: px(L.radius) }], opts),
    L.backdrop.animate([{ opacity: dimNow }, { opacity: 0 }], opts),
  ];
  if (L.column) {
    back.push(L.column.animate([{ transform: driftNow }, { transform: "none" }], opts));
  }
  void Promise.allSettled(back.map((a) => a.finished)).then(() => {
    back.forEach((a) => a.cancel());
    teardown(L);
  });
}

/**
 * The route committed. On the lift's own destination the hand-over begins;
 * anywhere else the lift is removed at once (the gallery is already gone).
 */
export function commitLift(pathname: string) {
  const L = active;
  if (!L || L.phase !== "lift") return;
  if (normalise(pathname) !== L.to) {
    teardown(L);
    return;
  }
  L.phase = "handover";
  // The old state is already captured; the drift has no more work to do.
  L.drift?.cancel();
  clearSignalRegion();
  installFallback(L);
}

/**
 * The cover's own image may still be on the network at the commit. Until it
 * loads, a copy of the lifted picture sits inside the cover wrapper, so the
 * hand-over never lands on an empty box.
 */
function installFallback(L: LiftState) {
  const slot = document.querySelector<HTMLElement>("#main [data-case-cover]");
  if (!slot) return;
  const img = slot.querySelector<HTMLImageElement>("img");
  if (!img || (img.complete && img.naturalWidth > 0)) return;
  const copy = L.layer.firstElementChild?.cloneNode(true) as HTMLElement | undefined;
  if (!copy) return;
  const fb = document.createElement("div");
  fb.className = "nav-open-fallback";
  fb.setAttribute("aria-hidden", "true");
  fb.append(copy);
  slot.append(fb);
  const done = () => {
    const out = fb.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: readMs("--duration", 150),
      easing: "ease-out",
      fill: "forwards",
    });
    void out.finished.then(() => fb.remove(), () => fb.remove());
  };
  img.addEventListener("load", done, { once: true });
  img.addEventListener("error", () => fb.remove(), { once: true });
  // Never left behind: a navigation away discards the slot with the page.
}

/**
 * Called once the view transition's pseudo-elements exist (the `site-main`
 * ViewTransition's `onUpdate`). Retimes the `case-cover` morph to what the
 * lift had left, on an ease-out curve, when the commit landed mid-flight;
 * removes the layer when the transition ends.
 */
export function liftTransitionReady() {
  const L = active;
  if (!L || L.phase === "cancel") return;
  const anims = document.getAnimations().filter((a) => {
    const fx = a.effect as KeyframeEffect | null;
    return !!fx?.pseudoElement && fx.pseudoElement.includes("(case-cover)");
  });
  if (anims.length === 0) return;
  const elapsed = Number(L.move.currentTime ?? L.duration);
  const remaining = L.duration - (Number.isFinite(elapsed) ? elapsed : L.duration);
  const floor = readMs("--duration-nav-open-handover", 350);
  if (remaining > floor) {
    const group = anims.find((a) =>
      (a.effect as KeyframeEffect).pseudoElement?.startsWith("::view-transition-group"),
    );
    group?.effect?.updateTiming({
      duration: remaining,
      easing: readEase("--ease-nav-open-recede", "ease-out"),
    });
  }
  void Promise.allSettled(anims.map((a) => a.finished)).then(() => {
    if (active === L) teardown(L);
  });
}

/** The last word: whatever is still up goes. Called before `data-nav` drops. */
export function finishLift() {
  if (active) teardown(active);
}
