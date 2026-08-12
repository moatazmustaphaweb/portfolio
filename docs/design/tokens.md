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

### NDA treatment — decided (amendment 036)

Work under NDA renders **full grayscale**. Everything else renders in full colour. The screen stays completely legible: this is a precautionary signal, not concealment — the Mashreq screens are design files containing dummy data, so there is nothing to hide.

```
Cloudinary:  e_grayscale        applied ahead of the sizing preset
Driven by:   case_files.nda     one flag per client relationship
```

**The contrast is the explanation.** Grey work is under NDA; colour work is not. The gallery makes that legible at a glance and no caption has to say it.

The accent blue is preserved in the **frame** — the `redacted_notice` badge and the border — not inside the image. Cloudinary has no selective-hue effect, so "grayscale except blue" is not achievable; the alternatives are a duotone that tints the whole screen and costs legibility, or uniform partial desaturation that mutes every colour rather than keeping one.

```css
--color-nda-stroke: var(--color-border-strong);   /* frame around NDA media */
--color-nda-badge:  var(--color-accent);          /* the signal, in the frame */
```

The badge is not optional. A silently desaturated image reads as a broken or badly-exported asset; the badge is what makes it read as deliberate.

---

## TYPOGRAPHY

### Families

| Token | Value | Use |
|---|---|---|
| `--font-sans` | Geist | Latin, everything by default |
| `--font-mono` | Geist Mono | Latin metadata only — kickers, labels, role lines, legends, column headers |
| `--font-arabic-heading` | LANTX → Geist | Arabic `h1`–`h4` |
| `--font-arabic-body` | Meral Sans → Geist | Arabic everything else |

Latin self-hosted through `next/font/google`; Arabic through `next/font/local` from `app/fonts` as woff2. No external stylesheet, no CDN, no layout shift. Sans 400/500/600/700; mono 400/500; Meral 400/500/600/700; **LANTX 400 only**.

**Arabic** is settled — decision 045 closes open question F and replaces the Geist interim.

- **Geist sits behind both Arabic faces, and it is load-bearing.** The Arabic copy deliberately keeps technical and brand terms in English (`Governance`, `OTP`, `RTL`, `LinkedIn`). LANTX ships **no Latin letters at all**, so a heading like `Cervello Cloud — منصة IoT` needs somewhere for the Latin to land. Meral also lacks `U+2190 ←`, which appears in body copy as `Instance ← Organisation ← Team ← Project`.
- **LANTX is one weight.** Headings are `font-weight: 600` sitewide, and a browser asked for 600 from a 400-only family fakes it by smearing the outlines — which on Arabic thickens the joins until letters close up. `:lang(ar) h1–h4` sets `font-weight: 400` and `font-synthesis-weight: none`; hierarchy comes from size.
- **Arabic never uses `--font-mono`.** The mono metadata style falls back to `--font-arabic-body` at letter-spacing `normal`. The design files achieve this with `letter-spacing: normal !important` — decision 020 rejects that hack; we scope it with `:lang(ar)`.
- **Line height is looser.** Meral's descender is -0.51em against Geist's -0.29em, so Arabic body runs `1.9` and Arabic headings `1.45`. Without it, descenders meet the next line — which in Arabic reads as a broken word, since so much of the script hangs below the baseline.

### The Arabic scale — three factors

Measured, not guessed: `ه` — the closed, baseline-sitting letter that is Arabic's x-height analogue — occupies **0.459em** in Meral and **0.448em** in LANTX, against Geist's **0.537em** x-height.

| Variable | Arabic | Applies to | Why |
|---|---|---|---|
| `--type-scale-small` | **1.30** | `label` 11px, `micro` 10px | More than the measurement suggests. Tracked-out uppercase at 10px is a *Latin* device — Latin capitals stay legible as simple closed shapes. Arabic has no capitals and carries meaning in dots and joins; at 11.5px the dots stop resolving. 13px is where they come back |
| `--type-scale` | **1.15** | body, body-sm, ui, meta, lead, statement | The measured `ه` ratio |
| `--type-scale-display` | **1.00** | hero, title, h2, h3, metric | A *fit* decision, not legibility. Nothing is hard to read at 60px; a title filling a third of the viewport is. Arabic runs longer than English for the same meaning, and 15% on top pushed the results-table heading to three lines and the table below the fold |

Latin leaves all three at 1. Every size token is `calc(<size> * var(--type-scale…))`, so the adjustment is three numbers in one place rather than a duplicated scale.

> ⚠️ The overrides live in an **unlayered** `:root:lang(ar)` block beside the theme overrides — *not* in `@layer base` with the other `:lang(ar)` rules. Unlayered declarations beat layered ones whatever the specificity, so a layered override loses to `:root` and the variable silently reads back as `1`. That happened, and nothing looked broken: the adjustment simply never applied.

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

**Arabic:** ✅ resolved. The scale above is the Latin one; Arabic multiplies it by the three factors documented under *The Arabic scale* and runs looser line height. Verified at reading size on Landing, a cover, a chapter and the results table (decision 045).

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

### Minimum widths — for controls whose label changes on screen

```
--control-min-w: 8rem     /* submit button — fits جارٍ الإرسال… */
--pill-min-w:  7.5rem     /* status pill — fits غير قابل للقياس */
```

A control that changes its own label mid-interaction must not resize while the
user is looking at it. Two cases exist, and both are worse in Arabic:

- **Submit button** — إرسال → جارٍ الإرسال… is ~2.5× the character count.
  Apply `min-w-control`.
- **Status pills** — محقَّق / غير محقَّق / غير قابل للقياس vary ~3× against each
  other down a single Results Table column. Apply `min-w-pill` so the column
  reads as one shape.

The fix belongs here, not in shorter Arabic: those translations are correct
(reviewed 2026-08-11), and trimming them to fit a box would be the wrong trade.

> ⚠️ **Provisional values.** Estimated from the longest Arabic string in each
> set, not measured against rendered text. Verify in both locales when the
> Contact form and Results Table land in Phase 1.

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
| ~~F~~ | ~~Permanent Arabic typeface~~ | *Closed by decision 045 — LANTX headings, Meral Sans body* |
