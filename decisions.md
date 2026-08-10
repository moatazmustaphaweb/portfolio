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

---

## OPEN — NOT YET DECIDED

| # | Question | Blocks |
|---|---|---|
| A | **Visual language** — colour, type scale, Arabic typeface, redaction palette | All page building. Resolves when the Claude Design link is provided |
| B | Mini case files — in MVP-1 or cut? | Gallery scope |
| C | Stale Cervello rows — route collision + 5 orphaned chapters | Sync correctness |
| D | Contact form delivery — Supabase table or email service? | Contact page |
| E | Ask layer: lead capture yes/no; answer boundaries | Layer 4 |
