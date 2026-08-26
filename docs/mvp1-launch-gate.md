# MVP-1 — what is left before launch

**Measured 2026-08-26, task `009250826`, against production at `gate.moatazmustapha.com` and
against the database. Nothing here is quoted from another document.**

That matters on this project: `CLAUDE.md` has now had **five** claims rot the same way — true
when written, quoted into a brief afterwards, never re-run. Three were already recorded there.
Two more were found today and are listed at the bottom.

---

## The verdict — MVP-1 IS DONE, 2026-08-26

**Every item on this page is closed, tested, or explicitly deferred with a reason.** Nothing is
outstanding that a visitor would meet.

The site builds, deploys, serves 200 on every route in both locales, and is live on
`gate.moatazmustapha.com` with no login wall in front of it.

**What "done" does not mean**, stated so the word is not read as more than it is: colour
contrast, focus order and screen-reader behaviour have not been exercised, `/api/revalidate`
returns 400, and three pages have no sync write path so future edits to them in Notion will not
appear. None of those blocks a reader today. All three are written down.

---

## 1. CLOSED, 2026-08-26 — the draft pages stay as they are

Moataz: *"هما direct link… مش معمول ليهم listing على الـ work حاليًا، فمفيش فيهم أي مشكلة. سيبهم
زي ما هما."*

They are reachable only by typing the URL: not linked from `/work`, not in the sitemap. **The
routes are unchanged and nothing is owed here.**

⚠️ **My description of these pages was wrong and is corrected.** I reported them as
*"`<h1>east</h1>` over five empty paragraphs"* — a raw slug rendering as a title. They are
nothing of the kind. Each is a deliberate `StubPage`: `SITE MAP · PREVIEW · NOT BUILT YET`, with
an explanation of what a stub is and a table of route, served path, build layer and section. I
counted `<h1>` and `<p>` tags with `curl` and described a page I had never opened.

**What WAS wrong, and he caught it:** the stub copy explained the machinery — it named Notion,
the database, the query behaviour and an environment variable, on pages a visitor can reach.
Rewritten to `Content is not ready yet.` The rule is now in the file header and in
`docs/learn.md` Part 7: **name what the reader is missing, never the machinery behind it.**

---

## 2. Not blocking — visible gaps a reader could notice

**One item was removed from this section on 2026-08-26, and the correction is worth keeping.**
It read *"`egypt-acquisition` has no cover image, 1 of 4 missing."* **False, and my error rather
than the data's.** I queried `cover_media_id` alone. There are **two** cover sources and the
database says which: `cover_kind`. Egypt is `component`, with `cover_component =
'egypt-acquisition'` — a hand-drawn inline SVG bound to the site's tokens, so it follows the
theme in a way a raster cover cannot. A CHECK added in migration 0026 makes the two mutually
exclusive, so a null `cover_media_id` on a `component` cover is the correct state, not a gap.

**All four published case files have a cover.** Moataz: *"غلاف مصر خلصان بس هو مرسوم svg في
الموقع."*

The lesson is the one this file is about: half a question answered confidently reads exactly
like a whole one.

| | State | Note |
|---|---|---|

### `Achieved` — CLOSED, 2026-08-26, decision 060

This section previously argued that `achieved` was *"five different kinds of evidence wearing
one word."* **Wrong, and the error was where I looked.** I read the seven `achieved` rows out of
the database and judged the label as though it appeared alone. It does not.

Measured on production, `/en/work/egypt-acquisition/results` — every row is three adjacent
cells:

```
~15 minutes to complete an application  │ Achieved │ Timed across ten prototype-testing sessions and documented
Half of tested participants began in English … │ Achieved │ Ten prototype-testing sessions
The same language-switching behaviour after go-live │ Achieved │ Reported by the analytics team; not a figure I measured myself
```

**The status says whether. The note says how.** Two fields, two jobs, and the qualification is
never more than one cell from the claim. Moataz: *"المهم إن هي achieved سواء هي internally ولا
validating ولا حاجة. الـ notes هي اللي بتdescribe، فدي ما فيهاش تعارض."*

The gallery card compresses to outcome plus status with no note, because a card has one line and
links straight to the table. Deliberate, not a leak.

**`CLAUDE.md` still carries the old framing** — *"the `Achieved` label carries two different
claims"* — and it is now superseded by decision 060.

---

## 3. Arabic — CLOSED, 2026-08-26, decision 061

This section has now carried **two** wrong numbers, both mine, and the second one is the
instructive failure.

**First wrong:** *"19 strings"*, from comparing 350 English `translations` rows against 341
Arabic. `chapter_paragraphs` has its own `locale` column, so that counts rows, not coverage.

**Second wrong:** *"15 paragraphs missing Arabic, and 6 that exist in Arabic and not in
English"*, from comparing row counts per locale per chapter. **That measures nothing either.**
Moataz: *"إحنا بنعمل الصفحة كلها toute… مش فقرة وفقرة… الخلفية وطريقة السرد مختلفة."*

**Translation is per PAGE.** Two English paragraphs may be one in Arabic; one may become three.
Decision 054 already said the Arabic is an original text rather than a rendering — if the two
languages may explain differently, they may paragraph differently, and a row-count difference is
the expected consequence, not a defect.

**The `+3` in both directions was the answer and I read it as an anomaly.** A gap that runs both
ways is not a gap.

### The correct measure, and the result

*Does the chapter have Arabic at all?* Across all 14 published chapters:

| | |
|---|---|
| Chapters with Arabic | **14 of 14** |
| Chapters with none | **0** |

**The Arabic is complete.** Nothing is owed here before launch.

⚠️ **Do not rebuild the per-paragraph comparison.** It has produced a wrong answer twice — once
as `109 of 248` in `CLAUDE.md`, once as `15 missing` today. The audit asks whether the page is
translated, and stops.

---

## 4. Tested, 2026-08-26

| | |
|---|---|
| **The contact form** | ✅ **Moataz submitted it himself and the message arrived in his inbox.** Stronger evidence than the browser test I had offered, which would have proved the submission and not the delivery. |
| **Accessibility, structural pass** | ✅ **17 routes, 0 findings.** `lang` and `dir` correct on `<html>` in both locales · a non-empty `<title>` on every page · exactly one `<h1>` · every `<img>` carries `alt` · every link and button has an accessible name · the contact fields are labelled · a skip link is present. |
| ⚠️ **Accessibility, what was NOT tested** | **Colour contrast, focus order, and screen-reader behaviour.** These need a real browser and a longer pass than launch day allowed. The structural pass above says the semantics are right; it does not say the experience is. Listed so it is not mistaken for a clean audit. |
| **ISR / `/api/revalidate`** | Still untested, and **it returned 400** when called on 2026-08-26. Nothing depends on it: every route is `server-rendered on demand`, not ISR-cached, so content changes appear immediately without it. Worth fixing, blocks nothing. |

---

## 5. Known and deliberately deferred

| | |
|---|---|
| **The privacy claims render nowhere — AND THEY ARE NOT MVP-1** | Moved here from section 2 on 2026-08-26, at Moataz's correction: *"بالك تكون شغال على حاجة مش موجودة أصلًا في mvp one."* He is right and I had it in the wrong list. The five strings belong to `/how-this-site-works`, whose Notion row carries **`In MVP-1 = NO`** and **`Build Layer 2`**. So this is not an MVP-1 gap and nothing here is owed before launch. Two facts worth keeping anyway: the copy is **not in Notion** — it was written straight into `supabase/migrations/0009_seed_consent_and_privacy_copy.sql`, corrected in `0011`, so there is no Notion link to send — and the route currently answers **200 with nothing on it**, which is a separate and smaller question about a Layer 2 route being reachable early. |
| **Vercel Preview has no environment variables** | Every branch build fails on `NEXT_PUBLIC_SUPABASE_URL is not set`, whatever is on the branch. Deferred to MVP-2 by **decision 059** — in MVP-1 production is the preview. |
| **`scripts/sync-notion.ts` creates media without dimensions** | Migration 0060 backfilled 160 rows, but the next `[cld]` tag written in Notion arrives NULL, so its figure renders unframed whatever its shape. A repair was done; the cause is open. |
| **`notFound()` inside a locale route** | Renders Next's `__next_error__` shell with no `lang`/`dir`. Mitigated by `app/not-found.tsx`. Unmatched URLs are fixed and render the designed 404. |

---

## What is confirmed working on production

Verified today by fetching the live pages, not by reading code.

- **Every route 200 in both locales**, including `/en/how-this-site-works` and `/ar/how-this-site-works` — which `CLAUDE.md` also says 404. **It is wrong about that too.**
- `/en/no-such-page` → **404**, the designed one.
- **The device frames**, live: `cervello/permission-architecture` 11 laptop · `egypt-acquisition/onboarding` 12 laptop · `neobiz-mobile/onboarding` 9 phone.
- **`settings.og_image` is set.** `CLAUDE.md` lists it as missing.
- **The career timeline has 14 roles** in the database and renders on `/en/about`. `CLAUDE.md` says the component was never built because there was nothing to put in it.
- **Custom domain attached and public.** `gate.moatazmustapha.com`, HTTP 200, no deployment protection.
- **All four published case files have a cover** — three `media`, one `component`. See the note in section 2.

---

## The two new stale claims in `CLAUDE.md`

Recorded here rather than fixed in passing, because that file's own rule is that a rotted line
gets replaced with the command that answers it rather than with a fresher number.

1. **"`/how-this-site-works` is Layer 2 and 404s."** It returns 200 in both locales.
2. **"a draft slug like `/en/work/east` … still renders Next's `__next_error__` shell."** It
   renders a real page with the slug as its heading, which is a different and worse defect.

Both were true when written. Neither was re-run before being quoted.
