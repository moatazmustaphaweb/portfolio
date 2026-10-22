# docs/status/frontend.md — frontend agent log

**Living document. Newest first.** Written by the `frontend` agent as part of the task, never
offered afterwards. An unchanged status file is indistinguishable from work that never ran.

Every entry carries the nine-digit task id the orchestrator assigned — `NNNDDMMYY`, e.g.
`014210826` is task 014 on 21/08/26. That id ties this entry to `docs/status.md` and to
the other agents' entries for the same work. **Entries are dated to match the commit time,
never ahead of it.**

A task that ends in a diagnosis, a refusal, or a question returned still gets an entry.
Two lines, not silence.

The shape of an entry is in `.claude/agents/frontend.md`. The structure is in `docs/agents.md`;
the handoffs are in `docs/workflows.md`.

---

## 002221026 — 2026-10-22 11:45 — a second phone-frame variant, `variant="android"`, built and shown, not wired

**Brief:** Build a second phone frame for Moataz to look at: no Dynamic Island or lens, smaller
corners, bezel fitted to the 720x1600 Kshemam screens, Android-style keys on the right edge
that do not mirror. The default stays exactly as it is, frame selection is not touched, and no
page uses the new variant. Show both side by side in light and dark.

**Files:**
- `components/media/PhoneFrame.tsx` — new optional prop `variant?: "default" | "android"`,
  default `"default"`. The per-variant numbers live in one `GEOMETRY` table. The island moved
  into its own `DynamicIsland` function, unchanged. The header records the new variant's
  numbers and why it is named after what the object is.

**Variant numbers** (in mockup units of 478.42, so as % of width): body r 48 (10.0%, against
the default's 17.2%), ring r 42.1, screen r 26. Each radius is the one outside it minus the
inset, so the rings stay concentric. Insets 5.9 / 15.09 on all four sides. Power key at y 250 /
h 72 and volume rocker at y 352 / h 150, both on the right. At 320px: corners 32.1 / 28.2 /
17.4px, against the default's 55.2 / 52.0 / 41.0px.

**Verified:**
- The default renders the same markup as before the change. `react-dom/server` HTML from
  before and after the edit is byte-identical (`cmp`).
- `npx tsc --noEmit` exits 0. `npx eslint components/media/PhoneFrame.tsx` is clean.
- The only call site, `components/case-file/ChapterSections.tsx:373`, is unchanged and
  passes no `variant`, so it still gets the default.
- A scratchpad harness renders the real component and pulls the real `--device-*` tokens out
  of `app/globals.css`. Measured in Chromium at a 320px frame with a 315x700 Kshemam home screen
  (ratio 0.45): screen box 287.97x639.92, the same size as the image, so nothing is cropped or
  letterboxed. The image's rendered ratio is 0.45 and its natural ratio is 0.45. The android
  variant draws nothing over the screen (0 spans; the default draws 3). In light the body is
  white with the shadow; in dark it is the gradient with no shadow, in both variants.
- Under `dir="rtl"` every key keeps the same computed `left` and `right` in both variants.
- Observed in the shot: the default's 41px screen corner clips the Android status-bar clock
  ("12:30" shows as "!2:30"). The android variant's 17px corner does not clip it.

**Not verified:** Not checked on `:3000` or any real page, because nothing is wired to the
variant. Not checked with a real 720x1600 Cloudinary asset, since Cloudinary is unreachable from
this sandbox; the stand-in has the same 0.45 ratio. Not checked below 320px. Whether the variant
looks right is Moataz's call.

**Open questions:** None from this task. Which frame each screen uses is still his decision.
**Finding for devops:** `npm ci` fails because `package-lock.json` is out of sync with
`package.json` (missing `@swc/helpers@0.5.23`). Dependencies were installed with
`--no-package-lock`, and the lockfile was left untouched.

### 002221026, follow-up — 2026-10-22 12:40 — dark-theme hairlines on both phone variants

**Brief:** Moataz approved both variants. In dark only, make the phone's strokes visible:
body hairline, ring hairline, and the side keys' edges. Do it through tokens. Light must stay
identical. Say whether the laptop changes.

**Files:**
- `app/globals.css` — new token `--device-phone-edge`.
  - Dark `:root`: `#46484e`.
  - Both light blocks: `var(--device-edge)`.
- `components/media/PhoneFrame.tsx` — its four `var(--device-edge)` strokes now read
  `var(--device-phone-edge)`, and the header says why.
- `docs/learn.md` — Part 6 row: PIL `getbbox()` on an RGBA diff reports no difference.

**Why a new token:** `--device-edge` (`#2e2f33`) is shared with the laptop `DeviceFrame`, and
in dark it is almost the same colour as the top of the body gradient (1.04:1 against `#2b2c2f`).
The new token is used only by the phone, so **the laptop does not change**. It probably has the
same problem in dark; I did not touch it.

**Contrast:**

| | against body top | against body middle | against page |
|---|---|---|---|
| `#2e2f33` (old) | 1.04 | 1.33 | 1.57 |
| `#46484e` (new) | 1.53 | 1.94 | 2.3 |

For comparison, light's `#E0E1E6` on white is 1.31.

**Verified:**
- `npx tsc --noEmit` exits 0. `npx eslint components/media/PhoneFrame.tsx` is clean.
- Computed `border-top-color` in the harness: `rgb(224,225,230)` in light, `rgb(70,72,78)` in
  dark.
- Before/after pixel compare in RGB at 2x, frame by frame:
  - Default light and android light: IDENTICAL.
  - Default dark: 16,433 pixels differ. Android dark: 16,110 pixels differ.
- An earlier RGBA compare wrongly reported all four identical. That is now the learn.md row.

**Not verified:**
- Not checked on `:3000`: the default variant is live on case-file pages, but I did not run the
  dev server.
- The harness sets themes on a wrapper `.theme-*` class, not through
  `prefers-color-scheme` or `data-theme` on `<html>`.
- The laptop in dark was not looked at.
- The screen has no stroke of its own; the ring hairline is the one around it. I added no new
  stroke.

## 005230826 — 2026-08-23 14:30 — a local-only preview of every unbuilt page, and the site map

**Brief:** Render the whole planned site map — every page the project plans, not only the ten
routes that exist — so Moataz can judge shape, sequence and connection visually. Placeholder
copy in code, never in Notion and never in the database. Gated behind
`NEXT_PUBLIC_PREVIEW_STUBS`, `.env.local` only. With the flag off every route must behave
byte-identically to today. Purposes verbatim from Notion; on `/ar` rendered as English marked
`lang="en" dir="ltr"`. Do not touch the real nav.

**Files:**
- `components/preview/preview-stubs.ts` — the stub content and the flag. The single place on
  the project where rule 1 is set aside, and it says so at the top.
- `components/preview/StubPage.tsx` — one unbuilt page at its route.
- `components/preview/PreviewIndex.tsx` — the site map.
- `app/[locale]/(site)/[...preview]/page.preview.tsx` — the catch-all serving all 21 stub
  routes plus `/[locale]/preview`. **The `.preview.tsx` extension is the gate**; see below.
- `app/[locale]/(site)/work/[caseFile]/page.tsx` — flag-gated: the four draft mini case files
  are added to `generateStaticParams` and render a stub. The only production route touched,
  and the only place that can serve them.
- `next.config.mjs` — **devops' file, written by frontend.** Flagged in the report as the one
  decision returned. Two lines: `pageExtensions` gains `preview.tsx` only when the flag is
  set. There is no way to do this from inside frontend's paths, and the alternatives were
  measurably worse — see below.

**Verified:**
- **Flag off, two clean production builds compared** (`rm -rf .next && next build` +
  `next start`), pristine tree against this one, 17 URLs including five flavours of 404:
  **identical byte count on every one, and DOM-identical on every one** (scripts stripped,
  chunk hashes normalised). The only residue is Turbopack module ids inside the RSC payload,
  which shift because `work/[caseFile]/page.tsx` imports the stub component. Zero byte delta.
- **Flag off, dev on `:3000`:** `/en/read`, `/en/preview`, `/en/door`, `/en/studio`,
  `/en/work/east`, `/en/work/<slug>/cut/zzz`, `/en/nonexistent-xyz`, `/ar/read` all 404 at the
  same byte counts as the pristine baseline, all with `<html lang dir class="…fonts…">`.
- **Flag on:** 44/44 route-locale combinations return 200, in dev and in a production build
  (109 static pages against 65). `/ar` is `dir="rtl"`.
- **RTL, queried against the running page, not grepped.** On `/ar/read`, `/ar/door`,
  `/ar/work/east`: every text-bearing leaf inside `<main>` sits inside an element carrying
  `lang="en"`, and all 16/26 of those also carry `dir="ltr"` — zero with one and not the other.
  On `/ar/preview` the only unmarked leaves are the twelve Arabic `ui_strings`, which are in
  the document's own language and correctly unmarked. Nested chapter rows measure
  `padding-inline-start: 24px` and mirror: the pill's right edge moves 1296 → 1272.
- No horizontal overflow: `scrollWidth === innerWidth` at 390 (`/ar/preview`) and at 320
  (`/en/preview`).
- `sitemap.xml` still lists 30 URLs and none of them is a preview route; `llms.txt` likewise.
  Every preview page emits `<meta name="robots" content="noindex, nofollow">`.
- `tsc --noEmit` clean · `npm run lint` clean · `next build` clean with the flag both ways.
- Screenshots at 390 and 1440 in both locales, 16 files, in
  `~/Desktop/preview-005230826/` — the index, a plain stub, the four-step Door, a draft case
  file.

**Two things measured that contradict what the code and the docs suggest, both written into
the comments where they will be read:**
- A route file that merely 404s is NOT equivalent to a route that does not exist. As a plain
  `page.tsx`, the catch-all still answered 404 with the flag off — and turned every unmatched
  URL on the site from a missing ROUTE into a missing PARAM, which Next renders inside
  `<html id="__next_error__">`: no `lang`, no `dir`, no font variables, +7.2KB, on every 404
  in both locales in production. That is why the gate is the file extension.
- Fall-through into a catch-all depends on where the match fails. `/work/east` is refused by
  `work/[caseFile]`'s own `dynamicParams = false` and never reaches the catch-all;
  `/work/uae-acquisition/cut/example-cut` resolves that param and falls through, so Cuts need
  no route file. A real `cut/[cut]/page.tsx` was written first, and it degraded every
  `/work/<slug>/cut/*` 404 the same way. It was deleted.

**Not verified:**
- **Nobody has looked at these pages.** Sixteen screenshots exist and the measurements above
  are real; whether the map reads well, whether the grouping is the right grouping, and
  whether a stub reads as a placeholder rather than as an unfinished page are Moataz's.
- Not opened in a real browser — headless Chrome over CDP only. No keyboard pass, no screen
  reader, no axe.
- Dark theme not checked. The screenshots are the headless default, which is light.
- `.env.local` was NOT written; the dev server currently on `:3000` has the flag set in its
  own environment. Restarting it any other way turns the preview off.
- Behaviour on Vercel is untested, as it is for everything else on this project.

**Open questions — returned to the orchestrator, unanswered:**
1. **`next.config.mjs` is devops', and frontend wrote it.** Two lines plus a comment block.
   Without it the preview either leaks into every 404 or does not run at all. Keep, or hand
   the diff to devops to re-apply.
2. **The four draft case files have no title and no Purpose.** `lib/content` cannot read an
   unpublished row and Notion supplies none, so the stub shows the slug. Reported, not filled.
3. **`Admin — Analytics Dashboard` and `Ask — AI Chat Layer` have no Purpose either.** Listed
   in the index as "Not a page" with the location Notion gives them, and nothing invented.

---
