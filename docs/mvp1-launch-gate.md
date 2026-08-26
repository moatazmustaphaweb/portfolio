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
| **The privacy claims render nowhere** | 0 occurrences | `privacy_no_ip`, `privacy_no_tracking`, `privacy_location`, `privacy_title` are seeded in both languages and resolved by no component. Checked `/en`, `/en/contact` and `/en/how-this-site-works` on production: zero matches. |
| **The `Achieved` label carries two different claims** | Open | "live in production for 18 months" and "ten people in a usability lab" under one label, and the gallery card shows the label without the evidence line. The LLM read test named this as the one place the metric discipline leaks. Content and design, not purely either. |

---

## 3. Not blocking — small Arabic gaps, far smaller than recorded

Measured off `translations`. **`CLAUDE.md` says 109 of 248 chapter paragraphs are missing
Arabic. That is stale by a wide margin:**

| Field | EN | AR | Missing |
|---|---|---|---|
| chapter paragraphs | 350 | 341 | **9** |
| media `alt` | 126 | 124 | **2** |
| media `caption` | 119 | 117 | **2** |
| `page_section` body | 35 | 29 | **6** |
| `ui_strings` | 100 | 100 | **0** |

**19 strings in total.** Six of the `page_section` gaps are the deliberately unwritten Arabic
chapter closing pointers.

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
