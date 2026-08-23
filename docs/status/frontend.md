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
