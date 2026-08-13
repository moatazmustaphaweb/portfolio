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
| Notion data issues | ~~Cervello collision~~ ✅ · ~~5 orphaned chapters~~ ✅ · 4 empty mini case files still flagged into MVP-1 (sync as draft, harmless) | Moataz |
| Gallery scope | Mini case files — in MVP-1 or cut? | Moataz |
| Evidence blocks | NDA asset audit + redaction rules | Moataz |
| Neobiz Mobile chapters | Mobile feature lists not provided | Moataz |
| ~~Permanent Arabic typeface~~ | **Resolved** — LANTX (headings) + Meral Sans (body), decision 045 | — |
| ~~Analytics retention~~ | **Resolved** — 180 days + indefinite monthly aggregates, `pg_cron` enabled (decision 031) | — |
| Arabic review — 8 new strings | Consent banner + the four privacy claims. `npm run export:ui-strings` regenerates the review doc | Moataz |
| Redaction treatment (question H) | Designing against `docs/redaction-brief.md` §0. Enforcement is built; the visual treatment and `--color-redacted-*` values are pending | Moataz |

*Resolved 2026-08-11 by the decisions logged as 018–024: visual language, light+dark, interim Arabic face, content sourcing, rebuild-not-migrate, plain MVP-1, and Results Table enums.*

---

## 🟡 IN PROGRESS

### Phase 0 foundation — steps 1–4 of the current work order
- [x] **Step 1** — `git init` + clean baseline commit (disputed content removed first)
- [x] **Step 2** — documentation moved into `/docs/`, cross-references fixed
- [x] **Step 3** — `docs/design/tokens.md` written from the Vercel-style design, implemented in `globals.css` + `tailwind.config.ts`
- [x] **Step 4** — Layer 0 schema applied to Supabase and verified behaviourally

### Next: 4 Egypt outcome markers → clean dry run → first real sync → Phase 1 Landing

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
- [ ] Verify body→field mapping against real page bodies (untested until it runs)

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
- [x] `RedactedEvidence` — plain bordered surface + badge + caption
- [x] `docs/redaction-brief.md` written for the design pass
- [x] Redacted path made structurally non-cropping — `CloudinaryImage` forces the `redacted` preset (`c_fit`) when `media.redacted`, verified
- [x] Redacted media blocked from cover / `og_image` — 3 database triggers + query-layer guard, all verified including the retroactive-redaction bypass
- [ ] 🔴 Redaction *treatment* — awaiting the design and token values (open question H). Blocks are solid fills, per-image, badge bottom-left
- [ ] Verify redaction block legibility at 200px once the treatment lands (no simplified variant by decision)
- [ ] 🔴 **Moataz:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in `.env.local` — no image can render without it
- [ ] Upload the first real assets and confirm they render

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
- [ ] 🔴 **Retention window** — proposed 90 days raw + pre-aggregation. Awaiting confirmation, then a `pg_cron` job
- [ ] 🔴 Arabic review of the 8 new consent/privacy strings
- [ ] `NEXT_PUBLIC_SITE_URL` at custom-domain cutover (Vercel supplies its own until then)
- [ ] Gate: paste a live URL into ChatGPT/Claude and verify the summary — needs real content first

---


- [x] **Per-page metadata** — `lib/seo/metadata.ts`; title, description, canonical and language alternates per page. A shared case-file link now names the case file
- [x] **Sitemap** — 22 → 29 URLs; `/about/philosophy`, the four `/all` views and the two `/results` tables added
- [x] **`NEXT_PUBLIC_SITE_URL`** — the helper was already correct; a production build now warns loudly when it falls back to localhost. Resolves itself at deploy
- [ ] **3 ESLint errors, all `react-hooks/set-state-in-effect`** — ConsentBanner, GoogleAnalytics, ThemeToggle. Behaviour is correct; the fix is `useSyncExternalStore` and is a refactor of hydration-sensitive components that needs a browser to verify

### Design rebuild — outstanding
- [ ] 🔵 **Visual pass, both locales — MOATAZ IS DOING THIS.** Three attempts failed: the connected Chrome cannot reach the local server. Everything remains DOM-verified only
- [x] **`--control-h` raised to 44px** sitewide, per the rule the Accessibility page states
- [ ] **`--control-h-sm` is still 32px** — ThemeToggle, LocaleSwitch and the gallery filter chips. Fix is a transparent pseudo-element extending the hit area to 44px without changing visual height (WCAG 2.5.8); flagged rather than restyling the chrome unilaterally
- [ ] **Systems direction** — Direction B (essay) is built because the content supports it. Direction A (documentation) needs a token table, component inventory and changelog that do not exist as content
- [ ] **404 `<html lang>`/`dir` for in-route notFound()** — copy and chrome are correct; the wrapper is Next's error shell. `dynamicParams = false` did not fix it. Mitigated by setting lang/dir on the page's own wrapper

### Content gaps — not blocking, need writing
- [ ] **Cover images** — `media` is empty, so the NDA grayscale contrast on the gallery is invisible. Upload one cover per case file and set `case_files.cover_media_id`
- [x] **UAE outcomes** — ✅ your `[achieved]` markers synced. 4 outcomes; gallery card and cover strip both carry them
- [x] ~~Neobiz cover has no outcomes table~~ — **not a gap.** Designed and internally validated, not built; it makes design claims only, and completion-time or conversion figures belong to the Egypt web case file. Its cover says so. No notice, no flag (decision 041)
- [x] **Entry handles** — ✅ `entry_handles` (migration 0017), parsed, synced, rendering. UAE 3 · Egypt 3 · Neobiz 3
- [x] **Sibling links** — ✅ `case_file_siblings` (migration 0017), directed. All four live: UAE→Egypt+Neobiz, Egypt→Neobiz, Neobiz→Egypt
- [x] ~~Egypt declares no sibling~~ — **my bug, fixed.** Siblings were scanned only under the `Three ways in` heading; Egypt and Neobiz declare theirs elsewhere on the cover. Now scanned across the whole body
- [x] ~~Cervello route collision~~ — **the check's fault, fixed.** One claimant is a parked Layer 3 row; checks are MVP-1-scoped now (decision 040). Cervello syncs 3 handles, all linked
- [ ] **Egypt handle pointer `Results table → What broke.`** — the Results Table page now exists, but handles resolve to **chapters** only and a results table is not a chapter row. Still renders as text. Would need a nullable target route on `entry_handles` — not worth it for one handle unless more appear
- [x] **Contact form delivery** — ✅ option A built with honeypot, timing check and a global rate limit. No IP is read or stored (decision 029 holds)
- [ ] **Arabic for the static pages** — About, Philosophy, Systems and Contact have no Arabic child pages in Notion, so all four fall back to English (decision 013). Sections pair by position and are skipped outright if the counts disagree
- [ ] **Arabic for eleven new UI strings** — written by me from the English, not authored in Arabic. Needs your review. `entry_handles_heading` · `sibling_case_files` · `results_table` · `status_label` · `form_subject` · `form_subject_hiring` · `form_subject_project` · `form_subject_speaking` · `form_subject_other` · `form_message_placeholder` · `download_cv`. (The older `form_name`/`form_email`/`form_message`/`form_submit` set is yours and was reviewed on 2026-08-11 — untouched.)
- [ ] **Arabic entry-handle content** — no Arabic cover carries a `ثلاث طرق للدخول` block yet; handles pair by position and are skipped when counts disagree
- [ ] **`gallery_intro`** — the Classic Gallery intro line. Page renders without it
- [ ] **`Features` sections** — no chapter has one; the parser finds 0. Either write them in Notion under a `Features` heading, or amend the contract to stop promising feature strips
- [ ] **`egypt-acquisition/workflow` Arabic decisions** — 1 in EN, 3 in AR. Arabic skipped until the counts agree
- [ ] **`uae-acquisition` Arabic cover title** — no H1 in the Arabic child page; falls back to English

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
- [ ] 🔴 13. 404 — **BROKEN, not 'real'.** `app/[locale]/not-found.tsx` never renders: no root `app/layout.tsx`, so `notFound()` falls to Next's stock page. No lang, no dir, no chrome, no copy, either locale. Audited 2026-08-13

---

## ⬜ QUEUE — PHASE 2: LAUNCH GATE
- [ ] **404 renders in the visitor's locale.** A `not-found` boundary receives no route params, so an Arabic visitor hitting a bad link currently gets an English page. Small, but it undermines a bilingual claim — and the positioning is doing Arabic properly, not approximately. **Launch-gate item, not a nice-to-have**
- [ ] **`settings.og_image` designed, uploaded to Cloudinary, seeded** — every shared link renders without it otherwise
- [ ] **`settings.cv_url` hosted and seeded** — footer CV link is dead until then
- [x] Arabic UI strings corrected — verified drift-free by `npm run check:seed-drift`
- [ ] All four Case Files complete, every declared target closed
- [ ] Metric truth table applied (Egypt = projected; UAE public wording only; ~30% recovery-rate framing corrected)
- [ ] No unredacted NDA material in site or repo
- [ ] Mobile tested end to end, both languages
- [ ] RTL verified on every page type
- [ ] LLM summary test passes
- [ ] Zero heading-level typos, both languages
- [ ] Lighthouse acceptable
- [ ] Analytics writing to Supabase
- [ ] Cutover: point `moatazmustapha.com` at Vercel

---

## ✅ DONE

- **2026-08-11** — Read the full doc set; connected Claude Design (`DesignSync` project `f6113c80`) and added the Supabase MCP server to `.mcp.json`. Surfaced the two-visual-languages conflict and the decision-007 metric violations.
- **2026-08-11** — Step 1: `git init` + clean foundation baseline. Deleted `content/caseFiles/*.ts`, `app/work/`, and `components/` before the first commit so client names and disputed metrics never entered history. Pre-rebuild tree backed up outside the repo at `~/Moataz_Next_pre_rebuild_backup_2026-08-10`.
- **2026-08-11** — Step 2: moved all documentation into `/docs/` (`tokens.md` → `docs/design/tokens.md`); fixed every cross-reference so paths resolve.
- **2026-08-11** — Step 3: replaced the visual language with the Vercel-style system (decision 018). `docs/design/tokens.md` written from the design; implemented in `globals.css` + `tailwind.config.ts`; Geist + Geist Mono self-hosted.
- **2026-08-11** — 0.3 seed: navigation + 50 UI strings in both locales, verified idempotent. `settings` seeded as keys only — values left NULL rather than invented.
- **2026-08-11** — 0.7 i18n + RTL shell: `next-intl` `[locale]` routing, `dir` from the locale segment, and Header/Footer/Nav/LocaleSwitch/ThemeToggle rendering entirely from Supabase. Verified against the running server in both locales.
- **2026-08-11** — 0.5 query layer: Supabase clients, generated DB types, translation resolver with English fallback and batched lookups, case-file/chapter/settings/navigation/ui accessors, and a secret-guarded `/api/revalidate`.
- **2026-08-11** — Step 4: Layer 0 schema applied to `cidxctilamdxbzjjzppb`. Verified behaviourally in both directions — draft content and `translations` invisible to anon, published content visible. Cleared two security-advisor `WARN`s by revoking the `PUBLIC` EXECUTE grant on the platform's `rls_auto_enable()`. Resolved manifesto open item 8: it was an account mismatch, not a permissions bug.
