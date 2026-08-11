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

---

## OPEN — NOT YET DECIDED

| # | Question | Blocks |
|---|---|---|
| B | Mini case files — in MVP-1 or cut? | Gallery scope |
| C | Stale Cervello rows — route collision + 5 orphaned chapters | Sync correctness |
| D | Contact form delivery — Supabase table or email service? | Contact page |
| E | Ask layer: lead capture yes/no; answer boundaries | Layer 4 |
| F | Permanent Arabic typeface | Replaces the interim in decision 020 |
| G | ~~`settings` table shape~~ | *Closed by decision 026* |
| I | **Analytics retention window** — see the proposal in `docs/status.md` | Nothing; accumulating meanwhile |

*Question A (visual language) closed by decision 018.*
