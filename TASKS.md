# TASKS.md

**Owner:** Claude Code maintains this file. Moataz seeds it and may add items.
**Protocol:** read at session start · move items between sections as work progresses · add discovered sub-tasks under their parent · commit changes alongside the work they describe · never delete completed items, move them to DONE with a date.

---

## 🔴 BLOCKED

| Task | Blocked by | Owner |
|---|---|---|
| 0.2 Supabase schema | Awaiting `claude /mcp` authentication in a regular terminal (not the IDE extension). Also: `settings` table design issue needs resolving before apply — see decision 025 | Moataz |
| 0.4 Sync script correctness | Stale Cervello rows in Notion: route collision at `/work/cervello` + 5 orphaned chapters | Moataz |
| Gallery scope | Mini case files — in MVP-1 or cut? | Moataz |
| Evidence blocks | NDA asset audit + redaction rules | Moataz |
| Neobiz Mobile chapters | Mobile feature lists not provided | Moataz |
| Permanent Arabic typeface | Geist is an explicit interim choice (decision 020). Replace when a proper Arabic face is selected | Moataz |

*Resolved 2026-08-11 by the decisions logged as 018–024: visual language, light+dark, interim Arabic face, content sourcing, rebuild-not-migrate, plain MVP-1, and Results Table enums.*

---

## 🟡 IN PROGRESS

### Phase 0 foundation — steps 1–4 of the current work order
- [x] **Step 1** — `git init` + clean baseline commit (disputed content removed first)
- [x] **Step 2** — documentation moved into `/docs/`, cross-references fixed
- [ ] **Step 3** — `docs/design/tokens.md` written from the Vercel-style design, implemented in `globals.css` + `tailwind.config.ts`
- [ ] **Step 4** — Layer 0 schema applied to Supabase (blocked on `/mcp` auth)

---

## ⬜ QUEUE — PHASE 0: FOUNDATION

### 0.1 Repo & environment
- [x] `create-next-app` — TypeScript, App Router, Tailwind *(ESLint not installed — add)*
- [x] Verify `.gitignore` covers `.env*.local` **before first commit** — covered by `.env*`
- [ ] Add ESLint
- [ ] Create `.env.local` with all keys (see `docs/conventions.md` for the list)
- [ ] Connect Vercel to the repo; add the same env vars in Vercel
- [ ] First deploy succeeds

### 0.2 Supabase schema
- [ ] Create enums
- [ ] `media`
- [ ] `case_files` → `chapters` → `features`
- [ ] `outcomes`, `targets`
- [ ] `series` → `articles`
- [ ] `studio_works`, `experiments`
- [ ] `settings`, `navigation`, `ui_strings`
- [ ] `translations` (with the unique constraint)
- [ ] `revisions`
- [ ] `sessions`, `events`
- [ ] Indexes
- [ ] RLS policies

### 0.3 Seed non-content tables
- [ ] `settings` rows + translations (en + ar)
- [ ] `navigation` rows + translations (en + ar)
- [ ] `ui_strings` rows + translations (en + ar)

### 0.4 Notion → Supabase sync
- [ ] `scripts/sync-notion.ts` per `docs/sync-contract.md`
- [ ] Dry-run mode
- [ ] First real sync

### 0.5 Query layer
- [ ] `lib/supabase/client.ts` + `server.ts`
- [ ] `lib/content/types.ts`
- [ ] `lib/content/translate.ts` (with English fallback)
- [ ] `lib/content/{case-files,chapters,settings,navigation,ui}.ts`
- [ ] ISR config + `/api/revalidate`

### 0.6 Design tokens
- [ ] Extract token values from the Vercel-style `*.dc.html` designs
- [ ] Write `docs/design/tokens.md` (semantic names, light + dark, RTL-safe)
- [ ] Implement in `app/globals.css` + `tailwind.config.ts`
- [ ] Swap Space Grotesk → Geist + Geist Mono in `app/layout.tsx`

### 0.7 i18n + RTL shell
- [ ] `next-intl` + `[locale]` routing
- [ ] `dir` at layout level, logical CSS properties throughout
- [ ] Header, Footer, Nav, LocaleSwitch, Breadcrumb — all from the database
- [ ] Verify full mirroring in `ar`

### 0.8 Media
- [ ] Cloudinary + `next-cloudinary`
- [ ] `CloudinaryImage` component
- [ ] Transform presets: thumb, card, hero, gallery, redacted

### 0.9 Instrumentation & machine legibility
- [ ] `/api/events` → Supabase (anonymous session IDs)
- [ ] GA
- [ ] Person JSON-LD, `llms.txt`, `sitemap.xml`, `robots.txt`
- [ ] Gate: paste live URL into ChatGPT/Claude, verify accurate summary

---

## ⬜ QUEUE — PHASE 1: MVP-1 PAGES
*Build in this order.*

- [ ] 1. Landing
- [ ] 2. Classic Gallery
- [ ] 3. Case File Cover (LivingMap × 3 grammars)
- [ ] 4. Chapter (DecisionBlock, FeatureStrip, RedactedEvidence, MilestoneClose)
- [ ] 5. Results Table
- [ ] 6. Linear View
- [ ] 7. Comparison pages
- [ ] 8. Accessibility page
- [ ] 9. Systems
- [ ] 10. About
- [ ] 11. Philosophy
- [ ] 12. Contact
- [ ] 13. 404

---

## ⬜ QUEUE — PHASE 2: LAUNCH GATE
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
