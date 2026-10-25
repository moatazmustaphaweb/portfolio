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

## 009251026 — 2026-10-25 12:46 — Browser inspection of preview.moatazmustapha.com against architecture v2.0 (no code change)

**Brief:** Inspection and report only. I opened every route in the architecture v2.0 tree, every sitemap URL and the not-built routes on `preview.moatazmustapha.com`, in EN and AR, using local Playwright Chromium. For each I recorded status, lang/dir, the shell, navigation, images, console errors, English on AR pages, no-JS text, 375/320 overflow, analytics and cookies, and the 404. The reference changed mid-task from the scratchpad `vision.md` (v1.0) to `docs/architecture.md` v2.0, at the orchestrator's instruction.
**Files:** `docs/status/frontend.md` (this entry) only. The scripts and outputs are in the session scratchpad (`crawl/scripts`, `crawl/data`), outside the repo.
**Verified (measured):** 122 browser loads. 86 locale pages return 200 and 30 return 404. Every 200 page has the right `lang`/`dir`, a header, a footer and a locale switch that keeps the path. 0 console errors and 0 broken images. No-JS main text equals JS main text on 86/86 pages. No page scrolls horizontally at 375, and none at 320 on the four pages tested there. NDA case files use `e_grayscale` on 100% of their images, and non-NDA files on none. The only result statuses shown are ACHIEVED and NOT MEASURABLE. Findings:
- The UAE results page is 404, but its cover declares 4 outcomes.
- Entry handles that are not links: 5 (UAE ×3, Egypt ×1, PideTaxi ×1).
- The last chapter of every case file has no forward link. The comparison and accessibility pages link back only.
- Raw `[Title]` link markup shows in the prose of 6 EN and 2 AR pages.
- AR pages carry English paragraphs marked `lang="en"`.
- Six "Preview scaffolding" stub routes return 200 in English on both locales.
- `/api/events` gets a POST on every page load before any consent, and no page text mentions it. GA loads only after the visitor clicks Allow, and it uses the production property `G-363N14SWTX`.
- The 404 raw HTML is `<html id="__next_error__">` with no lang or dir.
- The sitemap `<loc>` entries point at `www.moatazmustapha.com`.
**Not verified:** Visual appearance. I took no screenshots and made no visual judgement. Contrast, focus and screen readers were not checked. FeatureStrip could not be identified in the DOM by name. The contact form was not submitted. One `POST /api/events` with `{}` was sent by curl and returned 400, so nothing was written as far as the status shows. The crawl's cookie capture read empty while a targeted run showed the `NEXT_LOCALE` cookie set, and I did not reconcile the two.
**Open questions:** none returned. The findings are for the orchestrator to route.

---

## 008251026 — 2026-10-25 11:57 — Off production, robots.txt disallows everything and every page carries `noindex, nofollow`

**Brief:** `preview.moatazmustapha.com` is now a public Preview deployment serving the same content as production (decision 060), and its robots.txt allowed everything. When the deployment is not production, `app/robots.ts` must return a single rule disallowing `/` for every user agent, with no sitemap. Page metadata must carry `robots: { index: false, follow: false }` under the same condition. Production robots output must stay byte-identical.

**Files:** `app/robots.ts` · `app/layout.tsx`.

**What changed:**
- **Condition:** production is `process.env.VERCEL_ENV === "production"`. Unset counts as non-production. Vercel sets the variable on every deployment, so it is missing only on a local machine, where blocking crawlers costs nothing. The other choice fails open: a production build anywhere the variable is absent would be indexable without anyone deciding it. Nothing in `npm run build` depends on robots output.
- **robots.ts:** an early return `{ rules: [{ userAgent: "*", disallow: "/" }] }`, with no `sitemap` and no `host`. The production branch is untouched, and the header comment states the non-production rule.
- **Metadata:** set in **`app/layout.tsx`** (the root), not `app/[locale]/layout.tsx`. The root is the top of every route's metadata chain, the 404 included. Next merges metadata shallowly, and nothing below sets `robots` except `[...preview]/page.preview.tsx`, which sets the same value, so every page inherits it. A module-level `NOINDEX` is spread into both returns of the root `generateMetadata`. On production it is `{}`, so the key is absent exactly as before.

**Verified:**
- `npx tsc --noEmit -p .` exit 0. `npx eslint app/robots.ts app/layout.tsx` exit 0.
- Called `robots()` through tsx with `VERCEL_ENV` = production / preview / development / unset, against both the new file and `HEAD`'s. Then serialised both through Next's own `resolveRobots`. **Production robots.txt: `cmp` identical to HEAD.** Preview, development and unset all give exactly `User-Agent: *` / `Disallow: /`.
- Next's metadata resolver turns `{ index: false, follow: false }` into `noindex, nofollow`.

**Not verified:**
- **No page was rendered.** There is no `.env.local` in this container, so neither `next dev` on :3000 nor `npm run build` can run. The `<meta name="robots">` tag was not seen in any served HTML, in either locale, and the 404 was not checked either.
- Not checked on `preview.moatazmustapha.com` or on production after deploy.
- Whether Vercel's runtime `VERCEL_ENV` on the `preview.` custom domain reads `preview` was not checked. That is the documented behaviour for a branch alias.

**Open questions:** none.

## 004221026 — 2026-10-22 14:04 — `imageLayout="grid"` sets runs of 2+ consecutive screenshots in a 1/2/3-column grid; stacked unchanged

**Brief:** Per-chapter `imageLayout: "stacked" | "grid"` (backend, in parallel). When "grid", fold each run of 2+ consecutive figures in a section into one CSS grid (1 col / 2 at medium / 3 at wide); a lone figure renders as today; "stacked" byte-identical to before. Pass `imageLayout={detail.imageLayout}` at every `ChapterSections` call site. Measure whether three phone frames fit at the 320px cap at 1440, and report rather than shrink silently.

**Files:** `components/case-file/ChapterSections.tsx` · `app/[locale]/(site)/work/[caseFile]/[chapter]/page.tsx` (3 call sites).

**What changed:** the block renderer was lifted out of the map unchanged into `renderBlock`. The stacked branch still maps over `section.blocks` with it. The grid branch runs `groupFigureRuns`, which groups by ADJACENCY, never by pairing lists. Only figures with non-null `media` count toward a run, so `[fig, missing]` stays a lone figure. A run is one `<div data-figure-grid class="!my-10 grid grid-cols-1 items-start gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">`. Breakpoints are the existing `md` 768 and `lg` 1024 from `tailwind.config.ts`; nothing was added. `ChapterFigure` takes `inGrid`: it drops the figure margins (the grid owns spacing) and, when framed, sets `relative mx-auto w-full min-w-0`, so the frame fills its cell up to its cap and centres. All properties are logical or symmetric, and auto-placement follows `direction`. The local `ImageLayout` type was dropped once backend's export appeared, and the type is now imported from `@/lib/content/types`.

**Verified:**
- `npx tsc --noEmit` exit 0 and `eslint` on both files exit 0, against backend's landed `ImageLayout`/`detail.imageLayout`.
- Byte-identical stacked, using `react-dom/server` against a snapshot of the file from before this task. Two section mixes (prose, a 3-run, null media, landscape, square, table, an empty section and a prose-only section) × deviceFrame none/iphone/android × imageLayout omitted/"stacked": all 6 identical. Separately, "grid" on a section with no run of 2+ is identical to stacked.
- Harness with the site's real Tailwind CSS (`npx tailwindcss -c tailwind.config.ts -i app/globals.css`), using the chapter page's container (`mx-auto px-gutter py-section-y max-w-prose`), Chromium viewport set by Playwright and `innerWidth` read back:
  - **1440:** content column 952px, tracks 3 × 301.3px, **phone frames 301px**.
  - **900:** column 852, tracks 2 × 414, frames 320, centred.
  - **390:** column 342, 1 track, frames 320, centred (x=35; a stacked phone figure hugs the inline start at x=24).
  - Grid margin-top 40px.
  - Arabic: same widths, first figure in the rightmost cell (x=895 at 1440, x=509 at 900).
- Screenshots: `/tmp/claude-0/-home-user-portfolio/37432f93-ffd7-595b-90e1-fb93589f6bdb/scratchpad/grid/grid-{en,ar}-{1440,900,390}.png`.

**Not verified:**
- Not on `localhost:3000`, and not on the real Kshemam chapter. Whether 0063 is applied, whether Kshemam is set to grid, and whether content has reordered the images were not checked; the harness uses placeholder captions and images.
- Next fonts are not loaded in the harness (fallback faces).
- Dark theme was not shot.
- A grid cell whose `CloudinaryImage` omits itself for a missing alt was not exercised; it would leave a caption-only cell.
- Moataz has not looked.

**Open questions:**
1. **Three frames do not fit at the 320 cap in the prose column.** 3×320 + 2×24 gap = 1008px against a 952px column, so at `lg`+ the frames render at 301px (6% under the cap). A 16px gap still gives only 306.7. Options: (a) accept 301; (b) let the grid break out to `max-w-container` (1152px content, which fits 320 from about 1056px viewport and is 309px at 1024); (c) start 3 columns later — that does not help, because the column is 952 at every width ≥1000. Recommendation: (b), if he wants the cap held.
2. **A run of two at 1440 fills 2 of 3 tracks and leaves the third empty** (it hugs the start). Spec-literal. The alternative is 2 columns for a run of exactly two.
3. **Landscape in a grid:** a laptop at 301px has a 269px screen; the bezel stays in absolute px. At 900 a landscape beside a portrait leaves a tall empty area under the laptop. Shots: `/tmp/claude-0/-home-user-portfolio/37432f93-ffd7-595b-90e1-fb93589f6bdb/scratchpad/grid/land-en-1440.png`, `/tmp/claude-0/-home-user-portfolio/37432f93-ffd7-595b-90e1-fb93589f6bdb/scratchpad/grid/land-en-900.png`.

---

## 003221026 — 2026-10-22 12:41 — chapter pages pass `deviceFrame`, and portrait screenshots use `variant="android"` when a chapter is set to android

**Brief:** Backend now gives every chapter `deviceFrame: "iphone" | "android"`, never null, default
"iphone". Pass it from the chapter page into `ChapterSections`, and use it to pick the
`PhoneFrame` variant for portrait screenshots. The laptop frame and the aspect-ratio rule that
decides phone, laptop or no frame stay as they are. With "iphone", the output must not change.

**Files:**
- `components/case-file/ChapterSections.tsx` — new optional prop `deviceFrame?: DeviceFrame`
  (default `"iphone"`), passed down to `ChapterFigure`. Portrait figures now render
  `<PhoneFrame variant={deviceFrame === "android" ? "android" : "default"}>`. Nothing else changed.
- `app/[locale]/(site)/work/[caseFile]/[chapter]/page.tsx` — `deviceFrame={detail.deviceFrame}`
  added at all three `ChapterSections` call sites (lines 280, 376, 456). A grep finds no other
  `<ChapterSections` call site in the repo.

**Verified:**
- `npx tsc --noEmit`: clean. `eslint` on both touched files: clean. Prettier flags
  `ChapterSections.tsx`, but the HEAD version gets the same flag, so it is not new. I did not reformat it.
- I rendered the HEAD version and the new version with `react-dom/server`, using a fixture
  section of prose, a 720x1600 portrait figure and a 1600x1000 landscape figure.
  HEAD output === new output with no prop === new output with `deviceFrame="iphone"`: **true,
  byte-identical** (5246 chars). With `"android"` the output differs, and only inside the phone
  frame: no island, smaller radii, two keys on the right. The laptop figure is byte-identical.
- Screenshot of the android render, with tokens from `app/globals.css`:
  `/tmp/claude-0/-home-user-portfolio/37432f93-ffd7-595b-90e1-fb93589f6bdb/scratchpad/phone/cs/chaptersections-android.png`.
  DOM count in it: 1 phone frame, 0 islands, 2 right-edge keys, 0 left-edge keys.

**Not verified:**
- No dev server and no real chapter: this environment has no database access. Nothing was checked on
  `:3000`, and a chapter actually stored as `android` has never been rendered end to end.
- The harness page has no Tailwind CSS, so figure layout and widths in the screenshot are not what
  the site shows. The second figure in the shot shows the portrait PNG inside the laptop frame
  only because the harness replaced every `src` with that one image. The 1440/390 widths, both
  locales and RTL were not exercised. The frame's keys use physical `right` on purpose
  (002221026), and that was not re-checked in `/ar` here.

**Open questions:** none.

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
