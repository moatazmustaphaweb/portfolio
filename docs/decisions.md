# docs/decisions.md — Decision Log

**This file is the tie-breaker.** When documents disagree, the most recent dated decision here wins. Correct the conflicting document in the same session and log the correction.

**Format:** `### YYYY-MM-DD — Title` · Decision · Why · Consequence · Status (`ACTIVE` | `SUPERSEDED by #n`)

---

### 001 — Portfolio as a personal design system
**Decision:** One identity, re-prioritised per visitor archetype. Never gated — ordering and emphasis change, facts never do.
**Why:** Five audiences (Institution, Founder, Learner, Leadership, Curator) ask different first questions. One undifferentiated presentation serves none of them well.
**Consequence:** Requires an intake mechanism and a content model that supports re-ordering. Drives the entire architecture.
**Status:** ACTIVE

### 002 — Redaction as the NDA visual language
**Decision:** Mashreq work is shown abstracted/masked as a deliberate, crafted treatment — not hidden, not omitted.
**Why:** The constraint is unavoidable; making it a designed language turns a limitation into a signature, and it echoes the "Required Fields" art practice.
**Consequence:** `media.redacted` flag; a redaction transform preset; every Evidence block designed for it.
**Status:** ACTIVE

### 003 — Five archetypes, six paths
**Decision:** Institution · Founder · Learner · Leadership · Curator, plus a Classic path.
**Why:** Persona research showed these five cover the realistic visitor universe with genuinely different needs and funnel exits.
**Consequence:** Five result screens in Layer 2. Classic is always an explicit choice, never a fallback from skipping.
**Status:** ACTIVE

### 004 — Case File → Chapters → Cuts, as a network
**Decision:** Bidirectional; enter anywhere, zoom out from any node. Features documented as strips, not pages. Cuts are a small editorial selection, not one per feature.
**Why:** Scope must be *seen* rather than narrated; readers need multiple depths without being forced through a linear read.
**Consequence:** Three-level content schema plus a features table. Cuts deferred to Layer 3.
**Status:** ACTIVE

### 005 — Egypt splits into two Case Files
**Decision:** Egypt Acquisition (Web, 4 chapters) and Neobiz Mobile (2 chapters) are separate Case Files, connected as siblings.
**Why:** One system, two variants — each has its own design principles (back-office density vs. one-handed capture). Mobile is a major project with clean sole authorship.
**Consequence:** Four Case Files in MVP-1, 10 chapters total. Cross-links between siblings.
**Status:** ACTIVE

### 006 — Chapter merges in Egypt Web
**Decision:** Customer Portal + Notifications merge; Fulfilment + AOF merge.
**Why:** Same audience and same job in each pair. The merges produce better narratives ("the customer's view", "closing the deal").
**Consequence:** Egypt Web = 4 chapters, not 6.
**Status:** ACTIVE

### 007 — Metric integrity rules
**Decision:** Egypt figures are **projected** (controlled release, friends & family only). The ~30% is a **recovery rate** for abandoned branch applicants, not a conversion increase, and must be removed from the CV's UAE section where it was transposed. UAE public wording is locked: *"live for over a year and a half, processing thousands of new business accounts monthly at peak."* The 5,000 activated accounts (July 2025, web + mobile) is **interview-only**, never published.
**Why:** Every published number must survive an interview. Internal celebration figures are not publishable while employed at the bank.
**Consequence:** `outcomes.status` and `targets.status` have no default — an explicit call every time. The sync script aborts on a missing status marker.
**Status:** ACTIVE

### 008 — Fully dynamic content in Supabase
**Decision:** All content — including the name, menu labels, and every UI string — lives in Supabase. Nothing hardcoded, no content files in the repo.
**Why:** The end state has comments, articles, and an admin panel. Static-then-migrate loses weeks; building for the end state costs ~2 extra days now.
**Consequence:** `settings`, `navigation`, and `ui_strings` tables. Query layer before pages. Supersedes the original static-content plan.
**Status:** ACTIVE — supersedes the content model in Architecture v1.0

### 009 — ISR as the rendering strategy
**Decision:** Incremental Static Regeneration. Pages render server-side, cache at the edge, revalidate on publish.
**Why:** Resolves the tension between dynamic content and static speed. Visitors never touch the database on a normal page load; scales to millions.
**Consequence:** `/api/revalidate` with a secret; `revalidate` set on every content route.
**Status:** ACTIVE

### 010 — Cloudinary for media
**Decision:** All images in Cloudinary. Only `public_id` stored; URLs built at render from named transform presets.
**Why:** Global CDN, on-the-fly transforms, no repo bloat, and global sizing changes without touching content.
**Consequence:** `CloudinaryImage` is the only component allowed to construct URLs. Presets: thumb, card, hero, gallery, redacted.
**Status:** ACTIVE

### 011 — Notion as the authoring layer
**Decision:** Notion → sync script → Supabase. Content is written in Notion page bodies; properties supply structure.
**Why:** Supabase's table grid is unusable for long-form writing. Authoring and storage are separate problems.
**Consequence:** `scripts/sync-notion.ts`; one-way sync; retired in Layer 4 when the admin panel writes directly. Same tables, no migration.
**Status:** ACTIVE

### 012 — UUID primary keys
**Decision:** UUID (`gen_random_uuid()`) everywhere.
**Why:** Safe to expose, merges cleanly, no enumeration.
**Consequence:** IDs are not human-readable in the Supabase editor — acceptable, since authoring happens in Notion.
**Status:** ACTIVE

### 013 — English fallback for missing translations
**Decision:** Missing Arabic falls back to English. Never hide a page, never show a "not translated" notice.
**Why:** Partial translation is the normal state, not an error. Hiding content would punish Arabic-speaking visitors.
**Consequence:** Fallback chain in `translate.ts`; a missing row is expected, never a warning.
**Status:** ACTIVE

### 014 — Vercel for hosting
**Decision:** Vercel, with Supabase Cloud as a separate service.
**Why:** Built by the Next.js team — App Router, ISR, middleware, and i18n work without adapter debugging. At 2 hrs/day, one lost evening is a meaningful share of the budget.
**Consequence:** Hobby tier is non-commercial; move to Pro if the site drives paid work.
**Status:** ACTIVE

### 015 — MVP-1 scope
**Decision:** Classic portfolio only — gallery plus four Case Files, About, Philosophy, Systems, Contact, 404. No Door, no AI, no Read, no Studio, no Cuts.
**Why:** Content is what gets interviews; the adaptive layer is what makes the project distinctive. Ship the first, build the second on top.
**Consequence:** Layers 2–5 attach to the same schema without rework.
**Status:** ACTIVE

### 016 — Studio deferred from MVP-1
**Decision:** The art section ships in Layer 3.
**Why:** Art content isn't ready, and with no Door in MVP-1 there is no Curator path for it to serve.
**Consequence:** Golden Visa documentation needs an interim route until Layer 3.
**Status:** ACTIVE

### 017 — Documentation set and drift rule
**Decision:** `CLAUDE.md` (front door) + `TASKS.md` (execution) + eight `/docs` files. This log is the tie-breaker when documents disagree.
**Why:** Claude Code auto-reads only `CLAUDE.md`; everything else must be indexed from it. Twelve unindexed files would be a library nobody opens.
**Consequence:** Rejected as unnecessary: a separate BRD, MVP2–5 plans, a credentials file, content `.md` files.
**Status:** ACTIVE

### 2026-08-11 — 018 — Visual language: the Vercel-style pages win
**Decision:** The visual language is the one used by the twelve `*.dc.html` page files in Claude Design project `f6113c80` — Geist + Geist Mono, dark-first `#000`, accent `#0070f3`, 1px hairline borders, 6–12px radii, subtle blur and gradients. The Neubrutalist `_ds/` system in the same project is **abandoned**: it was an earlier iteration that was explicitly asked to be replaced. The two are not to be blended.
**Why:** The project contained two incompatible languages and the repo had implemented the abandoned one. Neubrutalist forbids exactly what the page designs rely on (blur, gradients, hairline borders, mixed radii), so no reconciliation exists.
**Consequence:** `docs/design/tokens.md` is written by extracting values from the `.dc.html` pages, not from `_ds/tokens/*.css`. The existing `app/globals.css` and `tailwind.config.ts` are replaced, not salvaged. Space Grotesk → Geist in `app/layout.tsx`. Closes open question A.
**Status:** ACTIVE — supersedes the Neubrutalist token system previously implemented in the repo

### 2026-08-11 — 019 — Light and dark mode are both required
**Decision:** The site ships both themes. Dark is the default; an explicit user choice overrides the OS preference and persists.
**Why:** Both palettes are fully specified in the design files. This had already been implemented in code (a `data-theme` attribute plus a pre-paint script) without ever being logged — `docs/design/tokens.md` still listed it as an open question.
**Consequence:** Every colour token is defined twice. Retro-logging an undocumented decision; the token file's "Dark mode: yes or no?" checkbox is resolved.
**Status:** ACTIVE

### 2026-08-11 — 020 — Geist for Arabic, as an explicit interim
**Decision:** Arabic is set in Geist for now. This is a stated interim choice, to be replaced when a proper Arabic typeface is selected. The design files' `letter-spacing: normal !important` override is **not** carried over.
**Why:** Geist has usable Arabic coverage and unblocks the RTL shell. Choosing a real Arabic face is a craft decision that shouldn't gate foundation work — but pretending the interim is a pairing would violate "Arabic is not an afterthought".
**Consequence:** `--font-arabic` exists as a distinct token from day one, so swapping the face later is a one-line change. The typeface choice stays on the blocked list.
**Status:** ACTIVE — interim, pending replacement

### 2026-08-11 — 021 — All content comes from Notion → Supabase; the design carries none
**Decision:** Every string in the Claude Design project is dummy content and is ignored entirely — every metric, headline, and paragraph. Specifically the 30%, the 85%+ satisfaction score, and the 10k+ downloads are **dummy** and do not enter the codebase in any form.
**Why:** The design files were built to demonstrate layout, not to carry copy. Their metrics contradict decision 007 (the ~30% appears there as a UAE *conversion increase*, when it is an Egypt *recovery rate*, projected). Treating layout copy as content is exactly how fabricated figures get published.
**Consequence:** The `.dc.html` files are read for structure and styling only. Decision 007 stands unchanged. Reinforces rule 1 (nothing hardcoded) and rule 7 (no fabricated content).
**Status:** ACTIVE — reinforces 007

### 2026-08-11 — 022 — Rebuild, not migrate
**Decision:** `app/`, `components/`, and `content/` are rebuilt against the architecture rather than adapted. `content/caseFiles/*.ts` was deleted **before** the first commit so client names and disputed metrics never entered git history. The old token files are not salvaged.
**Why:** The existing code had no `[locale]` routing, no Supabase, no query layer, static content superseded by decision 008, and the abandoned visual language. Nearly every layer needed replacing; adapting would have cost more than rebuilding and left the disputed material in history permanently.
**Consequence:** The repo's first commit is a near-empty foundation. Pages come last, per the build order. The pre-rebuild tree is backed up outside the repo.
**Status:** ACTIVE

### 2026-08-11 — 023 — MVP-1 is deliberately plain
**Decision:** MVP-1 ships plain text and plain images. No animation, no scroll effects, no living-map visualisation. The distinctive interaction layer is Phase 2.
**Why:** Content is what gets interviews. Shipping simple and correct first protects the 6–9 week target; the interaction layer is where time overruns hide.
**Consequence:** `LivingMap` renders as a plain hierarchical list in MVP-1, not the positioned SVG node graph shown in the design. The three grammars still drive structure, just not bespoke visuals. Motion tokens are defined but barely used.
**Status:** ACTIVE — refines 015

### 2026-08-11 — 024 — Results Table uses the schema enums
**Decision:** Target status is `achieved | missed | not-measurable` and outcome status is `projected | achieved | not-measurable`, exactly as in `docs/schema.md`. The design's "Confirmed / In progress / Directional" legend is dummy and is discarded.
**Why:** The schema enums encode the integrity rule — every declared target must be closed, and "projected" must be distinguishable from "achieved". "Directional" and "In progress" are soft labels that let an unclosed target look closed.
**Consequence:** The Results Table renders three states from the enum. No status is inferrable or defaulted; the sync script still aborts on a missing marker.
**Status:** ACTIVE

### 2026-08-11 — 025 — No anonymous read access to `translations`
**Decision:** `translations` has RLS enabled and **no select policy**. The anon key cannot read it at all. All content reads go through the service role in `lib/content/*`. Supersedes the `for select using (true)` policy specified in `docs/schema.md`.
**Why:** Every human-readable string on the site lives in `translations`, including the copy of unpublished case files. A permissive policy would have published all draft writing — and anything drafted about an NDA project before redaction review — to anyone holding the anon key, which is public by construction: it ships in the browser bundle as `NEXT_PUBLIC_SUPABASE_ANON_KEY`. That breaks rule 6 and the launch gate. It cannot be fixed with a join, because `translations` is polymorphic (`entity_type` + `entity_id`) and has no single parent to check.
**Consequence:** RLS with zero policies denies by default, so the *absence* of a policy is the enforcement — do not later "fix" this by adding one. `lib/supabase/client.ts` (anon) has no content role until comments arrive in Layer 3. Nothing legitimate breaks: rule 2 and decision 009 already route every content read through the server. `docs/schema.md` corrected in the same session.
**Verified:** a draft case file with a translation row was inserted and queried as `anon` — 0 rows. Positive control: after publishing, the case file became visible while `translations` stayed at 0.
**Status:** ACTIVE — supersedes the translations policy in `docs/schema.md`

### 2026-08-11 — 026 — `settings` identity, and RLS for child content tables
**Decision:** Two corrections to `docs/schema.md`, applied in migration `0001_layer0_schema.sql`:
1. `settings` is `id uuid primary key default gen_random_uuid()` + `key text not null unique`, matching its sibling `ui_strings`. Replaces `key` as primary key plus an `id uuid` bolted on by `ALTER`.
2. `chapters`, `features`, `outcomes` and `targets` get parent-derived read policies rather than being left open.
**Why:** (1) The original left the table with two identities and — critically — no unique constraint on the uuid that `translations.entity_id` must join to, so nothing prevented a translation pointing at a duplicate id. (2) `schema.md` said "repeat for every content table" but only demonstrated `case_files`. Those four tables have no `status` of their own, so a permissive policy would have exposed chapters and outcomes belonging to unpublished case files.
**Consequence:** Lookup by `settings.key` is unchanged and still index-backed. A chapter is visible only when both it *and* its parent case file are published.
**Verified:** a `published` chapter under a `draft` parent returned 0 rows to `anon`, and flipped to 1 only once the parent was published.
**Status:** ACTIVE — supersedes the `settings` definition and the RLS section in `docs/schema.md`

### 2026-08-11 — 027 — Redaction is baked into the asset before upload
> ⚠️ **SUPERSEDED 2026-08-12 by amendment 036. The premise was wrong.** Read that first — the reasoning below is sound but it protects data that does not exist.
**Decision:** NDA redaction is baked into the pixels **before** the asset is uploaded. The unredacted original **never reaches Cloudinary at all.** Cloudinary transforms handle only sizing, cropping, format and quality — never concealment. This is a security posture, not a styling preference.
**Why:** A live Cloudinary transform does not remove anything. `…/t_redacted/abc123` is a *derived* asset; the base URL `…/abc123` still returns the untouched original. Anyone who sees a redacted image URL can delete the transform segment and fetch the unredacted screen. `docs/brief.md` calls published NDA material "a hard failure regardless of any other outcome" — a guessable URL away from an unredacted Mashreq screen is not an acceptable posture. Cloudinary's strict transformations and authenticated delivery do restrict base-asset access, but they add signing to every image request and make a single misconfiguration the difference between compliant and not. Baking has no failure mode.
**Consequence:**
- The redaction treatment is produced in the design tool, not by a transform chain — which also means no Cloudinary effect vocabulary constrains the design.
- The asset **is** the record. A wrong redaction is re-exported and re-uploaded under a new `public_id`; it is never "fixed with a URL parameter".
- Rule 3 still holds: only `public_id` is stored, presets stay named.
- No reveal interaction of any kind — hover-to-unblur or click-to-reveal would imply a recoverable original, which by this decision does not exist.
- Anything that would upload an original "to transform later" is a violation, including any future admin panel or bulk-import script.
**Status:** ACTIVE — reinforces 002 and 010

### 2026-08-11 — 028 — Redacted images: never cropped, never a cover or OG image
> ⚠️ **AMENDED 2026-08-12 by amendment 037.** The guards survive; their justification changed.
**Decision:** Three constraints on redacted media, enforced structurally rather than by convention:
1. **Never cropped.** The redacted path uses a non-cropping fit and cannot be configured otherwise — `CloudinaryImage` overrides the requested preset when `media.redacted` is true.
2. **Never a case-file cover.** A redacted `cover_media_id` is rejected by a database trigger and throws in the query layer.
3. **Never the OG image.** `settings.og_image` pointing at a redacted asset is rejected by a database trigger.
**Why:** An off-centre crop can clip a mask and expose the data beneath it — the failure is silent and looks like a normal image. Covers and OG images are the two places the site's imagery travels **outside** our control, into LinkedIn and WhatsApp link previews, where it cannot be recalled. Both are exactly the "hard failure" case, so neither may depend on a component being called correctly.
**Consequence:** The `redacted` preset uses `c_fit`. Covers and OG images use non-NDA imagery only. A redacted media id in either slot **fails loudly** rather than rendering.
**Status:** ACTIVE — implements the answers to `docs/redaction-brief.md` §7

### 2026-08-11 — 029 — Approximate geography, without storing IP addresses
**Decision:** `sessions` records `country` (ISO alpha-2) and `city`, taken from the `x-vercel-ip-country` and `x-vercel-ip-city` headers Vercel resolves at the edge. The IP address is **never read by our code and never stored**. No region, no coordinates, no postal code, no timezone.
**Why:** Knowing which countries and cities the work reaches is genuinely useful and does not require holding an address. Taking geography from edge-resolved headers is stronger than resolving it ourselves and deleting the IP afterwards: there is no window in which we hold it, and no code path that could log it by accident. City is already the most identifying field in the table, so the line is drawn there — anything finer turns approximate geography into a location trail.
**Consequence:** Two nullable columns and an index on `(country, started_at desc)` for rollups. Geography is null in local development, which is correct: an unknown location beats a guessed one. Next strips client-supplied `x-vercel-*` headers in some paths, so this cannot be spoofed from a browser.
**Verified:** a request carrying `x-forwarded-for: 194.170.101.55`, `x-real-ip`, and `Referer: …?q=moataz+private+search` stored `AE` / `Dubai` and nothing else. A full-text scan of `sessions` and `events` for the address and the query string returns nothing.
**Status:** ACTIVE

### 2026-08-11 — 030 — Google Analytics, consent-gated. Our own analytics are not
**Decision:** GA4 runs, but only after an explicit accept. The GA `<script>` is not rendered at all until consent is granted — before that there is no request to Google, no `gtag`, and no cookie. The banner appears once, persists the answer, and offers accept and decline at **equal visual weight**, with decline first in the tab order. Dismissal is not consent; there is no X.
**The banner gates GA and nothing else.** The site's own Supabase analytics run regardless of the answer. They are anonymous, session-scoped, store no IP, set no cookie, and cannot follow anyone between visits, so there is nothing to consent to. Someone who declines GA is still counted in our own store, with geography.
**Why:** GA supplies a ready-made dashboard with maps and charts that would otherwise have to be built from the Supabase data, and those hours do not exist. But GA4 sets persistent cookies and processes IPs for geolocation, which cannot be reconciled with an unqualified "no IP, no fingerprinting" claim. Consent is what makes both true at once: the claim holds for everyone who declines, and everyone who accepts was asked plainly. A pre-ticked or dismissal-as-consent pattern would forfeit exactly the credibility the site is built on.
**Consequence:** Nothing loads when `NEXT_PUBLIC_GA_ID` is unset — no banner, no script. `/how-this-site-works` (Layer 2) states the four claims in plain language. The consent hook must not be reused to gate anything else without deciding that thing needs consent on its own merits.
**Status:** ACTIVE — supersedes the "do not run GA" recommendation made during 0.9

### 2026-08-11 — 031 — Analytics retention: 180 days raw, aggregates forever
**Decision:** Raw `sessions` and `events` are deleted after **180 days**. Before each delete, a monthly rollup is written to `analytics_monthly` — counts by month, country, referrer type and device — and kept indefinitely. A `pg_cron` job runs daily at 03:15 UTC.
**Why 180 and not 90:** the raw data exists to serve Layer 2's validation of archetype inference against real behaviour, and those thresholds need roughly 200 sessions per signal. At portfolio traffic that can take months to accumulate. A 90-day window would bound the data correctly but destroy the early sessions before the sample was large enough to conclude anything — bounding the data at the cost of its purpose. 180 covers two full quarters and still expires.
**Why a bound at all:** indefinite accumulation is neglect, not a posture. `city` + timestamp is the most identifying combination the system holds, and time-bounding it is what keeps "approximate location" honest rather than a slowly-growing location history.
**Why aggregates are safe to keep forever:** they carry no session id and — deliberately — **no city**. City plus month plus a small count is the combination that could narrow to a person; country cannot. Aggregates answer the year-over-year questions that motivated a longer window, without the re-identification risk that motivated a shorter one.
**Consequence:** `analytics_monthly` with RLS enabled and no policy, matching `sessions`/`events`. `prune_analytics()` aggregates *before* deleting — the order is load-bearing. Both functions are `SECURITY INVOKER` with EXECUTE revoked from `anon` and `authenticated`.
**Verified:** a 200-day-old session with events was deleted from raw while its month survived in `analytics_monthly`; a 10-day-old session was untouched; events cascaded with their session; `analytics_monthly` has no `city` column; the cron job is scheduled.
**Status:** ACTIVE

### 2026-08-12 — 032 — A chapter has as many decisions as it has
**Decision:** Chapters carry an **ordered list** of decisions, not one. New `decisions` table (`id`, `chapter_id`, `sort_order`); the decision's name and body live in `translations` under `entity_type='decision'`, fields `name` and `body`. Mirrors `features` exactly.
**Why:** Modelling one decision per chapter was wrong. Nine of ten chapters carry between one and three, and collapsing them would flatten the most valuable content in the case study — a decision block is where the trade-off is stated and defended. The name is *content*, not a label: it belongs in `translations` and may legitimately differ between languages. `egypt-acquisition/workflow` proves the point — one decision in English, three in Arabic, because the Arabic splits what the English combines.
**Consequence:** `docs/architecture.md` Part 3.1 and `docs/schema.md` amended. The existing `chapter.decision` translation field is left in place and unused rather than dropped — removing it would break nothing today but would silently discard any content still written against it. Arabic is paired **by position and only when the counts match**; a mismatch skips the Arabic and reports it, because pairing across different counts attaches the wrong Arabic to the wrong decision.
**Status:** ACTIVE — amends the chapter model in Architecture v2.0

### 2026-08-12 — 033 — Comparison and Accessibility are chapters with a `kind`
**Decision:** Standalone case-file pages — the two Comparisons and the Accessibility page — are stored in `chapters` with `kind` in (`chapter`, `comparison`, `accessibility`). They are excluded from the numbered narrative and from the linear view, and the query layer returns them as a separate `pages` array.
**Why:** Everything about them *is* a chapter — same parent, same slug uniqueness, same route shape, same status, same hero media, same translations. Exactly one thing differs: they are not part of the sequence. A parallel table would duplicate the whole structure to express that one difference, and would need every query written twice.
**Consequence:** `sort_order` is meaningless for them and stays 0. Three pages that were previously synced as nothing are now reachable at `/work/egypt-acquisition/{web-vs-mobile-onboarding, web-vs-mobile-portal, accessibility}`.
**Status:** ACTIVE

### 2026-08-12 — 034 — Rule 3 allows an explicitly EMPTY decision set
**Decision:** Rule 3 ("`role` and `decision` required before a chapter publishes") is amended: a chapter may publish with **zero** decisions, but the absence must be explicit — the chapter genuinely has none — rather than a field nobody filled in.
**Why:** `cervello/method` is complete and good, and it argues in **principles** rather than decisions. Those are different things: a decision resolves a specific problem or feature; a principle is a standing rule that governs many decisions. Relabelling one as the other to satisfy a parser would corrupt the content to fit the tool, which is backwards. The rule exists to prevent a case file publishing without the "I" — and a chapter that states four principles in the first person is not missing the "I".
**Consequence:** The publish check tests for a *decided* decision set, not a non-empty one. `cervello/method` publishes with zero and gains a Decision section later without a migration. This is a considered exception, logged so it is not mistaken for the rule quietly weakening.
**Status:** ACTIVE — amends non-negotiable 3

### 2026-08-12 — 035 — Analytics retention: 360 days
**Decision:** Raw `sessions` and `events` are kept **360 days**, then deleted. Monthly aggregates by country, referrer type and device are kept indefinitely. `pg_cron` runs daily at 03:15 UTC: aggregate, then prune.
**Why:** Supersedes the 180-day window in decision 031. A full year of raw data covers year-over-year comparison at the raw level and gives Layer 2's archetype validation the widest sample it can get while still expiring. The bound still matters — `city` + timestamp is the most identifying combination held, and time-bounding it is what keeps "approximate location" honest.
**Consequence:** `prune_analytics()` updated. Aggregates carry no session id and no city, so nothing re-identifiable outlives the window.
**Status:** ACTIVE — supersedes the window in 031

### 2026-08-12 — 036 — The NDA treatment is a signal, not concealment. Supersedes 027.
**The premise 027 was built on was wrong.** The Mashreq screens are **design files containing dummy data the designer wrote himself while designing**. They are not production screenshots and contain no customer information. There is nothing to conceal and there never was.

**Decision:** NDA work renders **full grayscale** via a live Cloudinary transform (`e_grayscale`). Non-NDA work renders in full colour. The screen stays completely legible — the desaturation is a precautionary signal that the work sits under an NDA, not an attempt to hide anything.

**Why the original reasoning no longer applies — read this before reinstating anything.** 027 required baking the treatment into the pixels before upload, because a live transform leaves the original fetchable at its base URL. That was correct *given a secret to protect*. With dummy data there is no secret: the "unprotected original" is a design file with invented values, and stripping the transform reveals a fully legible screen the designer is happy to show. The constraint solved a problem that does not exist, and it cost real things — no live transform, no global restyle, a re-export and re-upload for every change.

**Driven by `case_files.nda`, not `media.redacted`.** The NDA belongs to the **client relationship**, not to individual files. One flag per case file — Egypt, Neobiz and UAE true; Cervello and everything else false — rather than a flag on every image that someone has to remember to set. The flag is stamped onto each `Media` object by the content layer, so no component prop carries it and no call site can omit it. A treatment that depends on being passed correctly is a treatment that will eventually be missed on one page.

**Consequence:** The contrast is the explanation — grey work is under NDA, colour work is not, and the gallery makes that legible without a caption. The `redacted_notice` badge stays, because it is what makes the treatment read as deliberate rather than as a washed-out image. `docs/redaction-brief.md` open question H is closed.

**One thing that could not be built as described:** "grayscale with the accent blue preserved" *inside* the image is not achievable — Cloudinary has no selective-hue effect, and nothing desaturates every colour except one. What exists is full grayscale, uniform partial desaturation (which mutes every colour rather than keeping one), or a duotone that tints the whole image blue and costs legibility on a UI screenshot. Full grayscale is used and the accent is preserved in the **frame** — the badge and border — where a signal belongs. Duotone is a one-line change in `lib/media/presets.ts` if preferred.
**Status:** ACTIVE — supersedes 027

### 2026-08-12 — 037 — The structural guards survive, on new grounds
**Decision:** NDA images are still never cropped, never a case-file cover, never the OG image. The database triggers and the preset override stay exactly as built.
**Why the justification had to change:** each guard was originally protecting against exposure — a crop clipping a mask, an NDA screen reaching a LinkedIn preview. With no data to expose, that reasoning is gone. They are kept because each still prevents a real and different problem:
- **Never cropped** — a design screen cropped off-centre loses the composition, which is the actual subject of a design case study.
- **Never a cover or OG image** — these travel outside the site, into link previews that cannot be recalled. A precautionary NDA signal is worth keeping intact precisely where the context is stripped away and nobody can see the badge.

**A guard kept for a reason nobody wrote down is a guard that gets deleted by the next person who reads it as cargo cult.** Hence this entry.
**Consequence:** `media.redacted` and `case_files.nda` now do different jobs, and both are needed: `nda` drives the **visual treatment** for every image in a case file; `redacted` marks an **individual asset** as never-cropped, never-cover, never-OG. An NDA case file can therefore still have a cover — it renders grayscale like everything else in it, which is exactly the gallery contrast the treatment is for.
**Status:** ACTIVE — amends 028

---

## 038 — An entry handle that names no chapter renders as text

*2026-08-12*

**Decision:** `entry_handles.target_chapter_id` is nullable, and the sync fills it **only** when a handle's pointer names a chapter unambiguously — either by exact title (`Application workflow → Craft`) or by position (`Chapter 2`). Everything else stays null and the handle renders as plain text.

**Why:** the three handles are written as prose, and their pointers are not a uniform field. Three genuinely different cases appear in the source today:

| Case | Example | Resolves? |
|---|---|---|
| Names a chapter by title | `Onboarding journey → Decision.` | ✅ |
| Names a chapter by position | `Chapter 2.` | ✅ |
| Names something that is not a chapter | `Results table → What broke.` | ❌ |
| Names nothing at all | all three UAE handles | ❌ |

Guessing the third case is the failure this project keeps guarding against, in a new costume: the nearest chapter is not the chapter the sentence points at, and a link built from a guess sends a reader somewhere the author never sent them. **A wrong link is worse than no link** — no link is visibly incomplete, whereas a wrong one is invisibly false.

The obvious objection is rule "no dead ends". It does not apply: the living map sits directly beneath the handles and lists every chapter, so a reader who wants the destination has it one element away.

**Consequence:** UAE shows three handles and zero links; Egypt shows three and two links; Neobiz shows three and three. The dry run reports every unresolved pointer by name, so the gap is visible and fixable in Notion rather than silent.

**Status:** ACTIVE

---

## 039 — Sibling links are directed, and declared on the cover that points

*2026-08-12*

**Decision:** `case_file_siblings` is a directed edge, not a symmetric pair. A cover declares its own siblings with a `Sibling case file: [Title] and [Title] — note` line, and the note belongs to the pointing cover.

**Why:** the relationship is not reciprocal in meaning even when it is in fact. UAE points at both Egypt files to say "the same requirement, in a market without the infrastructure" — an argument that reads in one direction. Egypt pointing back would be a different sentence, and might be one worth not making.

**Consequence:** UAE has two siblings. **Egypt currently has none** — decision 004 describes Egypt and Neobiz as siblings, but no `Sibling case file:` line exists on Egypt's cover in Notion, so nothing was written. Content gap, not a code gap; flagged in `docs/status.md` rather than invented here.

Both ends must be published for the link to appear, enforced in the RLS policy and again in the query layer, because the service role bypasses RLS.

**Status:** ACTIVE — implements the cross-links promised in decision 004

---

## 040 — Checks report on MVP-1 only

*2026-08-12*

**Decision:** every check that scans the content database — route collisions, empty rows, missing tables — considers only rows flagged `In MVP-1`. A row parked for a later layer cannot report a problem, and cannot block a row that ships.

**Why:** the Cervello route collision was between a finished MVP-1 cover and a Layer 3 row with no content, deliberately parked. The parked row aborted the cover **and its seven chapters**, and the report read as a genuine content fault. A check that fires on deliberately-parked content spends attention and buys nothing; worse, it trains you to skim the failure list, which is where the real failures live.

**Consequence:** `findRouteCollisions` takes `inMvp` per claim and ignores parked ones. `--all` still widens what is *synced*; it no longer widens what is *reported*. Notices route through a gate keyed on row title. **Failures are not gated** — if a parked row is actually being written and the write breaks, that is still a broken write.

Stated trade-off: two parked rows colliding with each other is not reported. Intended — it is a problem about content nobody is building, and it surfaces the moment either row joins MVP-1.

**Status:** ACTIVE — closes open question C

---

## 041 — Absence is content, not a gap

*2026-08-12*

**Decision:** the sync does not report the absence of optional content. Entry handles, sibling links and outcome tables are editorial; a case file without them is complete.

**Why:** three of these were being reported as problems and none of them was one.

- **Neobiz has no results table.** Deliberate: the product is designed and internally validated but not built, so it makes design claims only, and any completion-time or conversion figure belongs to the Egypt web case file. Its cover says so.
- **Cervello has no outcomes.** Its `Status, honestly` section states that the cloud version shipped and the numbers belong to the customers running it.
- **A cover without entry handles or siblings** is simply a cover that does not use them.

The check that survives is narrower and better: report only when there is **neither a table nor a statement about its absence** — a silence that could equally mean "the table is under a heading we don't recognise", which is the case actually worth catching. A cover that declares its position has answered the question.

**Consequence:** notices dropped from 12 to 7, and every remaining one is actionable.

**Status:** ACTIVE

---

## 042 — The Results Table lives at `/work/[caseFile]/results`, and has no red

*2026-08-12*

**Decision:** the route is a static `results` segment beside `[chapter]`, so no chapter slug can shadow it. The page 404s for a case file with no declared targets, and `generateStaticParams` covers only case files that have them.

`missed` is **not** styled as an error. The palette has one accent and the standing rule that colour is never the sole indicator of a state, so the label carries the meaning and the styling only sets emphasis: accent for achieved, full-strength foreground for missed, dimmed for not-measurable.

**Why the last part matters:** six of the eleven target rows across both case files are `not-measurable`, because a controlled release has no commercial launch to measure against. Colouring those like failures would misreport the work — in the direction of self-criticism, which is no more honest than the flattering direction and is the louder mistake on a page whose whole credibility comes from being even-handed.

**Consequence:** Egypt and Neobiz have results tables, linked from their covers. Cervello and UAE 404 there and link to nothing, correctly. Rendered as a real `<table>` with `scope` attributes — this is tabular data, and a stack of divs would look identical and navigate far worse.

**Status:** ACTIVE — implements decision 024

---

## 043 — Static page prose lives in `page_sections`, not `ui_strings`

*2026-08-12*

**Decision:** About, Philosophy, Systems and Contact store their copy in a `page_sections` table — a row per section carrying `page`, `slug` and `sort_order`, with `heading` and `body` in `translations`.

**This amends the sync contract, Step 1**, which routed static page content to `translations` with `entity_type = 'ui_string'` scoped by route. `docs/sync-contract.md` has been corrected in the same session.

**Why the contract's mapping could not work:** these are not a handful of labels. They are five to seven ordered sections each, every one a heading plus several paragraphs, and **the order is load-bearing** — About runs Now → Before → The Artist's Book → What that year actually taught me, which is a chronology and an argument. `ui_strings` has no `sort_order`, so order would have had to be encoded into key names (`page.about.03-the-artists-book`), putting sequencing inside a string and making an insertion a rename of every key after it.

Heading and body are separate fields because **the heading is content**. "What that year actually taught me" is written, not a label, and it needs Arabic like everything else.

**Consequence:** the sync's static-page branch is implemented rather than reported as missing. 22 sections across the four pages. Landing and the Classic Gallery stay on `settings`/`ui_strings` — they have no ordered prose, and writing empty section rows for them would put a headingless, bodyless section on two finished pages.

**Status:** ACTIVE — amends sync-contract Step 1

---

## 044 — Contact form delivery: three options, none chosen

*2026-08-12*

**Decision:** the form is built and rendered; **delivery is not implemented**, and `ContactForm` takes `deliveryConfigured` rather than assuming one. While it is false, the submit button is replaced by the direct email link.

**Why not just pick one:** every option stores or forwards a name, an email address and a message body. The standing rule on this project is that privacy is a hard constraint rather than a default — anything collecting more than the minimum gets flagged, not implemented — and creating a store of personal data is reversible only in the sense that rows can be deleted after they exist. This is a decision, so it is presented as one.

`CONTACT_DELIVERY_CONFIGURED` is a constant in the page rather than an env var, deliberately: the missing piece is a decision, and an env var would let it be switched on without one being made.

**The options, with what each actually costs:**

| | Where it goes | Cost | Privacy | Effort |
|---|---|---|---|---|
| **A — Supabase table** *(recommended)* | `contact_messages` in the existing database | £0 | Data stays in infrastructure already held and already governed by the retention policy. No third party. Needs a retention window — 360 days matches decision 035 | ~1 hour: table, RLS, `/api/contact`, rate limit |
| **B — Email service** (Resend / Postmark) | Straight to the inbox | Free tier covers this volume | A third party processes every message. One more API key | ~1 hour |
| **C — Both** | Table + notification | As B | As B | ~1.5 hours |

**A is the recommendation:** the notification in B is the only thing A lacks, and a portfolio contact form that is checked daily does not need one. A also keeps every message inside the same privacy posture already documented on `/how-this-site-works`, rather than adding a processor that page would then have to disclose.

Whichever is chosen, the form needs a spam control before launch — a honeypot field and a rate limit are enough at this volume; a CAPTCHA is a third-party tracker and is not.

**Status:** OPEN — replaces open question D with three costed options

---

## 045 — Arabic typefaces: LANTX for headings, Meral Sans for body

*2026-08-13*

**Decision:** LANTX (display, headings) and Meral Sans (text, body), self-hosted as woff2 via `next/font/local`. Latin is untouched — Geist and Geist Mono exactly as they were. **Closes open question F** and replaces the Geist interim of decision 020.

`--font-arabic` became two tokens, which is the swap decision 020 kept it separate for.

**Format.** The files arrived as `.otf` (LANTX) and nine `.ttf` weights (Meral) and were converted: **112 KB total as woff2, down from 282 KB**, a 59–72% reduction. Only the four Meral weights the scale can request (400/500/600/700) ship; the other five (thin, extralight, light, extrabold, black) are ~23 KB each of nothing the scale asks for.

**Three things the fonts themselves forced:**

1. **Geist sits behind both Arabic faces.** Not defensive — load-bearing. LANTX contains **no Latin letters**, and the Arabic copy deliberately keeps technical terms in English per the convention in `docs/ui-strings-review.md`. `Cervello Cloud — منصة IoT` is a real heading. Meral also lacks `U+2190 ←`, which appears in body copy as `Instance ← Organisation ← Team ← Project`. Both were found by testing coverage against every Arabic character in the database, not by inspection.
2. **LANTX ships one weight, and synthetic bold is refused.** Headings are 600 sitewide; a browser asked for 600 from a 400-only family smears the outlines, which on Arabic thickens the joins between letters until they close. `font-synthesis-weight: none`, weight 400, hierarchy from size — how Arabic display faces are normally used.
3. **Arabic needs more leading, not the same.** Meral's descender is -0.51em against Geist's -0.29em. Body 1.9, headings 1.45.

**The scale is adjusted per script, in three factors** — `--type-scale-small` 1.30, `--type-scale` 1.15, `--type-scale-display` 1.00. Measured from `ه` against Geist's x-height; full reasoning in `docs/design/tokens.md`. The display factor is a fit decision rather than a legibility one, and it came from looking at the rendered results table, not from the measurement.

**Consequence:** the overrides live in an **unlayered** `:root:lang(ar)` block. A layered one loses to `:root` regardless of specificity — the variable read back as `1` and the entire adjustment silently did nothing while looking correct.

**Status:** ACTIVE — closes open question F, replaces decision 020's interim

---

## 044 — CLOSED: contact delivery is a Supabase table

*2026-08-13 — amends the 2026-08-12 entry above*

**Decision:** option A, implemented. `contact_messages` + `/api/contact`, writing through the service role. RLS enabled with **no policy**, matching the operational tables — nothing about a contact message is publicly readable. Retention 360 days, folded into the existing daily prune so one function answers "what does this site delete, and when".

**Spam control without an IP.** The obvious control is a per-IP rate limit, and it is not available: decision 029 commits to the IP being "never read by our code and never stored". Reading it to protect a form would break that commitment.

> ⚠️ **Correction, 2026-08-13.** The original wording of this entry said the promise "is published on `/how-this-site-works` in both languages". **It is not published anywhere today.** `/how-this-site-works` is a Layer 2 page and does not exist, and the four `privacy_*` strings seeded by migration 0009 (`privacy_no_ip` = "I never store IP addresses") are resolved by no component — only `consent_message` renders. The engineering decision stands unchanged and is if anything more clearly right: the commitment is one this project made to itself, and keeping it when nobody is checking is the whole point. But the justification as written overstated the current state, and this file is the tie-breaker, so it is corrected rather than left to be discovered.

Instead of an IP limit:

- **Honeypot** — hidden field, `aria-hidden` and `tabIndex -1` so a screen-reader user cannot fill it by accident. Filled means bot, and the response is a normal 200: telling a spammer they were rejected only tells them what to change.
- **Timing** — a form rendered and submitted in under 3s was not typed. Upper bound 2h, after which the tab was left open and the timestamp means nothing.
- **Global in-memory ceiling** — 20/hour per instance, held in a variable, never persisted.

**Stated trade-off:** a global limit means one spammer can exhaust the window for everyone. Acceptable at this volume, and the usual next step — a CAPTCHA — is a third-party tracker and is not an option on this site.

`CONTACT_DELIVERY_CONFIGURED` stays a constant rather than becoming an env var. The reasoning that kept it one while the question was open still holds: this is a decision about where personal data goes, and it should be visible in a diff.

**Status:** ACTIVE — closes open question D

---

## 046 — The Motion Layer: `motion-system.md` v2.0 adopted, v1 dropped

*2026-08-13*

**Decision:** `docs/design/motion-system.md` **v2.0** is the source of truth for every animated and interactive surface on the site. It supersedes **Motion System v1** — the cursor-tracked spotlight system — in its entirety. Nothing of v1's driver survives.

**Why v1 was dropped: it depended on a pointer.** The spotlight was the primary visual language and it followed the cursor, so it existed only for a visitor with a mouse. On touch there is no hover state to track; on keyboard navigation there is no pointer position at all. The site's own accessibility posture makes that disqualifying — a design language available to roughly half the audience is not a design language, it is a desktop enhancement pretending to be one. v2 keeps the useful idea (what is attended to renders at full clarity, the rest dims) and changes the driver to camera position, which every input method produces. There is no degraded mode because there is no pointer dependency left to degrade.

Carried forward from v1 unchanged: the density prohibition, no colour signalling urgency, one focal pulse per page, count-up on `[achieved]` figures only (decision 007), and full `prefers-reduced-motion` compliance. Those were right; only the driver was wrong.

**Consequence:** `docs/design/motion-system.md` joins the documentation set and is the doc to read before writing any animation. The camera grammar is closed at six moves — a route that fits none of them is a signal the route is misplaced in the architecture, and the architecture is what gets fixed. The layer requires the two token amendments in decision 048.

**Status:** ACTIVE — supersedes Motion System v1

---

## 047 — Decision 023 is scoped to MVP-1. The Motion Layer is permitted after the launch gate, behind a flag

*2026-08-13*

**Decision:** decision 023 ("MVP-1 is deliberately plain") applies to **MVP-1 only**. It is not a permanent prohibition on motion, and it was never argued as one — its stated reason is protecting the 6–9 week target, which expires when the target is met. The Motion Layer of `docs/design/motion-system.md` is permitted **after the launch gate in `docs/manifesto.md` passes**, and only then.

**Two conditions, both required:**

1. **The gate, in full.** Every box in Phase 2 of `manifesto.md` ticked — all four Case Files complete, the metric truth table applied, no unredacted NDA material, RTL verified, the LLM summary test passed, Lighthouse acceptable, the domain cut over. Not "mostly passing". The gate is the permission.
2. **Behind one feature flag.** The entire layer, one switch. If it degrades the site it goes off in a single commit and MVP-1's behaviour is exactly what remains. That reversibility is what makes it responsible to build at all, and it is a condition of building it, not an implementation detail to add later.

**Why scope it explicitly rather than leave it implied:** 023 is cited across `architecture.md`, `redaction-brief.md`, `status.md`, and `tokens.md` as the reason something is plain. Read as permanent, it forbids work already planned as Layer 2. Read as MVP-1-scoped, every one of those citations stays correct — they all describe MVP-1. The ambiguity was doing real damage in one direction and none in the other.

**What does not change:** MVP-1 ships plain. Nothing in `motion-system.md` may be partially implemented inside it — not a prototype, not one page, not "just the field". Half a camera system is worse than none, and a partial implementation is how a scoping decision becomes a scope leak. Decision 023 remains ACTIVE and its behaviour in `tokens.md` is untouched.

**Consequence:** the Motion Layer sits alongside Layer 2 in `docs/roadmap.md` on the same Layer 0 foundation, with no rework — the field is a sibling layer to the DOM, not a rebuild of it. It adds **no** work to Phase 0 or Phase 1 and nothing enters `TASKS.md` until Layer 2 starts, per the roadmap's tracking rule.

**Status:** ACTIVE — scopes 023, which remains ACTIVE

---

## 048 — `transform` is scoped to the camera and field layers; navigation gets its own duration scale

*2026-08-13*

**Decision:** two amendments to the MOTION section of `docs/design/tokens.md`, both required by decision 046 and neither affecting MVP-1's rendered behaviour.

**1 — `transform` is re-scoped, not unbanned.** The old rule read "**Never** `transform`, `width`, `height`, or `box-shadow`". It was written before the Motion Layer existed, and the camera is composited entirely from `transform` — so as written it forbade the layer outright. The rule is now:

> `transform` is permitted **only** on the camera and field layers of the Motion Layer, alongside `opacity`. **Content-level components never transform** — in MVP-1 and after it.

The boundary is the layer, not the phase. `width`, `height`, and `box-shadow` stay forbidden everywhere, for the reason they always were: they cost layout or paint on every frame. A component that wants to move is asking for the camera, and it gets the camera.

**2 — a navigation duration scale.** `--duration: 150ms` is a state-change token and cannot express a camera move. Four durations and four easings, one pair per move in the closed grammar, named semantically per the OUTPUT rule — `--duration-nav-pan`, `--duration-nav-zoom-in`, `--duration-nav-zoom-out`, `--duration-nav-lift`, and `--ease-nav-*` alongside them. Values are the midpoints of the ranges in `motion-system.md` §3.4; the ranges are tuning windows, and leaving one is a decision rather than a token edit.

**The 900ms ceiling is a hard bound**, recorded in `tokens.md` as such. No navigation token exceeds it at any breakpoint, in any theme, for any move.

**`prefers-reduced-motion: reduce` zeroes the new tokens the same way it zeroes `--duration` today** — a token override in one place, never a per-component media query, never a per-move exception. Zeroing them is exactly what produces the **Cut** move of §3.2. Easing tokens are untouched, since a zero-duration transition never samples its curve.

**Why now, before any of it is built:** `motion-system.md` §0.3 requires these logged as decisions rather than assumed at implementation time. Amending the tokens now removes a contradiction from work that is already scheduled; deferring it would mean discovering mid-build that the token file forbids the layer, and resolving it under time pressure.

**Consequence:** the new tokens are **declared but inert**. Nothing in MVP-1 reads them and defining them is not permission to use them — the layer is behind the flag from decision 047. `docs/design/tokens.md` is amended; no application code changes.

**Status:** ACTIVE — amends decision 018's token set, required by 046

---

## 049 — Case file covers are inline SVG components, not Cloudinary assets

*2026-08-13*

**Decision:** the four case file covers are conceptual artwork built as **inline SVG React components in `designs/`**, bound to the design tokens. They are not uploaded to Cloudinary and do not render through `CloudinaryImage`. `case_files` gains `cover_kind` (`media | component`) and `cover_component`, mutually exclusive with `cover_media_id` via CHECK (migration 0026). Egypt Acquisition is the first.

**Why, and why it is not reopenable:** an SVG inside an `<img>` is an isolated document. It cannot read the page's CSS, so no `--color-*` variable resolves and the artwork cannot follow the theme. **Token binding and Cloudinary delivery are mutually exclusive**, and token binding won — one artwork that inverts with the theme, with no JavaScript and no second light-mode file, beats two rasters that drift.

**Why a column rather than an inferred NULL.** Leaving `cover_media_id` NULL and inferring "it must be a component" makes a case file that has no cover yet indistinguishable from one whose cover is code. `cover_kind` states it. The decision is data; the implementation stays code — the same split already used for media, where the `public_id` is data and the transform preset is code. An unresolvable `cover_component` **throws** at render, for the reason `assertNotRedacted` throws: a silently-dropped cover looks like a missing image and gets ignored, a thrown error gets fixed.

**The redaction triggers are not bypassed — they are inapplicable.** A component cover leaves `cover_media_id` NULL, so `assert_cover_not_redacted` (migration 0007, decision 028) passes trivially and *correctly*: the risk it exists for is a raster of a real screen escaping into a link preview, and a schematic drawn entirely from tokens has no NDA surface to leak. Recorded in the migration comment as well as here, because the next person to read `cover_media_id IS NULL` on a published case file will reasonably wonder whether the guard was dodged. It was not. The guards on `settings.og_image` and `media.redacted` are untouched and still load-bearing.

**`og_image` stays a raster.** Link previews cannot render SVG at all, so a PNG export is a technical floor, not duplication. `settings.og_image` and its trigger are unchanged.

**Consequence:** `designs/` is a new top-level folder holding artwork components and the registry. The other three covers follow this pattern. Reflow is not permitted — one composition, scaled by its `viewBox`, from a 280px card to full container width.

**Status:** ACTIVE — extends decision 010 (Cloudinary for media) with a stated exception; requires 050

---

## 050 — Component covers take no NDA grayscale. The badge carries the signal

*2026-08-13*

**Decision:** the **grayscale half of amendment 036 does not apply to component covers**. An NDA case file with `cover_kind = 'component'` renders its artwork in full token colour, including the single accent. The NDA signal on that card is carried entirely by the `redacted_notice` badge.

**Why.** Three reasons, and the first alone settles it:

1. **Mechanically it cannot apply.** The grayscale is a Cloudinary transform (`e_grayscale`) driven by `case_files.nda`. A component cover never passes through Cloudinary. There is no stage at which the transform could run.
2. **It has nothing left to signal against.** Amendment 036's argument is *contrast* — "grey work is under NDA; colour work is not… the gallery makes that legible at a glance". **Three of the four published case files carry `nda = true`** (Egypt Acquisition, Neobiz Mobile, UAE Acquisition; only Cervello does not). Once all four covers are token-drawn artwork in the same two-token palette, there is no colour cover for a grey one to contrast against. The signal was never *grey*; it was *grey beside colour*, and that pairing does not survive.
3. **There is nothing to conceal.** The artwork contains no client pixels — it is a schematic of chapter names already published as prose on the site. Desaturating it would signal caution about a diagram that discloses nothing.

**What still carries the signal:** the badge, which `ProjectCard` already renders from `case_files.nda` independently of the image, and which the code already describes as *"the half that always works"* — because grayscale alone signals by colour only, which the accessibility baseline forbids and which vanishes on a greyscale display. That reasoning now carries the whole load rather than half of it.

**The rule this sets for the remaining three covers:** a component cover may depict **only what is already published in prose on the site**. Chapter names, system names, and structure that a visitor can already read. Nothing drawn from a real screen, no layout traced from a client artefact, no figure that is not in the database. That is what keeps "no NDA surface" true rather than merely asserted.

**Consequence:** `docs/design/tokens.md`'s NDA section describes the Cloudinary path only and now needs a line scoping it to `cover_kind = 'media'`. Amendment 036 is otherwise unchanged — evidence images inside chapters still desaturate, and that is where the treatment does its work.

**Status:** ACTIVE — scopes amendment 036 to media covers and chapter evidence

---

## 051 — 044 amended: storage is the record, not the notification. The CV flow forced it

*2026-08-15 — amends decision 044*

**What option A was.** Delivery *is* the row. `/api/contact` inserts into
`contact_messages`, returns `ok: true`, and Moataz reads the table in the Supabase
dashboard. Chosen deliberately in 044 over an email service, on the argument that it
adds no third-party processor and keeps every message inside infrastructure already
governed by the retention policy.

**What it now is.** The insert stays exactly as it is and remains the system of
record. **An email notification to Moataz is added on top of it**, on every
submission of either kind. Email is a notification layer over storage and never a
replacement: if mail fails, the row is still there and the visitor still sees
success.

**Why the CV flow forced it.** 044's reasoning has a hidden premise — *"a portfolio
contact form that is checked daily does not need one"* — and the CV request panel
breaks it. The panel tells a recruiter *"Thanks — I'll reply soon"*. That is a
promise made by the site, in the site's voice, and under option A nothing at all
tells Moataz it was made. A contact form that sits unread for a week is untidy; a CV
request that sits unread for a week is the site lying to the exact visitor the site
exists to reach. The polling model was tolerable only while nothing depended on
latency, and the CV flow depends on latency.

**What this costs, stated rather than buried.** 044's central argument was that
option A introduces **no third-party processor**. Adding a provider ends that, and
message contents will transit one. `/how-this-site-works` is unbuilt and the four
`privacy_*` strings render nowhere, so there is no page to correct today — which is
exactly how a disclosure gets lost. It is recorded here so the page inherits a
correct processor list whenever it is built. The header comment on migration
`0024_contact_messages.sql`, which asserts no new disclosure is needed, becomes
false on implementation and is corrected in the same change.

**Constraints this amendment fixes, whatever mechanism is chosen:**

- Insert first, then send. Mail failure must never turn a stored message into a
  visitor-facing error.
- The failure must be **durably** findable — not only a log line, which is ephemeral
  and does not exist at all before deployment.
- The notification distinguishes a CV request from a general enquiry, because they
  need different reactions.
- No `Reply-To` built from unvalidated input. The visitor's address is body content,
  not a header.
- Secrets are server-side only. Never `NEXT_PUBLIC_`.
- Nothing is sent to the visitor — no auto-reply, no confirmation. The CV is never
  attached and never sent automatically. Moataz replies himself; that is the design
  of the flow, not a limitation of it.

**Rule 1 boundary, decided here so it is not re-argued.** Rule 1 governs what a
**visitor** reads. An operator notification is an operational artifact, and its
scaffolding is plain English in code. The one exception is the **subject label**,
which is the visitor's own choice from a `ui_strings` list and is resolved from the
database, so the notification and the site never describe that choice differently.

**Mechanism: Resend, called from the route with `fetch`, no SDK.** Approved
2026-08-15 and implemented the same day.

Resend because it is the only provider that works **with no domain**: its sandbox
sends from `onboarding@resend.dev` to the account's own signup address and nowhere
else. That restriction normally disqualifies it in production; here it fits exactly,
because the only intended recipient in the whole design is Moataz. Postmark and the
rest refuse `outlook.com` as a sender signature and need a verified domain, which
does not exist yet.

**No dependency.** The REST endpoint is one POST with a bearer token and a JSON
body — precisely what the `resend` package wraps. `package.json` is unchanged.

**Three env vars, none `NEXT_PUBLIC_`:** `RESEND_API_KEY`, `CONTACT_NOTIFY_TO`,
`CONTACT_NOTIFY_FROM`. All three unset is a supported state, not a crash: the row is
still written, the visitor still sees success, and `notify_error` records
`not configured`. When the domain is bought, `CONTACT_NOTIFY_FROM` changes and no
code changes.

**A security property worth recording:** while the account has no verified domain,
the key is only capable of emailing Moataz. A leak could not be used to send mail to
anyone else.

**Failure is recorded on the row, not only in a log** — `notified_at` and
`notify_error`, migration 0029. Vercel's runtime logs are ephemeral and absent
entirely before deployment, and a log line cannot be joined to the message it failed
to announce. `where notified_at is null` answers "who did I never hear about?".

**Status:** ACTIVE — amends 044. Mechanism decided and built.

---

## 052 — The Cloudinary cloud name is committed. It is configuration, not a secret

**2026-08-19.**

`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` was unset in the Vercel project. It cost nothing
while `media` had no rows. The moment the first cover row existed, `getCldImageUrl`
threw during server rendering and `/work` returned 500 to a real visitor — the first
page this site has ever served broken in production.

**The value is now committed** in `lib/media/cloud.ts` as a default. It is public by
construction: `vewhrkzj` is the first path segment of every image URL the site serves,
visible in the page source of any page carrying an image. Rule 5 governs secrets — a
key that grants access — and this grants none.

**A module constant, not a `next.config.mjs` `env` entry.** `next-cloudinary` reads
`process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` inside its own bundled code, and
whether that reference gets substituted at build time is a property of the bundler
rather than of this repo. `CloudinaryImage` now passes the cloud name explicitly as
`config.cloud.cloudName`, which the library prefers over its own environment read, so
the URL builder depends on nothing but an import.

**Not a committed `.env` file**, which would be the more idiomatic Next mechanism.
`.gitignore` ignores `.env*` with a single exception for `.env.example`, and adding a
second exception would turn a pattern that cannot be got wrong into one that can. The
service-role key sits behind that pattern. Configuration convenience does not outrank
it.

**A real environment variable still wins** — the config reads `process.env` first and
falls back. Setting the variable in Vercel remains the correct move; it is now an
override rather than a prerequisite.

**Related, same session:** `CloudinaryImage` now omits an image when the cloud name is
absent instead of throwing, which is what `docs/status.md` always claimed it did. A
misconfiguration should cost the image, not the page.

**Status:** ACTIVE.

---

## 053 — Layout direction comes from the locale. Text direction comes from the language of the text

**Decision:** two different things were being called "direction", and they now have separate sources.

- **Layout direction** — which side a margin sits on, which way an arrow points, where a rail lives — comes from the **locale segment**, is set once as `dir` on `<html>` in `app/layout.tsx`, and **no component may read it, set it, or branch on it.** That rule is unchanged and absolute.
- **Text direction** — which way a run of characters reads — comes from **the language that text is written in**, and is set as `dir` + `lang` on the element carrying it.

**Why:** decision 013's fallback serves English when a locale has no translation, which is correct and stays. But the fallback text was being rendered as though it were Arabic. Latin prose inside a `dir="rtl"` container resolves its trailing punctuation to the wrong visual side, so a sentence rendered as `.This is where the whole design meets its limit` and the paragraph aligned right. Counted on 2026-08-19: **73 paragraphs and 31 captions** across nine Arabic chapter pages. Every structural check passed on all of them — the DOM was correct, the counts were correct, and it only read wrong.

**Why this does not weaken the rtl-guard rule.** That rule exists so no component hardcodes a screen side; it is about layout. This is about content language, which is what the HTML `dir` attribute is for and what it has always been for. The codebase already did this once, correctly, before the rule was written down: `app/[locale]/(site)/contact/page.tsx` sets `dir="ltr"` on an email address so it does not mangle in Arabic.

**The test that separates them:** if the answer depends on *which page you are on*, it is layout and comes from the locale. If it depends on *what the words are*, it is text and comes from the language.

**How the language is known — not by sniffing.** `lib/content/translate.ts` already resolved English as a floor and let the requested locale overwrite it; a field is a fallback exactly when the first pass set it and the second did not. That fact was computed and discarded. `resolveManyDetailed` now returns it as `fieldLocales`, and `withFields` attaches it to every row. **One extra map, no extra query.**

Detecting the language by looking for Latin characters was rejected outright. Arabic prose on this site deliberately keeps `Governance`, `OTP`, `KYC`, `RTL`, `NDA` and `LinkedIn` in Latin — decision 045 makes Geist load-bearing behind both Arabic faces for exactly that reason — so a heuristic would flip most Arabic paragraphs on the site.

**Consequence:** `Media` carries `fieldLocales`; `ChapterBlock` carries `lang`; `ChapterSection` carries `headingLang`. `dirForLocale()` in `lib/content/types.ts` is the one place a language maps to a direction. `docs/design/tokens.md` and `.claude/skills/rtl-guard/SKILL.md` both state the boundary. Elements are marked from their own language unconditionally, so an English page emits `dir="ltr" lang="en"` too — redundant and honest, rather than a branch on the page's locale.

**Status:** ACTIVE — refines the rtl-guard rule rather than overriding it

---

## OPEN — NOT YET DECIDED

| # | Question | Blocks |
|---|---|---|
| B | Mini case files — in MVP-1 or cut? | Gallery scope |
| ~~C~~ | ~~Stale Cervello rows — route collision~~ | *Closed by decision 040 — the parked row is out of scope, not a competing claim* |
| ~~D~~ | ~~Contact form delivery~~ | *Closed 2026-08-13 — option A, built with honeypot, timing check and rate limit* |
| E | Ask layer: lead capture yes/no; answer boundaries | Layer 4 |
| ~~F~~ | ~~Permanent Arabic typeface~~ | *Closed by decision 045 — LANTX headings, Meral Sans body* |
| G | ~~`settings` table shape~~ | *Closed by decision 026* |
| ~~I~~ | ~~Analytics retention window~~ | *Closed by decision 031 — 180 days* |

*Question A (visual language) closed by decision 018.*
