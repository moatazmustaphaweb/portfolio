---
name: motion-system
description: Governs every animated or interactive surface on this site — page transitions, the dot field, camera navigation, loading states, scroll effects, entrance reveals, count-ups, image reveals, hover motion, Framer Motion, GSAP, canvas or WebGL. Use before writing any animation code, and when reviewing a component for motion.
---

# Motion System

Full specification: `docs/design/motion-system.md`. Read it before writing animation code. This skill carries the gates that must hold whether or not that file is open.

## Gate 1 — Which layer is this?

Establish before writing a line.

**MVP-1** ships under decision 023: the only motion is the 150ms `color` / `background-color` / `border-color` / `opacity` transitions in `docs/design/tokens.md`. A request for animation in an MVP-1 component is answered by stating that constraint and stopping. Half a camera system is worse than none.

**Motion Layer** is post-launch-gate, behind one feature flag, dynamically imported. Everything below applies to it.

When the layer is ambiguous from the task alone, ask.

## Gate 2 — Does the move carry meaning?

> Does this move tell the visitor something they would otherwise have to be told in words?

Position in the hierarchy, relationship between two things, which figure is the point. "It looks alive" fails the gate. A move that fails does not ship.

## Gate 3 — The camera grammar is closed

Six moves, no additions:

| Move | Navigation |
|---|---|
| Zoom in | Gallery → Cover → Chapter |
| Zoom out | Chapter → Cover → Gallery |
| Pan along the reading axis | Chapter → next/previous chapter |
| Pan across | Case file → sibling case file |
| Lift | Work → About / Contact / Systems |
| Cut | 404, error boundary, reduced motion |

A route that fits none of the six is a signal the route sits wrong in the architecture. Raise it; do not invent a seventh move.

The reading axis resolves from document direction at runtime. Screen direction is never hardcoded — see the `rtl-guard` skill.

Ceiling: 900ms per navigation move. A move in progress yields to a new one from its current position and never blocks input.

## Gate 4 — Redacted regions stay solid

For any `media.redacted = true`, the baked mask blocks render solid through every stage of every animation. They do not condense, disperse, dissolve, or fade.

`docs/redaction-brief.md` §3 bakes redaction into the pixels and §6.5 forbids reveal interactions, because a reveal implies a recoverable original. A mask that dissolved into points and reassembled reads as exactly that. The reading is the failure, not the mechanism.

The mask is the one thing on this site never made of dots.

## Gate 5 — Text stays in the DOM

All copy renders as server-rendered DOM text from `translations`. The field renders on its own layer beneath content, `aria-hidden`, outside the tab order. The camera transforms containers; it never replaces document structure.

With JavaScript disabled the site is the MVP-1 site: complete, readable, navigable, correct in both locales. The LLM read test outranks every visual in this system.

## Gate 6 — Reduced motion is off, not softened

`prefers-reduced-motion: reduce` disables the layer entirely: instant cuts, static field, direct image rendering, no camera, no pulse, no count-up, everything at full undimmed clarity. Implement as a token override so no component carries its own media query.

Keyboard navigation triggers the same camera moves as clicks. After navigation, focus lands on the destination heading and never on an off-camera element.

## Gate 7 — One of each, per page

One field. One camera. One focal pulse, on the page's actual point of meaning. No new colour token — the field draws from the existing text ramp.

Count-up and condense-in are permitted on `[achieved]` figures only; see the `metric-integrity` skill.

## When the spec is silent

`docs/design/motion-system.md` §16 lists the open questions. A task that lands on one of them stops and asks. Do not resolve an open question by implementing a guess.
