# Implementation Manifesto — moatazmustapha.com
### The executable build plan. Derived from Architecture v2.0. Written to be handed to Claude Code.

**Repo:** `github.com/moatazmustaphaweb/portfolio`
**Supabase project:** `cidxctilamdxbzjjzppb`
**Host:** Vercel · **Media:** Cloudinary · **Authoring:** Notion → sync → Supabase
**Budget:** ~2 hrs/day · **Target:** MVP-1 in 6–9 weeks

---

## 0. RULES OF ENGAGEMENT (read before writing any code)

1. **Nothing hardcoded.** No name, no menu label, no button text, no heading in code. If a human reads it, it comes from the database.
2. **Pages never query Supabase directly.** Only `lib/content/*` talks to the database.
3. **Image URLs are never stored.** Only Cloudinary `public_id` + a named transform preset.
4. **Build in order.** Schema → seed → query layer → tokens → shell → pages. Pages last. Building pages first is how this architecture fails.
5. **Every commit deploys.** Vercel preview per branch; main is the staging site until cutover.
6. **Secrets never enter the repo.** `.env.local` in `.gitignore` from commit #1. Service-role key server-side only.
7. **NDA discipline.** No Mashreq screens, files, or unredacted assets in the repo — ever. Git history is permanent.

---

## PHASE 0 — FOUNDATION
*Everything here must exist before the first page renders. Est. 8–10 working days.*

### Step 0.1 — Repo & environment
- [ ] `create-next-app` — TypeScript, App Router, Tailwind, ESLint
- [ ] `.gitignore` verified (`.env*.local`) **before first commit**
- [ ] `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `REVALIDATE_SECRET`
- [ ] Vercel project connected to the repo; same env vars added in Vercel
- [ ] First deploy succeeds (blank page is fine)

### Step 0.2 — Supabase schema
Create in this order (foreign keys depend on it):
- [ ] Enums: `content_status`, `outcome_status`, `target_status`, `grammar_type`, `locale_code`, `article_stream`, `nav_location`, `comment_status`
- [ ] `media`
- [ ] `case_files` → `chapters` → `features`
- [ ] `outcomes`, `targets`
- [ ] `series` → `articles`
- [ ] `studio_works`, `experiments`
- [ ] `settings`, `navigation`, `ui_strings`
- [ ] `translations` — with `UNIQUE (entity_type, entity_id, locale, field)`
- [ ] `revisions`
- [ ] `sessions`, `events`
- [ ] Indexes: `translations(entity_type, entity_id, locale)`, `chapters(case_file_id, sort_order)`, `case_files(slug)`, `articles(slug)`
- [ ] RLS: public read on published rows only; writes via service role only
- [ ] Deferred to their layers: `comments` (L3), `documents`+pgvector (L4)

### Step 0.3 — Seed the non-content tables
Site cannot render without these:
- [ ] `settings` — name, tagline, email, linkedin_url, cv_url, og_image
- [ ] `navigation` — header (Work · Systems · About · Contact) + footer items
- [ ] `ui_strings` — every interface word: read_more, next_chapter, back_to_work, view_all, skip, language labels, form fields, submit, 404 copy, filter labels
- [ ] All of the above with `translations` rows in **both** `en` and `ar`

### Step 0.4 — Notion → Supabase sync script
- [ ] `scripts/sync-notion.ts` — reads the portfolio database, upserts case_files / chapters / features + translations
- [ ] Idempotent, slug-matched, safe to re-run
- [ ] Dry-run flag that reports what would change
- [ ] Run it: real content in Supabase

### Step 0.5 — Query layer
- [ ] `lib/supabase/client.ts` (anon) and `server.ts` (service role)
- [ ] `lib/content/types.ts` — TS types mirroring the schema
- [ ] `lib/content/translate.ts` — resolve translations for an entity + locale, with fallback rules
- [ ] `lib/content/case-files.ts`, `chapters.ts`, `settings.ts`, `navigation.ts`, `ui.ts`
- [ ] Every function typed, every function cached
- [ ] ISR: `revalidate` on all content routes + `/api/revalidate` with secret

### Step 0.6 — Design tokens ⚠️ BLOCKED
**This is the one open creative decision. Nothing visual proceeds until it's made.**
- [ ] Colour system (incl. the redaction treatment palette)
- [ ] Type scale — Latin **and** Arabic typeface pairing
- [ ] Spacing, radius, elevation
- [ ] Tokens as CSS variables consumed by Tailwind

### Step 0.7 — i18n + RTL shell
- [ ] `next-intl` with `[locale]` routing (`en` | `ar`)
- [ ] `dir` set at layout level; logical CSS properties throughout (no `left`/`right`)
- [ ] Header, Footer, Nav, LocaleSwitch, Breadcrumb — all rendered from the database
- [ ] Verify: a page in `ar` mirrors completely

### Step 0.8 — Media
- [ ] Cloudinary account + `next-cloudinary`
- [ ] `CloudinaryImage` component — the only place URLs are built
- [ ] Transform presets: `thumb`, `card`, `hero`, `gallery`, `redacted`

### Step 0.9 — Instrumentation & machine legibility
- [ ] `/api/events` → Supabase; anonymous session ID (no PII)
- [ ] GA
- [ ] Person JSON-LD, `llms.txt`, `sitemap.xml`, `robots.txt` (GPTBot/ClaudeBot allowed)
- [ ] **Gate:** paste a live URL into ChatGPT/Claude — the summary must be accurate

---

## PHASE 1 — MVP-1 PAGES
*Build in this order — each reuses what came before. Est. 15–20 working days.*

| # | Page | Depends on |
|---|---|---|
| 1 | Landing | shell, settings |
| 2 | Classic Gallery | case_files query, ProjectCard, FilterBar |
| 3 | Case File Cover | LivingMap (3 grammars), OutcomeStrip, EntryHandles |
| 4 | Chapter | DecisionBlock, FeatureStrip, RedactedEvidence, MilestoneClose |
| 5 | Results Table | targets query, NextCaseHandoff |
| 6 | Linear View | renders from the same queries — no new content |
| 7 | Comparison pages | table component, chapter cross-refs |
| 8 | Accessibility page | prose template |
| 9 | Systems | prose + link into Cervello DS chapter |
| 10 | About | timeline component |
| 11 | Philosophy | docs-style prose template |
| 12 | Contact | form → Supabase or email service |
| 13 | 404 | shell only |

**Content loaded in MVP-1:** Egypt Acquisition Web (4 chapters) · Neobiz Mobile (2) · UAE Acquisition (cover + 1) · Cervello Cloud (3)

---

## PHASE 2 — LAUNCH GATE
*All must pass before pointing `moatazmustapha.com` at Vercel.*

- [ ] All four Case Files complete, every declared target closed
- [ ] Metric truth table applied everywhere — Egypt figures marked **projected**; UAE public wording only; the ~30% recovery-rate framing correct and removed from the CV's UAE section
- [ ] No unredacted NDA material anywhere on the site or in the repo
- [ ] Mobile tested end to end, both languages
- [ ] RTL verified on every page type
- [ ] LLM summary test passes
- [ ] Zero heading-level typos, both languages
- [ ] Lighthouse: performance + accessibility acceptable
- [ ] Analytics confirmed writing to Supabase
- [ ] Old Webflow site stays live until every box above is ticked

---

## PHASE 3+ — AFTER LAUNCH
Per Architecture v2.0 layers: **L2** Door + result screens + how-this-site-works · **L3** Cuts, Read/Learn, comments, Studio · **L4** RAG/Ask + admin panel (retires Notion sync) + analytics dashboard · **L5** open-source design system + Case Study Zero.

---

## OPEN ITEMS BLOCKING WORK

| # | Item | Blocks | Owner |
|---|---|---|---|
| 1 | **Design tokens / visual language** | all visual work | Moataz |
| 2 | Stale Cervello rows in Notion (route collision + 5 orphaned chapters) | sync script correctness | Moataz |
| 3 | Mini case files — in MVP-1 or cut? | gallery scope | Moataz |
| 4 | Metric truth table application | Results Tables, gallery cards | Moataz |
| 5 | NDA asset audit + redaction rules | every Evidence block | Moataz |
| 6 | Neobiz Mobile feature lists | 2 chapters | Moataz |
| 7 | Arabic typeface choice | tokens, RTL shell | Moataz |
| 8 | Supabase MCP permission error | direct DB access from chat | Moataz |

---

## DEFINITION OF DONE (per page)
Renders from the database with zero hardcoded strings · works in `en` and `ar` with correct RTL · responsive from 320px · real content, no placeholders · every image via `CloudinaryImage` · no dead ends · passes the LLM read test · committed and deployed to preview.
