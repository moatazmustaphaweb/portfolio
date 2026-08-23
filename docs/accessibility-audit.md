# docs/accessibility-audit.md — the site's own accessibility

**First audit this project has ever had.** Run 2026-08-23, task `008230826`, against the running
site at `localhost:3000`.

**Why it exists:** the Egypt case file carries a page arguing that this work took accessibility and
bilingual comprehension seriously. That page cannot be written honestly until the site making the
argument passes its own test. Moataz asked for the site to be fixed first.

---

## How it was run, and what that does not cover

- **`axe-core` against 28 pages** — 14 routes × 2 locales, including a 404 — loaded into `jsdom`.
- **`jsdom` has no layout engine**, so three rules could not run there: `color-contrast`,
  `landmark-one-main`, `page-has-heading-one`. **All three were checked separately** — the first by
  computing WCAG ratios from the design tokens, the other two by counting elements per page.
- **No browser was involved.** The Chrome extension is not connected — the same failure
  `CLAUDE.md` records against three previous attempts.

**So this audit cannot see:** real focus order, focus visibility against actual painted pixels,
anything that depends on JavaScript running, screen-reader announcement, zoom and reflow at 200%,
motion, or touch target size as rendered. **Those remain untested and are listed at the bottom.**

---

## What passes, and it is most of it

| check | result |
|---|---|
| exactly one `<main>` | **28/28** |
| exactly one `<h1>` | **28/28** |
| heading order, no skipped level | **28/28** |
| skip link present | **28/28**, `href="#main"`, `انتقل إلى المحتوى` in Arabic |
| `lang` and `dir` on `<html>` | correct in both locales |
| axe violations other than the two below | **none** |

Two rules that usually produce noise — image alt text and form labels — produced **nothing**. That
is the `CloudinaryImage` alt rule and the form markup doing their jobs.

---

## Findings

### 1 — 🔴 The smallest text on the site fails AA in the light theme

`--color-fg-dim` against every background, **light theme only**:

| on | ratio | AA normal text needs 4.5 |
|---|---|---|
| `bg` | **3.54** | ✗ |
| `surface` | **3.40** | ✗ |
| `surface-raised` | **3.22** | ✗ |

**It is used 66 times, and 42 of those are `text-micro` or `text-label`** — section labels, metadata
lines, status pills, breadcrumbs. **The smallest type on the site carries the lowest contrast.**

Dark theme is fine — the same token reaches 5.84–6.49 there. **This is a light-theme-only defect,
which is exactly the kind that survives review when the designer works in dark.**

### 2 — 🟠 Link colour falls just under AA on raised surfaces, dark theme

`--color-accent` as **text**:

| theme | on `bg` | on `surface` | on `surface-raised` |
|---|---|---|---|
| dark | 4.61 ✓ | **4.35** ✗ | **4.15** ✗ |
| light | 5.62 ✓ | 5.38 ✓ | 5.22 ✓ |

Under 4.5 for normal text on the two raised backgrounds. Passes everywhere in light.

**The focus ring is fine.** It also uses `accent`, but a focus indicator is non-text and needs 3.0 —
it clears that in both themes on every background.

### 3 — 🟠 Form input borders are below the non-text minimum

WCAG 1.4.11 requires **3.0** for the boundary of a UI component. `ContactForm` inputs use
`border-strong`:

| theme | on `bg` | on `surface` |
|---|---|---|
| dark | 1.66 | 1.57 |
| light | 1.48 | 1.42 |

**Roughly half of what is required.** An input whose edge is invisible is a real problem for low
vision, and this is the one form on the site.

**Card and divider borders fail the same numbers and are a different question.** 1.4.11 covers
components and graphics *needed to understand the content*; a decorative panel edge arguably is not
one. **Input boundaries are not arguable.** Reported as separate things deliberately.

### 4 — 🟠 Two `<nav>` landmarks with no distinguishing name

`landmark-unique`, **24 nodes on 24 pages**. The header nav and the footer nav are both bare
`<nav>`. A screen-reader user listing landmarks hears "navigation" twice with no way to tell them
apart. Fixed with an `aria-label` on each — **and the labels are strings, so they belong in
`ui_strings`, not in the component** (rule 1).

### 5 — 🟡 The 404 page has no `<title>`

Both locales. axe rates it **serious**: with no title, the tab and the screen-reader page
announcement are empty. Every other page has one.

---

## One thing I reported wrongly and corrected

My first pass flagged **"no skip link on any Arabic page"** — 14 pages. **False.** My regex tested
for `تخطي`; the actual string is `انتقل إلى المحتوى`. The link is present and correct on all 28
pages. **A test that does not know the content it is testing invents defects**, and an Arabic false
positive is the easiest kind to leave standing.

---

## Still untested, and none of it can be settled from HTML

- **Keyboard-only walkthrough.** Tab order, focus never trapped, every control reachable, the skip
  link actually working.
- **Focus visibility on real pixels** — the ring is `2px solid accent` at `2px` offset and the maths
  passes, but it has never been seen.
- **Screen reader.** Nothing has been listened to, in either language.
- **Zoom to 200% and reflow**, per 1.4.10.
- **Touch targets as rendered.** `--control-h` is 44px, `--control-h-sm` is deliberately 32px for
  chrome controls; whether that survives contact is a judgement.
- **The consent banner and theme toggle**, which are the only interactive JavaScript on the site.

**These need a browser.** The extension is not connected, and that is now the single biggest gap
between this audit and a defensible claim.
