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

**Layout direction comes from the locale. Text direction comes from the language of the text** (decision 053).

- **Layout** — margins, arrows, rails, which side anything sits on. `dir` is set once on `<html>` from the locale segment. **No component reads it, sets it, or branches on it.** This has not changed and does not bend.
- **Text** — which way a run of characters reads. Set `dir` and `lang` on the element carrying the text, derived from the language that text is written in. `dirForLocale()` in `lib/content/types.ts` is the only place a language maps to a direction.

**The test:** if the answer depends on *which page you are on*, it is layout — take it from the locale. If it depends on *what the words are*, it is text — take it from the language.

**Why text needs marking at all.** Decision 013 serves English when a locale has no translation, and that fallback is correct. But English inside a `dir="rtl"` document lays out as Arabic: the trailing full stop resolves to the wrong visual side, so a sentence renders `.This is where the whole design meets its limit` and the paragraph aligns right. 73 paragraphs and 31 captions did exactly that across nine Arabic pages, and every structural check passed on all of them.

⚠️ **Never infer the language by looking for Latin characters.** Arabic copy here deliberately keeps `Governance`, `OTP`, `KYC`, `RTL`, `NDA` and `LinkedIn` in Latin — that is why Geist is load-bearing behind both Arabic faces — so a sniffing heuristic marks most Arabic prose as English and flips it. The content layer already knows which locale supplied each field: `withFields` attaches `fieldLocales`.

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
