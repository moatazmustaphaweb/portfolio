# MVP-1 — what is left before launch

**Measured 2026-08-26, task `009250826`, against production at `gate.moatazmustapha.com` and
against the database. Nothing here is quoted from another document.**

That matters on this project: `CLAUDE.md` has now had **five** claims rot the same way — true
when written, quoted into a brief afterwards, never re-run. Three were already recorded there.
Two more were found today and are listed at the bottom.

---

## The verdict

**Nothing below blocks publishing today except item 1**, and item 1 is a switch, not work.

The site builds, deploys, serves 200 on every route in both locales, and is already live on a
custom domain with no login wall in front of it.

---

## 1. Blocking — but it is a decision, not a task

| | |
|---|---|
| **Four draft case files are live and readable** | `/en/work/east`, `/pidetaxi`, `/kshemam`, `/aam-advisor` — and the same four under `/ar`. **Eight URLs.** |

Each returns **200** and renders `<h1>east</h1>` — the raw slug as a title, over five empty
paragraphs. They are **not** linked from `/work` and **not** in the sitemap (30 URLs, none of
them these), so no visitor navigates to one. But they are not `noindex` either, and `robots.txt`
allows everything, so a crawler that finds a URL will index a page whose headline is the word
`east`.

⚠️ **`CLAUDE.md` says these 404. They do not.** That line is now false.

**Three ways to close it, all small:** publish them with real content, return 404 for
`status <> 'published'`, or add `noindex`. **The choice is Moataz's** — it depends on whether the
mini case files are in MVP-1 at all, which is open question B and has never been answered.

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
| **`Achieved` covers five different kinds of evidence** | Open | Read out in full below — it is worse than the one-line version suggested. |

### What `Achieved` is actually doing

Seven targets carry `status = 'achieved'`, and the label is the same on all seven. Their own
notes say they are not the same kind of claim at all:

| Case file | The claim | Its own note |
|---|---|---|
| egypt | ~15 minutes to complete an application | *Timed across ten prototype-testing sessions and documented* |
| egypt | Half of tested participants began in English; nearly all switched to Arabic at the regulatory step | *Ten prototype-testing sessions* |
| egypt | The same language-switching behaviour after go-live | *Reported by the analytics team; **not a figure I measured myself*** |
| neobiz | Full design coverage: every case path in the ownership matrix, both languages | *Verifiable by inspection of **the design files themselves*** |
| neobiz | The dashboard structure, case matrix, and capture model | *Design decisions … **claims about the design itself, not about its performance*** |
| neobiz | Internal walkthrough surfaced no blocking issues | *Stakeholder validation sessions; **internal review, not customer evidence*** |
| neobiz | Patterns adopted by later teams | *Organisational reuse, **reported to me*** |

**Five different things wearing one word:** measured by him in a lab · observed in production by
someone else · verifiable by opening a file · a design decision that explicitly makes no
performance claim · an internal review that is explicitly not customer evidence.

**The notes are honest. The label flattens them, and the gallery card shows the label without
the note** — three cards say `Achieved` on `/en/work` today. So the qualification disappears at
exactly the place a recruiter skims, which is what the read test caught.

**This is a content decision, not a rendering bug**, and the fix is a naming one: either the
status vocabulary grows past three values, or the four neobiz rows move off `achieved` onto
something truthful about design work that has not been measured in production.

---

## 3. Arabic — the gap is 15 paragraphs, and 10 of them are one missing section

⚠️ **This section replaces a wrong count of my own, 2026-08-26.** It said *"19 strings"* from
comparing 350 English `translations` rows against 341 Arabic ones. **That comparison is
meaningless here.** `chapter_paragraphs` has its own `locale` column — an English paragraph and
its Arabic counterpart are **separate rows**, so an `en` row never carries an `ar` translation
and never should. Counting translations counted rows, not coverage. Third time today the same
shape of error: see `docs/learn.md` Part 7.

Measured properly, by comparing row counts per locale per chapter:

| Case file | Chapter | EN | AR | |
|---|---|---|---|---|
| egypt-acquisition | onboarding | 47 | 40 | **−7** |
| egypt-acquisition | workflow | 41 | 35 | **−6** |
| egypt-acquisition | accessibility | 47 | 46 | −1 |
| egypt-acquisition | portal | 30 | 29 | −1 |
| egypt-acquisition | web-vs-mobile-onboarding | 6 | 9 | **+3** |
| neobiz-mobile | portal | 8 | 11 | **+3** |

**15 paragraphs missing Arabic. And six paragraphs where the Arabic says something the English
does not** — which is allowed under the "original, not translated" rule but is worth him
knowing about rather than discovering.

### 10 of the 15 are one slot, absent by content rather than broken by code

`the-interface` is **5 EN / 0 AR in both** `onboarding` and `workflow`. A clean zero in two
places is a structural signature, not a translation that got lost.

**It is not a sync bug.** `lib/sync/chapter-slots.ts` already records the cause in a comment:

> Its Arabic page has no `the-interface` section. That is an absence, not an error.

So this is **content to be written in Notion**, not a fix to be made in code. The remaining five
are ones and twos spread across four slots and need checking individually.

---

## 4. Not blocking — never tested, and still never tested

Listed because "not tested" and "working" have been conflated on this project before.

| | |
|---|---|
| **No accessibility audit** | No axe, no Lighthouse, no keyboard-only walkthrough, no screen-reader pass. Semantics were written carefully and verified structurally; they have never been exercised. |
| **The contact form has never been submitted through a browser** | Four route branches tested with `curl`. The rendered form, its validation, the honeypot in a real DOM and the success state have not been clicked once. |
| **ISR has never been observed working in production** | `/api/revalidate` has never been called against a production build. |

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
