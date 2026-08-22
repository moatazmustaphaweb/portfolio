# TASKS.md

**Owner:** Claude Code maintains this file. Moataz seeds it and may add items.
**Protocol:** read at session start · move items between sections as work progresses · add discovered sub-tasks under their parent · commit changes alongside the work they describe · never delete completed items, move them to DONE with a date.

---

## 🔴 BLOCKED

| Task | Blocked by | Owner |
|---|---|---|
| ~~0.5 query-layer verification~~ | **Resolved** — key in place, `npm run verify:content` passes | — |
| **`settings.og_image`** | Not designed. Controls how every shared link renders on LinkedIn and WhatsApp — the first impression for anyone the site is forwarded to. **Launch-gate blocker** | Moataz |
| **`settings.cv_url`** | Hosting location not chosen. The CV link appears in the footer on every page. **Launch-gate blocker** | Moataz |
| ~~Egypt/UAE outcome markers~~ | **Resolved** — markers added in Notion; UAE has 4 outcomes, Egypt 3 | — |
| **Cervello route collision — REOPENED 2026-08-23** | Two Notion covers claim `/[locale]/work/cervello`. The live one is `Cervello Cloud (IoT)`; the other is blank, `Not started`, `Layer 3`. Decision 040 cleared it by taking the blank one **out of MVP-1** — which works only while the sync is MVP-1-scoped. **`--all` pulls it back in and writes `draft` over the published row**, and the case file drops out of the gallery. **Restored 2026-08-23 and verified rendering** — gallery, cover (en + ar), chapters and `/all` all 200. It **will recur on the next `--all`** unless the parked page is archived or its `Route` changed. ⚠️ Restoring the row is not enough on its own: `dynamicParams = false` means the route list is fixed at build, so the cover kept 404ing until the server was restarted | Moataz |
| Gallery scope | Mini case files — in MVP-1 or cut? | Moataz |
| Evidence blocks | NDA asset audit + redaction rules | Moataz |
| Neobiz Mobile chapters | Mobile feature lists not provided | Moataz |
| ~~Permanent Arabic typeface~~ | **Resolved** — LANTX (headings) + Meral Sans (body), decision 045 | — |
| ~~Analytics retention~~ | **Resolved** — 360 days raw (migration `0014_retention_360_days.sql`) + indefinite monthly aggregates; `pg_cron` present, verified 2026-08-23 (decision 031) | — |
| Arabic review — 8 new strings | Consent banner + the four privacy claims. `npm run export:ui-strings` regenerates the review doc | Moataz |
| Redaction treatment (question H) | Designing against `docs/redaction-brief.md` §0. Enforcement is built; the visual treatment and `--color-redacted-*` values are pending | Moataz |
| **Objective at statement size — TRIAL, awaiting a ruling** | Live on chapter pages, one class, no flag. Takes the h1 from 39–72% of the screen down to 10–28%. **It also removes the page's only dominant element without adding a title**, and the breadcrumb cannot carry that job — least of all in Arabic, where it wraps to four lines at 390. Keep · keep and add the chapter-name h1 (the next question) · revert. Screenshots in `~/Desktop/objective-size-trial/`, account in `docs/status.md` 2026-08-26 | Moataz |

*Resolved 2026-08-11 by the decisions logged as 018–024: visual language, light+dark, interim Arabic face, content sourcing, rebuild-not-migrate, plain MVP-1, and Results Table enums.*

---

## 🟡 IN PROGRESS

### Phase 0 foundation — steps 1–4 of the current work order
- [x] **Step 1** — `git init` + clean baseline commit (disputed content removed first)
- [x] **Step 2** — documentation moved into `/docs/`, cross-references fixed
- [x] **Step 3** — `docs/design/tokens.md` written from the Vercel-style design, implemented in `globals.css` + `tailwind.config.ts`
- [x] **Step 4** — Layer 0 schema applied to Supabase and verified behaviourally

**Phase 0 and Phase 1 are both complete.** Every route renders from the database in both locales.
The project has been at the **launch gate** since 2026-08-13 — see PHASE 2 below, which is the only
list that still describes unfinished work.

### Next: the three things Moataz owns, in the order they unblock the most

1. **`og_image` + `cv_url`** — two `settings` values, and every shared link and every footer stops being broken
2. **Three cover images** — the gallery is the landing surface, and the NDA treatment has never been seen on it
3. **The visual pass** — nothing below it can be trusted until someone looks. `:3000` is serving the current build now

---

## ⬜ QUEUE — PHASE 0: FOUNDATION

### 0.1 Repo & environment
- [x] `create-next-app` — TypeScript, App Router, Tailwind *(ESLint not installed — add)*
- [x] Verify `.gitignore` covers `.env*.local` **before first commit** — covered by `.env*`
- [x] Add ESLint — `eslint.config.mjs`, flat config. Found a duplicate `THEME_INIT` left by the layout split on its first run
- [ ] Create `.env.local` with all keys (see `docs/conventions.md` for the list)
- [ ] Connect Vercel to the repo; add the same env vars in Vercel
- [ ] First deploy succeeds

### 0.2 Supabase schema
- [x] Draft the full migration — `supabase/migrations/0001_layer0_schema.sql` (**not applied**)
- [x] Sign-off received on [FIX 1] (`settings`) and [FIX 2] (translations RLS = Option B)
- [x] Applied to `cidxctilamdxbzjjzppb` 2026-08-11 — 17 tables, 9 enums, 13 policies, 37 indexes, RLS on all 17
- [x] Create enums
- [x] `media`
- [x] `case_files` → `chapters` → `features`
- [x] `outcomes`, `targets`
- [x] `series` → `articles`
- [x] `studio_works`, `experiments`
- [x] `settings`, `navigation`, `ui_strings`
- [x] `translations` (with the unique constraint)
- [x] `revisions`
- [x] `sessions`, `events`
- [x] Indexes
- [x] RLS policies — verified behaviourally, both directions

### 0.3 Seed non-content tables
- [x] `navigation` — 8 rows (header + footer), 16 translations (en + ar)
- [x] `ui_strings` — 50 keys, 100 translations (en + ar), zero missing Arabic
- [x] `settings.name` — en `Moataz Mustapha` / ar `مُعتز مصطفى`
- [x] `settings.email` — `moataz.mustapha@outlook.com`
- [x] `settings.linkedin_url`
- [x] `settings.tagline` · `intro` · `description` — seeded, both locales, live on Landing
- [ ] 🔴 `settings.og_image` · `cv_url` — still NULL, **launch-gate blockers** (see BLOCKED)
- [x] Native Arabic review — 9 corrections applied to the database, `0003_seed_site_chrome.sql` and `docs/ui-strings-review.md`. No collisions remain across all 52

### 0.4 Notion → Supabase sync
- [x] `lib/sync/classify.ts` — classification, route→slug, status markers, collision detection
- [x] `scripts/test-sync-logic.ts` — 35 checks, no credentials needed (`npm run test:sync`)
- [x] `scripts/sync-notion.ts` with `--dry-run` and `--all`
- [x] Fails loudly on missing status markers (decision 007) and same-kind route collisions
- [x] `NOTION_API_KEY` set; first `--dry-run` run successfully
- [x] Distinct errors for bad key / database-not-shared / no read capability / rate limit
- [x] Dry-run fidelity fixed — simulates parent resolution, excludes skipped rows from the not-ready list, reports unimplemented page types
- [x] **Notion data issues** — resolved; the Cervello collision turned out to be a scoping bug in the check, not a content fault (decision 040)
- [x] First **real** sync — runs clean: exit 0, zero failures
- [x] Static / comparison / accessibility pages → **`page_sections`**, not `ui_strings` (decision 043 amends contract Step 1). Prose and tables both carried
- [x] Verify body→field mapping against real page bodies — the sync has run clean many times since, most recently 2026-08-23 for the UAE tracking chapter

### 0.5 Query layer
- [x] `lib/supabase/client.ts` + `server.ts` (+ generated `database.types.ts`)
- [x] `lib/content/types.ts`
- [x] `lib/content/translate.ts` (English fallback, batched to avoid N+1)
- [x] `lib/content/{case-files,chapters,settings,navigation,ui}.ts`
- [x] `/api/revalidate` — secret-guarded, invalidates both locales per path
- [x] `scripts/verify-content.ts` smoke test + `npm run verify:content`
- [x] `SUPABASE_SERVICE_ROLE_KEY` in place; `npm run verify:content` passes
- [x] ISR `revalidate = 300` on all 9 content routes

### 0.6 Design tokens
- [x] Extract token values from the Vercel-style `*.dc.html` designs
- [x] Write `docs/design/tokens.md` (semantic names, light + dark, RTL-safe)
- [x] Implement in `app/globals.css` + `tailwind.config.ts`
- [x] Swap Space Grotesk → Geist + Geist Mono in `app/layout.tsx`
- [ ] 🔴 Redaction treatment — structure only for now, crafted language undecided (open question H)
- [ ] Measure `--control-min-w` against the rendered **Contact form submit button** (Phase 1 #12) and `--pill-min-w` against the rendered **Results Table status pills** (Phase 1 #5), in **both** locales, and adjust. Current values are eyeballed from the longest Arabic string, not measured
- [x] Type scale re-verified against the permanent Arabic faces — three factors, measured (decision 045)

### 0.7 i18n + RTL shell
- [x] `next-intl` + `[locale]` routing (`localePrefix: always`) + middleware
- [x] `dir` set once at layout level from the locale segment; logical properties throughout
- [x] Header, Footer, Nav, LocaleSwitch, ThemeToggle — all rendered from the database
- [x] Verified: `/en` → `lang=en dir=ltr`, `/ar` → `lang=ar dir=rtl`; both prerendered (SSG); `/` → 307 → `/en`
- [x] Rule-1 audit — swept for JSX text literals and hardcoded aria-label/alt/title; found and fixed a hardcoded `LinkedIn` label
- [ ] Breadcrumb — deferred until there are nested routes to render it on (Phase 1)

### 0.8 Media
- [x] Cloudinary + `next-cloudinary`
- [x] `CloudinaryImage` — the only place a URL is built; server component, no client JS
- [x] Presets `thumb` / `card` / `hero` / `gallery` — verified against live Cloudinary URLs (200, correct transforms)
- [x] `RedactedEvidence` — badge + caption. **The border and background were removed 2026-08-23**: images carry no frame anywhere on the site. The NDA signal is the Cloudinary grayscale plus the badge, never a box. *(Note: this component is still rendered by no page.)*
- [x] `docs/redaction-brief.md` written for the design pass
- [x] Redacted path made structurally non-cropping — `CloudinaryImage` forces the `redacted` preset (`c_fit`) when `media.redacted`, verified
- [x] Redacted media blocked from cover / `og_image` — 3 database triggers + query-layer guard, all verified including the retroactive-redaction bypass
- [ ] 🔴 Redaction *treatment* — awaiting the design and token values (open question H). Blocks are solid fills, per-image, badge bottom-left
- [ ] Verify redaction block legibility at 200px once the treatment lands (no simplified variant by decision)
- [x] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — committed as a default in `lib/media/cloud.ts` (decision 052). It was unset in Vercel on 2026-08-19 and 500'd `/work` as soon as the first cover row existed. Setting it in the Vercel dashboard is now an override, not a prerequisite
- [x] `CloudinaryImage` omits the image when Cloudinary is unconfigured, rather than throwing — matches the behaviour `docs/status.md` already documented
- [x] Upload the first real assets and confirm they render — **80 `media` rows**; the four UAE tracking screens render in both locales with `e_grayscale` applied live from `case_files.nda`

### 0.9 Instrumentation & machine legibility
- [x] `/api/events` → Supabase. Anonymous session IDs (sessionStorage, not cookies), per-type payload allowlist, PII backstop, no IP, no UA, referrer category only
- [x] Person JSON-LD — from `settings`, localised, NULL values omitted
- [x] `llms.txt` — generated from the database, never hand-written
- [x] `sitemap.xml` — both locales with `hreflang` alternates
- [x] `robots.txt` — GPTBot / ClaudeBot / OAI-SearchBot / PerplexityBot explicitly allowed
- [x] Migrated `middleware.ts` → `proxy.ts` (Next 16.3 deprecation)
- [x] GA consent-gated (decision 030) — script does not render until explicit accept; banner bilingual, RTL-safe, decline equal weight and first in tab order
- [x] Geography — `country`/`city` from edge headers, no IP stored (decision 029), verified
- [x] `/how-this-site-works` copy seeded, all four claims testable
- [x] **Retention window** — resolved: 360 days raw + indefinite monthly aggregates (migrations 0010/0014, decision 031). **`pg_cron` is installed** — verified 2026-08-23. *(This line said 🔴 while the BLOCKED table above said resolved. The extension is present; the table was right.)*
- [ ] 🔴 Arabic review of the 8 new consent/privacy strings
- [ ] `NEXT_PUBLIC_SITE_URL` at custom-domain cutover (Vercel supplies its own until then)
- [ ] Gate: paste a live URL into ChatGPT/Claude and verify the summary — needs real content first

---


- [x] **Per-page metadata** — `lib/seo/metadata.ts`; title, description, canonical and language alternates per page. A shared case-file link now names the case file
- [x] **Sitemap** — 22 → 29 URLs; `/about/philosophy`, the four `/all` views and the two `/results` tables added
- [x] **`NEXT_PUBLIC_SITE_URL`** — the helper was already correct; a production build now warns loudly when it falls back to localhost. Resolves itself at deploy
- [x] **ESLint at zero.** ConsentBanner, GoogleAnalytics and ThemeToggle rewritten with `useSyncExternalStore` — the cause removed, not suppressed. Server HTML byte-identical before/after in both locales; client behaviour needs eyes (checklist in `docs/status.md`)

- [ ] 🔵 **Verify the three rewritten client components** — theme flash on first paint, toggle label, theme survives reload, consent banner does not reappear, and zero `googletagmanager` requests before Allow. Expected-vs-failure checklist in `docs/status.md`

### Design rebuild — outstanding
- [ ] 🔵 **Visual pass, both locales — MOATAZ IS DOING THIS.** Three attempts failed: the connected Chrome cannot reach the local server. Everything remains DOM-verified only
- [x] **`--control-h` raised to 44px** sitewide, per the rule the Accessibility page states
- [x] **`--control-h-sm` stays 32px** — decided 2026-08-13. The size distinction is intentional and the hit-area extension was considered and rejected. 44px applies to `--control-h`, which every primary action uses
- [ ] **Systems direction** — Direction B (essay) is built because the content supports it. Direction A (documentation) needs a token table, component inventory and changelog that do not exist as content
- [ ] **404 `<html lang>`/`dir` for in-route notFound()** — copy and chrome are correct; the wrapper is Next's error shell. `dynamicParams = false` did not fix it. Mitigated by setting lang/dir on the page's own wrapper

### Content gaps — not blocking, need writing
- [ ] 🔴 **Cover images — 1 of 4.** Measured 2026-08-23: `media` holds **80 rows** and only `uae-acquisition` has `cover_media_id` set. *(This line used to say `media` is empty. It was true when written and was quoted for weeks after it stopped being true — run the query, do not trust the number.)* **The NDA grayscale has still never been seen on a gallery card**, which is the part that matters
- [x] **UAE outcomes** — ✅ your `[achieved]` markers synced. 4 outcomes; gallery card and cover strip both carry them
- [x] ~~Neobiz cover has no outcomes table~~ — **not a gap.** Designed and internally validated, not built; it makes design claims only, and completion-time or conversion figures belong to the Egypt web case file. Its cover says so. No notice, no flag (decision 041)
- [x] **Entry handles** — ✅ `entry_handles` (migration 0017), parsed, synced, rendering. UAE 3 · Egypt 3 · Neobiz 3
- [x] **Sibling links** — ✅ `case_file_siblings` (migration 0017), directed. All four live: UAE→Egypt+Neobiz, Egypt→Neobiz, Neobiz→Egypt
- [x] ~~Egypt declares no sibling~~ — **my bug, fixed.** Siblings were scanned only under the `Three ways in` heading; Egypt and Neobiz declare theirs elsewhere on the cover. Now scanned across the whole body
- [x] ~~Cervello route collision~~ — **the check's fault, fixed.** One claimant is a parked Layer 3 row; checks are MVP-1-scoped now (decision 040). Cervello syncs 3 handles, all linked
- [ ] **Egypt handle pointer `Results table → What broke.`** — the Results Table page now exists, but handles resolve to **chapters** only and a results table is not a chapter row. Still renders as text. Would need a nullable target route on `entry_handles` — not worth it for one handle unless more appear
- [x] **Contact form delivery** — ✅ option A built with honeypot, timing check and a global rate limit. No IP is read or stored (decision 029 holds)
- [x] **Arabic for the static pages** — done. Measured 2026-08-23: About, Systems and Contact all carry Arabic `page_sections`; Philosophy too. The one page still English-only is **accessibility**, which has 8 Arabic sections in Notion against 14 English and is skipped by the count guard
- [ ] **Arabic for eleven new UI strings** — written by me from the English, not authored in Arabic. Needs your review. `entry_handles_heading` · `sibling_case_files` · `results_table` · `status_label` · `form_subject` · `form_subject_hiring` · `form_subject_project` · `form_subject_speaking` · `form_subject_other` · `form_message_placeholder` · `download_cv`. (The older `form_name`/`form_email`/`form_message`/`form_submit` set is yours and was reviewed on 2026-08-11 — untouched.)
- [x] **Arabic entry-handle content** — done. **24 Arabic translations across 12 handles**, measured 2026-08-23
- [ ] **`gallery_intro`** — the Classic Gallery intro line. Page renders without it
- [ ] **`Features` sections** — no chapter has one; the parser finds 0. Either write them in Notion under a `Features` heading, or amend the contract to stop promising feature strips
- [x] **`egypt-acquisition/workflow` Arabic** — the chapter now carries Arabic prose; the count mismatch is gone
- [x] **`uae-acquisition` Arabic cover title** — present; no longer falling back

---

## ⬜ QUEUE — PHASE 1: MVP-1 PAGES
*Every route below is now scaffolded and navigable — see the route map in `docs/status.md`. Phase 1 is filling them, not creating them.*

- [x] 1. Landing — real content, both locales, minimal footer
- [x] 2. Classic Gallery — 4 published case files, domain filter, NDA markers, both locales
- [x] 3. Case File Cover — title, thesis, role statement, OutcomeStrip, LivingMap branching on grammar
- [x] 4. Chapter — objective, context, decision blocks, result, prev/next navigation
- [x] 5. Results Table — every declared target with status and evidence; no red (decision 042)
- [x] 6. Linear View — whole case file inline, one `h1`, deep link per chapter
- [x] 7. Comparison pages — ✅ prose + 5-column tables via `page_sections` (kind `table`, migration 0025)
- [x] 8. Accessibility page — ✅ 13 sections + the conformance table
- [x] 9. Systems — intro + 4 sections, 3 evidence chapters resolved through the query layer
- [x] 10. About — intro + 6 sections in chronological order
- [x] 11. Philosophy — docs-style, 5 numbered positions, anchor per section
- [x] 12. Contact — ✅ form **and delivery**: Supabase table, honeypot, timing check, rate limit (decision 044 closed)
- [x] 13. 404 — **fixed for the case that matters.** `app/layout.tsx` now exists, so an unmatched URL renders the designed 404 in the correct locale with `lang`/`dir` set. **One case remains:** `notFound()` thrown *inside* a locale route (a draft slug like `/en/work/east`) still gets Next's `__next_error__` document wrapper, so `<html>` carries no `lang`/`dir` — mitigated by `app/not-found.tsx` setting both on its own wrapper. Tracked below, not here

---

## ⬜ QUEUE — PHASE 2: LAUNCH GATE

**Rewritten 2026-08-23 against the database and the running server, not against the previous
version of this list.** Every number below was measured on that date. Numbers rot — the ones that
matter carry the query that reproduces them.

### 🔴 Blocking, and only Moataz can clear them

- [ ] **`settings.og_image`** — still `NULL`. Every link shared to LinkedIn or WhatsApp renders bare
- [ ] **`settings.cv_url`** — still `NULL`. The footer CV link is dead on every page
- [ ] **Cover images: 1 of 4.** Only `uae-acquisition` has one. **The NDA grayscale has never been seen on a gallery card**, and the gallery is the first page anyone lands on
  ```sql
  select slug, cover_media_id is not null from case_files where status = 'published';
  ```
- [ ] **Dates, employers, job titles.** The About design has had a career timeline since before the site existed; the component was never built because there is nothing to put in it. **The LLM read test named this gap first**
- [ ] **Mini case files — in MVP-1 or cut?** Four empty rows sync as draft and 404 correctly. Harmless, but the gallery scope is undecided
- [ ] **Domain + Vercel account.** No deploy has ever happened

### 🔴 Blocking, and mine once he answers

- [ ] **Cervello route collision, REOPENED.** See BLOCKED. A `--all` sync silently unpublishes Cervello. **Restored by hand 2026-08-23; it recurs.** Either the parked Notion page is archived, or its `Route` changes, or the sync learns to refuse a blank page overwriting a published row
- [ ] **Arabic review of 11 UI strings + 8 consent/privacy strings.** Written from English by me, never reviewed by a native speaker. `npm run export:ui-strings`
- [ ] **The privacy claims render nowhere.** `privacy_no_ip`, `privacy_no_tracking`, `privacy_location`, `privacy_title` are seeded in both languages and resolved by no component. `/how-this-site-works` is Layer 2 and 404s
- [ ] **The `Achieved` label carries two different claims** — "live in production for 18 months" and "ten people in a usability lab" — and the gallery card shows the label without the evidence line. The read test caught this as the one place the metric discipline leaks

### 🟡 Content depth — the site ships without these, but thinner

- [ ] **109 of 262 chapter paragraphs have no Arabic** (153 do). Most of that Arabic **is written in Notion and is being dropped by the sync**, not missing
  ```sql
  select count(*) filter (where t.locale='en'), count(*) filter (where t.locale='ar')
  from chapter_paragraphs cp join translations t on t.entity_id = cp.id;
  ```
- [ ] **33 of 65 images have no Arabic `alt`.** A missing `alt` means `CloudinaryImage` omits the image entirely — an invisible gap on an Arabic page
- [ ] **The accessibility page is English-only** — 8 Arabic sections in Notion against 14 English, so the count guard skips all of them
- [ ] **`gallery_intro`** — not in `ui_strings`. The gallery renders without it
- [ ] **`Features` sections** — `features` has **0 rows** and no chapter has the heading. Either write them, or amend the contract to stop promising feature strips
- [ ] **Egypt handle pointer `Results table → What broke.`** renders as text; handles resolve to chapters only

### 🔵 Never tested, in any environment — the honest list

- [ ] **The visual pass has never happened.** Not once. Everything is DOM-verified only. **Moataz owns this**, and `:3000` is serving the worktree right now
- [ ] **No accessibility audit** — no axe, no Lighthouse, no keyboard-only walkthrough, no screen reader
- [ ] **The contact form has never been submitted through a browser.** Four branches tested with `curl`; the rendered form, its validation, the honeypot in a real DOM and the success state have not been clicked once
- [ ] **ISR has never been observed working in production**, and `/api/revalidate` has never been called against a production build
- [ ] **Verify the three `useSyncExternalStore` rewrites** — theme flash, toggle label, theme survives reload, consent banner does not reappear, zero `googletagmanager` requests before Allow
- [ ] **`notFound()` inside a locale route** still renders Next's `__next_error__` shell — no `lang`, no `dir` on `<html>`. Mitigated, not fixed
- [ ] **Measure `--control-min-w`** against the rendered Contact submit and `--pill-min-w` against the Results Table pills, **both locales**. Current values are eyeballed from the longest Arabic string

### ⚪ Deploy, and everything that can only be true after it

- [ ] Vercel project created, env vars set, first deploy succeeds
- [ ] `NEXT_PUBLIC_SITE_URL` set at custom-domain cutover — absolute URLs emit `localhost:3000` until then
- [ ] Analytics confirmed writing to Supabase from production
- [ ] LLM summary test re-run against a live URL
- [ ] Cutover: point `moatazmustapha.com` at Vercel

### ✅ Already true, kept so nobody re-opens them

- [x] **404 renders in the visitor's locale** for unmatched URLs, `lang`/`dir` correct, both CTAs
- [x] Arabic UI strings corrected — drift-free by `npm run check:seed-drift`
- [x] **Arabic on the static pages** — About, Philosophy, Systems, Contact all carry it
- [x] **Arabic entry handles** — 24 translations across 12 handles
- [x] Metric markers applied — 7 outcomes and 11 targets, every one carrying its status
- [x] No unredacted NDA material in the repo — assets live in Cloudinary, treatment is a live transform
- [x] 36/36 route-locale combinations return 200 against a real production build
- [x] ESLint at zero, `tsc` clean, `next build` exit 0 with 55 static pages

---

## ✅ DONE

- **2026-08-23** — Task `001230826`: **images lost their frames sitewide**, and chapter figures gained a height cap. Four frames removed (chapter figures, cover section images, the gallery card seam, the unrendered evidence component); `--figure-max-h: 600px` added as a token with `md:max-h-figure md:w-auto`, so a phone gets full width and a desktop gets 600px tall. `me-auto` + `block` per `rtl-guard` so a narrowed image hugs the inline start in both directions. Verified by reading the **generated stylesheet**, not the class list — a utility outside the replaced `spacing` scale compiles to nothing and looks identical in HTML. `eslint`/`tsc` clean, build exit 0, 55 pages. Account in `docs/status.md` 2026-08-23 00:47 and 01:06.
- **2026-08-23** — **Cloudinary write access.** `NEXT_PUBLIC_CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET` in `.env.local`; replacement is a signed `curl` with `overwrite=true` and `invalidate=true`, **no dependency added**. First asset replaced in place, proven by the version moving `1787174286` → `1787425340`. Learned and logged: an in-place replace **cannot reach a browser that already has the bytes** — Cloudinary serves `cache-control: immutable, max-age=2592000`, and `getCldImageUrl` emits a fixed `/v1/`, so the URL never changes. **Whoever has been watching the page sees the old image for 30 days.**
- **2026-08-22** — Task `001220826`: **the UAE case file became two chapters.** `Application Tracking / متابعة الطلب` written from a live interview, English and Arabic, four images, published and rendering in both locales. Migration `0044` adds three slot aliases. Five lessons written to `docs/learn.md` and one rule into the `portfolio-voice` skill — the sharpest being that **he cuts sentences about credit, not sentences about the work**, and that the two languages are allowed to say different things. The Desktop Redirect screen was **refused, not missing**. Twelve status entries, `docs/status.md` 2026-08-22.

- **2026-08-21** — Task `001210826`: the five-agent structure. `orchestrator` (this session) plus `.claude/agents/{frontend,backend,devops,content}.md`; `docs/agents.md` (the constitution — permission boundary, task-id scheme, standing rules) and `docs/workflows.md` (eight workflows, their handoffs, the ledger); one status file per agent under `docs/status/`; the first rule and an agent-structure section added to `CLAUDE.md`. **Only devops writes to git history.** Visual verification stays with Moataz and a visual-review agent is recorded as a planned addition. Two stale claims corrected: the ports note in `docs/status.md` (verify on `:3000`, not 3100) and `CLAUDE.md`'s "no git remote". **No agent has been run — they load on the next session restart.** Account in `docs/status.md` 2026-08-21 15:57.
- **2026-08-24** — Two-size chapter h1: **tried, ruled against, reverted.** The split logic, the punctuation matching and `lib/utils/splitHeading.ts` are out; `app/[locale]/(site)/work/[caseFile]/[chapter]/page.tsx` is byte-identical to its pre-trial state. Verified by re-shooting all 18 pre-trial screenshots and diffing: identical in dark, and identical in light against a reconstructed pre-trial build. Account in `docs/status.md` 2026-08-25.
- **2026-08-11** — Read the full doc set; connected Claude Design (`DesignSync` project `f6113c80`) and added the Supabase MCP server to `.mcp.json`. Surfaced the two-visual-languages conflict and the decision-007 metric violations.
- **2026-08-11** — Step 1: `git init` + clean foundation baseline. Deleted `content/caseFiles/*.ts`, `app/work/`, and `components/` before the first commit so client names and disputed metrics never entered history. Pre-rebuild tree backed up outside the repo at `~/Moataz_Next_pre_rebuild_backup_2026-08-10`.
- **2026-08-11** — Step 2: moved all documentation into `/docs/` (`tokens.md` → `docs/design/tokens.md`); fixed every cross-reference so paths resolve.
- **2026-08-11** — Step 3: replaced the visual language with the Vercel-style system (decision 018). `docs/design/tokens.md` written from the design; implemented in `globals.css` + `tailwind.config.ts`; Geist + Geist Mono self-hosted.
- **2026-08-11** — 0.3 seed: navigation + 50 UI strings in both locales, verified idempotent. `settings` seeded as keys only — values left NULL rather than invented.
- **2026-08-11** — 0.7 i18n + RTL shell: `next-intl` `[locale]` routing, `dir` from the locale segment, and Header/Footer/Nav/LocaleSwitch/ThemeToggle rendering entirely from Supabase. Verified against the running server in both locales.
- **2026-08-11** — 0.5 query layer: Supabase clients, generated DB types, translation resolver with English fallback and batched lookups, case-file/chapter/settings/navigation/ui accessors, and a secret-guarded `/api/revalidate`.
- **2026-08-11** — Step 4: Layer 0 schema applied to `cidxctilamdxbzjjzppb`. Verified behaviourally in both directions — draft content and `translations` invisible to anon, published content visible. Cleared two security-advisor `WARN`s by revoking the `PUBLIC` EXECUTE grant on the platform's `rls_auto_enable()`. Resolved manifesto open item 8: it was an account mismatch, not a permissions bug.
