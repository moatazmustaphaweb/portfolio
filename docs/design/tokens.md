# docs/design/tokens.md — Visual Language

**Status:** ✅ DECIDED — decision 018 (2026-08-11).
**Source:** the twelve `*.dc.html` page files in Claude Design project `f6113c80`. Values below are extracted from those files, not invented.
**Abandoned:** the Neubrutalist `_ds/` system in the same project. Do not reintroduce any of it.

> **The design files carry no content.** Per decision 021, every string in them is dummy. This document describes *form only* — colour, type, space, motion. No copy, no metric, and no headline from those files enters the codebase.

---

## THE LANGUAGE IN ONE PARAGRAPH

Quiet, dense, technical. Dark by default. Hierarchy comes from **size, weight, and a three-step text-colour ramp** — not from rules, fills, or decoration. Surfaces are separated by 1px hairlines, never by shadow. One accent blue, used sparingly and never as the only signal. Monospace is reserved for metadata: labels, kickers, timestamps, role lines. Type is tightly tracked at display sizes and set loose for reading. Nothing moves except a 150ms colour or border transition.

---

## COLOUR

Two complete palettes. Dark is the default; an explicit choice overrides the OS preference (decision 019).

### Semantic tokens

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--color-bg` | `#000000` | `#ffffff` | Page ground |
| `--color-surface` | `#0a0a0a` | `#fafafa` | Cards, panels, footer |
| `--color-surface-raised` | `#111111` | `#f4f4f4` | Nested surface, table header, hover fill |
| `--color-scrim` | `rgba(0,0,0,0.72)` | `rgba(255,255,255,0.8)` | Sticky header behind `backdrop-filter` |
| `--color-border` | `#1f1f1f` | `#eaeaea` | Default hairline — cards, dividers, controls |
| `--color-border-strong` | `#333333` | `#d4d4d4` | Secondary button, hover border, emphasis |
| `--color-border-subtle` | `#2a2a2a` | `#e5e5e5` | Interior lines inside a bordered surface |
| `--color-fg` | `#ffffff` | `#000000` | Headings, primary emphasis |
| `--color-fg-body` | `#ededed` | `#171717` | Body copy |
| `--color-fg-muted` | `#a1a1a1` | `#666666` | Secondary copy, inactive nav |
| `--color-fg-dim` | `#8f8f8f` | `#888888` | Metadata, captions, legends |
| `--color-accent` | `#0070f3` | `#0060df` | The single accent |
| `--color-accent-fg` | `#ffffff` | `#ffffff` | Text on an accent fill |

### Rules

1. **The text ramp is `fg → fg-body → fg-muted → fg-dim`.** Four steps, in that order. Never introduce a fifth.
2. **The accent marks at most one thing per section** — the current chapter, the primary action. **Never the sole indicator**: always pair it with a border, underline, or label. Required for the colour-blind case and by the accessibility baseline.
3. **Inverted primary button.** The primary action is `--color-fg` fill with `--color-bg` text — the accent is *not* the button colour. This is why the accent stays available as a state marker.
4. **No shadows.** Depth is a 1px border plus a surface step. There is no elevation scale.
5. **Contrast.** All four ramp steps meet WCAG AA on `--color-bg` and on `--color-surface` in both themes. `fg-dim` is the floor — do not go quieter.

### Redaction — ⚠️ STRUCTURE ONLY, TREATMENT UNDECIDED

Decision 002 calls redaction "a deliberate, crafted treatment… a signature". **The design files contain no redaction treatment**, so there is nothing to extract, and inventing one would be a styling decision made on your behalf.

Defined now so `media.redacted` has something to bind to, composed entirely from existing tokens:

```css
--color-redacted-fill:   var(--color-surface-raised);
--color-redacted-stroke: var(--color-border-strong);
```

> 🔴 **Open — question H.** The crafted redaction language (mask geometry, grain, whether redacted regions carry the accent, how the "Required Fields" art practice echoes into it) is a design decision for Moataz. Until it is made, `RedactedEvidence` renders a plain bordered surface with its caption. Do not elaborate it speculatively.

---

## TYPOGRAPHY

### Families

| Token | Value | Use |
|---|---|---|
| `--font-sans` | Geist | Everything by default |
| `--font-mono` | Geist Mono | Metadata only — kickers, labels, role lines, legends, column headers |
| `--font-arabic` | Geist | **Interim** — decision 020 |

Both self-hosted through `next/font/google` (no external stylesheet, no layout shift). Sans weights 400/500/600/700; mono 400/500.

**Arabic:** Geist is an explicit interim choice pending a proper face (open question F). Two rules hold now so the swap is one line later:

- `--font-arabic` is a **separate token** from `--font-sans`, even though both currently resolve to Geist.
- **Arabic never uses `--font-mono`.** The mono metadata style falls back to `--font-arabic` at the same size and letter-spacing `normal`. The design files achieve this with `letter-spacing: normal !important` — decision 020 rejects that hack; we scope it properly with `:lang(ar)`.

### Scale

Display sizes are fluid and negatively tracked; body sizes are fixed and loose. Tracking tightens as size grows — this is what makes the language feel technical rather than airy.

| Token | Size | Weight | Line height | Tracking |
|---|---|---|---|---|
| `--text-hero` | `clamp(44px, 7.5vw, 80px)` | 600 | 1.02 | `-0.045em` |
| `--text-title` | `clamp(38px, 6vw, 60px)` | 600 | 1.03 | `-0.04em` |
| `--text-h2` | `clamp(28px, 4.4vw, 44px)` | 600 | 1.08 | `-0.035em` |
| `--text-h3` | `clamp(22px, 3vw, 28px)` | 600 | 1.15 | `-0.03em` |
| `--text-lead` | `clamp(20px, 3vw, 28px)` | 400 | 1.3 | `-0.02em` |
| `--text-statement` | `clamp(20px, 2.6vw, 26px)` | 500 | 1.4 | `-0.02em` |
| `--text-metric` | `clamp(28px, 4vw, 38px)` | 600 | 1.0 | `-0.03em` |
| `--text-body` | `16px` | 400 | 1.7 | `0` |
| `--text-body-sm` | `15px` | 400 | 1.6 | `0` |
| `--text-ui` | `14px` | 500 | 1.4 | `0` |
| `--text-meta` | `13px` | 400 | 1.5 | `0` |
| `--text-label` | `11px` | 500 | 1.4 | `0.12em` · uppercase · mono |
| `--text-micro` | `10px` | 500 | 1.4 | `0.1em` · uppercase · mono |

**Reading measure:** `--measure-prose: 68ch` for body copy, `--measure-lead: 42ch` for lead paragraphs. Both cap earlier than the container.

**Balance:** `text-wrap: balance` on headings and leads; `text-wrap: pretty` on body copy. Both used throughout the design.

**Arabic caveat:** the scale is verified for Latin only. Arabic at these sizes runs optically smaller and needs looser line height — expect a `:lang(ar)` line-height adjustment when the permanent face is chosen. Do not fix that against the interim.

---

## SPACE

4px base. Only these steps exist:

```
--space-1: 4px     --space-2: 8px     --space-3: 12px    --space-4: 16px
--space-5: 20px    --space-6: 24px    --space-8: 32px    --space-10: 40px
--space-14: 56px   --space-18: 72px   --space-22: 88px
```

Section rhythm is fluid:

```
--section-y:      clamp(40px, 6vw, 72px)    /* standard section block */
--section-y-hero: clamp(64px, 10vw, 140px)  /* landing hero only */
--card-p:         clamp(24px, 3vw, 32px)    /* panel interior */
```

> ⚠️ The design files use off-scale values (5, 10, 13, 14, 18, 22, 26px) in places. Those are **snapped to the nearest scale step** here. Tailwind's spacing scale is replaced, not extended, so an off-scale utility silently produces nothing — snap to the scale rather than reaching for an arbitrary value.

## LAYOUT

| Token | Value | Use |
|---|---|---|
| `--container-max` | `1200px` | Shell, header, footer, gallery |
| `--container-prose` | `1000px` | Chapter and long-form routes |
| `--gutter` | `24px` | Horizontal page padding at every breakpoint |
| `--header-h` | `56px` | Sticky header |

**Breakpoints** (mobile-first, from 320px): `sm 640` · `md 768` · `lg 1024` · `xl 1280`.

## FORM

```
--radius-control: 6px     /* buttons, inputs, toggles */
--radius-panel:  12px     /* cards, tables, bordered regions */
--radius-pill:  999px     /* kickers, badges, status tags */
--border-width:   1px     /* the only stroke weight in the system */
--blur-header:   12px     /* backdrop-filter on the sticky header — the only blur */
```

Control heights: `--control-h: 40px` (primary), `--control-h-sm: 32px` (header controls).

## MOTION

```
--duration: 150ms
--ease: ease
```

Only `color`, `background-color`, `border-color`, and `opacity` transition. **Never** `transform`, `width`, `height`, or `box-shadow`. Per decision 023, MVP-1 has no animation, no scroll effects, and no entrance transitions — only these hover/focus state changes.

**`prefers-reduced-motion: reduce`** → `--duration: 0ms`, and `scroll-behavior: auto`. Implemented as a token override so no component needs its own media query.

## FOCUS

```
--focus-ring:   2px solid var(--color-accent)
--focus-offset: 2px
```

Visible on **every** interactive element. `outline: none` without a replacement is forbidden. The accent is legible as a focus ring against both themes; it is the one place the accent may appear more than once per section.

---

## RTL — NON-NEGOTIABLE

Every token above is direction-neutral. No token encodes left or right.

- **Logical properties only.** `margin-inline-start`, `padding-inline`, `border-inline-start`, `text-align: start`. In Tailwind: `ms-*`/`me-*`, `ps-*`/`pe-*`, `border-s`/`border-e`, `text-start`/`text-end`. Never `ml-*`, `pl-*`, `text-left`.
- **Directional glyphs flip.** Forward arrow is `→` in LTR and `←` in RTL; "back" reverses correspondingly. This is content-adjacent, so it belongs in `ui_strings`, not hardcoded in a component.
- `dir` is set once on `<html>` from the locale segment. No component reads or sets direction.
- Numerals stay Western (`1,500+`) unless a specific string in `translations` says otherwise — that is a content decision per locale, not a token.

---

## OUTPUT

CSS custom properties in `app/globals.css`, consumed by `tailwind.config.ts`, which **replaces** rather than extends Tailwind's colour, spacing, radius, font-size, and border-width scales — so only on-system values are reachable.

Token names are semantic, never literal: `--color-fg-muted`, not `--color-gray-400`. Semantic names survive a palette change; literal ones don't.

Theme selection resolves in this order — OS preference, then an explicit `data-theme` on `<html>`, applied before first paint to avoid a flash.

---

## OPEN

| # | Question | Blocks |
|---|---|---|
| F | Permanent Arabic typeface — replaces the Geist interim | Arabic type scale, line-height tuning |
| H | Redaction treatment — the crafted NDA visual language | `RedactedEvidence`, the `redacted` Cloudinary preset |
