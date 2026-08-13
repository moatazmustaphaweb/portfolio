# docs/design/motion-system.md — Motion System

**Version 2.0** — full rewrite. Supersedes Motion System v1 (the spotlight/torch system) in its entirety.
**Reference for:** Claude Code (build) and Claude Design (visual concepting). Source of truth for every animated or interactive surface on the site.

---

## 0 · SCOPE, STATUS, AND WHAT THIS DOCUMENT REPLACES

### 0.1 This is the Motion Layer. It is not MVP-1.

MVP-1 ships under **decision 023**: no animation, no scroll effects, no entrance transitions — only the 150ms colour/border/opacity state changes defined in `tokens.md`. That decision stands. The launch gate does not move.

This document specifies the **Motion Layer**, which attaches after MVP-1 passes the launch gate in `docs/manifesto.md`. It sits alongside Layer 2 in `docs/roadmap.md` and is built on the same Layer 0 foundation without rework — the field is a sibling layer to the DOM, not a rebuild of it.

Nothing in this document may be partially implemented inside MVP-1. Half a camera system is worse than none.

### 0.2 What v1 got wrong, and what carries forward

| v1 | v2 | Why |
|---|---|---|
| Cursor-tracked spotlight as the site-wide background component | **Deleted.** Focus follows the camera, not the pointer | Pointer-dependence fails on touch, fails on keyboard, and made the primary visual language unavailable to half the audience |
| Motion as per-page decoration on static pages | **Camera grammar** — every move states a position in the content hierarchy | Motion that carries wayfinding is motion that earns its cost |
| Background as a container that diagrams sit *inside* | **The Field** — the material every visual is *made of* | A background is decoration. A material is a system |
| "Never increase density to fake sophistication" | **Retained, unchanged** | Still the hardest rule to keep and the one most worth keeping |
| One focal pulse per page, `[achieved]`-only count-ups, `prefers-reduced-motion`, no red/urgency colour | **Retained, unchanged** | These were right |

### 0.3 Amendments this layer requires elsewhere

✅ **All three logged and applied, 2026-08-13.** They were required as decisions before implementation, not assumptions made during it.

1. **`tokens.md` → MOTION.** Was: only `color`, `background-color`, `border-color`, `opacity` may transition; `transform` forbidden. The camera is composited entirely from `transform`, so the rule as written forbade this layer. **Re-scoped by decision 048** to: *transform is permitted only to the camera and field layers; content-level components still never transform.* The boundary is the layer, not the phase.
2. **`tokens.md` → new duration/easing scale.** A single `--duration: 150ms` cannot express a camera move. **Added by decision 048** — `--duration-nav-pan` / `-zoom-in` / `-zoom-out` / `-lift` with matching `--ease-nav-*`, valued from §3.4, with the 900ms ceiling recorded as a hard bound and `prefers-reduced-motion` zeroing them through the same token override that zeroes `--duration`. The tokens are declared but inert until this layer ships.
3. **`decisions.md`** — **decision 046** adopts this document as v2.0 and records why v1's pointer dependency ended it; **decision 047** scopes 023 to MVP-1 and permits this layer after the launch gate, behind a feature flag.

None of this adds work to Phase 0 or Phase 1. It removes a contradiction from work already scheduled.

---

## 1 · PHILOSOPHY — THE FIELD

The tagline is **"Simple, where it's hard."** One element, used everywhere, doing everything.

That element is **a dot**.

The whole site is a single field of dots. Content does not *arrive* on the site — it **condenses out of the field**. A diagram, an illustration, a map, an evidence image: all of them are the same dots, temporarily arranged. When you leave, they disperse back into the field.

This is not a background effect. It is the site's material, and it is load-bearing for three reasons:

**It is the art practice, made structural.** *Required Fields / حقول إجبارية* is about identity reduced to data fields — a person compressed into points of captured data. The site renders every image as points of data that assemble into a picture and disperse again. The concept is not illustrated by the site; the site is built out of it.

**It is the redaction language, extended.** `redaction-brief.md` §0 chose solid blocks over blur because *data replaced by shape* reads as deliberate. The field is the same argument at site scale: information as discrete units that can be present, absent, or withheld.

**It is the honest answer to "simple, where it's hard."** The visible vocabulary is one primitive. The difficulty is entirely in the system underneath.

### 1.1 The two prohibitions (carried from v1, non-negotiable)

- **No colour signals urgency or threat.** No heat maps, no red/orange network visuals, no "cybersecurity dashboard". The palette is the existing text ramp plus one accent, per `tokens.md`. The field introduces **no new colour**.
- **No density as a substitute for sophistication.** The field is quiet, sparse, and mostly still. It is a ground, not a display. If a piece needs more dots to feel impressive, it needs fewer.

### 1.2 The test every motion decision must pass

> **Does this move tell the visitor something they would otherwise have to be told in words?**

Position in the hierarchy, relationship between two things, which figure is the point, where a career went. If the answer is no, the move does not ship. "It looks alive" is not an answer.

---

## 2 · THE FIELD — SPECIFICATION

### 2.1 What it is

A single persistent layer of points rendered beneath all content, spanning the viewport. It mounts once, at the root layout, and **never unmounts** for the life of the session — including across navigation. Its permanence is what produces the "one continuous film" reading.

### 2.2 Structure

| Property | Value |
|---|---|
| Geometry | Irregular grid — a base lattice with per-point positional jitter. Never a perfect grid (reads as a texture swatch), never fully random (reads as noise) |
| Density | Sparse at rest. Target ≈ one point per 40–56px of viewport area at the resting state; tune once against the real type sizes |
| Point size | 1–2px at rest. Sub-pixel sizes render inconsistently and must be avoided |
| Colour | `--color-fg-dim` at low alpha. **No new token, no new hue.** In light theme the same token inverts with the palette |
| Connections | Hairlines between near neighbours, drawn only under a distance threshold, at lower alpha than the points |
| Gaps | Deliberate. Regions of the field are empty. The disconnected patch is part of the language — a field with no gaps has nothing to say about absence |

### 2.3 The three states

1. **Resting** — the default. Barely-perceptible drift, sub-pixel amplitude, long period. Present but not asking for attention. This is what 90% of the session looks like.
2. **Condensing** — points migrate from their resting positions into a target arrangement (a diagram, a mark, a map, a masked image). Ease-out, staggered by distance from target so the shape resolves from the centre outward.
3. **Dispersing** — the reverse, faster than condensing. Leaving is always quicker than arriving.

### 2.4 What the field is *not*

- Not a particle system with physics, collision, or mouse repulsion. **No pointer interaction anywhere in this system.**
- Not a canvas that content is drawn into. All text is DOM text. See §9.
- Not per-page. One field, one implementation, no page-level variants.

---

## 3 · THE CAMERA — NAVIGATION AS INFORMATION ARCHITECTURE

### 3.1 The premise

The site is one artboard. Pages are regions of it. Navigation moves a camera; it does not swap documents.

This is only defensible because **the content model is already a spatial hierarchy**: Case File → Chapters, with siblings across case files (`case_file_siblings`) and ordered chapters (`chapters.sort_order`). The camera renders relationships that exist in the database. It is not a metaphor applied on top.

### 3.2 The grammar — every move means one thing

| Move | Navigation | What it states |
|---|---|---|
| **Zoom in** | Gallery → Cover → Chapter | You are going deeper into something. The chapter is inside the case file |
| **Zoom out** | Chapter → Cover → Gallery | You are stepping back up. Context is regained, detail is lost |
| **Pan along the reading axis** | Chapter → next/previous chapter | Sequence. Ordered peers within one case file |
| **Pan across** | Case file → sibling case file (Egypt ↔ Neobiz) | Parallel, not sequential. The same requirement in a different market |
| **Lift** | Any page → About / Contact / Systems | Leaving the work, not descending into it. A different plane, not a deeper one |
| **Cut** | 404, error boundary, `prefers-reduced-motion` | No move at all. See §8 and §10 |

**The grammar is closed.** No page invents a seventh move. If a new route does not fit one of these six, that is a signal the route is in the wrong place in the architecture — fix the architecture, not the motion.

### 3.3 Direction is a locale concern

The reading axis flips with `dir`. In Arabic, "next chapter" pans in the opposite screen direction. This follows the same logical-properties discipline as `tokens.md`: **no component hardcodes a screen direction.** The camera reads the document direction and resolves the axis at runtime. RTL correctness is not a later pass.

### 3.4 Timing

| Move | Duration | Easing |
|---|---|---|
| Pan (peer to peer) | 500–700ms | Ease-in-out, symmetric |
| Zoom in (descend) | 700–900ms | Ease-out, decelerating into rest |
| Zoom out (ascend) | 600–800ms | Ease-in-out |
| Lift | 500ms | Ease-in-out |

Ceiling: **no navigation move exceeds 900ms.** Motion that makes a visitor wait for content is a failure regardless of how good it looks. A visitor who clicks again mid-move interrupts it — the new move takes over from the current position, never queues behind it, never blocks input.

---

## 4 · FOCUS FOLLOWS THE CAMERA

v1's spotlight is deleted. Its useful idea survives with a different driver.

**Rule:** what the camera is settled on renders at full clarity. What sits at the edges of the frame — adjacent regions, incoming or outgoing content, the field's far reaches — renders dimmed. *There but dim, never empty.*

Because the driver is camera position rather than pointer position, this behaves identically on desktop, touch, and keyboard navigation. There is no degraded mode, because there is no pointer dependency to degrade.

Implementation: a radial or edge falloff mask on the field and non-focused regions, driven by the same CSS custom properties the camera writes. Cheap, no per-frame JavaScript, no listeners.

**Constraint carried from v1, unchanged:** the falloff is never the only way to read anything. Full information is always present in the DOM.

---

## 5 · CONTINUITY AND THE CUSTOM LOADER

### 5.1 No browser page feel

Across the whole site there is no white flash, no spinner, no browser-default loading state. The field is persistent and covers every transition, because it never unmounts.

### 5.2 First load

Cold entry only:

1. Field appears at resting state — sparse, still, a few hundred milliseconds.
2. Points condense into the mark (the same language as the 404 mark).
3. The mark disperses; the landing content condenses in its place.

**Budget: 1.2s maximum, and it must be interruptible.** If content is ready earlier, the sequence cuts short — the loader never pads to look complete. A loading animation that outlives its load is theatre, and this system does not do theatre. Once per session only: it never replays on internal navigation.

### 5.3 Between routes

No loader. The camera moves; content resolves inside the move. If data is genuinely slow, the destination region holds the field in a condensing state rather than showing a spinner — the visitor sees a place being built, not a wait.

---

## 6 · CONTENT INSIDE THE FIELD

### 6.1 Images

Media on the site renders as **dot-matrix** — the field's points sampling the image's luminance — and resolves toward the full image as it enters the viewport. It is one language across evidence shots, covers, and studio work.

**Hard limits:**

- The resolved state is the real image. The dot-matrix is an entrance, never a permanent substitute for content.
- The image resolves on **scroll position, not pointer position**, and reaches full resolution well before it is centred. A visitor never has to move to finish an image.
- If the sampling cannot run (no WebGL/canvas, reduced motion, low-power mode), the image renders directly. Always.

### 6.2 NDA media — the integrity boundary

**Masked regions never participate in the dot treatment.**

`redaction-brief.md` §3 requires the redaction to be baked into the pixels before upload; §6.5 forbids any reveal interaction, because a reveal implies a recoverable original. A masked block that dissolved into points and reassembled would read as exactly that — a reveal — even though nothing is recoverable. The *reading* is the failure, not the mechanism.

Therefore, for any `media.redacted = true`:

- The baked solid blocks render solid at every stage of the animation. They do not condense, disperse, dissolve, or fade in.
- The surrounding interface may take the dot treatment; the mask is composited above it, opaque, throughout.
- Grayscale (amendment 036) and the badge behave exactly as specified. Motion changes nothing about the NDA treatment.

The mask is the one thing on this site that is never made of dots. That is a statement, and it is the correct one: **the withheld data is the one thing that is not available as material.**

### 6.3 Diagrams and LivingMaps

Diagrams are drawn from the field: points condense into nodes, hairlines path-draw between them (`stroke-dashoffset`). This is where §1's density prohibition bites hardest — a LivingMap is a handful of labelled nodes, not a network graph. Force-directed layouts remain ruled out.

---

## 7 · THE ABOUT PAGE — MAP AND TIMELINE AS ONE OBJECT

The strongest single expression of the system, and the page most worth spending the budget on.

**One piece, not two.** The world rendered as a dot-matrix map. Almost all of it is resting field — inert, dim, undifferentiated. Only the worked locations are live points: Cairo, Madrid, Dubai, and further markets as they are published.

**The scroll is the career.** As the visitor scrolls, a hairline path-draws between locations in chronological order, and the camera follows the line — pan and zoom, using the §3 grammar. Each arrival brings that period's text alongside it, condensing in beside the point.

The visitor is not scrolling a page about a career. They are travelling it.

**Rules:**

- Locations are content, from the database. No coordinates hardcoded in a component, per rule 1 of the manifesto.
- The path is chronological and never branches. One life, one line.
- The full timeline is readable as ordered DOM text with the map absent — the map is the presentation, not the record. This is what keeps the LLM read test and screen readers intact.
- Adding a country is a row. It is never a design task.

---

## 8 · MOTION TIERS

Rewritten against the camera grammar. Tiers describe what happens *after* a camera move lands.

| Tier | Pages | Behaviour |
|---|---|---|
| **Quiet** | 404, Results Tables, error boundaries, Contact | The camera arrives and stops. Content is present at once; a short fade at most (≤400ms). Field at rest. **No focal pulse on Results Tables** — closing the v1 open question: these pages are about factual stillness. A number that breathes is a number that looks unsettled |
| **Standard** | Chapters, Comparison pages, Accessibility, Philosophy, Systems | Camera lands; content condenses in sequence — Context, then Decision a beat later. One focal pulse, on the Decision block. Field at rest |
| **Signature** | Landing, Case File Covers, About | Full expression, still restrained. Field condenses into the page's central object (LivingMap, map, mark). Lines path-draw. `[achieved]` numbers count up. One focal pulse. Still **one** field, **one** camera, **one** pulse — signature means more craft in the reveal, not more elements |

---

## 9 · MACHINE LEGIBILITY — THE GATE THAT OUTRANKS ALL OF THIS

Non-negotiable #1 in the architecture: every route server-rendered as real text, and the LLM summary test is a launch gate.

**The field and the camera are a presentation layer over unmodified server-rendered HTML.**

- All copy is DOM text from `translations`. Nothing is drawn as pixels, ever.
- The field renders on its own layer beneath content, marked `aria-hidden`, outside the tab order.
- The camera transforms containers. It never replaces document structure with a scene graph.
- Headings stay in order. Landmarks stay intact. Focus order stays document order.
- With JavaScript disabled, the site is the MVP-1 site: complete, readable, navigable, correct in both locales.

**Test:** disable JavaScript and paste the URL into an LLM. If the summary degrades at all, the implementation is wrong — not the gate.

---

## 10 · ACCESSIBILITY

**`prefers-reduced-motion: reduce` disables the entire system.**

Not softened, not shortened — off. Navigation becomes instant cuts. The field renders static, at its resting arrangement, without drift. Images render directly. No condensing, no dispersing, no count-up, no pulse, no camera. Everything is at full, undimmed clarity everywhere.

Additional requirements:

- **Keyboard navigation triggers the same camera moves as clicks.** A keyboard visitor gets the identical spatial model, or the model is a lie for them.
- **Focus is never lost mid-move.** After navigation, focus lands on the destination's heading. Focus must never sit on an element that is off-camera.
- **No motion on scroll that moves text a reader is reading.** See §12.
- **Field contrast.** The field must not reduce text contrast below WCAG AA anywhere. It sits at `fg-dim` alpha under body copy — verify measured, in both themes.
- **A user-facing motion toggle**, persisted like the theme choice, exposing the reduced-motion path to anyone who wants it without changing an OS setting.
- **Vestibular safety.** Zoom is the highest-risk move in this system. Amplitude stays modest, no rotation ever, no acceleration spikes, nothing full-screen and fast.

---

## 11 · PERFORMANCE BUDGET

The field is continuous and the camera is frequent. Both are cheap or the system is not shippable.

| Constraint | Value |
|---|---|
| Frame budget | 60fps on a mid-range phone from 2023. Not on the build machine |
| Field rendering | Single canvas / WebGL layer. Never DOM nodes per point |
| Camera compositing | `transform` and `opacity` only. Never `width`, `height`, `top`, `left`, or layout-triggering properties |
| Per-frame JS | None for the resting state. The resting drift is a shader or a CSS animation, not a `requestAnimationFrame` loop mutating properties |
| Idle behaviour | The field pauses when the tab is hidden and when it has been at rest and untouched — a portfolio open in a background tab must not drain a battery |
| Mobile | Reduced point count and simplified transitions. Not a different system — the same system, tuned |
| Bundle | The motion layer is dynamically imported and does not delay first paint. MVP-1's Lighthouse numbers are the floor, not a starting point to spend from |

**Kill switch:** the whole layer is behind one feature flag. If it degrades the site, it goes off in one commit and MVP-1's behaviour is what remains. That is the safety property that makes it responsible to build this at all.

### 11.1 The honest technical note

"One artboard" is a **composed illusion**, not an implementation strategy. The entire site is never mounted in a single scene — that is a memory and performance grave.

What is actually continuous is the field and the camera transform. Content is swapped inside the move using the framework's transition primitives. The eye reads one continuous space; the browser holds one route at a time. Anyone implementing this should understand that distinction before starting.

---

## 12 · PARALLAX

Depth is permitted, on the field only.

- The field moves **slower** than content during scroll. That is the whole effect.
- Display-size headings may take a very small offset. Nothing else does.
- **Body copy never moves relative to the viewport during reading.** The `--measure-prose` and line-height decisions in `tokens.md` exist to make reading easy; parallax that fights them loses.
- Arabic body copy takes **no parallax at all**. Meral's descender depth and the 1.9 line height give Arabic reading less tolerance for any additional instability.

---

## 13 · MOTION AND METRIC INTEGRITY

Carried from v1 unchanged, because it is the site's core discipline expressed in motion:

**Count-up animation is permitted only on `[achieved]` figures.** `[projected]` and `[not-measurable]` values arrive static, with the general fade-in only.

A number that animates upward reads as measured, live, real. Animating a projection would be a visual claim the copy explicitly refuses to make — the integrity system defeated by a transition. The status enum is in the database (`outcome_status`, no default); the animation reads it and obeys.

**Extended for the field:** an `[achieved]` figure may condense from the field. `[projected]` and `[not-measurable]` values do not — they are already fully formed on arrival. A projection that assembles itself in front of the visitor performs a certainty it does not have.

---

## 14 · TOOLING

| Tool | Used for |
|---|---|
| **The field** | WebGL via a thin abstraction, or 2D canvas if the point count allows. Decided by a prototype, not in advance — build both, measure on a real phone |
| **The camera** | Framer Motion `layout` and shared-element transitions, over the framework's route transition API. CSS custom properties carry camera position to the field and the focus falloff |
| **CSS-native** | Focus falloff, state changes, reduced-motion overrides. Cheapest, most portable, first choice for anything it can do |
| **SVG path animation** | `stroke-dasharray` / `stroke-dashoffset` for LivingMap and About-timeline line drawing |
| **GSAP + ScrollTrigger** | Only if the About timeline's scroll scrubbing genuinely exceeds what Framer Motion's scroll utilities do well. Not a default, and not a second animation runtime carried for one page unless it earns it |

---

## 15 · THE RULES, IN ONE LIST

1. Nothing in this document ships inside MVP-1.
2. No pointer-driven behaviour anywhere.
3. The camera grammar is closed — six moves, no additions.
4. Every move states a position or a relationship, or it does not ship.
5. No navigation move exceeds 900ms, and none blocks input.
6. Redacted regions never animate.
7. All text is DOM text; the LLM read test outranks every visual here.
8. `prefers-reduced-motion` disables the system entirely, not partially.
9. Count-up and condense-in are permitted on `[achieved]` figures only.
10. One field, one camera, one pulse per page. No new colour.
11. The layer is behind a flag and can be removed in one commit.

---

## 16 · OPEN — TO DECIDE BEFORE BUILD

| # | Question | Blocks |
|---|---|---|
| A | Field density and point size, measured against real type at 320px and 1440px | Field implementation |
| B | Canvas 2D vs WebGL — decided by measured frame cost on a real mid-range device | Field implementation |
| C | Camera zoom amplitude — how much scale change reads as "descending" without reading as vertigo | Camera grammar |
| D | Whether Lift (§3.2) is visually distinct enough from Zoom out, or whether About/Contact should share the ascend move | Camera grammar |
| E | Dot-matrix image resolve distance — how far above the fold an image must be fully resolved | Media treatment |
| F | Where the motion toggle lives in the UI, and its `ui_strings` keys in both locales | Accessibility, seed data |
| G | Mobile tuning targets — point count, whether zoom is reduced to a cross-fade on small screens | Performance |
