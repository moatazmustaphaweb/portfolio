# docs/status.md — Build Status

**Living document.** Updated at the end of each working session. Newest first.
For the queue, see `TASKS.md`; for why anything is the way it is, `docs/decisions.md`.

---

## ROUTE MAP — what is a stub and what is real

*Kept current as pages fill. This is the progress view.*

| Route | State | What is real | What is missing |
|---|---|---|---|
| `/[locale]` | 🟢 **REAL** | Name, tagline, intro, description, one CTA. Minimal footer. Both locales | — |
| `/[locale]/work` | 🟢 **REAL** | 4 published case files, domain filter, NDA markers, outcome line where one exists | Cover images · 3 outcome lines · intro copy |
| `/[locale]/work/[caseFile]` | 🟢 **REAL** | Title, thesis, prominent role statement, **entry handles**, OutcomeStrip with statuses, LivingMap branching on grammar (`<ol>`/`<ul>`), **sibling links**, links to comparison/accessibility pages | Cover images · Cervello's handles (blocked by the route collision) |
| `/[locale]/work/[caseFile]/[chapter]` | 🟢 **REAL** | Objective, context, **decision blocks**, result, prev/next, back to cover and to /work | FeatureStrip · RedactedEvidence · MilestoneClose |
| `/[locale]/work/[caseFile]/all` | 🟢 **REAL** | Thesis, role statement, every chapter with objective/context/decisions/result inline, deep link per chapter, one `h1` | — |
| `/[locale]/work/[caseFile]/results` | 🟢 **REAL** | Every declared target with status and evidence, as a real `<table>`. Egypt 6 rows · Neobiz 5 · Cervello and UAE 404 (no targets) | — |
| `/[locale]/systems` | 🟡 stub | Title, breadcrumb | Prose, link into the Cervello DS chapter |
| `/[locale]/about` | 🟡 stub | Title, breadcrumb | Timeline component, copy |
| `/[locale]/about/philosophy` | 🟡 stub | Title, breadcrumb (3 levels) | Docs-style prose template |
| `/[locale]/contact` | 🟡 stub | Title, breadcrumb | Form, delivery (open question D) |
| `404` | 🟢 **real** | Title, body, CTA, all from `ui_strings` | Locale — see the caveat below |
| `/robots.txt` · `/sitemap.xml` · `/llms.txt` | 🟢 **real** | Generated from the database | — |
| `/api/events` · `/api/revalidate` | 🟢 **real** | Verified against live requests | — |
| `/[locale]/work/[caseFile]/cut/[cut]` | ⚪ not built | — | Layer 3 |
| `/[locale]/door` · `/for/[archetype]` · `/read` · `/studio` | ⚪ not built | — | Layers 2–3 |

**Every stub renders its title and body copy from Supabase.** Rule 1 applies to scaffolding too — a hardcoded heading in a stub survives into the real page because nobody remembers to remove it.

> ⚠️ **404 locale caveat.** A `not-found` boundary receives no route params, so it cannot read the locale from the URL and falls back to English. An Arabic visitor hitting a bad URL currently gets an English 404. Known gap, tracked in `TASKS.md`.

> ✅ **The three `[caseFile]` routes are LIVE** as of the first sync. Clickable now:
> `/en|ar/work/egypt-acquisition` · `/neobiz-mobile` · `/cervello` · `/uae-acquisition`, each with `/[chapter]` and `/all`.
> The four mini case files (`east`, `pidetaxi`, `kshemam`, `aam-advisor`) are drafts with no content and correctly 404.

---

## 2026-08-12 — MVP-1 scoping, two bugs of mine, Linear View and Results Table

### Scope: checks now report on MVP-1 only (decision 040)

The Cervello "route collision" was **not a content problem**. One claimant is an MVP-1 cover with content Done; the other is a Layer 3 row parked with nothing in it. A row deliberately excluded from this release was aborting a row that ships in it, plus its seven chapters, and the report read as a real fault.

`findRouteCollisions` now takes `inMvp` per claim and ignores parked rows; notices route through a gate keyed on row title. `--all` still widens what is **synced** — it no longer widens what is **reported**. Failures are deliberately not gated: a parked row that is actually being written and breaks is still a broken write.

Trade-off, stated rather than buried: two parked rows colliding with each other go unreported. Intended — it becomes visible the moment either joins MVP-1.

### Absence is content, not a gap (decision 041)

Dropped the notices for missing entry handles, missing siblings, and — where the cover states its position — missing outcome tables. **Neobiz's absent results table is deliberate**: designed and internally validated, not built, so it makes design claims only and any completion-time or conversion figure belongs to the Egypt web case file. Cervello's `Status, honestly` does the same job.

The surviving check is narrower and better: report only where there is **neither a table nor a statement about its absence** — a silence that could equally mean the table sits under an unrecognised heading. Notices went 12 → 7, and every remaining one is actionable.

### ⚠️ Two bugs of mine, both found by your corrections

**1. Siblings — I scanned one heading, not the cover.** I reported that Notion doesn't declare an Egypt→Neobiz sibling. It does. My Pass 4 only read lines under the `Three ways in` heading, which is where UAE happens to put its declaration; Egypt and Neobiz put theirs elsewhere on the page. A parser looking in one place and staying silent about the places it didn't look — the exact failure shape this project keeps catching, and I shipped it. Siblings are now scanned across the whole cover body, deduped by target.

All four links are live and match what you described:

| Cover | Siblings |
|---|---|
| `uae-acquisition` | `egypt-acquisition`, `neobiz-mobile` |
| `egypt-acquisition` | `neobiz-mobile` |
| `neobiz-mobile` | `egypt-acquisition` |

**2. The Cervello collision was the check's fault, not Notion's.** Covered above. With it fixed, Cervello syncs: **3 entry handles, all 3 linked** (`Chapter 1/2/3` resolve positionally), plus its 3 chapters.

### UAE's outcomes landed

Your `[achieved]` markers synced. UAE now has **4 outcomes**, so its gallery card carries an outcome line and its cover shows the strip. Sync is **exit 0, zero failures.**

| Cover | Handles | Linked | Siblings | Outcomes | Targets |
|---|---|---|---|---|---|
| `cervello` | 3 | 3 | 0 | 0 | 0 |
| `uae-acquisition` | 3 | 0 | 2 | **4** | 0 |
| `egypt-acquisition` | 3 | 2 | 1 | 3 | 6 |
| `neobiz-mobile` | 3 | 3 | 1 | 0 | 5 |

### Linear View — `/[locale]/work/[caseFile]/all` 🟢 REAL

The whole case file on one page: thesis, role statement, then every chapter with objective, context, decision blocks and result inline, each keeping a deep link to its own page.

`listChapterBodies` fetches all of it in two queries plus two translation resolves, rather than calling `getChapter` in a loop — that would have been seven round trips for Egypt, re-resolving the same case file each time. `kind = 'chapter'` only, enforced in the query so the next surface inherits it: comparisons and the accessibility page are reachable from the cover but are not the sequence.

One `h1` per page, chapters as `h2`. A linear view with eight `h1`s reads as eight documents to a screen reader. Verified: Egypt renders 1 `h1`, 4 chapters, 8 decision blocks.

### Results Table — `/[locale]/work/[caseFile]/results` 🟢 REAL

The manifesto's fourth commitment, on a page: every declared target closed, with its evidence. A real `<table>` with `scope` attributes — this is tabular data, and a stack of divs would look identical and navigate far worse.

**No red** (decision 042). Six of the eleven target rows are `not-measurable` because a controlled release has no commercial launch to measure against; styling those like failures would misreport the work in the direction of self-criticism, which is no more honest than the flattering direction. The label carries the state; styling only sets emphasis.

Egypt 200 (6 rows) · Neobiz 200 (5 rows) · Cervello 404 · UAE 404 — the last two declare no targets, and `generateStaticParams` covers only case files that have them, so the build doesn't prerender pages its own guard 404s.

Arabic verified: `dir="rtl"`, `جدول النتائج`, `الحالة`, `محقَّق`.

> ⚠️ Three Arabic UI strings are mine, rendered from English rather than authored: `results_table`, `status_label`, plus the two from the previous entry. In `TASKS.md`.

---

## 2026-08-12 — the Case File Cover, finished

The covers were **not stubs** — title, thesis, role statement, living map and outcome strip have been rendering since the cover shipped. What was genuinely missing was the two blocks that had nowhere in the schema to land: entry handles and sibling links. Both exist now, end to end.

### Migrations 0017–0019

`entry_handles` and `case_file_siblings`, plus two `entity_type` values and two UI strings. Handle text lives in `translations` (`invitation`, `payoff`) and **not** in the row — `outcomes` keeps copy in `outcomes.value` *and* accepts a `label` translation, the two drifted into holding the same string, and Egypt's outcome rendered twice on the cover. A table whose text has one home cannot develop that fault.

### What each cover now carries

| Cover | Handles | Linked | Siblings | Living map |
|---|---|---|---|---|
| `uae-acquisition` | 3 | **0** | 2 | `<ol>` — ordered |
| `egypt-acquisition` | 3 | 2 | **0** | `<ol>` — ordered |
| `neobiz-mobile` | 3 | 3 | 0 | `<ol>` — ordered |
| `cervello` | **0** | — | 0 | `<ul>` — unordered |

### The two zeroes are correct

> ⚠️ **Superseded in part by the entry below.** Egypt's and Cervello's zeroes were both my bugs and are fixed; the table above is the state at the time of that session. Corrected figures are in the next entry.

- **UAE, 0 linked.** Its three handles name no chapter — they name a decision, a misreading, and a set of lost arguments. Decision 038: a pointer that names no chapter renders as text rather than being guessed at a destination. Egypt's `Results table → What broke.` is the same case; it names a results table, which is not a chapter.
- **Egypt, 0 siblings.** ~~Notion does not declare one.~~ **Wrong — my parser only looked under one heading.** See the next entry.
- **Cervello, 0 handles.** ~~Blocked by a route collision needing a Notion fix.~~ **The collision itself was the bug** — one of the two claimants is a parked Layer 3 row. See decision 040.

### The living map now branches where it counts

It always read `grammar`; it now also chooses its element from it. `country-culture` renders `<ol>`, `ecosystem` renders `<ul>` — a screen reader announces an ordered list as a sequence, and for a platform with things orbiting it that would assert a first and a last the work does not have. Numbering was already grammar-aware. Presentation stays plain per decision 023; the data shape is right for Phase 2.

### Cervello's cover still says plainly that it has no numbers

Unchanged and verified: no outcome strip, `Status, honestly` rendering as the reflection. The cover states the absence in its own words.

### ⚠️ Arabic I wrote, needing review

`entry_handles_heading` → `ثلاث طرق للدخول` and `sibling_case_files` → `ملفات شقيقة`. Both are **rendered from the English**, which is the thing the review file exists to catch. Logged in `docs/ui-strings-review.md`. The Arabic handle *content* is paired by position and skipped outright when the counts disagree.

### Confirming the outcomes question: it landed, and it changed nothing yet

The widened parser works — it finds UAE's table under the `Results` heading. **UAE still has no outcome line**, for a different reason: all four rows are rejected for missing a status marker, exactly as decision 007 requires.

```
✗ Case File Cover — UAE Acquisition → outcomes: 4 row(s) need a status marker
    - "Live in production for over a year and a half"
    - "~10 minutes to complete an application"
    - "Under one business day to open the account, sometimes same day"
    - "Thousands of new business accounts via the digital journey"
```

Neobiz has no results table at all; Cervello correctly has none. So of the three you asked about, one is blocked on four markers, one on a missing table, and one is right as it stands.

---

## 2026-08-12 — navigability, footer, the staleness, and `npm run fresh`

Three fixes before any new pages, since you can't judge what you can't see — plus the `fresh` script.

> **To review content: `npm run fresh`.** One command, browser opens itself. If a dev server is already running it will tell you the pid rather than break it.

### 1 ✅ Footer — it was rendering *inside* `<main>`

Root cause, not a styling tweak. The root locale layout wrapped `{children}` in `<main>`, and the `(site)` layout's footer was one of those children — so the footer sat inside `<main>`, which is both wrong semantically and why it landed directly after the content.

`<main>` now lives in the route-group layouts, making the footer its sibling. `<body>` is a `min-h-screen` flex column and `<main>` is `flex-1`, so the footer pins to the bottom of the viewport on short pages and sits after the content on long ones. Verified on Landing, `/work`, and a cover.

### 2 ✅ The site is navigable end to end

**The gallery cards were rendering and linking correctly all along** — I checked the HTML and found four correct anchors. What you were looking at was a stale production build serving the *old stub* version of `/work`, which genuinely had no cards. Issues 2 and 3 were one problem.

What was genuinely missing was onward navigation from chapters, so I built the Chapter page rather than leaving it a stub. Crawled it as a visitor, following only links:

```
Landing → /en/work ✓
/en/work → 4 clickable cards ✓
4 covers + 17 onward pages, every one with a way back
```

| Cover | Onward | Back to /work |
|---|---|---|
| cervello | 4 | ✓ |
| egypt-acquisition | 8 | ✓ |
| neobiz-mobile | 3 | ✓ |
| uae-acquisition | 2 | ✓ |

Every chapter links to its cover, to `/work`, and to its neighbours. Prev/next are resolved in the query layer, not the page, so a chapter cannot render without them — "no dead ends" is a non-negotiable and shouldn't depend on a page remembering.

Prev/next skip comparison and accessibility pages: they are reachable from the cover but are not part of the sequence (amendment 033), so they must never appear as "next chapter".

### 3 ✅ Staleness — the cause was the production build, not a cache bug

`next dev` was never the problem. Tested against the running dev server: changed the tagline directly in Supabase and **the change appeared in under one second**, then restored cleanly.

The staleness comes from `npm start`. Routes built with `generateStaticParams` and no `revalidate` are baked at build time and never regenerate — which is exactly "even a private window serves the old page".

Fixed properly: **every content route now exports `revalidate = 300`** (decision 009, and the outstanding 0.5 item). A change appears within five minutes on its own, or instantly via `/api/revalidate` on publish.

**For content review, use `npm run dev`.** Changes show on refresh with no window at all.

> One wrinkle worth knowing: `revalidate` must be a **literal**. My first attempt imported a shared constant and the build failed with *"Invalid segment configuration export"*. `lib/content/revalidate.ts` documents the value; each route states it inline.

### 4 ✅ `npm run fresh`

```
npm run fresh
```

Clears `.next`, starts the dev server, waits until it is genuinely ready, then opens `http://localhost:3000/en` in your browser. `PORT=3200 npm run fresh` to use another port. `Ctrl-C` stops it.

It is `scripts/dev-fresh.mjs` rather than a one-line npm command because three things need to happen in the right order, and each of them bit during this session:

- **`.next` must be cleared before the server starts, never during.** See below.
- **Next allows one dev server per *directory*, not per port.** A second one is refused with a message that scrolls past easily, so the script checks first and says so plainly.
- **The browser should open when the server is ready**, not after a guessed delay.

### ⚠️ I was a cause of issue 3, and I reproduced it while fixing it

My verification runs used `rm -rf .next && npm run build` in this same directory **while your dev server was running**. Deleting `.next` under a live dev server produces exactly the symptoms you reported: stale or broken pages that survive a refresh and a private window. Some of what you were seeing was me.

Then the first version of the `fresh` script made the same mistake in a more durable form. Its guard checked whether the *port* was in use; I ran it on port 3200 expecting a clean start, and it deleted `.next` out from under your server on :3000 before Next refused to start. The port was the wrong question.

Fixed: the script reads Next's own `.next/dev/lock` — `{"pid":…,"port":…}` — and tests that the pid is alive with signal 0 before touching anything. A stale lock from a crashed server is ignored rather than becoming a permanent block. Verified: the guard fires, names the pid, and leaves `.next` intact.

### Re-verified: `revalidate = 300` does not reintroduce the staleness

Worth stating because the order of work made the earlier test invalid. I confirmed dev freshness *before* adding `revalidate = 300` to every route, so that result no longer covered the shipped code — an ISR window could in principle have caused the very thing it was meant to fix.

Re-tested against live code: changed the `tagline` translation directly in Supabase, refreshed immediately and again two seconds later — both showed the new value; restored the original by row id and confirmed the Arabic was untouched. **Dev mode ignores the ISR window.** The window applies to production builds only, which is where the staleness came from.

### A verification habit I had wrong — twice

I had been checking builds with `grep -c error` on the output. The failure above says *"Invalid segment configuration export detected"* — no word "error" — so my check reported a clean build for one that had exited 1. Now checking exit codes.

Two more of the same shape this session, both caught before they misled anything:

- `grep -c 'href="/en/work/…"'` counts *lines*, and the HTML is one line — so four links reported as "1". Count matches (`grep -o | sort -u`), not lines.
- `${PIPESTATUS[0]}` is a bash-ism and this shell is **zsh** (`$pipestatus`, 1-indexed). It expanded to empty, so `tsc exit:` printed a blank that reads as success. Re-run without the pipe: exit 0, genuinely clean.

---

## 2026-08-12 — Case File Cover shipped; outcomes parser widened

### The parser was the gap — you were right

`Results` / `النتائج` now parse as `Outcomes` on a cover. The Arabic already worked (`النتائج` was folded to `outcomes` by the heading synonyms); it was only English `## Results` that missed.

**But two of the three covers you named have no results table at all.** Correcting that plainly:

| Cover | What is actually there |
|---|---|
| **UAE** | A `Results` table, 4 rows — found, and **all four rejected for missing markers** |
| **Neobiz** | No results table. Headings are `Thesis` · `What it is` · `Status, honestly` · `Why it matters anyway` · `Three ways in` |
| **Cervello** | No results table — correct and deliberate, this is the "no numbers" cover |

The Neobiz *Results Table page* has 5 targets and synced long ago; I think that is what you were remembering.

The `Claim / Basis` shape parses fine — column names are never read, only position.

### The four UAE rows, all at once

I changed the failure behaviour first. It aborted on the *first* bad row, which would have made this a fix-resync-fix loop. It now collects every bad row and reports them together:

```
✗ Case File Cover — UAE Acquisition → outcomes: 4 row(s) need a status marker:
    - Live in production for over a year and a half
    - ~10 minutes to complete an application
    - Under one business day to open the account, sometimes same day
    - Thousands of new business accounts via the digital journey
```

No status inferred. Add the markers and the four outcomes appear on the cover and the first one on the gallery card.

### A silence closed

A cover with no outcomes previously passed without a word — the same silent-gap pattern as before. It now emits a notice saying the card will show no outcome line, and whether that is legitimate.

### Two headings mapped

- `My role` → `role`. Covers are written that way, not as `Role`, so **no cover had a role statement at all** until now.
- `Status, honestly` → `reflection`. This is where Cervello states plainly that it has no numbers. Unmapped, it simply vanished — a cover that has chosen an honest absence showed nothing, which reads as an oversight rather than the deliberate position it is.

Cervello's cover now reads: *"And I have no numbers for it… I'd rather name the limit than manufacture a result."*

### The cover

Order is deliberate: title → thesis → **role statement** → outcomes → reflection → map.

The role statement sits at `text-statement` size in its own block with a rule down its side, not in a caption. UAE's reads *"Sole designer on the mobile product, end to end."* — the single most load-bearing sentence on the page, typeset accordingly.

**LivingMap branches on grammar**, plain list in all three cases per decision 023, but the shape is already right:

| Grammar | Rendering | Why |
|---|---|---|
| `country-culture` | Numbered `Chapter 01…04` | A journey through a market — sequence carries meaning |
| `ecosystem` | Unnumbered | A platform and what orbits it — numbering would assert an order the work does not have |
| `design-system` | Ordered, unnumbered | A documentation tree has hierarchy, not a path |

Verified: Egypt renders numbered, Cervello unnumbered. Phase 2 replaces the presentation, not the model.

The outcome strip shows every figure with its status **and its note** — how it is known is what makes the marker defensible.

### Not built — no data for them

- **Entry handles.** The `Three ways in` heading exists on every cover but maps to no field. It is three named links into specific chapters, which needs either a new field or a parse of the list.
- **Sibling links.** Egypt→Neobiz, UAE→both. There is no sibling relation in the schema; it would need a self-referencing table or a translation field.

Both are listed in `TASKS.md`. Neither blocks the page.

---

## 2026-08-12 — Classic Gallery shipped

Four published case files, domain filter, both locales. Drafts verified absent.

### Two data problems fixed first — the page would have been useless otherwise

**`domain` was `"work"` for every case file.** The sync was writing Notion's `Section` into it, so the domain filter had exactly one option. Set to the real domains from `docs/brief.md` — banking for Egypt/Neobiz/UAE, smart-things for Cervello — and **the sync no longer touches `domain`, `grammar` or `nda` at all**. Those three are structural and editorial, they are not in Notion, and an upsert including them reset all three on every run. Existing rows now have only `status` updated; a genuinely new case file gets placeholders *and a notice*, because a placeholder nobody is told about is a placeholder that ships.

**`grammar` was hardcoded `ecosystem` for all four.** Set properly — Egypt's own Notion note says *"country-culture (journey through a market)"*, Neobiz and UAE are the same journey in other forms, Cervello is a platform. This matters for the LivingMap in Phase 1 #3, not for the gallery, but it was wrong and the fix belonged with the same change.

### ⚠️ The NDA contrast cannot be seen yet — there are no images

Your point 1 is the feature of this page, and it is **not visible**, because `media` has **zero rows**. No cover has been uploaded, so there is nothing to desaturate.

The machinery is right and verified — `media.nda` travels from the case file, `CloudinaryImage` applies `e_grayscale`, the grid deliberately applies no shared filter or hover-saturate that would flatten it. The moment covers exist, three cards go grey against Cervello's colour.

Until then the contrast survives **in text**: every NDA card carries an `Under NDA` marker. That was always required rather than optional — a desaturated thumbnail signals by colour alone, which the accessibility baseline forbids and which disappears on a greyscale display. The badge is the half that always works.

**To make it visible:** upload one cover per case file to Cloudinary and set `case_files.cover_media_id`. Nothing else is needed.

### ⚠️ Three of four cards have no outcome line

Your point 2 — evaluators scan for impact first — and only **Egypt** currently satisfies it:

| Card | Outcome line |
|---|---|
| Egypt Acquisition | *~15 minutes to complete an application* · **Achieved** |
| UAE Acquisition | — |
| Neobiz Mobile | — |
| Cervello Cloud | — |

`outcomes` has three rows and all three belong to Egypt. Neobiz has five *targets* but no outcomes; UAE and Cervello have neither.

I did not substitute the thesis. It is a paragraph, it would not read as an outcome, and quietly promoting prose into an impact slot is the kind of thing the metric rules exist to stop.

**What needs writing:** an `Outcomes` table on the UAE, Neobiz and Cervello covers in Notion, same shape as Egypt's — claim with a `[marker]` in column 1, source in column 2. The sync already reads it and the card already renders it.

The status marker is rendered beside the figure and is not optional. A card is the most-screenshotted surface on the site, and a number without its `Projected` / `Achieved` label is exactly the misrepresentation decision 007 exists to prevent.

### One bug caught in review

Egypt's outcome rendered **twice**, separated by an em dash. The sync writes the same string into `outcomes.value` and into the `label` translation, and the card was printing both. Now it prints the translated label, falling back to the raw value.

### Not seeded, on purpose

`gallery_intro` is copy. The page renders correctly without it and gains it the moment a translation row exists — no code change needed.

---

## 2026-08-12 — Landing page shipped. First real page.

### The three strings are seeded and live

`tagline`, `intro`, `description` — position, intent, domain — in both locales. Three of the launch-gate blockers close; `cv_url` and `og_image` remain yours.

The migration carries a warning in its header that **the Arabic is written, not translated**, and that a future pass aligning it to the English would destroy both sides. That note belongs in the file someone will actually open when they "tidy up the translations".

### Landing

Renders name → tagline → intro → description → one call to action. Nothing else. Verified in both locales, `dir="rtl"` on Arabic, all three Arabic strings rendering as written.

**The minimal footer is structural, not a flag.** Landing sits in a `(landing)` route group; every other page sits in `(site)`, whose layout supplies the full footer. Which group a page is in decides its footer — there is no `variant` prop for a future page to forget to pass, which is the same reasoning as stamping `nda` onto media in the content layer rather than passing it around.

| Page | Footer |
|---|---|
| `/en` | email · LinkedIn · language switch |
| `/en/work` | nav · email · LinkedIn · wordmark |

The CV link is absent from both because `cv_url` is NULL — the fallback working, not a gap in the page.

### JSON-LD and metadata — wired, and changed

`description` now populates the Person JSON-LD in both locales, which was omitted entirely while `tagline` was NULL.

I also switched the `<meta name="description">` and OG description from `tagline` to `description`, which was not asked for. Reasoning: that string is the search-result snippet and the link-preview subtitle. *"Ten years designing regulated banking, IoT platforms, and the systems in between"* tells a recruiter what this is; *"Simple, where it's hard."* states a position that only means something once you already know who wrote it. The tagline still leads the page itself, where it has the name above it for context. Say the word if you'd rather the tagline led everywhere.

### Arabic wrapping

The Arabic `description` is 60 characters to the English 81, but renders wider per character. It is capped at `--measure-lead` (42ch) with `text-wrap: pretty`, and carries no fixed width, so at 320px it wraps to three or four lines inside the gutter rather than overflowing. No horizontal scroll.

---

## 2026-08-12 — NDA treatment: grayscale. Premise corrected.

The Mashreq screens are **design files with dummy data**, not production screenshots. Decision 027 was protecting a secret that does not exist.

### What changed

**Amendment 036 supersedes 027.** NDA work renders **full grayscale** via a live Cloudinary transform. Non-NDA renders in colour. Legibility is untouched — this is a precautionary signal, not concealment.

I marked 027 and 028 with a warning at the top rather than rewriting them, so a reader hits the correction first but can still see the superseded reasoning and why it no longer holds. A constraint deleted without its history gets reinstated by the next person who rediscovers the original argument.

**Driven by `case_files.nda` — your instinct was right.** The NDA belongs to the client relationship, not to individual files. One flag per case file (Egypt, Neobiz, UAE true; Cervello false) rather than a flag on every image someone must remember to set.

I went one step further than the question asked: **the flag is stamped onto each `Media` object by the content layer**, so it is not a component prop at all. A treatment that depends on a call site passing a flag correctly is a treatment that will eventually be missed on one page. Now the only way to render an NDA image without the treatment is to bypass `CloudinaryImage`, which rule 3 already forbids.

### ⚠️ One thing I could not build as described

**"Grayscale with the accent blue preserved" inside the image is not possible.** Cloudinary has no selective-hue effect — nothing desaturates every colour except one. I verified the alternatives against your account:

| Transform | What it actually does |
|---|---|
| `e_grayscale` | Full grayscale. **Chosen.** |
| `e_saturation:-70` | Mutes *every* colour uniformly — does not keep blue, just makes everything faint |
| `e_grayscale/e_colorize:40,co_rgb:0070f3` | Duotone: tints the **whole** image blue, costing legibility on a UI screenshot |

So: full grayscale on the image, and the accent preserved in the **frame** — badge and border — which is where a signal belongs and where it survives a greyscale display. Duotone is a one-line change in `lib/media/presets.ts` if you want blue in the pixels.

An unexpected benefit: the grayscale variants are **less than half the byte size** (47KB vs 101KB on the test asset).

### Guards kept — amendment 037, on new grounds

Never cropped, never a cover, never the OG image. Their original justification is gone with the premise, so I wrote down new ones rather than leaving them as cargo cult:

- **Never cropped** — a design screen cropped off-centre loses the composition, which is the subject of the case study.
- **Never a cover or OG** — those travel into link previews outside our control, where the badge is stripped and the context is gone.

`media.redacted` and `case_files.nda` now do genuinely different jobs: `nda` drives the treatment for a whole case file, `redacted` marks an individual asset as never-cropped/cover/OG. That split matters — it means **an NDA case file can still have a cover**, rendered grayscale, which is exactly the gallery contrast the treatment exists for. Tying the cover ban to `nda` would have left Egypt, Neobiz and UAE unable to have covers at all.

### Verified

`e_grayscale/c_limit,w_1200/…` and `e_grayscale/c_fill,w_640,h_400,g_auto/…` both return 200 from your account; non-NDA media renders with no transform. Open question H is closed.

---

## 2026-08-12 — four amendments applied, all synced

Logged as decisions **032–035**. `docs/architecture.md` and `docs/schema.md` amended so the docs match the code.

### 1 ✅ Decisions — 20 written, ordered, both locales

`decisions` table built as proposed, mirroring `features`. Names and bodies in `translations` under `entity_type='decision'`.

| Chapter | Decisions |
|---|---|
| egypt-acquisition/onboarding · workflow · portal · fulfilment | 1 · 1 · 3 · 3 |
| neobiz-mobile/onboarding · portal | 3 · 1 |
| uae-acquisition/onboarding | 3 |
| cervello/on-premises-to-cloud · permission-architecture · method | 2 · 3 · **0** |

Arabic paired on all but one. **`egypt-acquisition/workflow` skipped its Arabic and reported it** — 1 decision in English, 3 in Arabic, and pairing by position across different counts would attach the wrong Arabic to the wrong decision. Whenever you want that resolved, either the English splits into three or the Arabic merges into one; the sync will pick it up.

### 2 ✅ Three pages that were invisible — now live

Stored as chapters with a `kind` (amendment 033) rather than forced into the sequence or given a parallel table. Everything about them *is* a chapter — same parent, slug uniqueness, route shape, status, translations — and exactly one thing differs: they are not part of the narrative.

Live now, both locales:
`/work/egypt-acquisition/web-vs-mobile-onboarding` · `/web-vs-mobile-portal` · `/accessibility`

Verified excluded from the linear view, which still reads `01 Onboarding · 02 Workflow · 03 Portal · 04 Fulfilment`. The query layer returns them as a separate `pages` array so a cover can link them without them entering the sequence.

### 3 ✅ `cervello/method` publishes with zero decisions

Rule 3 amended (decision 034): the check now tests for a **decided** decision set, not a non-empty one. Your reasoning is recorded verbatim in `decisions.md` and in both docs — a decision resolves a specific problem, a principle is a standing rule governing many, and relabelling one as the other to satisfy a parser would corrupt content to fit a tool.

Logged as an amendment to a non-negotiable so it reads as a considered exception rather than the rule quietly weakening.

### 4 ✅ Retention — 360 days

`prune_analytics()` updated, cron active at 03:15 UTC daily, aggregate-then-prune order preserved. Aggregates still carry no session id and no city.

### Applying the standing rule

Two things I decided rather than asking:

- **The `chapters.kind` shape** for the standalone pages. A parallel table would have duplicated the whole structure to express one difference and forced every query to be written twice.
- **Left `chapter.decision` in place, unused.** Dropping it would break nothing today but would silently discard any content still written against that field.

### Still short

- **`features` = 0.** The parser works; no chapter has a `Features` heading. Needs the content written or the contract changed — flagged in `TASKS.md`, not blocking.
- **`uae-acquisition` has no Arabic cover title.** Its Arabic child page has no H1 and its page title yields nothing usable. Falls back to English, which is decision 013 working.

---

## 2026-08-12 — order, Arabic titles, features, decisions parsed

### ✅ Chapter order — fixed

`Order` is read into `sort_order` and is the only source consulted; H1 chapter numbers and route names are ignored as you specified. Linear views now render:

`01 Onboarding Journey · 02 Application Workflow · 03 Customer Portal & Notifications · 04 Fulfilment & AOF`

### ✅ Arabic titles — resolving, no longer falling back

All 10 chapters and 3 of 4 covers now carry Arabic titles. `/ar/work/egypt-acquisition` reads **الاستحواذ في الخدمات المصرفية للشركات — مصر**.

The parser prefers an H1 in the content and falls back to the Notion page title with its scaffolding stripped (`النسخة العربية — الفصل الأول: X` → `X`).

Two things to look at:

- **`uae-acquisition` still has no Arabic cover title.** Its Arabic page's first heading is `الإمارات / نيوبيز موبايل — فتح حساب الشركات`, which lands on the chapter, not the cover — the cover's Arabic child has no H1 and its page title yields nothing usable.
- **Arabic chapter titles carry their chapter-number prefix**, English ones do not: `الفصل الثاني · نظام مراجعة الطلبات (Application Workflow)` versus `Application Workflow`. Faithful to what is written, but it renders as a longer, noisier line in the Arabic linear view. Your call whether the H1s should drop the prefix.

### ⚠️ Features — implemented, and it finds nothing

The parser is in and behaves correctly. **No chapter has a `Features` heading**, so it produces 0 rows everywhere.

I could have left it silent. Reporting it instead: the contract specifies feature strips as "scope proof, one line each", and right now that content does not exist in Notion under any heading the contract names. The nearest thing is Cervello's *"The Feature Catalogue"*, which is a section about a catalogue rather than a list of features. Either the content needs a `Features` list, or the contract should stop promising one.

### ✅ Decisions — parsed. 20 across 9 chapters.

| Chapter | EN | AR |
|---|---|---|
| egypt-acquisition/onboarding | 1 | 1 |
| egypt-acquisition/workflow | 1 | **3** ⚠️ |
| egypt-acquisition/portal | 3 | 3 |
| egypt-acquisition/fulfilment | 3 | 3 |
| neobiz-mobile/onboarding | 3 | 3 |
| neobiz-mobile/portal | 1 | 1 |
| uae-acquisition/onboarding | 3 | 3 |
| cervello/on-premises-to-cloud | 2 | 2 |
| cervello/permission-architecture | 3 | 3 |
| cervello/method | 0 | 0 |

**`egypt-acquisition/workflow` has 1 decision in English and 3 in Arabic.** The Arabic splits into ضمّ الأنظمة المنفصلة / جعل الاستثناء كيانًا له دورة حياة / إظهار مخارج القرار الخمسة, where the English combines them into *"Fold the separate systems in, and give the exception a life"*. Not a parser artefact — the two languages genuinely say different things. Pairing them by position would attach the wrong Arabic to the wrong decision.

**`cervello/method` has none at all.** Its sections are "Why this chapter exists", "Four principles, written down", and so on. Under rule 3 that chapter cannot publish.

### 🔴 SCHEMA PROPOSAL — needs your approval before I write decisions

Decisions are **parsed but not written**. A `translations` row is unique on `(entity_type, entity_id, locale, field)`, so `field='decision'` can hold exactly one value per chapter per locale. Three decisions cannot fit.

**Proposed — a `decisions` table, mirroring `features` exactly:**

```sql
alter type entity_type add value 'decision';

create table decisions (
  id          uuid primary key default gen_random_uuid(),
  chapter_id  uuid not null references chapters(id) on delete cascade,
  sort_order  int not null default 0
);
create index on decisions (chapter_id, sort_order);
```

Strings go to `translations` with `entity_type='decision'` and fields `name` and `body` — structure in typed tables, every human-readable string in `translations`, exactly the rule the architecture already follows.

Why this shape:

- **It is the `features` pattern.** No new concept, and `DecisionBlock` renders a list the same way `FeatureStrip` does.
- **Ordered.** `sort_order` preserves the sequence the chapter argues in, which is the whole point of a decision block.
- **The name is content, not a label.** It goes in `translations`, so it is translatable and can differ between languages — which the workflow chapter proves is necessary.
- **It does not disturb the existing `decision` field.** That field stays valid for chapters with a single decision, so nothing already synced breaks.

The alternative — numbered fields `decision_1`, `decision_2` — is unbounded, unordered, and cannot express a name. I would not recommend it.

**Rule 3 consequence worth naming:** once decisions are stored, the publish check becomes checkable for the first time. Right now no chapter has a `decision` field, so strictly none should be published. With this table, 9 of 10 chapters have decisions and `cervello/method` is the one genuine gap.

### ✅ Contradiction check — built

`findStatusContradictions` compares every claim across every page on normalised text and reports any claim asserted with two different statuses. It runs on each sync and fails the run rather than writing. **It reports nothing now** — your fix cleared the last one. It exists so that failure cannot survive review again by being on a page nobody happened to be looking at.

---

## 2026-08-12 — FIRST REAL SYNC. Content is in the database.

Dry run came back clean — exit 0, zero failures, Cervello notice only — and the sync ran. **But it took three runs**, because the first two exposed bugs that the dry run could not see.

### What landed

| Table | Rows |
|---|---|
| `case_files` | 8 (4 published, 4 draft mini case files) |
| `chapters` | 10 |
| `outcomes` | 3 |
| `targets` | 11 |
| `translations` | 230 |
| `features` · `media` | 0 |

**Every marker survived the trip.** Statuses in Supabase are identical to Notion, in both locales:

| Case file | Outcomes | Targets |
|---|---|---|
| egypt-acquisition | `achieved` `projected` `projected` | `achieved` `not-measurable` `achieved` `achieved` `not-measurable` `not-measurable` |
| neobiz-mobile | — | `achieved` ×4, `not-measurable` |
| cervello | — | — (notice: limits in prose) |

Nothing invented, nothing coerced. All 14 rows carry their note in **both** locales.

### Three bugs the sync itself exposed

**1. No Arabic synced at all — silently.** `findArabicChild` matched the title exactly against `العربية`; the live pages are titled `النسخة العربية — الغلاف`. Nothing matched. It hid perfectly because decision 013 makes a missing Arabic translation the *normal* state — the one design decision that guaranteed this would look like content rather than a bug. Now matched by containment.

**2. Arabic headings were never mapped.** Even after the pages were found, `## الأطروحة` / `## دوري` / `## النتائج` matched nothing, because the heading→field map was English-only. Added a synonym table. Arabic now lands on 10/10 chapters and all outcomes and targets.

**3. Orphaned translations accumulated on every re-sync.** Outcomes and targets are replaced wholesale, but `translations` is polymorphic — no foreign key, so no cascade. Deleting the rows left their translations behind, and the second run turned 11 targets into 22 entity_ids, half pointing at rows that no longer existed. Translations are now deleted first. Existing orphans purged; verified zero across all four entity types.

### Still missing — reported, not worked around

- **`decision` is absent on all 10 chapters.** Rule 3 is non-negotiable: *"`role` and `decision` required before a chapter publishes — no Case File publishes without the 'I'."* No chapter currently has one, so strictly none should publish. Either the Notion chapters have no `Decision` heading, or it is worded differently.
- **`features` = 0.** The sync creates no feature rows at all. The contract specifies them; the code never implemented them.
- **Chapter order is wrong.** The linear view reads *Portal, Onboarding, Workflow, Fulfilment*; your cover says *Onboarding → Workflow → Portal → Fulfilment*. The sync never sets `sort_order`, so everything defaults to 0 and order is arbitrary. Notion has no order property — this needs a source of truth before it can be fixed.
- **Arabic titles fall back to English.** The Arabic child pages carry no title heading, so `/ar/work/egypt-acquisition` shows *"Egypt Acquisition (Web)"*. That is decision 013 working correctly, not a defect — but it is visible.
- **`media` = 0**, as designed: images are uploaded to Cloudinary manually (contract Step 6).

---

## 2026-08-11 — targets parse; one real mismatch left. Not synced.

### The fallback guard holds — proven, not assumed

Extracted the item-selection logic into a pure function and tested it directly rather than trusting the live data:

| Check | Result |
|---|---|
| Targets page finds a table under **any** heading | ✅ `table-fallback` |
| Outcomes do **not** use the fallback (named heading only) | ✅ `none` |
| An expected heading beats the fallback | ✅ `table` |
| A table beats loose prose under the same heading | ✅ `table` — the summary-sentence bug |
| Legacy prose form still parses | ✅ `prose` |
| No table anywhere → reportable, never silent | ✅ `none` |

### What the dry run shows now

```
updated 18 · skipped 8 · notices 1 · failed 1
```

- **Neobiz targets: clean.** 5 rows — `[achieved] [achieved] [achieved] [achieved] [not-measurable]`, found via `table-fallback`.
- **Egypt cover outcomes: clean.** 3 rows — `[achieved] [projected] [projected]`.
- **Cervello: notice, as expected.** No targets table; limits in prose.
- **Egypt Results Table: 1 failure**, and it is a real modelling mismatch rather than a typo.

### ⚠️ `[projected]` is not a valid *target* status

The two enums are deliberately different:

| Table | Statuses | Question it answers |
|---|---|---|
| `outcomes` | `projected` · `achieved` · `not-measurable` | What came of the work? |
| `targets` | `achieved` · `missed` · `not-measurable` | Was the declared target **closed**? |

Three Egypt Results Table rows carry `[projected]` — the SLA, the 1,500+ accounts, and the ~30% recovery. A projection is not a closure, so `target_status` has no value for it. **The parser refused to coerce it**, which is the guard working: silently mapping `[projected]` → `[not-measurable]` would have invented a closure that was never declared.

**Your own content already answers this.** The Neobiz table closes exactly this situation honestly:

> Completion time / conversion / drop-off / adoption — **[not-measurable]** — nothing to measure before launch; the row exists to state the absence of a claim.

That is a declared target, closed, with the reason stated. The Egypt rows are the same shape: targets that cannot yet be measured because there has been no commercial launch.

**Recommendation:** mark the three Egypt rows `[not-measurable]` with the reason in the Source column — *"no commercial launch; nothing to measure against yet"*. That satisfies "every declared target closed" without claiming anything, and it matches the pattern you already used on Neobiz.

The alternative is to move those rows out of the Results Table into the cover's Outcomes table, where `[projected]` is valid. That is also honest, but it leaves the Results Table silent about targets that were genuinely declared — and the manifesto requires every declared target to be closed.

I did not choose between them. Same reasoning as before: this is a judgement about what was promised and what was delivered, and it is not mine to make.

### Naming

Checked: **Cervello** is spelled consistently with a C everywhere — Notion, all docs, the slug, and the seed data. Nothing to correct.

---

## 2026-08-11 — the dry run's "clean" was false. Targets were never syncing.

### ⚠️ I did not run the real sync, and here is why

The dry run came back **exit 0, zero failures** after your fixes. It was wrong, and I checked the Results Table pages before writing rather than trusting it.

**No targets were being parsed at all — across all three case files.** My parser looked for headings named `Targets` or `Results`; the live pages use `## Every number, and where it came from`. No match, so it fell through the `lines.length === 0` guard and **skipped silently**. Exactly the class of silent gap I fixed for static pages, and it produced a zero-failure run that would have written 18 entities and zero targets while reporting success.

Fixed two ways: a `Results Table —` page now falls back to *any* table on the page whatever its heading is called, and a targets page yielding nothing is reported rather than skipped.

### The honest picture

```
updated 18 · skipped 8 · notices 1 · failed 2
```

**Failures (2):** the Egypt and Neobiz Results Tables.

**Notice (1):** Cervello has no targets table. That is legitimate — a case file may declare no targets and state its limits in prose, and "every declared target closed" is satisfied vacuously when none were declared. So it is a notice, not a failure. But it is reported loudly, because *"a table exists and was missed"* looks identical to *"there is no table"* and only this line tells them apart. I nearly shipped it as a failure, which would have been the collision-detector mistake again.

### The real blocker: two different axes, one column

The Results Table pages are a **three-column** table, not two:

| Claim | Source | Status |
|---|---|---|
| ~15 minutes to complete an application | Timed across ten prototype-testing sessions | **Measured** |
| 24 hours – 3 days to an active account | The service level agreed with the business | **Agreed target** — not my measurement |
| 2 weeks – 1 month under the paper model | The bank's internal figures | **Baseline, internal data** |
| The same language-switching behaviour after go-live | Reported to me by the team | **Reported** |
| 1,500+ new SME accounts in year one | Business projection | **Projected** |

**That Status column is not the schema's status.** *Measured*, *Agreed target*, *Reported*, *Baseline* answer **"how do I know this?"** — provenance. `target_status` (`achieved` / `missed` / `not-measurable`) answers **"was the declared target closed?"** — closure. They are different axes, and only two of the five values even gesture at closure.

Mapping one onto the other would be coercion, and coercion is what decision 007 exists to prevent. *Measured* → `achieved` is defensible; *Reported* → `achieved` quietly upgrades hearsay; *Baseline* → anything is a category error, and by the rule we just wrote it should not be in the table at all.

**So I need a decision, not a guess.** Two options:

- **A. Marker in column 1, provenance stays in the Source column.** Consistent with the cover outcomes, no new parsing, both axes preserved — the marker records closure, the note records how it is known. This is what Step 5 already says the note is for.
- **B. Extend the contract to a three-column form** where column 3 is the status, with an explicit prose→enum vocabulary that you define. More faithful to how you already write, but it needs the mapping written down and it loses whatever the enum cannot express.

I would take **A**. It requires no new vocabulary, and the richness you want is already carried by the Source column.

---

## 2026-08-11 — contract corrected to match the content

### `docs/sync-contract.md` Step 3 rewritten

The code was right and the doc wasn't, which is the drift that makes the next person write content in the wrong shape. Step 3 now describes:

- **Two kinds of content under a heading** — prose (paragraphs, list items) and a **table**, which is the item list. When a table is present it is authoritative and loose paragraphs above it are prose intro.
- **The outcomes/targets table shape** — column 1 carries the label *and* the status marker, column 2 carries the note, with a worked example.
- **A new rule: "A baseline is not an outcome."** Your call on the paper-model figure generalises, so I wrote it down rather than leaving it as a one-off. None of the three statuses fits a baseline honestly — not achieved, not projected, and it *is* measurable — and it has no marker because it is not that kind of claim. It belongs in `Context` prose, attributed. A baseline in context makes the other numbers mean something; the same figure in a results table reads as a claim about the work.

Step 5 updated to match, with one line added that your reasoning on marker 1 earned:

> **The note is not decoration.** A figure marked `[achieved]` on prototype evidence is defensible only if the note says so — the marker records *whether* it happened, the note records *how it is known*.

### Code brought in line

The parser joined table cells before parsing, which would have folded the delimiter and the note into the label. Cells are now split on a unit separator first, so column 1 is parsed for the marker and column 2 becomes the note. Four tests added over the real Egypt rows, including that the baseline row **still fails if left in the table** rather than being guessed at.

Confirmed working: the dry-run error now names `"~15 minutes to complete an application"` — the label cell alone — rather than the whole joined row.

### 404 locale — promoted

Moved from a Phase 1 nice-to-have to a **launch-gate item**. An Arabic visitor hitting a bad link getting an English page is small, but it undermines a bilingual claim, and the positioning is doing Arabic properly rather than approximately.

### Waiting on

The four Notion edits. Current dry run: **18 would write, 8 skipped, 1 failure** — still the unmarked first outcome row. Once the markers land I re-run the dry run, and if it comes back clean, the first real sync.

---

## 2026-08-11 — Cervello resolved, route scaffolding

### Dry run after your Notion fixes

The collision is gone. `cervello` now syncs as published with its 3 completed chapters, and **all 8 previously-failing Cervello rows pass**. `Results Table — Cervello` and `Linear View — Cervello` are correctly not flagged — the results table is a different entity kind, and Linear Views are skipped by design.

```
Read 67 rows, 39 in scope.
created 0 · updated 18 · skipped 8 · failed 1
```

### ⚠️ The Egypt outcome is not what my last report implied

You said mark it `[projected]`, and I did not, because doing so would have been wrong.

The line I reported — *"Two weeks to one month → about fifteen minutes to submit, twenty-four hours to three days to activate."* — is a **summary headline spanning three different figures**, not an outcome. Below it sits a **four-row table** carrying the real outcomes with their source notes:

| Outcome | Source note in Notion |
|---|---|
| ~15 minutes to complete an application | Measured across ten prototype-testing sessions and documented |
| 24 hours – 3 days to an active account | The service level agreed with the business |
| 2 weeks – 1 month under the paper model | The bank's own internal figure, the objective the programme was set against |
| 1,500+ new SME accounts in year one | A projection. Egypt is in controlled release; no commercial launch |

Marking the headline `[projected]` would have created one nonsense row and **silently discarded all four real outcomes**.

The root cause is a contract mismatch, not a content error: `docs/sync-contract.md` Step 3 says *"Outcomes (list) → one outcomes row each"*, but the content is written as a **table**. The sync now reads tables — a table under the heading is the item list, and loose paragraphs above it are prose. It correctly reports `outcomes source: table (4 rows)` and fails on the first real row instead of the headline.

**What I need from you:** four separate markers, one per row, because they are genuinely different judgements — a prototype-measured timing, an agreed SLA, a historical baseline, and a stated projection. Decision 007 says these must be explicit and must not be guessed, and I am not the one who can make those four calls. The table has no Status column; either add one, or append the marker to each label cell.

### Route scaffolding — all MVP-1 routes navigable

See the route map at the top of this document, which I will keep current.

Validated against a temporary fixture case file, then removed:

| Check | Result |
|---|---|
| `/en/work/…/probe-chapter` | 200, breadcrumb `Home / Work / Route Probe Case File / Probe Chapter` |
| `/ar/work/…/probe-chapter` | 200, `dir="rtl"`, breadcrumb `الرئيسية / الأعمال / ملف اختبار المسار / فصل الاختبار` |
| Linear view ordering | `01 فصل الاختبار`, `02 الفصل الثاني` |
| Unknown case file / unknown chapter | 404, both |

Breadcrumb deliberately does not reverse itself or flip its separator for RTL — `dir` on `<html>` mirrors the row, and doing both would double-flip it.

### Arabic corrections applied

- `privacy_no_tracking` → **لا يمكنني التعرّف عليك عند عودتك.** Your call was right.
- `privacy_no_ip` → **لا أخزّن عناوين IP.** Dropped `إطلاقاً` — `لا` already carries "never", and the emphatic particle tipped a plain fact into protesting.
- `consent_accept` / `consent_decline` → **أوافق / لا أوافق**. Parallel construction is how equal weight is achieved. `لا شكراً` is polite where `أوافق` is decisive — an asymmetry in the opposite direction from the usual dark pattern, but an asymmetry.
- `privacy_location` kept as `أسجّل` — no warmer alternative reads as precisely.

### A dead check found while doing it

`check-seed-drift` required 4 fields per tuple, so **every 2-field correction tuple was silently discarded** — the corrections files were parsed into nothing. It only ever passed because I had edited the base seed directly last time. Fixed; it now catches what it was built to catch.

---

## 2026-08-11 — dry run, retention, Arabic review

### The dry run — and three fidelity bugs it had

`NOTION_API_KEY` is in. First run surfaced both failure modes on real data. But reviewing the output before showing it to you, **the dry run was lying about what a real run would do**, so I fixed it first:

1. **It reported 22 updates when the truth is 14.** Chapters were listed as syncable without simulating parent resolution. In reality the Cervello route collision blocks the `cervello` case file, so **all 8 Cervello chapters fail** — including the three good ones. The dry run now records which case files *would* exist and resolves parents against that.
2. **The "flagged into MVP-1 but not ready" list was 20 rows of mostly noise** — 4 `FOUNDATION` build tasks and 3 Linear Views that are skipped anyway, burying the 4 real mini case files. Skipped rows are now excluded.
3. **Static pages vanished silently.** Landing, About, Contact, Systems, Classic Gallery, 404, both Comparisons and the Accessibility page appeared in neither the synced nor the skipped list — they looked handled. They are now reported under "NOT YET IMPLEMENTED", because a row absent from every list reads as success.

### What it would write

```
Read 67 rows, 45 in scope.
created 0 · updated 14 · skipped 8 · failed 10
```

**Would write (14):** 7 case files — `east`, `kshemam`, `pidetaxi`, `aam-advisor` as draft; `uae-acquisition`, `egypt-acquisition`, `neobiz-mobile` as published — and 7 chapters across Egypt, Neobiz and UAE.

**Skipped (8), with reasons:** 5 `FOUNDATION —` build tasks, 3 Linear Views (derived at render).

**Failed (10), nothing written:**

- the `/[locale]/work/cervello` collision
- **8 Cervello chapters**, each reported as a knock-on of that collision
- **Egypt Acquisition outcomes** — decision 007 caught a real unmarked figure: *"Two weeks to one month → about fifteen minutes to submit, twenty-four hours to three days to activate."* has no `[projected]`/`[achieved]`/`[not-measurable]` marker, so the whole outcomes block aborted rather than guessing.

That last one is the rule working exactly as intended on live content, not a test fixture.

**Not yet implemented:** static, comparison and accessibility pages map to `ui_strings` scoped by route (contract Step 1). Listed in the output so they are visibly absent.

### Retention — 180 days, implemented

Decision 031. `pg_cron` job at 03:15 UTC daily: aggregate, then prune. Order is load-bearing.

Verified with synthetic data: a 200-day-old session was deleted from raw **while its month survived in `analytics_monthly`**; a 10-day-old session was untouched; events cascaded; the aggregate has **no `city` column** (city + month + a small count is the combination that could narrow to a person; country cannot); the cron job is scheduled.

### Notion error messages

Your point about "bad key" vs "key valid, database not shared" is now handled explicitly — 401, 404 `object_not_found`, 403 `restricted_resource` and 429 each produce a different message naming the actual fix, including the Connections menu path for the 404 case.

### Arabic — in the existing file

The 8 new strings are in `docs/ui-strings-review.md`, same format, same export script. One file, as asked.

**`privacy_no_tracking` is the one I am least confident in.** "I cannot follow you between visits" → `لا أستطيع تتبّعك بين الزيارات.` The problem is `تتبّع`: it reads closer to "stalk/trace" than neutral technical "track", so the sentence can sound defensive — protesting too much. Alternative in the doc: `لا يمكنني التعرّف عليك عند عودتك` ("I can't recognise you when you return"), which is softer and arguably more accurate to the mechanism, since the session id dies with the tab.

Also flagged: `إطلاقاً` in the no-IP claim possibly tipping into overclaiming, `أسجّل` reading bureaucratically, and whether `لا شكراً` reads as *more* hesitant than `أوافق` is affirmative — which would be a soft dark pattern in the opposite direction from the usual one.

---

## 2026-08-11 — 0.4 Notion sync script

### Built against the live database, not the contract alone

I read the real Notion database before writing anything. The schema matches `docs/sync-contract.md` exactly, and **all four known issues are still present**:

| Issue | Live state |
|---|---|
| Route collision | `Case File Cover — Cervello` (Not started) and `Case File Cover — Cervello Cloud (IoT)` (Done) both claim `/[locale]/work/cervello` |
| Orphaned Cervello chapters | 5 — `platform`, `design-system`, `alarm`, `horizontal-apps`, `website`, all Not started. The current three (`method`, `on-premises-to-cloud`, `permission-architecture`) are Done |
| Mini case files in MVP-1, no content | 4 — AAM Financial Advisor, EAST Rebrand, Kshemam HealthCare, PideTaxi |
| Stale rows marked into MVP-1 | The `FOUNDATION —` build-task rows are flagged `In MVP-1`; the script skips them by title prefix per the contract |

### The two failure modes you named

Both are pure functions in `lib/sync/classify.ts`, covered by `npm run test:sync` — **35 checks, no credentials or network needed**, so they are proven before the sync ever touches anything.

**Missing status marker aborts the entity.** `parseStatusItem` returns an Error rather than a value; there is no default path in the code to fall through to. Tested: a line reading `30% increase in conversion rate` with no marker fails, the error names decision 007, and no status is invented. Also tested: the design files' vocabulary (`[confirmed]`) is rejected, and outcome statuses are not accepted for targets or vice versa.

**Two rows claiming one route abort rather than overwrite.** Detected up front, before any write, so the sync never produces a plausible-looking wrong result.

### A bug the tests caught

My first collision detector compared on route alone. That flagged **every cover and its own results table** as a collision — Notion annotates results tables as `/work/x (close)`, and stripping the annotation made them identical. In the live data that is Egypt, Neobiz *and* Cervello: six valid rows aborted.

Entity kind is now part of the collision key. A cover and its results table write to different tables, so they cannot collide; two results tables for one case file still do. A check that fires on correct data teaches everyone to ignore it, which is worse than no check.

### Not yet run

`NOTION_API_KEY` is unset, so **the script has never executed against Notion**. What is verified: the classification and parsing logic (35 tests), the TypeScript typechecks, and the credential guards. What is not: the Notion API calls, the body-to-field mapping against real page bodies, and the Supabase writes.

A `--dry-run` needs **only** `NOTION_API_KEY` — the Supabase import is lazy, so previewing does not require the service-role key.

---

## 2026-08-11 — analytics: geography, consent-gated GA

Decisions **029** (geography) and **030** (consent-gated GA) logged.

### Geography — verified the way the referrer was

`sessions` now records `country` and `city`, taken from headers Vercel resolves at the edge. The IP never enters our code, so there is nothing to discard carefully — it is never held.

Test request carried `x-forwarded-for: 194.170.101.55`, `x-real-ip`, and `Referer: https://www.google.com/search?q=moataz+private+search`.

| Stored | Not stored |
|---|---|
| `country: AE`, `city: Dubai` | the IP address, in any column |
| `referrer_type: search` | the search query |
| `device: desktop` | the User-Agent |

A second request confirmed percent-decoding: `San%20Francisco` → `San Francisco`, `us` → `US`. A full-text scan of `sessions` and `events` for both IPs and the query string returns nothing.

Deliberately **not** collected: region, coordinates, postal code, timezone. City is already the most identifying field; anything finer is a location trail.

### Consent-gated GA

`NEXT_PUBLIC_GA_ID` is set to the property you sent. The gate is that the GA `<script>` is **not rendered at all** until consent is granted — stronger than GA's own Consent Mode, which loads the script and then asks it to behave. Verified: no `googletagmanager` reference in the served HTML before a choice.

The banner renders in both locales (`Allow` / `No thanks`, `أوافق` / `لا شكراً`) and mirrors via the existing logical properties. Decline is the same size and weight as accept and comes **first in the tab order**. There is no dismiss X — dismissal is not consent.

**The banner gates GA and nothing else.** Our Supabase analytics are mounted outside it and run regardless, with geography. Someone who declines is still counted. There is a comment in `ConsentBanner.tsx` warning against reusing the hook to gate anything else without deciding that thing needs consent on its own merits.

### `/how-this-site-works` copy — seeded, all four claims testable

Seeded as `ui_strings` in both languages, ⚠️ **Arabic needs your review** like the last batch:

| Claim | How it is true |
|---|---|
| I record approximate location — country and city | Verified above |
| I never store IP addresses | No column in the schema can hold one; scan returns nothing |
| I cannot follow you between visits | Session id lives in `sessionStorage`, dies with the tab |
| I use Google Analytics only if you allow it | No GA script renders before an explicit accept |

### Retention — proposal, needs your confirmation

Indefinite accumulation is not a posture. My recommendation:

**90 days for raw `sessions` and `events` rows.**

- The Door validation in Layer 2 needs a few months of data at most, not years.
- `city` + timestamp is the most identifying combination in the table; time-bounding it is the mitigation that keeps "approximate location" honest.
- Anything longer needs a reason, and "we might want it" is not one.

If you want year-over-year trends, the answer is to **pre-aggregate before deleting** — monthly counts by country, referrer type, and device, kept indefinitely — rather than keeping raw rows longer. Aggregates answer the trend questions and cannot be re-identified.

Alternative if 90 feels short: **180 days**, which still bounds it and covers two full quarters. I would not go past that without a specific need.

Implementation is a `pg_cron` job; I have not enabled it pending your answer.

### Two process notes

- **The port race cost real time.** `npm start` kept failing with `EADDRINUSE` while my kill was still settling, so several "failed" verifications were actually testing a stale server against new code. The geography code was correct from the first attempt. Using a fresh port per run is the fix; I have stopped reusing 3100.
- Combined with the stale-`.next` issue already noted, the rule for verification runs is now: `rm -rf .next`, build, start on an **unused** port, and confirm the bind before trusting a single result.

---

## 2026-08-11 — 0.9 instrumentation and machine legibility

### Cloudinary connected

Cloud name `vewhrkzj` is set. The account is live and ships with default sample assets, so all five presets were verified against the **real** account rather than the demo cloud — `c_limit,w_1200`, `c_fill,w_640,h_400,g_auto`, `c_fill,w_160,h_160,g_auto`, `c_limit,w_1000` and `c_fit,w_1000` all return 200 image/jpeg. A nonexistent asset returns 404 and a nonexistent cloud returns 404, so the 200s are meaningful.

### Privacy — enforced, then tested

Every claim was verified against the running endpoint, because these get published on `/how-this-site-works` and have to be true rather than approximately true.

| Request | Result |
|---|---|
| Valid `page_view` | 204, written |
| Email address under an allowlisted key | **422 rejected** |
| Disallowed key (`ip`) | **400 rejected** |
| Nested object under an allowed key | **400 rejected** |
| 13-digit string | **422 rejected** |
| Non-UUID session id | **400 rejected** |
| Unknown event type | **400 rejected** |

The rejected six wrote nothing.

**The referrer test is the one that matters.** The request carried
`Referer: https://www.google.com/search?q=secret+query`. What was stored:

```
referrer_type: "search"   device: "desktop"   locale: "en"
payload: { "route": "/en", "locale": "en" }
```

The query string never landed. Only the category. The User-Agent was read to bucket the device and discarded.

**Structural proof:** a scan of every column in `public` for anything matching `ip|agent|fingerprint|referrer|user|email|name` or typed `inet` returns exactly one row — `sessions.referrer_type`, which holds a category. There is nowhere an IP or UA *could* be stored.

Design choices behind that:

- Session id lives in **sessionStorage**, not a cookie and not localStorage. It dies with the tab. This undercounts unique visitors, and that is the correct trade: an identifier surviving the visit would make "we cannot follow you" false.
- Payload keys are **allowlisted per event type**, and values must be primitives — a nested object is how personal data arrives under an allowlisted top-level key.
- `email_capture` deliberately has **no key for the address**. The schema names the event, which makes it look like where an email would go. It is not: an address has its own consent and retention questions and belongs in its own table.

### GA is stubbed, and I'd flag it rather than wire it

Not only because the property ID is missing. GA4 sets persistent cookies, processes the visitor's IP for geolocation, collects the full User-Agent, and may enable Google Signals depending on property config. None of that is compatible with claiming "anonymous session IDs only, no IP, no fingerprinting" without qualification — and that claim is load-bearing for decision 001.

Three honest options are written up in `components/analytics/GoogleAnalytics.tsx`. My recommendation is **A: don't run GA** — the Supabase store already answers the questions that matter, and it is the one Layer 2 depends on. Nothing is collected until `NEXT_PUBLIC_GA_ID` is set, so the decision stays open.

### Machine legibility

- **Person JSON-LD** — from `settings`, localised (`Moataz Mustapha` / `مُعتز مصطفى`), with `description` omitted because `tagline` is still NULL. Nothing invented: this markup is quoted back verbatim by models, so rule 7 binds hardest here.
- **`llms.txt`** — generated from the database. A hand-maintained one drifts within a month and then actively misinforms the exact audience it was written for. Includes notes for summarisers: that redaction is deliberate rather than broken, and that metric labels must be preserved when quoted.
- **`sitemap.xml`** — both locales with `hreflang` alternates, so the two languages don't compete as duplicate content.
- **`robots.txt`** — GPTBot, ClaudeBot, OAI-SearchBot, PerplexityBot and Google-Extended explicitly allowed. Deliberate: the LLM read test is a launch gate, and blocking the crawlers would protect nothing while forfeiting the channel.

The read test itself can't be run yet — there is no real content to summarise. The plumbing is built so it can pass.

### Incidental

Next auto-updated to 16.3.0, which deprecates the `middleware` convention. Migrated `middleware.ts` → `proxy.ts`; warning gone, routing verified unchanged.

---

## 2026-08-11 (later still) — redaction posture enforced

Moataz confirmed the §3 finding and answered the brief. Logged as **decisions 027 and 028**; `docs/redaction-brief.md` §0 now carries the working spec.

**027 — redaction is baked into the pixels before upload.** The unredacted original never reaches Cloudinary. This is a security posture, not a preference: a live transform leaves the original fetchable at its base URL, one deleted path segment away. Now also stated in `CLAUDE.md` rule 6, so it is in the file read every session rather than only in a doc.

**028 — redacted images are never cropped, never a cover, never the OG image.** Enforced structurally rather than by convention:

- **Never cropped** — `CloudinaryImage` *forces* the `redacted` preset (`c_fit`) whenever `media.redacted` is true, overriding whatever the caller passed. Verified: a redacted image requested as `card` or `thumb` renders `c_fit,w_1000`, while clean images still crop normally.
- **Never a cover or OG image** — three database triggers, plus a query-layer guard that throws rather than silently dropping the cover.

Every path was tested against a live attempt, including the bypass and two controls:

| Attack | Result |
|---|---|
| Insert case file with redacted cover | blocked |
| Update cover to a redacted asset | blocked |
| **Bypass** — clean cover, then mark it redacted | blocked |
| `settings.og_image` → redacted asset | blocked |
| *Control:* clean cover / clean OG | accepted |

The database is the enforcement point because the writers are plural and growing — sync script, Layer 4 admin panel, and the Supabase table editor at any time. A rule living only in `lib/content` is a rule the table editor does not have.

**One thing worth remembering:** the triggers first went in as `SECURITY DEFINER` and tripped six advisor warnings. Supabase grants `EXECUTE` on new public functions to `anon`/`authenticated` **explicitly** via default privileges — so `revoke ... from public` was a no-op, the opposite of the earlier `rls_auto_enable()` case where the grant *was* on `PUBLIC`. Switched to `SECURITY INVOKER` (they need no elevated privileges) and revoked from the named roles. All warnings clear; triggers still fire.

---

## 2026-08-11 (later) — 0.8 media

### Built

`CloudinaryImage` is the only place an image URL is constructed (rule 3). Presets `thumb` / `card` / `hero` / `gallery` are live; `RedactedEvidence` renders a plain bordered surface with the shared badge and caption.

**Verified against live Cloudinary, not just a passing build** — a temporary probe route confirmed each preset returns a real image, then was removed:

| Preset | Transform | Result |
|---|---|---|
| `hero` | `c_limit,w_1200` | 200 · image/jpeg |
| `thumb` | `c_fill,w_160,h_160,g_auto` | 200 · image/jpeg |
| `card` | `c_fill,w_640,h_400,g_auto` | 200 · image/jpeg |

Aspect ratio is preserved on `limit` crops (1600×1200 → 1000×750). A missing `alt` translation omits the image entirely; a `decorative` image renders `alt=""`. Those two cases are distinguished deliberately — shipping an unlabelled image would quietly fail the accessibility baseline.

### One design decision worth recording

Built as a **server component** using `getCldImageUrl` + a plain `<img>`, not next-cloudinary's `<CldImage>`. `CldImage` calls `useState`, so importing it into the server tree fails the build — caught during verification — and would have shipped client JS for every image on an otherwise fully server-rendered site. `next/image` was also rejected: it would re-optimise what Cloudinary has already optimised.

### Redaction — still open by design

The `redacted` preset is deliberately identical to `gallery`. No blur, no pixelation, no tint. `docs/redaction-brief.md` briefs the design pass; its central point is that a **live Cloudinary transform does not remove the original** — stripping the transform segment from the URL returns the untouched image — so redaction should be baked into the asset before upload, and no unredacted original should ever reach Cloudinary.

### Blocked

`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is unset. Every image is omitted until it exists.

---

## 2026-08-11 — Arabic corrections applied · Phase 0 foundation complete

### Arabic review pass — applied

All nine corrections are live in the database, in `supabase/migrations/0003_seed_site_chrome.sql`, and reflected in `docs/ui-strings-review.md`.

| Key | Was | Now |
|---|---|---|
| `objective` | الهدف | **الغاية** |
| `outcome` | النتيجة | **الحصيلة** |
| `redacted_notice` | محجوب بموجب اتفاقية سرية | **محجوب بموجب NDA** |
| `reflection` | تأمّل | **خلاصة** |
| `status_projected` | متوقّع | **تقديري** |
| `status_achieved` | تحقّق | **محقَّق** |
| `status_missed` | لم يتحقّق | **غير محقَّق** |
| `skip_to_content` | تخطَّ إلى المحتوى | **انتقل إلى المحتوى** |
| `case_file` | ملف حالة | **ملف المشروع** |

**Verified, not assumed:**

- **No collisions remain.** A query across all 52 strings confirms no Arabic value serves more than one key, and no English value serves more than one key — in either direction, not just the two that were reported.
- **Rendered end-to-end.** `/ar` serves `انتقل إلى المحتوى` from a clean production build.
- **No file/database drift.** `npm run check:seed-drift` reports 52 = 52.

### Length handled in CSS, not by shortening Arabic

Two tokens added, documented in `docs/design/tokens.md`:

```
--control-min-w: 8rem     /* submit button — fits جارٍ الإرسال… */
--pill-min-w:  7.5rem     /* status pill — fits غير قابل للقياس */
```

Available as `min-w-control` and `min-w-pill`. The components that consume them (Contact form, Results Table) are Phase 1.

> ⚠️ **Provisional values** — estimated from the longest Arabic string in each set, not measured against rendered text. Verify in both locales when those components land.

### New guard against a recurring failure

`npm run check:seed-drift` parses the seed migrations and compares them field by field against the database. It exists because the drift already happened once: transcribing the seed into `apply_migration` silently substituted ASCII for typographic characters, and the committed migration stopped reproducing the live data. Run it after any content change.

---

## Phase 0 — where the foundation stands

| Task | State |
|---|---|
| 0.1 Repo & environment | Mostly — ESLint and Vercel still outstanding |
| 0.2 Supabase schema | ✅ Applied and verified behaviourally |
| 0.3 Seed | ✅ 52 UI strings, 8 nav items, settings (3 values pending) |
| 0.4 Notion sync | Not started — blocked on stale Cervello rows |
| 0.5 Query layer | ✅ Verified, 13/13 |
| 0.6 Design tokens | ✅ Except the redaction treatment (question H) |
| 0.7 i18n + RTL shell | ✅ Except Breadcrumb, deferred to Phase 1 |
| 0.8 Cloudinary + media | ✅ Except the redaction treatment (question H) and the cloud name |
| 0.9 Instrumentation | ✅ Except the GA decision |

### 0.7 was completed in the previous session

`/en` renders `lang=en dir=ltr`, `/ar` renders `lang=ar dir=rtl`, both prerendered as SSG, with header, footer, nav, language switch and theme toggle rendering entirely from Supabase. `/` redirects to `/en`. Verified against a running server, not just a passing build.

The only deferred piece is **Breadcrumb** — there are no nested routes for it to render on until Phase 1.

---

## Blockers, by who owns them

### Launch-gate blockers — Moataz

| Item | Why it blocks launch |
|---|---|
| `settings.tagline` | The line under the name on the landing page — the site's one-sentence claim about itself |
| `settings.og_image` | Controls how every shared link renders on LinkedIn and WhatsApp |
| `settings.cv_url` | The footer CV link is absent until it exists |

### Design decisions — Moataz

| Item | Blocks |
|---|---|
| Redaction treatment (question H) | `RedactedEvidence`, the `redacted` Cloudinary preset. Being designed against `docs/redaction-brief.md` |
| Permanent Arabic typeface (question F) | Geist is an explicit interim (decision 020). The type scale is verified for Latin only |

### Content — Moataz

| Item | Blocks |
|---|---|
| Stale Cervello rows in Notion | Sync script correctness |
| Mini case files — in MVP-1 or cut? | Gallery scope |
| NDA asset audit + redaction rules | Every Evidence block |
| Neobiz Mobile feature lists | 2 chapters |

---

## Verification commands

```bash
npm run verify:content      # query layer against the live database
npm run check:seed-drift    # migration files still reproduce the database
npm run export:ui-strings   # regenerate docs/ui-strings-review.md
npm run build               # production build
```

**Note on local dev:** use `npm run dev` for content review — changes appear on refresh in under a second. `npm start` serves a production build where routes are prerendered; they now carry `revalidate = 300`, so a change appears within five minutes or instantly via `/api/revalidate`. Only a code change requires a rebuild.

**Note on ports:** something outside these sessions serves an older build on **port 3000**. Verification runs use **3100** to avoid touching it.
