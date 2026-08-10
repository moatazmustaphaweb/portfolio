# moatazmustapha.com — Full Site Architecture v2.0
### Next.js + Supabase · Fully dynamic · Built once, extended in layers
*Core principle: nothing is hardcoded. Every string on the site — including the name, the menu labels, and every UI word — comes from the database. The foundation must absorb the complete vision (paths, RAG, articles, comments, admin panel, studio) without being rebuilt.*

*Changed from v1.0: content moved from static repo files to Supabase; ISR added as the rendering strategy; Cloudinary added for media; Notion formalised as the authoring layer; settings / navigation / ui_strings tables added for full dynamism.*

---

## PART 1 — THE STACK

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js (App Router) + TypeScript | File-based routing matches the sitemap 1:1; server components render real text |
| **Rendering** | **ISR (Incremental Static Regeneration)** | Pages render server-side, cache at the edge, revalidate on publish. Dynamic source, static-file speed. Scales to millions without extra DB load |
| **Styling** | Tailwind CSS + design tokens as CSS variables | Tokens are the design system; the site documents its own tokens later (Case Study Zero) |
| **Content storage** | **Supabase (Postgres)** | Single source of truth for ALL content, both languages, plus comments, articles, settings, navigation |
| **Media** | **Cloudinary** | Images stored as `public_id`; URLs and transforms built at render. No repo bloat, global CDN, on-the-fly resizing |
| **Authoring** | **Notion → sync script → Supabase** | Writing stays comfortable; the database stays authoritative. Replaced by the admin panel in Layer 4 — same tables, no migration |
| **AI (v-next)** | RAG: Supabase pgvector + cheap API model | No fine-tuning; answers grounded in real published content only |
| **Hosting** | Vercel | Native Next.js, edge caching, preview deploys per branch |
| **Analytics** | GA (aggregate) + Supabase events (decision trail) | GA can't capture the Door's decision trail; Supabase can, and you own it |
| **i18n** | `next-intl` with `[locale]` routing | Locale in the URL = shareable, indexable, AI-legible in both languages |

---

## PART 2 — ROUTE ARCHITECTURE

```
app/
  [locale]/                        ← en | ar (RTL flips at the layout level)
    layout.tsx                     ← header/footer from DB, dir=ltr|rtl, Ask mount point
    page.tsx                       ← Landing
    work/
      page.tsx                     ← Classic Gallery (filterable)
      [caseFile]/
        page.tsx                   ← Case File Cover (living map)
        [chapter]/page.tsx         ← Chapter
        all/page.tsx               ← Linear view
        cut/[cut]/page.tsx         ← Cut (v-next)
    systems/
      page.tsx
      [system]/page.tsx
    studio/                        ← v-next
      page.tsx
      [work]/page.tsx
    read/                          ← v-next
      page.tsx
      [slug]/page.tsx
      series/[series]/page.tsx
    about/
      page.tsx
      [section]/page.tsx           ← philosophy | career | how-i-work | reading | beliefs
    experiments/                   ← v-next
      page.tsx
      [slug]/page.tsx
    contact/page.tsx
    how-this-site-works/page.tsx   ← ships WITH the Door
    door/page.tsx                  ← v-next (4-step intake)
    for/[archetype]/page.tsx       ← v-next (5 result screens)
  api/
    events/route.ts                ← analytics ingest → Supabase
    revalidate/route.ts            ← ISR cache invalidation on publish
    ask/route.ts                   ← RAG endpoint (v-next)
  admin/                           ← v-next, auth-gated
    dashboard/page.tsx             ← analytics cockpit
    content/page.tsx               ← the CMS that replaces Notion sync
```

**Route rules baked in:**
- Every route server-rendered as real text (AI-reader gate)
- `/for/[archetype]` reorders content; it never gates it — all sections reachable from every path
- Deep links (shared Cuts, the recruiter gallery link) bypass the Door entirely
- Locale is always in the URL; no cookie-only language state

---

## PART 3 — THE DATA MODEL

**Design rule:** content and translation are separate concerns. Structure lives in typed tables; every human-readable string lives in `translations`. Adding a third language is rows, never a migration. Partial translation is the absence of a row, not a null column.

### 3.1 Content structure

```sql
case_files       (id, slug, grammar, domain, sort_order, status,
                  nda, cover_media_id, published_at, created_at, updated_at)
  -- grammar: 'country-culture' | 'ecosystem' | 'design-system'
  -- status:  'draft' | 'published' | 'archived'

chapters         (id, case_file_id, slug, sort_order, status,
                  hero_media_id, created_at, updated_at)

features         (id, chapter_id, sort_order)
  -- the feature strips: scope proof, one line each

outcomes         (id, case_file_id, value, status, sort_order)
  -- status: 'projected' | 'achieved' | 'not-measurable'  ← NOT NULL, no default
  -- the no-fabrication rule, enforced by the schema

targets          (id, case_file_id, status, sort_order)
  -- status: 'achieved' | 'missed' | 'not-measurable'
  -- drives the Results Table; every declared target must be closed

articles         (id, slug, stream, series_id, sort_order, status,
                  hero_media_id, published_at)
  -- stream: 'build-log' | 'field-notes' | 'positions'

series           (id, slug, sort_order, status)

studio_works     (id, slug, year, medium_key, sort_order, status, media_id)

experiments      (id, slug, domain, state, sort_order, status, url)
```

### 3.2 The translation layer

```sql
translations     (id, entity_type, entity_id, locale, field, value,
                  updated_at)
  -- entity_type: 'case_file' | 'chapter' | 'feature' | 'outcome' | 'target'
  --              | 'article' | 'series' | 'studio_work' | 'experiment'
  --              | 'media' | 'nav_item' | 'setting' | 'ui_string'
  -- locale: 'en' | 'ar'
  -- field:  'title' | 'thesis' | 'role' | 'objective' | 'context'
  --         | 'decision' | 'result' | 'body' | 'caption' | 'alt'
  --         | 'label' | 'note' | 'reflection' …
  -- value:  text (Markdown for long-form fields)
  -- UNIQUE (entity_type, entity_id, locale, field)
```

**Mandatory-field enforcement:** a chapter cannot publish without `role` and `decision` translations in at least one locale. Enforced by a publish-time check, not by nullable columns — the schema itself prevents the "we" problem.

### 3.3 Site-wide dynamism (nothing hardcoded)

```sql
settings         (key, value_type, sort_order)
  -- name, tagline, email, phone, linkedin_url, cv_url, og_image…
  -- human-readable values live in translations where they differ by locale

navigation       (id, route, parent_id, sort_order, location, visible)
  -- location: 'header' | 'footer'
  -- labels live in translations → menus are data, reorderable without deploy

ui_strings       (key, context)
  -- 'read_more', 'next_chapter', 'back_to_work', 'form_name', 'submit'…
  -- every interface word; the site is bilingual, not "translated content
  --   inside an English interface"
```

### 3.4 Media

```sql
media            (id, cloudinary_public_id, width, height, format,
                  redacted, sort_order, created_at)
  -- alt text and captions live in translations
  -- URLs are NEVER stored — built at render from public_id + transform preset
  -- redacted=true triggers the NDA visual treatment
```

### 3.5 Operations

```sql
revisions        (id, entity_type, entity_id, snapshot jsonb,
                  created_at, created_by)
  -- replaces the Git history lost by moving content out of the repo

comments         (id, entity_type, entity_id, parent_id, author_name,
                  body, status, created_at)          ← Layer 3
  -- status: 'pending' | 'approved' | 'spam'

sessions         (id uuid, started_at, locale, referrer_type, device)
events           (id, session_id, type, payload jsonb, created_at)
  -- page_view · scroll_depth · chapter_complete · entry_handle
  -- door_card · door_budget · door_hypothesis · door_action · door_persona
  -- feedback_response · email_capture · stat_note_seen

documents        (id, source_type, source_id, locale, content,
                  embedding vector)                   ← Layer 4, RAG
  -- generated FROM published content; never authored directly
```

**Privacy posture (hard constraint):** anonymous session IDs only, no personal data in events, disclosed on `/how-this-site-works`, aggregate-facing stat notes only. This keeps the transparency promise the brand rests on.

---

## PART 4 — CONTENT PIPELINE

```
Notion (authoring)  →  sync script  →  Supabase (source of truth)
                                            ↓
                                    Next.js ISR render
                                            ↓
                                     Vercel edge cache  →  visitor
                                            ↑
                              Cloudinary (images, by public_id)
```

**Sync script:** reads the Notion portfolio database, upserts `case_files`, `chapters`, `features`, and their `translations`. Idempotent — safe to re-run. Matches on slug.

**Publish → revalidate:** publishing calls `/api/revalidate` for the affected routes. Pages regenerate once; every subsequent visitor is served from cache.

**Layer 4 replacement:** the admin panel writes to the same tables. Notion sync is retired, not migrated. No schema change.

**Query layer:** a single typed data-access module (`lib/content/*`) is the only thing that talks to Supabase. Pages never query directly. This is what makes swapping the authoring source invisible to the rest of the app.

---

## PART 5 — THE COMPONENT SYSTEM

```
components/
  layout/       Header · Footer · LocaleSwitch · Breadcrumb · Nav
                (all rendered from navigation + ui_strings + settings)
  case-file/    Cover · LivingMap · OutcomeStrip · EntryHandles
                Chapter · ObjectiveHeader · DecisionBlock · FeatureStrip
                RedactedEvidence · MilestoneClose · ResultsTable
                NextCaseHandoff · Comparison
  gallery/      ProjectGrid · ProjectCard · FilterBar
  media/        CloudinaryImage (public_id → transformed URL)
  door/         WordCards · TimeBudget · GuessSentence · PersonaPicker   [v-next]
  reverse-ux/   ProgressIndicator · StatSideNote · CorrectionPrompt      [v-next]
  ask/          AskDock · AskPanel                                       [v-next]
  primitives/   Button · Card · Prose · Tag · Toggle
```

**LivingMap** takes `grammar` and renders one of three layouts from the same component: journey (country-culture), atom-and-orbit (ecosystem), or docs-tree (design-system). Static, hierarchical, collapses to a list on mobile — never a force-directed graph.

> **Corrected 2026-08-11 per decision 023.** In MVP-1 the LivingMap renders as a plain hierarchical list at every breakpoint — no positioned nodes, no connector lines, no visualisation. The three grammars still determine grouping and order; only the bespoke visual treatment is deferred to Phase 2.

**CloudinaryImage** is the only component allowed to construct image URLs. Transform presets (thumbnail, hero, gallery, redacted) are defined once and referenced by name.

---

## PART 6 — BUILD ORDER (the layers)

**Layer 0 — Foundation (build first, once, in this order)**
1. Supabase schema — all tables above, including settings / navigation / ui_strings
2. Seed script — Notion → Supabase, so real content flows immediately
3. Query layer (`lib/content/*`) + ISR configuration + `/api/revalidate`
4. Next.js + TypeScript + Tailwind + design tokens
5. `[locale]` routing with RTL · layout shell rendered from the database
6. Cloudinary integration + transform presets
7. Supabase events table + `/api/events` · GA
8. JSON-LD + llms.txt + sitemap.xml

*Order matters: pages come last. Building pages before the query layer is where this approach fails.*

**Layer 1 — MVP-1 (ships)**
Landing · Classic Gallery · Case File Cover + LivingMap · Chapter + DecisionBlock + FeatureStrip + RedactedEvidence · Linear view · ResultsTable · Comparison pages · Accessibility page · Systems (1 page) · About + Philosophy · Contact · 404
Content: Egypt Acquisition (Web, 4 chapters) · Neobiz Mobile (2 chapters) · UAE Acquisition (cover + mobile onboarding) · Cervello Cloud (3 chapters)

**Layer 2 — Paths**
Door (4 steps) · scoring engine · 5 result screens · `/how-this-site-works` · Reverse-UX components · door events live

**Layer 3 — Depth**
Cuts network + cross-links · Read/Learn (index, article, series, subscribe) · comments · Studio + cultural CV

**Layer 4 — Intelligence**
RAG ingest pipeline · `/api/ask` · Ask dock/panel · **admin panel** (content CMS + analytics dashboard) · Notion sync retired

**Layer 5 — Contribution**
Open-source community design system · `/systems/this-website` (Case Study Zero: tokens, components, changelog, build log)

---

## PART 7 — NON-NEGOTIABLES (enforced at build time)

1. **Nothing hardcoded** — no name, no menu label, no UI string in code. All from the database
2. **Every route server-rendered as real text** — LLM summary test is a launch gate
3. **`role` and `decision` required** before a chapter publishes — no Case File publishes without the "I"
4. **Every declared target closed** in the Results Table — achieved / missed / not-measurable
5. **`outcomes.status` has no default** — projected-vs-achieved is an explicit decision every time
6. **RTL is structural** — built in Layer 0, never retrofitted
7. **Image URLs are never stored** — only `public_id`; transforms are presets
8. **Pages never query Supabase directly** — only through the query layer
9. **Analytics anonymous and disclosed** — the transparency promise is load-bearing
10. **Skipping never routes to Classic** — Classic is only ever an explicit choice
11. **No dead ends** — every Chapter, Cut, and Cover offers a next step and a way back
12. **Nothing publishes without a language QA pass** — both languages
13. **Old site stays live** until MVP-1 is genuinely stronger

---

## PART 8 — WHAT MVP-1 DELIBERATELY DEFERS
Door + result screens · RAG/Ask · Read/Learn · Cuts · comments · Studio · Experiments · `/how-this-site-works` · admin panel · open-source design system · remaining mini case files · About sub-pages

*All of them attach to the Layer 0 schema without rework. That is the point of this architecture.*
