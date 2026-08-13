---
name: perf-budget
description: Holds the runtime performance budget for this site — animation compositing, canvas and WebGL rendering, per-frame work, bundle cost, image delivery, and query caching. Use when writing animation, rendering many elements, adding a dependency, or reviewing anything that runs every frame or on every request.
---

# Performance Budget

The target device is a mid-range phone from 2023, not the build machine. Lighthouse numbers at the MVP-1 launch gate are the floor, not a starting balance to spend from.

## Animate compositor properties only

`transform` and `opacity` animate on the compositor. Everything else costs layout or paint on every frame.

| Animate | Instead of |
|---|---|
| `transform: translate3d()` | `top`, `left`, `margin` |
| `transform: scale()` | `width`, `height`, `font-size` |
| `opacity` | `visibility` transitions, `filter` on large areas |

Content-level components still never transform — per `docs/design/tokens.md`, transform is scoped to the camera and field layers of the Motion Layer.

## Many elements means one canvas

A field of points is a single canvas or WebGL layer. One DOM node per point is the failure mode this rule exists to prevent: it multiplies style recalculation by the point count and collapses on mobile at a density that looks fine on a laptop.

The resting state carries **no per-frame JavaScript**. Drift is a shader or a CSS animation, not a `requestAnimationFrame` loop mutating properties.

Canvas 2D versus WebGL is decided by measuring on a real mid-range device, not in advance.

## Stop work that nobody is watching

- Pause rendering when `document.visibilityState` is `hidden`. A portfolio left open in a background tab must not drain a battery.
- Pause after the field has been at rest and untouched.
- Disconnect observers and listeners on unmount. The field is the one deliberate exception — it mounts once at the root and stays for the session, which is what makes navigation continuous.

## Keep the entry cheap

- The Motion Layer is dynamically imported and behind a feature flag. It never delays first paint, and it comes out in one commit if it degrades the site.
- Prefer a CSS-native solution to a JavaScript one whenever CSS can do the job. It is cheaper, more portable, and respects reduced-motion through a token override.
- A second animation runtime is carried only when it earns its weight across more than one page.

## Images

Every image goes through `CloudinaryImage` — the only place URLs are built — using a named preset with `f_auto` and `q_auto`. `width` and `height` come from the `media` row so the aspect box reserves space and nothing shifts on load. Redacted assets take `c_fit` and are never cropped.

## Data

Every `lib/content/*` function is cached, and every content route sets `revalidate`. Pages never query Supabase directly. A component that needs data receives it as props — a page-level server component fetches once rather than each child fetching its own.

## Verification

Measure before claiming a gain: throttled CPU, throttled network, a real device where one is available. A frame-rate claim from the build machine is not evidence.
