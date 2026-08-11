# docs/status.md — Build Status

**Living document.** Updated at the end of each working session. Newest first.
For the queue, see `TASKS.md`; for why anything is the way it is, `docs/decisions.md`.

---

## ROUTE MAP — what is a stub and what is real

*Kept current as pages fill. This is the progress view.*

| Route | State | What is real | What is missing |
|---|---|---|---|
| `/[locale]` | 🟡 stub | Shell, nav, JSON-LD, analytics | Everything. The Landing page is Phase 1 #1 |
| `/[locale]/work` | 🟡 stub | Title, breadcrumb | ProjectGrid, ProjectCard, FilterBar |
| `/[locale]/work/[caseFile]` | 🟡 stub · **live data** | Slug resolves against the database; unknown or unpublished 404s. Title from `translations` | LivingMap, OutcomeStrip, EntryHandles, thesis, role, sibling link |
| `/[locale]/work/[caseFile]/[chapter]` | 🟡 stub · **live data** | Chapter AND parent both resolve; 404 if either is missing or unpublished | ObjectiveHeader, DecisionBlock, FeatureStrip, RedactedEvidence, MilestoneClose |
| `/[locale]/work/[caseFile]/all` | 🟡 stub · **live data** | Renders the real chapter list in order | Chapter bodies inline |
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

> ⚠️ **The three `[caseFile]` routes currently 404 for every slug** because no content has been synced. That is correct behaviour, not a bug — they come alive with the first real sync.

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

**Note on local dev:** an incremental Turbopack build serves a stale prerender after the database changes — a corrected string will not appear until `rm -rf .next`. Content changes do not invalidate the build cache, which is what `/api/revalidate` exists for in production.

**Note on ports:** something outside these sessions serves an older build on **port 3000**. Verification runs use **3100** to avoid touching it.
