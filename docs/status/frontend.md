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

## 002261026 — 2026-10-26 05:47 — Gallery card → cover now answers on the click: the card's picture lifts, then hands over to the cover (decision 065)

**Brief:** Decision 065, which supersedes 064's mechanism. On the click, before any network, clone the card's visual into a fixed layer at its rect and grow it (compositor transform, 600–700ms, ease-in-out) toward the cover's position in the content column, over a scrim that darkens and drifts the gallery. On commit, hand it over through a shared `view-transition-name` to the cover's real visual, with the rest of the cover resolving in ≤300ms. No loader at 300ms during this move; only a small signal after the lift plus a grace, never over the picture. Handle partly off-screen cards, component covers, double clicks, back, the 15s ceiling, `/ar`, reduced motion and flag off. Retire the 064 clip reveal.
**Files:**
- new `components/motion/lift.ts`: `startLift`, `cancelLift`, `commitLift`, `liftTransitionReady`, `finishLift`, `liftTarget`, `liftHasSignalRegion`, `readMs`.
- `components/motion/NavProgress.tsx`: 064's `writeOpenRect` / `clearOpenRect` / `OPEN_PROPS` removed. `beginNav` cancels any running lift, then `open` = `zoom-in` + `data-nav-open` + `/work` → `/work/<slug>` + `startLift` succeeded. Loader and quote timers split out (`scheduleWait`): `open` shows nothing at 300ms, the small mark at `--duration-nav-open` + `--duration-nav-open-signal-grace` (650 + 600 = 1250ms), the quote at 2500ms, both placed `lift`. A replacing navigation reschedules them. The ceiling (`end(true)`) reverses the lift; `settle` calls `commitLift`; the `data-nav` drop calls `finishLift` first; unmount cancels at once. A second click on the card already lifting returns before `beginNav`.
- `components/motion/NavLoader.tsx`: `place` prop (`main` | `lift`), written as `data-place`.
- `components/motion/MainTransition.tsx`: now `"use client"`, with `onUpdate` on the `site-main` ViewTransition calling `liftTransitionReady` (a no-op unless a lift is running).
- `components/gallery/ProjectCard.tsx`: `data-nav-open-visual` on the image wrapper and on the component-cover wrapper.
- `app/[locale]/(site)/work/[caseFile]/page.tsx`: both cover wrappers get `data-case-cover` and `relative`, only when `MOTION_LAYER` is on.
- `app/globals.css`: 064 tokens `--duration-nav-open-fade` removed, `--duration-nav-open` 700 → 650ms, `--ease-nav-open` → `cubic-bezier(0.65, 0, 0.35, 1)`, `--nav-open-drift` 14vh → 2rem, `--nav-open-dim` 0.55 (now the alpha of a black scrim, not a brightness factor), `--ease-nav-open-recede` kept. New: `--duration-nav-open-handover` 350ms, `--ease-nav-open-handover` `cubic-bezier(0.45, 0, 0.2, 1)`, `--duration-nav-open-resolve` 300ms, `--duration-nav-open-signal-grace` 600ms, `--duration-nav-open-cancel` 200ms, `--nav-open-offset` 16rem, `--nav-open-ink` white. All new durations zeroed under reduced motion. 064 rules and keyframes `nav-open-reveal` / `nav-open-recede` removed. New: `.nav-open-backdrop` (z 47), `.nav-open-lift` (z 48), `.nav-open-fallback`, `.nav-loader[data-place="lift"]` (z 49, 2.5rem mark, no scrim), the `case-cover` / `case-backdrop` naming under `:root[data-nav="open"]`, their `::view-transition-*` rules, and the `open` old/new `.nav-main` resolve (300ms each).
**How it works:**
- *Lift:* the visual is cloned before it is hidden (`visibility`, same task as the append, so the two never paint together). Target = the gallery container's content box (rect minus computed physical padding) for width, header bottom + `min(--nav-open-offset, 35% of the viewport below the header)` for top, height = the visual's own aspect × the scale. One uniform `scale`, so nothing distorts. The radius animates to 0 as a separate main-thread animation so the transform stays on the compositor. The scrim fades in (`opacity`) and the gallery's page container translates up 2rem, both on the recede curve.
- *Hand-over:* globals.css names the layer `case-cover` and the cover wrapper `case-cover` only while `data-nav="open"`. The layer and scrim unname and hide themselves when `#main` no longer holds a `[data-nav-open]` card, which is only true in the new state, so each state has one `case-cover`. The group morph defaults to 350ms; `liftTransitionReady` retimes it to the lift's remaining time on the recede curve when the commit lands mid-flight (remaining > 350ms), then tears the layer down when the transition's `case-cover` animations finish. The old image stays opaque while the new one fades in over it (normal blending), so a cover image still loading at capture never thins the picture; with no cover on the new page the old image fades alone (`:only-child`). If the cover's own `<img>` is not complete at the commit, a copy of the lifted picture sits in the wrapper (`.nav-open-fallback`) until it loads, then fades out.
- *Signal region:* below the picture if ≥120px remains in the viewport, else between the header and the picture, else none (hairline only). Written as `--nav-open-signal-top/-h`.
- *Cancel:* reads the layer transform, radius, scrim opacity and drift once, then reverses each to rest in 200ms and restores the card. A cancelled layer drops its name inline at once, so a second card lifted meanwhile cannot make a duplicate `case-cover` (which would make the browser skip the transition).
- *Edge cases:* a card partly off screen lifts from its true rect (a card with no visible area below the header falls back to `zoom-in`); a component cover clones its SVG; `/ar` uses the same physical rects and transforms, nothing reads `dir`; reduced motion and flag off never lift (`motionAllowed()`), so the instant cut and focus-to-h1 are unchanged.
**Verified:** `npx tsc --noEmit -p .` exit 0. `npx eslint components/motion/ components/gallery/ProjectCard.tsx "app/[locale]/(site)/work/[caseFile]/page.tsx"` exit 0. `npx tailwindcss -i app/globals.css` compiles; output has the `case-cover` rules (11 occurrences), the `:has(#main [data-nav-open])` hide rule, the `:only-child` rule, and no `nav-open-reveal`.
**Not verified:** nothing rendered. No `.env.local` and no browser in this environment, so no dev server on `:3000`, no click, no recording, no measurement at 390 or 1440 in either locale. Specifically unobserved: that the lift starts in the click's frame; continuity when the commit lands mid-flight (the retime is reasoned, not seen); that React's `onUpdate` fires after the pseudo-elements exist, so `getAnimations()` finds the `case-cover` group (if it does not, the morph runs at the 350ms default and the layer is removed at the 900ms `data-nav` drop instead); that the gallery's page container is replaced at the commit rather than reused (the drift is also cancelled at commit in case); the `:has()` hide rule taking effect at the new-state capture; `.nav-open-fallback` over a slow cover image; the target top (`--nav-open-offset` 16rem) against the real cover position: ≈256px is computed from the spacing and type tokens, not measured; the signal region and the mark at 2.5rem; the scrim's contrast (≈4.7:1 for white text over the light theme is computed); Safari and Firefox; RTL. The 064 entry's open finding (the gallery brightening for a frame at commit) should not recur, since the scrim is now its own named group, but that is unobserved too.
**Open questions (for the orchestrator, none blocking the build):**
1. The brief's item 5 says only the media container moves; its item 1 and 065 item 1 ask the gallery to drift. The drift is a 2rem `translateY` of the gallery's page container (no scale). If item 5 is meant strictly, `--nav-open-drift: 0` removes it in one token.
2. The card shows a 1.6:1 crop (`card` preset, or `coverCard`); the cover shows the whole image (`hero`, `c_limit`). Where those aspects differ (a square master), the hand-over is not "the same picture": the morph changes aspect and the full image fades in over the crop. Invisible only where the card and cover aspects match.
3. `docs/design/tokens.md` needs the 065 tokens, and the 064 ones it may list removed. Not frontend's file.

## 001261026 — 2026-10-26 05:20 — Gallery card opens into the cover: clip reveal from the clicked card (decision 064)

**Brief:** Decision 064. A click on a gallery card (`/[locale]/work`) opens the case-file cover out of that card: the new `<main>` revealed by a `clip-path: inset()` growing from the card's rectangle to the viewport below the header, the old page drifting up and dimming behind it, ~700ms, one ease-out curve. Content never transforms. Cover → gallery stays the ≤400ms resolve. Flag off and reduced motion unchanged.
**Files:**
- `components/motion/NavProgress.tsx`: new kind `open`. In `beginNav`, a `zoom-in` whose clicked link carries `data-nav-open` and whose paths are `/<l>/work` → `/<l>/work/<slug>` becomes `open`, and `writeOpenRect` writes `--nav-open-x0/y0/x1/y1` and `--nav-open-y-end` on `<html>`. The card rect is clamped to the visible area (x 0..clientWidth, y header bottom..innerHeight) and translated into the new `<main>` snapshot's coordinates (its document top/left, since the new page lands at scroll 0). A card with no visible area falls back to `zoom-in`. The props are cleared at the start of every navigation and with `data-nav` after `CLEAR_NAV_MS`.
- `components/gallery/ProjectCard.tsx`: `data-nav-open=""` on the card's `<Link>`.
- `app/globals.css`: tokens `--duration-nav-open: 700ms`, `--ease-nav-open: cubic-bezier(0.2, 0.8, 0.2, 1)`, `--duration-nav-open-fade: 70ms`, `--nav-open-drift: 6vh`, `--nav-open-dim: 0.6` (the two durations zeroed under reduced motion); rules for `:root[data-nav="open"]` old/new `.nav-main`; keyframes `nav-open-reveal` (from `inset(y0 calc(100% - x1) calc(100% - y1) x0 round var(--radius-panel))` to `inset(0 0 calc(100% - y-end) 0 round 0)`) and `nav-open-recede` (opacity 1 → 0.6, `translateY(0)` → `translateY(-6vh)`, on top of the existing `--nav-old-shift` translate). `mix-blend-mode: normal` on both images so the UA's plus-lighter does not add the two pages inside the window.
**Landing:** the landing page has no project cards (its only work link is the CTA to `/work`), so nothing there opens a cover.
**Verified:** `npx tsc --noEmit -p .` exit 0. `npx eslint components/motion/NavProgress.tsx components/gallery/ProjectCard.tsx` exit 0. `npx tailwindcss -i app/globals.css` compiles and emits the tokens, the reduced-motion zeroing, both rules and both keyframes.
**Not verified:** nothing rendered: no `.env.local` and no browser in this environment, so no dev server, no screenshot, no click. Specifically unobserved: that Chrome interpolates the `inset()` with `calc(100% - var(...))` smoothly rather than discretely; that the new snapshot box starts at `<main>`'s document top after Next's scroll reset (the coordinate assumption, same one `--nav-old-shift` makes); the clip rect against the card when the gallery is scrolled; RTL (`/ar/work`) card origin; the header staying above the drifting old page; the plus-lighter override; light theme (0.6 opacity recedes toward white there, it does not darken); Safari and Firefox. Known limit: a scroll during a slow, still-pending navigation is not re-read, so the clip starts where the card was at click time.
**Open questions:** none.
**Correction (2026-10-26 05:40, orchestrator's preview finding, frames `scratchpad/crawl/open/en-00…13.png`):** four fixes, all in `app/globals.css`.
1. *Transparent new snapshot (double exposure):* `:root[data-nav="open"]::view-transition-new(.nav-main)` gets `background-color: var(--color-bg)`. I set it on the pseudo-element, not on `<main>`, so the live page is unchanged; the clip clips the background with the image.
2. *Window start vs card:* the math checks out against the frames. In en-04 the window spans x ≈ 494–945 for a card at x 537–903 (≈8% of the way to 0/1440). In en-05 it spans 240–1196, and both edges are 55% of the way to the viewport edges: consistent mid-animation progress, not an offset. `inset()` resolves against the snapshot box, which starts at `<main>`'s origin, and that origin is what `writeOpenRect` subtracts. No code change. Why it looks off: the ease-out `cubic-bezier(0.2, 0.8, 0.2, 1)` covers about a third of the distance in the first 10% of the time, so the exact-card frame lasts only a moment.
3. *Loader over the transition:* `:root[data-nav]::view-transition-new(nav-loader) { display: none; }`. The overlay is no longer drawn during any classified move, which is 063 item 3's "disappears the moment the route commits". This applies to every move, not only `open`.
4. *Dimming and drift:* the old image now animates `filter: brightness(1 → var(--nav-open-dim))` instead of opacity, with `opacity: 1` set explicitly against the base rule that hides every old image. `--nav-open-dim` changes 0.6 → 0.55 (now a brightness factor). `--nav-open-drift` changes 6vh → 14vh, because en-05 to en-07 showed the 54px drift finished but too small to read.
**Verified:** `npx tsc --noEmit -p .` exit 0; `npx eslint` on both touched `.tsx` files exit 0; `npx tailwindcss` compiles and emits the new rules.
**Not verified:** not rendered. Unobserved: the opaque window; the loader no longer showing over a slow navigation; brightness in both themes; the 14vh drift; brightness filter cost on a full-page snapshot. Also unobserved: the gallery may brighten for one frame at commit, because the pending scrim dimmed the live page and the old snapshot is captured without it.
**Curve (2026-10-26 05:50, orchestrator's call):** the reveal now uses `--ease-nav-open: cubic-bezier(0.65, 0, 0.25, 1)` at 700ms, and the old page keeps `cubic-bezier(0.2, 0.8, 0.2, 1)` under a new token, `--ease-nav-open-recede`. tsc and eslint exit 0. Not rendered. This departs from 064 item 1's "one ease-out curve": there are now two curves and the reveal's is ease-in-out. Flagged for the orchestrator.

## 013251026 — 2026-10-25 19:56 — Navigation feedback: press fix, pending hairline, mark loader, quotes, view transitions (decision 063)

**Brief:** Decision 063, six items. (1) Press dip that actually wins on the four primary CTAs, not flagged. (2) A 2px accent pending hairline for every internal navigation, not flagged, with no per-link edits. (3) Moataz's mark as a loader over `<main>` past 300ms, (4) one `wait_quote_N` past 2.5s, (5) React `ViewTransition` page transitions, 3 to 5 behind `MOTION_LAYER` and off under reduced motion. (6) Pending state on the contact and CV forms.
**Files:**
- new `components/motion/NavProgress.tsx` (hairline, start/end detection, loader host, transition classifier, focus-to-h1), `components/motion/NavLoader.tsx` (lottie loader + quote), `components/motion/MainTransition.tsx` (`<ViewTransition name="site-main">`, carries `/// <reference types="react/canary" />`), `components/motion/pending.ts` (form wait signal)
- `app/globals.css` (nav tokens + reduced-motion zeroing; `:active` moved out of `@layer base` to an unlayered `:root :is(...):active`; hairline, loader, `::view-transition-*` rules), `tailwind.config.ts` (`transition-colors` includes `opacity`)
- `app/[locale]/layout.tsx` (mounts `NavProgress` in Suspense, resolves `wait_quote_N`), `app/[locale]/(site)/layout.tsx`, `app/[locale]/(landing)/layout.tsx` (`<main>` wrapped in `MainTransition`), `app/[locale]/(site)/work/[caseFile]/[chapter]/page.tsx` (`transitionTypes` on next/prev)
- `active:border-fg` added beside every `hover:border-fg` (12 call sites): `app/[locale]/(landing)/page.tsx`, `.../work/[caseFile]/page.tsx`, `.../[chapter]/page.tsx`, `.../results/page.tsx`, `.../all/page.tsx`, `app/not-found.tsx`, `components/analytics/ConsentBanner.tsx`, `components/contact/ContactForm.tsx`, `components/contact/CvRequestPanel.tsx`
- `components/contact/ContactForm.tsx`, `components/contact/CvRequestPanel.tsx` (hairline while sending, `aria-busy`, label falls back to submit if `sending` is unset; ContactForm button gains `min-w-control`), `components/layout/SiteHeader.tsx` (`site-header` class for the anchor)
**Thresholds:** hairline invisible under 100ms, loader at 300ms, quote at 2500ms, 15s ceiling resets a navigation that never commits, `data-nav` dropped 900ms after commit. Cross-resolve 150 out + 250 in (6px settle) = 400ms; descend/ascend 400ms (scale .985); pan 600ms (`--duration-nav-pan`), 24px, mirrored by `--nav-axis` under `dir=rtl`; locale switch is a cut; back/forward fades the new page in 250ms.
**Chunk strategy:** `lottie-web/build/player/lottie_light` (the hero's chunk) plus `/motion/loader.json` are dynamically imported, warmed by `requestIdleCallback` (4s timeout, `setTimeout` 2s fallback) after mount, only when the flag is on and reduced motion is off. Flag off: never requested.
**Verified:** `npx tsc --noEmit -p .` clean. `npx eslint` on every touched file clean. `npx tailwindcss` compiles; the output has no native `@layer`, `.transition-colors` now lists `opacity`, `.active\:border-fg:active` is emitted, the press selector is (0,4,0) against `hover:opacity-85`'s (0,2,0).
**Not verified:** nothing was rendered: no `.env.local` in this environment, so no dev server, no screenshot, no DOM query, no click. Specifically unmeasured: that the press dip shows on the four CTAs; the hairline timing and RTL origin; the loader frames and loop (frame 0 empty is read from the JSON: every trim end starts at 0, not seen); the view-transition visuals in Chrome, Safari or Firefox; **the `--nav-old-shift` compensation for a scrolled page, which assumes Chrome snapshots a taller-than-viewport `<main>` at full size**; that `update` fires on the persisted `<main>` and `share` across landing/site; focus landing on `h1`; the forms' hairline.
**Open questions:** none blocking. Deviations for the orchestrator: pan is 600ms (token and 063's bound) not the brief's 500; the 400ms descend uses a new `--duration-nav-depth`, so the zoom tokens stay declared but unread and tokens.md needs the five new tokens documented (docs are not frontend's); release is 150ms on controls with a `transition-*` utility, 160ms elsewhere. Quotes take the locale's `lang`/`dir`: `getUiStrings` exposes no field locale, so `resolveManyDetailed` would need a backend accessor for ui_strings. `instrumentation-client.ts` was not written (root file, outside frontend's paths).
**Correction (2026-10-25 20:02, preview finding):** focus stayed on BODY under reduced motion because `settle()` gated the h1 focus move on `motionAllowed()`. That condition is now removed from the focus branch only (`focusOnCommit` was already set unconditionally in `beginNav`). Nothing else changed in `components/motion/NavProgress.tsx`.
**Verified / not verified:** `npx tsc --noEmit -p .` exit 0, `npx eslint components/motion/NavProgress.tsx` exit 0. Not re-run in a browser: focus landing on the h1 under `prefers-reduced-motion: reduce` is unobserved here.

## 012251026 — 2026-10-25 — Home hero mark is now the Lottie, behind MOTION_LAYER (decision 062)

**Brief:** replace the Home `HeroMark` with `public/motion/hero-mark.json`, recoloured to `currentColor` at the existing `text-accent opacity-20`, behind the single Motion Layer flag, static on server and under reduced motion. First pass stopped on three skill conflicts; Moataz answered them in decision 062.
**Files:** `components/brand/HeroMarkMotion.tsx` (new), `lib/motion/flag.ts` (new, `MOTION_LAYER = true`; path given by the orchestrator, outside my listed scope), `app/[locale]/(landing)/page.tsx` (swap import + call site), `app/globals.css` (`.hero-mark-motion` fill/stroke → currentColor), `package.json` + `package-lock.json` (`lottie-web@5.12.2` — devops's files, edited per brief).
**Playback choice:** play once, hold frame 119. JSON keyframes: Bezier 19 opacity 0→100 by f70, rotation ends f80, scales back at rest by f120; f120–240 repeat the same cycle. So 0–119 ends on the full mark.
**Verified:** `tsc --noEmit` clean; eslint on touched files clean; `npm run build` compiles, then fails collecting page data on `NEXT_PUBLIC_SUPABASE_URL is not set` (no `.env.local` here). The Lottie runtime is its own chunk (`.next/static/chunks/0stpraxlbcmso.js`): 167,778 B minified, 46,421 B gzip, referenced only from the dynamic-import loader chunk, not from any manifest.
**Not verified:** nothing rendered — no dev server, no screenshot, no browser. Unverified: the CSS recolour on the real SVG output, the Lottie's size relative to the static mark (512 square vs 282x278; the swap is likely a visible jump in size/rotation at frame 0), the reduced-motion path, both themes, both locales. The lockfile diff also drops ~120 `"libc"` lines because this container runs npm 10.9.4; a regenerate on Moataz's npm may restore them.
**Open questions:** none.

## 011251026 - 2026-10-25 16:43 - GA production-only, chapter title as h1, chapter close block; 404 shell diagnosed, not fixed

**Brief:** decision 061 items 5, 17, 12, plus the crawl's 404 lang/dir finding.
**Files:** `app/[locale]/layout.tsx`, `app/[locale]/(site)/work/[caseFile]/[chapter]/page.tsx`, this file.
**Changes:**
- GA (item 5): `gaId` is resolved only when `VERCEL_ENV === "production"` (unset = non-production, same as `app/robots.ts`). With no id, `GoogleAnalytics` renders nothing and `ConsentBanner` is disabled. The gate is in the server layout, not in the two client components, because `VERCEL_ENV` is not exposed to the client bundle. `Analytics` (/api/events) untouched.
- Chapter header (item 17): kind=chapter now renders `<h1>` = chapter title (`text-title`), then the OBJECTIVE label and the objective as a `<p>` at `text-statement` with its own `lang`/`dir`. The label moved from the progress row to above the objective. Document pages (comparison/accessibility) already had a single h1 = title; unchanged.
- Close block (item 12): rendered when `detail.next` is null (last chapter; comparison and accessibility pages never have `next`). Links: results table (only if `getCaseFile(...).targets.length > 0`, key `results_table`), Work gallery (`back_to_work`), `SiblingLinks` with `sibling_case_files`. No new ui_strings keys. Extra `getCaseFile` call only on end pages.
**Verified:** `tsc --noEmit` exit 0; `eslint` on both touched files, 0 findings; no em dashes in added lines.
**Not verified:** no `.env.local` here, so no build, no dev server, no render, no screenshots, no DOM h1 count. GA gate not observed on any deployment. The close block not seen in either locale; Arabic objective now loses the LANTX display face (it is no longer an h1), intended, unmeasured.
**404 (not fixed):** Next 16.4.2 emits `<html id="__next_error__">` from `getErrorRSCPayload` (`next/dist/server/app-render/app-render.js`) when a notFound/error escapes the shell render with no boundary above it (e.g. root layout, blocking metadata for bots); the client then re-renders the root not-found, which is why JS adds lang/dir. It cannot be addressed inside `app/not-found.tsx`, which is never reached in that path. The documented fix is `app/global-not-found.tsx` behind `experimental.globalNotFound` in `next.config` (devops' file) plus a duplicated document shell. Which URLs the crawl saw this on is not recorded in 009251026, so it could not be reproduced here.
**Open questions:** which 404 URLs showed the shell; whether to adopt `global-not-found` (needs devops for config).

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
