# TASKS.md

**Owner:** Claude Code maintains this file. Moataz seeds it and may add items.
**Protocol:** read at session start · move items between sections as work progresses · add discovered sub-tasks under their parent · commit changes alongside the work they describe · never delete completed items, move them to DONE with a date.

---

## 🔴 BLOCKED

| Task | Blocked by | Owner |
|---|---|---|
| Design tokens (`tokens.md`) | **Two conflicting visual languages in Claude Design project `f6113c80`.** The `_ds/` folder is a Neubrutalist system (Space Grotesk, #F0F0F0 page, 2px black borders, hard offset shadows, no blur/gradients). All 12 `*.dc.html` page designs use a *different* language (Geist + Geist Mono, dark-first #000, accent #0070f3, 1px borders, 6–12px radii, backdrop blur, radial gradient). Pick one before tokens can be written | Moataz |
| All page building | Tokens above | — |
| Repo is not under version control | `git init` never run — no history exists, so rule 6 (NDA discipline: "git history is permanent") has no baseline and manifesto rule 5 ("every commit deploys") cannot hold | Moataz |
| Existing repo code conflicts with the architecture | Static content in `content/caseFiles/*.ts`, hardcoded copy in `app/page.tsx`, no `[locale]` routing, no Supabase/next-intl/Cloudinary deps. Decide: delete and rebuild per Layer 0, or migrate | Moataz |
| Published metrics | **Decision 007 violated in both the design and the repo.** The ~30% appears as a *conversion increase* on the **UAE** case file (design + `content/caseFiles/uaeBusinessBanking.ts`) and as **"confirmed"** on Egypt (`egyptBusinessBanking.ts`), but 007 states it is a *recovery rate* for abandoned branch applicants, that Egypt figures are **projected**, and that it must be removed from UAE entirely | Moataz |
| Results Table statuses | Design uses `Confirmed / In progress / Directional`; schema enums are `targets: achieved\|missed\|not-measurable` and `outcomes: projected\|achieved\|not-measurable`. Reconcile — schema wins unless a new decision is logged | Moataz |
| Supabase MCP | Server added to `.mcp.json`; awaiting `claude /mcp` authentication in a regular terminal. The claude.ai Supabase connector still returns the permission error noted as manifesto open item #8 | Moataz |
| Sync script correctness | Stale Cervello rows in Notion: route collision at `/work/cervello` + 5 orphaned chapters | Moataz |
| Gallery scope | Mini case files — in MVP-1 or cut? | Moataz |
| Evidence blocks | NDA asset audit + redaction rules | Moataz |
| Neobiz Mobile chapters | Mobile feature lists not provided | Moataz |
| Arabic typography | Typeface choice | Moataz |

---

## 🟡 IN PROGRESS

*(nothing yet)*

---

## ⬜ QUEUE — PHASE 0: FOUNDATION

### 0.1 Repo & environment
- [ ] `create-next-app` — TypeScript, App Router, Tailwind, ESLint
- [ ] Verify `.gitignore` covers `.env*.local` **before first commit**
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
- [ ] 🔴 BLOCKED — see above

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

*(nothing yet)*
