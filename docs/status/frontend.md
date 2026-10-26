# docs/status/frontend.md — frontend agent log

**Living document. Newest first.** Written by the `frontend` agent as part of the task, never
offered afterwards. An unchanged status file is indistinguishable from work that never ran.

Every entry carries the nine-digit task id the orchestrator assigned — `NNNDDMMYY`, e.g.
`014210826` is task 014 on 21/08/26. That id ties this entry to `docs/status.md` and to
the other agents' entries for the same work. **Entries are dated to match the commit time,
never ahead of it.**

A task that ends in a diagnosis, a refusal, or a question returned still gets an entry.
Two lines, not silence.

## 013261026 — 2026-10-26 17:16 — `[frame] none` renders a figure bare at full width, in every layout (decision 069)

**Brief:** a chapter image block with `frame === "none"` (backend's new optional field on the image member of `ChapterBlock`) must render like the editorial wide figures: no laptop or phone frame, no box, image `block h-auto w-full`, the plain caption `mt-3 max-w-measure text-meta text-fg-muted` below. Stacked, grid and editorial alike. In grid it breaks out of the row at full width. In editorial it is full width, never beside text. Figures without the flag stay as they are.
**Files:** `components/case-file/ChapterSections.tsx` · this file.
**Change:**
- `ChapterFigure` gains the prop `unframed`. When it is set, `phone` is forced false, and `laptop` is false through `bare = bareWide || unframed`. The image takes the `device || bare` class (`block h-auto w-full`, no `max-h-figure`). With `device` false, the figure is `mt-8` with no maxWidth style and the caption takes the plain unframed branch. That is the same output `editorialFullWidth` gives a landscape figure, and it now holds for portrait and square too.
- Stacked: `renderBlock` passes `unframed={block.frame === "none"}`.
- Grid: `groupFigureRuns` no longer puts a renderable `frame: "none"` figure in a run. It flushes the run and renders as a block through `renderBlock`, so `[A, B, none, C, D]` becomes grid(A,B), the bare figure, grid(C,D). A run split down to one figure renders as a lone stacked figure, as before. I split the run rather than using `col-span-full` inside the grid, so the bare figure gets the stacked spacing and none of the grid-cell sizing rules. A null-media `none` figure does not break a run, because it renders nothing.
- Editorial: `EditorialUnit` pair carries `unframed`. `beside` is false whenever it is set, so the figure goes down the full-width path (`editorialFullWidth` + `unframed`) and does not advance the alternation. `countEditorialBesideFigures` uses the same grouping, so the offset across the two `ChapterSections` calls stays consistent.
- Figures without the flag: every class string and branch is unchanged (`unframed` defaults to false, `bare === bareWide`).
**Verified:** `rm -rf .next/types && npx tsc --noEmit -p .`: exit 0. `npx eslint components/case-file/ChapterSections.tsx`: exit 0. Read `lib/content/chapters.ts:320`: backend emits `frame: "none"` only when `para.frame === "none"`, matching the type.
**Not verified:** nothing was rendered. There is no `.env.local` here, so there is no :3000, no screenshot at 390/1440 in either locale, and no DOM check that the FATCA mockup figure has no `[data-device-frame]`-style wrapper or that its image computes to the container width. Whether the FATCA chapter is stacked, grid or editorial was not checked. Nothing changes on the page until migration 0067 is applied and the sync runs with the tag.
**Open questions:** none.

## 012261026 — 2026-10-26 13:17 — `editorial` image layout in the chapter renderer (decision 068)

**Brief:** build the third `imageLayout`, `editorial`, in `ChapterSections` along the same path as `grid`. Within each section, pair each figure with the prose since the previous figure and with its caption. A narrow figure (w/h <= 1.15 from the stored dimensions; unknown counts as wide) goes beside its prose on `md`+, alternating sides per narrow figure across the chapter, using logical sides only. A wide figure renders full width with the caption under it. Below `md`, everything stacks. Target: UAE Application Tracking.
**Files:** `components/case-file/ChapterSections.tsx` · `app/[locale]/(site)/work/[caseFile]/[chapter]/page.tsx` (the second `ChapterSections` call passes `editorialOffset={countEditorialBesideFigures(leadSections)}` so the decision cards do not restart the alternation) · `lib/media/image-layout.ts` (`IMAGE_LAYOUTS` gains `"editorial"`: backend had not added it when I built, and this is outside my usual write area, done on the brief's instruction) · this file.
**Change:**
- `groupEditorialUnits` groups by adjacency. Prose blocks accumulate. A renderable figure takes the accumulated prose as a pair. A table flushes the prose as plain blocks and renders unchanged. A null-media figure flushes its prose as plain blocks (it is not carried forward to the next figure). Prose after the last figure stays plain.
- A pair is "beside" only if the figure is narrow AND its text column would hold something (prose or a caption). Otherwise it renders exactly as stacked and takes no side, so a grid track can never be left empty.
- The beside pair is a grid: `grid-cols-1 gap-y-6` below `md`. From `md` it is `md:grid-cols-2 md:gap-x-10 md:grid-rows-[1fr_auto_auto_1fr] md:!my-10`. Prose is in row 2 and the caption in row 3, both in the text column. The image cell spans `row-start-1`/`row-end-5` with `self-center`. The `<figure>` is `md:contents`, so its figcaption becomes a grid cell while staying inside the `<figure>`. Sides are `md:col-start-1/2`, which follow `direction`, so Arabic mirrors. The counter is even → figure at inline end, odd → inline start.
- Columns are 1/1, not 5/7. Inside the 1000px prose container a square comes out about 456px at `lg`, against about 530px at 7/12.
- Captions keep their current styles and never float. The chip (framed figures) hugs the inline start of the text column. An unframed image is `mx-auto` in its cell. A framed one carries the frame max-width on the cell (a `style` on a `contents` box applies to nothing).
- Stacked and grid are unchanged. CloudinaryImage, the `gallery` preset, NDA grayscale (inside CloudinaryImage), the device-frame thresholds and the spacing tokens are all unchanged. No motion.
**Verified:**
- `rm -rf .next/types && npx tsc --noEmit -p .`: exit 0. That was with `"editorial"` added to `IMAGE_LAYOUTS` and before backend's change; `database.types.ts` still says `"stacked" | "grid"`, and tsc did not object.
- `npx eslint` on the three source files: exit 0.
- Tailwind compile (`npx tailwindcss -c tailwind.config.ts -i app/globals.css`): every new utility is emitted — `md:contents`, `md:col-start-1/2`, `md:row-start-1/2/3`, `md:row-end-5`, `md:self-center/start`, `md:grid-rows-[1fr_auto_auto_1fr]` → `grid-template-rows: 1fr auto auto 1fr`, `md:!my-10` → `var(--space-10) !important`, `md:gap-x-10`, `md:gap-y-0`, `gap-y-6`, `md:grid-cols-2`.
- No physical-direction utility in the file; the only grep hit is an existing comment.
**Not verified:**
- **Nothing was rendered.** There is no `.env.local` in this container and no Chrome, so no dev server on :3000, no screenshot, and no DOM or computed-style measurement in either locale at 390 or 1440.
- The target page's block order and captions were not read. The Supabase connector here lists only the Dabbler projects, not the portfolio's. The expected result (narrow on inline end, narrow on inline start, then two wide) assumes each 1000x1000 figure has prose before it or a caption. Without either, it renders stacked and takes no side.
- The `1fr auto auto 1fr` vertical centring is reasoned from the grid spec, not measured.
- `display: contents` on `<figure>`: screen-reader exposure of the figure/figcaption relationship was not tested.
- Nothing renders as editorial until backend's migration and sync land and the chapter's Notion `Image layout` is set to Editorial.
**Open questions:** none.

### 012261026 addendum — 2026-10-26 — editorial captions: one plain style, exact centring

**Brief:** in an editorial beside row, a framed figure's caption (the second figure on UAE Application Tracking, a portrait screen in the iPhone frame) rendered as the device-frame chip (mono, micro, bordered). Every caption in the editorial text column must use the unframed caption style. Stacked and grid keep the chip. Confirm that a caption-only text column stays vertically centred on the image.
**Files:** `components/case-file/ChapterSections.tsx` · this file.
**Change:**
- In `ChapterFigure`, the editorial figcaption branch no longer checks `device`. It is always `mt-3 max-w-measure text-meta text-fg-muted md:mt-0`, plus the existing `md:row-start-3 md:self-start` and the text column. That is the unframed caption's exact class string, with `md:mt-0` added. The non-editorial branches (the chip, the laptop float, the plain unframed caption) are byte-for-byte unchanged.
- **Centring was not exact, and is now.** With no prose, the caption's `mt-3` stayed in row 3, so the centred text group was the caption plus 12px, and the caption sat 6px below the image's centre. From `md` the 12px now belongs to the prose column (`md:pb-3`, only when the figure has a caption), and the caption drops it (`md:mt-0`). Below `md` the caption keeps `mt-3` under its image. With prose and a caption the spacing is unchanged (12px). With prose and no caption no padding is added, so that case is also unchanged.
- The brief called the normal caption style "`text-body-sm` / muted". The unframed caption in this file is `text-meta text-fg-muted` (13px, not 15px). I matched the unframed rows as the brief instructs and did not introduce `text-body-sm`.
**Verified:** `rm -rf .next/types && npx tsc --noEmit -p .`: exit 0. `npx eslint components/case-file/ChapterSections.tsx`: exit 0. Tailwind compile emits `md:mt-0` (margin-top 0) and `md:pb-3` (`var(--space-3)`).
**Not verified:** nothing was rendered. There is still no `.env.local` or Chrome in this container, so there is no :3000, no screenshot at 390/1440 in either locale, and no computed-style check of the caption's font or its vertical offset against the image. The 6px figure and its correction come from the grid arithmetic, not from a measurement. Preview was not inspected.
**Open questions:** none.

### 012261026 addendum 2 — 2026-10-26 — editorial: alternation flipped, caption-only column reads as a paragraph

**Brief:** Moataz's review on preview. (1) Flip the alternation: the first narrow figure goes on the inline-start side with its text at inline end, the second on inline end, and so on. Keep logical columns so Arabic mirrors, and keep the offset across the two `ChapterSections` calls. (2) When a beside row's text column holds only the caption (no prose before the figure), render that caption with the prose paragraph's size, leading and measure, in `text-fg-muted`. Keep `<figcaption>`, no box. A caption with prose above it stays the small caption.
**Files:** `components/case-file/ChapterSections.tsx` · this file.
**Change:**
- The counter is now even → `"start"` and odd → `"end"` (it was the reverse). The side still maps to `md:col-start-1/2`, which follows `direction`. `editorialOffset` and `countEditorialBesideFigures` are untouched: the count is the same, and only the parity-to-side mapping changed, so the second call continues the sequence. Comments updated.
- New `ChapterFigure` prop `captionAsParagraph`, passed as `unit.prose.length === 0` on the beside branch only. When it is true, the editorial figcaption is `mt-3 whitespace-pre-line text-body text-fg-muted md:mt-0`. That is the `<p>`'s `whitespace-pre-line text-body` (17px token, 1.7 leading, no `max-w-measure`, since the paragraph has none) in the caption's colour. Grid placement (`md:row-start-3 md:self-start` + text column) is unchanged. Otherwise the caption is byte-for-byte the previous `mt-3 max-w-measure text-meta text-fg-muted md:mt-0`. Stacked, grid and non-beside editorial captions are untouched.
- Below `md` the same caption-only figure also uses the paragraph style (image, then the caption at body size, 12px under it). The brief did not say which breakpoints; I applied it to the case, not to a width.
**Verified:** `rm -rf .next/types && npx tsc --noEmit -p .`: exit 0. `npx eslint components/case-file/ChapterSections.tsx`: exit 0. Tailwind compile emits `.text-body` (font-size `var(--text-body)`, line-height 1.7), `.whitespace-pre-line` and `.text-fg-muted`.
**Not verified:** nothing was rendered. There is still no `.env.local` or Chrome here, so there is no :3000, no screenshot at 390/1440 in either locale, and no DOM check that row 1's figure sits in column 1 (left in `/en`, right in `/ar`) or that the second row's caption computes to the paragraph's font-size and line-height. That Arabic picks up the Arabic body face on the caption relies on the figcaption's `lang`, which is unchanged. Preview was not inspected after the change.
**Open questions:** none.

### 012261026 addendum 3 — 2026-10-26 16:59 — editorial: wide figures leave the laptop frame

**Brief:** Moataz's review on preview. The two wide figures in UAE Application Tracking (the withdrawal mockup and the welcome-screen mockup) rendered inside the laptop frame, with the chip caption on or under it. They are finished mockups. In an `editorial` chapter a wide figure should have no device frame, panel or box: just the image at full container width, with the caption below it in the plain `text-meta text-fg-muted` style (no chip, border or mono font, not overlapping). Stacked and grid stay unchanged. Narrow editorial figures keep their current behaviour, and a portrait screen keeps its iPhone frame.
**Files:** `components/case-file/ChapterSections.tsx` · this file.
**Change:**
- New `ChapterFigure` prop `editorialFullWidth`. It is passed only on the editorial non-beside branch: wide figures, and narrow figures with nothing to sit beside. In `ChapterFigure`, `landscape` is the old laptop test (h/w < 0.9) and `bareWide = editorialFullWidth && landscape`, so `laptop = landscape && !bareWide`. A bare wide figure is therefore not a `device`. The consequences follow from that: no `DeviceFrame`, no frame max-width style, and the figure takes the existing unframed class (`mt-8`). The caption takes the existing unframed branch, byte-for-byte `mt-3 max-w-measure text-meta text-fg-muted`, and is in flow under the image.
- The bare wide image is `block h-auto w-full`, which is full container width with no `md:max-h-figure` cap. No rounding: unframed images on this site carry none, and I added none.
- Phone-framed figures (h/w >= 1.7) are untouched on every branch. Beside figures, stacked and grid never get the prop, so their output is unchanged.
**Verified:** `rm -rf .next/types && npx tsc --noEmit`: exit 0. `npx eslint components/case-file/ChapterSections.tsx`: exit 0. No new utility classes; every class used already exists in the file.
**Not verified:**
- **Nothing was rendered.** `npm run dev` started on :3000, but the page returns 500 because `NEXT_PUBLIC_SUPABASE_URL is not set` (there is no `.env.local` here). I stopped the server. There is no screenshot at 390/1440 in either locale and no DOM check that the two wide figures now contain no frame element.
- I did not check the two figures' stored dimensions, so it is not confirmed that both measure h/w < 0.9. A wide figure with no stored dimensions was never framed and still renders under the old unframed rule (height capped at 600px from `md`, not full width).
- Edge case, by construction: a figure with w/h between about 1.11 and 1.15 counts as narrow, so it sits beside its prose, and is also landscape by the frame test (h/w < 0.9), so it keeps the laptop frame in the beside row. The brief did not cover that case, so I left it unchanged.
- Full-width images with no height cap: a very wide but short mockup, or a 4:3 mockup at about 750px tall in the 1000px container, now renders at its natural height. That was the request. How it reads is Moataz's to judge.
**Open questions:** none.

## 008261026 — 2026-10-26 07:47 — one `CardArrow` primitive, body-sm, on every internal card link

**Brief:** follow-up to 007261026. The chapter-card arrow was too big (`text-h3`). Make it the description size, keep it vertically centred, and put the same arrow on every internal link that renders as a card or row surface: a bordered or surface panel with a hover state, where the whole block is the link. Extract it into one server component. Exclude gallery ProjectCards, inline text links, the header nav, and buttons/CTAs.
**Files:** new `components/primitives/CardArrow.tsx` · `components/case-file/LivingMap.tsx` · `components/case-file/EntryHandles.tsx` · `app/[locale]/(site)/work/[caseFile]/page.tsx` (passes `arrow` to EntryHandles) · `app/[locale]/(site)/work/[caseFile]/[chapter]/page.tsx` · `app/[locale]/(site)/work/[caseFile]/results/page.tsx` · `app/[locale]/(site)/work/[caseFile]/all/page.tsx` · `app/[locale]/(site)/systems/page.tsx` · `app/[locale]/(site)/about/page.tsx` · this file.
**Change:** `CardArrow({ glyph })` returns null when the glyph is undefined. Otherwise it renders an `aria-hidden` span with `shrink-0 text-body-sm leading-none text-fg-dim transition-colors group-hover:text-fg group-focus-visible:text-fg`. No transform. Each card listed below is now `group flex items-center gap-4`, with its content in a `min-w-0 flex-1` column and `<CardArrow glyph={ui.t("arrow_forward")} />` as the last child. Every existing hover/active border and background class is unchanged. On the cards that already had an arrow, the literal `→` + `rtl:rotate-180` span is gone (rtl-guard).
**Applied to:**
- LivingMap chapter cards. `text-h3` became `text-body-sm`, matching the objective line.
- EntryHandles, RESOLVED handles only. An unresolved handle is plain text and gets no arrow, because the arrow would promise a destination that does not exist.
- The chapter page's next-chapter card. It was `text-h3 text-fg-muted` with a literal arrow, and `gap-5` became `gap-4`.
- The results page's sibling "next case" card. It was `block` with the arrow `items-end` beside the h2 title. It is now a row: kicker, title and note in the column, arrow centred on the whole card. The title's old `mt-4` became the column's `gap-4`.
- The all-page sibling card, restructured the same way.
- The systems evidence cards. The arrow was `text-ui text-fg-muted`.
- The about onward cards. The arrow was `text-ui text-fg-dim` and `gap-3` became `gap-4`.
**Considered and excluded:**
- `SiblingLinks.tsx`: `h-control-h rounded-control` chips are controls, not card surfaces.
- The cover's extra-page chips (`detail.pages`, `rounded-control px-4 py-2`): the same reason.
- The chapter page's previous-chapter and back-to-cover links: these are plain text links, not cards, so `arrow_back` is not used anywhere yet. The back link still carries a literal `←` + `rotate`, which belongs to the separate cleanup.
- The contact LinkedIn row: an external `<a>`, not internal, with a literal arrow (`contact/page.tsx:170`).
- The `rounded-control` "Work" links on the results and all pages, and on contact: controls.
- The onward text links on systems and philosophy, the results-table links and "read more": inline text links.
- CTAs on the cover, the chapter end and the 404: buttons.
- `ProjectCard`: an image card, excluded by the brief.
- `components/preview/PreviewIndex.tsx` and `StubPage.tsx`: the internal preview tool, English-only by design, not a visitor surface.
- `CareerTimeline`: has no links.
**Verified:**
- `rm -rf .next/types && npx tsc --noEmit -p .`: exit 0.
- `npx eslint` on all nine source files: exit 0.
- `npx tailwindcss -c tailwind.config.ts -i app/globals.css`: compiles. The output has `.group:hover .group-hover\:text-fg` and `.group:focus-visible .group-focus-visible\:text-fg` (both `color: var(--color-fg)`). `.leading-none` (line 1803) comes after `.text-body-sm` (line 1699), so the arrow's box is the glyph height and `items-center` centres it.
- No ancestor of any of these cards carries a `group` class.
- A grep for `rtl:rotate-180` now finds only inline-text links, buttons, and the external contact row.
**Not verified:**
- Nothing rendered. Nothing answered on `localhost:3000`, and there is no `.env.local` in this checkout, so I could not start the dev server against data. There are no screenshots at 390 or 1440 in either locale and no `querySelectorAll` counts.
- Not measured: the arrow's visual centring against multi-line titles (h2 on the sibling cards), its size relative to each card's text, and whether Geist serves `←` under Meral in `/ar`.
- Not checked whether migration 0065 is applied. Until it is, no arrow renders on any card, including the five that showed a literal arrow before this change. Those cards now show nothing until `arrow_forward` exists in the database.
- Contrast of `text-fg-dim` at rest not measured.
**Open questions:** none.

## 007261026 — 2026-10-26 07:40 — chapter cards on the cover get an inline-end forward arrow (colour only)

**Brief:** make the chapter cards on the case-file cover look clickable. Add an `aria-hidden` forward arrow from `ui_strings.arrow_forward`, on the inline-end side and vertically centred. It goes `text-fg-dim` to `text-fg` on card hover and focus-visible. I first stopped with two questions (the brief's 4px translate against decision 048, and whether 0065 has an AR row). Orchestrator rulings: no translate, because decision 048 stands; 0065 will have both rows (EN →, AR ←) plus `arrow_back`.
**Files:** `components/case-file/LivingMap.tsx` · `app/[locale]/(site)/work/[caseFile]/page.tsx` (passes `arrow={ui.t("arrow_forward")}`).
**Change:** the card `<Link>` (already one link per card, already `hover:bg-surface-raised`) is now `group flex items-center gap-4`. The existing kicker, title and objective are wrapped in a `flex min-w-0 flex-1 flex-col gap-2` span. The arrow is a sibling span: `aria-hidden`, `shrink-0 text-h3 leading-none text-fg-dim transition-colors group-hover:text-fg group-focus-visible:text-fg`. It renders only when `arrow` is truthy, and `t()` returns `undefined` for a missing key. No transform, no rotate or flip, no literal glyph. The flex row mirrors with `dir`, so inline-end needs no physical property.
**Verified:** `rm -rf .next/types && npx tsc --noEmit` exit 0. `npx eslint` on both files exit 0. `npx tailwindcss -i app/globals.css` exit 0, and the output contains `.group:hover .group-hover\:text-fg` and `.group:focus-visible .group-focus-visible\:text-fg` (both `color: var(--color-fg)`), plus `.text-fg-dim`, `.leading-none` and `.shrink-0`. No ancestor of the card carries a `group` class, so the group variants bind to the card alone. `supabase/migrations/0065_seed_wait_quotes.sql` already contains `arrow_forward` on disk.
**Not verified:** nothing rendered. No dev server was on `:3000` and I did not start one, so there are no screenshots at 390 or 1440 in either locale and no `querySelectorAll` count. I did not check whether 0065 is applied to the database. Until it is, no arrow renders, by design. Not measured: the arrow's vertical alignment against a two-line title, the arrow's size against the title's cap height, and whether Geist serves `←` under the Arabic faces in `/ar` (rtl-guard says Meral lacks U+2190 and Geist sits behind it). Contrast of `text-fg-dim` at rest not measured.
**Open questions:** none.
**Separate cleanup, not done here:** literal `→` / `←` in JSX remain in `components/layout/NotFoundView.tsx:103` · `app/[locale]/(site)/systems/page.tsx:233,277` · `work/[caseFile]/[chapter]/page.tsx:539,550,581` · `work/[caseFile]/page.tsx:302,339` · `work/[caseFile]/results/page.tsx:250,268` · `work/[caseFile]/all/page.tsx:354,427,448,461` · `contact/page.tsx:171` · `about/philosophy/page.tsx:184` · `about/page.tsx:183`.

## 006261026 — 2026-10-26 07:05 — Decision 066: cover ⇄ chapter is a horizontal push

**Brief:** build 066. New kinds `push` (cover → its own chapter, `all` or `results`) and `push-back` (the reverse), by path pair, also for browser back/forward, taking precedence over zoom-in/zoom-out for those pairs only. New page slides in from inline-end, opaque, over the old one, which moves ~30% toward inline-start and darkens to ~0.6; push-back is the exact reverse. ~600ms, one ease-in-out curve, new tokens zeroed under reduced motion, normal blend, `--nav-old-shift` honoured. No loader and no quote on either; the hairline stays.
**Files:** `components/motion/NavProgress.tsx` (`push` / `push-back` kinds; `classifyPush(from, to)`; on `popstate` the "from" is the last committed path, since `location` is already the destination; `NO_LOADER` set `{open, push, push-back}` replaces the `!== "open"` check; header comment), `components/motion/MainTransition.tsx` (comment only), `app/globals.css` (tokens `--duration-nav-push: 600ms`, `--ease-nav-push: cubic-bezier(0.65, 0, 0.35, 1)`, `--nav-push-parallax: 30%`, `--nav-push-dim: 0.6`; `--duration-nav-push: 0ms` in the reduced-motion block; four `:root[data-nav="push|push-back"]` rules; keyframes `nav-push-enter`, `nav-push-recede`, `nav-push-exit`, `nav-push-return`), this file.
**Values:** push: new `translateX(calc(var(--nav-axis) * 100%))` → none; old none → `translateX(calc(-1 * var(--nav-axis) * 30%))` + `brightness(1)` → `brightness(0.6)`. push-back: old (chapter) `z-index: 1`, none → `translateX(calc(var(--nav-axis) * 100%))`; new (cover) from `translateX(-axis * 30%)` + `brightness(0.6)` → none + `brightness(1)`. `--nav-axis` is the existing token (1, and -1 under `:root[dir="rtl"]`). Both images in both kinds get `background-color: var(--color-bg)` and `mix-blend-mode: normal`; old images get `opacity: 1` (the base rule hides them). The old image's existing `translate: 0 var(--nav-old-shift)` composes with the animated `transform`.
**Verified:** `rm -rf .next/types && npx tsc --noEmit -p .` exit 0. `npx eslint .` exit 0. `npx tailwindcss -c tailwind.config.ts -i app/globals.css` compiles; output carries both tokens, the 0ms override, the four rules and four keyframes. `classifyPush` run under tsx on nine pairs: cover→chapter, cover→`all` = push; chapter→cover, `results`→cover = push-back; chapter→chapter, gallery→cover, cover→another case's chapter, cross-locale, chapter→gallery = null (fall through to the existing classification).
**Not verified:** nothing was run in a browser — no recording, no screenshot, in either locale, either theme, at any width. Not checked: that the RTL push actually enters from the left; that `z-index` on `::view-transition-old` puts the chapter above the cover in push-back in Chrome/Safari; that the old snapshot of a scrolled chapter lines up (and what shows below it when its shifted bottom ends above the viewport bottom); that a browser back from a scrolled chapter restores the cover at a scroll the new snapshot agrees with; that the loader truly never appears on a slow push; Safari's view-transition support for any of it. One judgement beyond the brief: the brief named the opaque background for the top snapshot; I also gave it to the snapshot underneath, because brightness() on a transparent `<main>` snapshot darkens only the ink and leaves the page background undimmed — 064's recede has the same property and was left untouched.
**Open questions:** none.

---

## 003261026 — 2026-10-26 06:10 — Diagnosis: `getLocale()` in the root layout makes every page dynamic; no code changed

**Brief:** Find why every page answers `private, no-store` / `x-vercel-cache: MISS` despite `revalidate = 300`; prove it with a build route table; fix it if it is in my paths and small, otherwise report.
**Files:** this entry only. No source file changed.
**Cause:** `app/layout.tsx` line 127 (`generateMetadata`) and line 152 (`RootLayout`) call `getLocale()` from `next-intl/server`. The root layout sits above `[locale]`, so `setRequestLocale()` in `app/[locale]/layout.tsx` has not run when it renders; next-intl falls back to `headers()` (`node_modules/next-intl/dist/esm/production/server/react-server/RequestLocale.js`), which opts the whole tree into dynamic rendering. The root layout was added in `334e4ee` (2026-08-23), which is why the pre-063 preview is MISS too.
**Verified:** `next build` in a scratch copy of the tracked tree (not in the repo's `.next`), dummy env, Supabase pointed at a local stub returning `[]`. As committed: every page route `ƒ` (`/[locale]`, about, philosophy, contact, systems, work). Same tree with only the two `getLocale()` calls replaced by a literal `"en"`: all twelve locale pages `●`, `initialRevalidateSeconds: 300` in `prerender-manifest.json`; case-file routes `●`. No other dynamic API in `app/`, `components/`, `lib/` (no `cookies()`, `headers()`, `connection()`, `no-store`; `useSearchParams` is inside Suspense; supabase-js clients read no cookies).
**Not verified:** case-file routes with real params (the stub returns no slugs, so none were prerendered); runtime `cache-control` on Vercel after a fix; whether anything gated on real data reaches a dynamic API. The literal `"en"` was a proof only, not a fix.
**Open questions:** the fix is not small and every option trades against the 404 / `lang`-`dir` work of 2026-08-23. Returned to the orchestrator: (A) next-intl's documented layout, `<html>` moved into `app/[locale]/layout.tsx`, root layout passes children through, `app/not-found.tsx` renders its own document; (B) keep `<html>` in the root layout without `lang`/`dir` in the server HTML, set them on a wrapper in `[locale]/layout.tsx` and on `<html>` before paint. Which one, if either.

### 003261026 (continued) — 2026-10-26 06:30 — Option A implemented: `app/[locale]/layout.tsx` is the root layout, unmatched URLs go to `global-not-found`

**Brief:** Decision A. Move `<html>`/`<body>`, fonts, the theme script and NOINDEX into `app/[locale]/layout.tsx`, with the locale from params. Remove or empty the root layout. Keep the designed 404 for unmatched URLs as a full document with the best available `lang`/`dir`, using `global-not-found`. Keep GA, the 063/065 mounts and DocumentLanguage (remove it if redundant). Prove it with a build.
**Files:** deleted `app/layout.tsx`, `app/not-found.tsx`, `components/layout/DocumentLanguage.tsx`. Added `app/global-not-found.tsx`, `app/[locale]/not-found.tsx`, `app/fonts/index.ts` (the four next/font declarations, unchanged), `components/layout/document.ts` (NOINDEX, viewport, THEME_INIT), `components/layout/NotFoundView.tsx` (the 404 body from the old `app/not-found.tsx`; the reduced header is now optional). Changed `app/[locale]/layout.tsx` and comment lines in `app/robots.ts` and the four `work/[caseFile]/**/page.tsx`. **`next.config.mjs` (devops's file): added one line, `experimental: { globalNotFound: true }`, with a flag comment.** Also appended one section to `docs/learn.md` Part 5.
**Verified:** scratch copy of the working tree, dummy env, Supabase stub on `127.0.0.1:54329` (one published slug `probe`, and a `name` setting). `next build`: every locale page and every case-file route is ●. `/en/work/probe` and `/ar/work/probe` (plus `/all`) were actually prerendered. 16 of 19 manifest routes show `initialRevalidateSeconds: 300`; the other three are `/_global-error`, robots and sitemap. ƒ appears only on `/api/*`, `/llms.txt` (a route handler, ƒ before as well) and `/_not-found` (global-not-found reads headers on purpose; it was ƒ on HEAD too). Building HEAD the same way gives ƒ on every locale page, so the comparison holds. `tsc --noEmit` exit 0, `eslint` exit 0. `next start` on `localhost:3000`: pages `200`, `Cache-Control: s-maxage=300, stale-while-revalidate`, `<html lang="en" dir="ltr">` / `lang="ar" dir="rtl"` on `/en /ar /ar/about /en/work`. Unmatched URLs (`/en|ar/nonexistent-xyz`, `/en|ar/work/east` with dynamicParams=false, `/ar/work/probe/results`) return `404` with the designed view, the reduced header, fonts, theme script, `<title>` from settings and the right `lang`/`dir` in the server HTML. On HEAD, `/ar/work/east` returned `<html id="__next_error__">`, so this is fixed as well. Playwright, Chromium: an `/en` → `/ar/about` → `/en/work` → back client navigation stays in one document with no reload, and `<html lang dir>` matches each step with DocumentLanguage removed, no page errors. That is why it was deleted.
**Not verified:** anything on Vercel: real `cache-control`/`x-vercel-cache`, ISR with real data, real case-file slugs. Anything visual: no screenshots were taken, and the layout and fonts were checked only as markup. `npm run dev` on the repo itself. Bare `/` → `/en` redirect (proxy, unchanged). How the global 404's locale behaves for a URL with no prefix that still 404s after the redirect (it uses the cookie or Accept-Language; not exercised).
**Known residual, not new:** `notFound()` thrown inside a prerendered page (`/en/work/probe`, where the stub has no detail) is served as `<html id="__next_error__">` server HTML. After hydration the designed 404 renders with the right `lang`/`dir` and the SiteHeader. HEAD serves the same shell for the same URL. With real data it is reached only when a published slug's detail fails to load.
**Open questions:** none for frontend. For devops: keep the `next.config.mjs` line. For backend (I did not touch these): stale comments in `lib/content/types.ts:35` and `lib/theme/store.ts:5,21` still name `app/layout.tsx`.

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

**Correction (2026-10-26 05:58, orchestrator's preview recording, `scratchpad/crawl/lv-light/full.mp4`, light, 1280×800, Cervello):**
- *The swell after the hand-over: diagnosed from the video, frame by frame at 25fps (16.5–17.5s).* I measured the picture box per frame (the first and last columns darker than 240 at y=700, and the top edge at x=1000):
  - f011, mid-morph: 61–1218, top 310.
  - f013–f016: 0–1279 (the full viewport), top 235 then 226. The content is enlarged about the picture's centre and covers the h1.
  - f017: 53–1226, top 316.
  - f019 onward: 64–1215, top 323 (the live page).
  So it is not a box that snaps but a swell and a return, and it ends on the live rect. That rules out the fallback copy, which is clipped to the cover wrapper (`relative` + `overflow: hidden`) and cannot reach x=0. It also rules out the overlay after teardown (hidden by the `:has()` rule, then removed).
- *Cause:* the `case-cover` group morph itself. A view transition captures a group's `width`/`height` and its `transform` separately and interpolates each linearly. My layer was card-sized (≈370px wide) and scaled ≈3.1× by its transform. Mid-morph its visual size is (width growing) × (scale shrinking), e.g. 761px × 2.05 ≈ 1560px at t=0.5 against 1152 at both ends. The ease-in-out kept the first frames near the right box, which is why the swell shows late.
- *Fix (`components/motion/lift.ts`):*
  - When the lift's `move` animation finishes, `settleLayer` re-expresses the layer as its real target size plus a plain `translate`, with radius 0, and cancels the scale animation in the same task (same pixels, no frame between). A commit after the lift has settled now captures a layer with no scale, so the group morph is size plus translate only.
  - For a commit mid-flight, `liftTransitionReady` replaces the group's first keyframe with the layer's visual rect (`getBoundingClientRect`: translate, width, height, no scale). The end keyframe stays implicit, which is the cover visual's own rect.
  - `cancelLift` returns a settled layer by scaling it down to the card (`scale(card.w / target.w)`, radius compensated).
- *Double h1:* the old page now fades out in `--duration-nav-open-resolve-out` (new token, 120ms, ease-out, zeroed under reduced motion). The cover still arrives in 300ms and the scrim still lifts in 300ms.
**Verified:** `npx tsc --noEmit -p .` exit 0. `npx eslint components/motion/` exit 0. `npx tailwindcss` compiles and emits the new token.
**Not verified:**
- Not rendered: no browser here.
- The diagnosis is read from the recording's geometry. Whether the swell is gone needs a new recording.
- The mid-flight path depends on `onUpdate` firing after the pseudo-elements exist, and on `setKeyframes` with an implicit end being honoured on the UA's group animation. If either fails, a commit that lands mid-lift still swells, though less than this one did.
- The small offset between morph end and live picture seen in f011 → f019 (≈3px each side, 12px at the top) was measured mid-morph, so it is not established as a fault.
**Open questions:** none new.

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
