---
name: rtl-guard
description: Enforces bidirectional correctness on this bilingual EN/AR site — logical CSS properties, Tailwind direction-neutral utilities, Arabic type scale and font behaviour, directional glyphs, numerals. Use when writing or reviewing any component, layout, style, or arrow, and when touching Arabic typography.
---

# RTL Guard

RTL is structural here, built in Layer 0 and never retrofitted. One physical property breaks a page in Arabic, and it breaks silently — the English view stays correct, so the bug ships.

Reference: `docs/design/tokens.md` (RTL section, Arabic scale) and `docs/conventions.md` (Styling).

## Write logical, always

| Write | Never |
|---|---|
| `ms-*` `me-*` | `ml-*` `mr-*` |
| `ps-*` `pe-*` | `pl-*` `pr-*` |
| `border-s` `border-e` | `border-l` `border-r` |
| `start-*` `end-*` | `left-*` `right-*` |
| `text-start` `text-end` | `text-left` `text-right` |
| `rounded-s-*` `rounded-e-*` | `rounded-l-*` `rounded-r-*` |
| `margin-inline-start`, `padding-inline`, `inset-inline-start` | `margin-left`, `padding-left`, `left` |

`text-center`, `mx-*`, `px-*`, and `inset-x-*` are symmetric and safe.

`dir` is set once on `<html>` from the locale segment. No component reads it, sets it, or branches on it.

## Directional glyphs are content

The forward arrow is `→` in LTR and `←` in RTL, and "back" reverses with it. These live in `ui_strings`, resolved per locale — never a literal in JSX, never a CSS transform flipping a glyph.

## Numerals stay Western

`1,500+` renders the same in both locales unless a specific `translations` row says otherwise. That is a per-string content decision, not a global rule and not a token.

## Arabic typography

- **Arabic headings run `font-weight: 400`** with `font-synthesis-weight: none`. LANTX ships one weight; a browser asked for 600 from a 400-only family smears the outlines until Arabic joins close up. Hierarchy comes from size.
- **Geist sits behind both Arabic faces and is load-bearing.** Arabic copy deliberately keeps technical and brand terms in Latin (`Governance`, `OTP`, `RTL`, `KYC`, `NDA`, `LinkedIn`), and LANTX carries no Latin letters. Meral also lacks `U+2190 ←`.
- **Arabic never uses `--font-mono`.** Mono metadata styles fall back to `--font-arabic-body` at `letter-spacing: normal`, scoped with `:lang(ar)`.
- **Line height is looser** — Arabic body `1.9`, Arabic headings `1.45`. Meral's descender runs deep enough that tighter leading makes descenders meet the next line, which in Arabic reads as a broken word.
- **The three scale factors** (`--type-scale-small` 1.30, `--type-scale` 1.15, `--type-scale-display` 1.00) live in an **unlayered** `:root:lang(ar)` block, beside the theme overrides. Placing them in `@layer base` makes them lose to `:root` silently — the variable reads back as `1`, nothing looks broken, and the adjustment simply never applies. This has happened once.

## Controls that change their own label need a floor width

Arabic strings vary far more than their English counterparts. `إرسال` → `جارٍ الإرسال…` is ~2.5× the characters; status pills vary ~3× down one column. Apply `min-w-control` to the submit button and `min-w-pill` to status pills so nothing resizes mid-interaction. The fix belongs in CSS — the translations are correct and trimming them to fit a box is the wrong trade.

## Verification

A component is not done until it has been viewed at `/ar`. Check: does the layout mirror completely, do arrows point the right way, does any element still sit on the wrong side, does Arabic text wrap without descenders colliding.
