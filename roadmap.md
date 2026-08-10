# docs/roadmap.md — Release Roadmap

Scope buckets, not dated plans. Tracking lives in Notion (`Build Layer` property). Each layer attaches to the Layer 0 schema without rework — that is the point of the architecture.

---

## LAYER 0 — FOUNDATION
*Prerequisite for everything. ~8–10 working days.*

Supabase schema · seed script (settings, navigation, ui_strings) · Notion→Supabase sync · query layer + ISR · Next.js/Tailwind/tokens · `[locale]` routing + RTL shell · Cloudinary + `CloudinaryImage` · events + GA · JSON-LD, llms.txt, sitemap

**Exit:** a blank page renders in both locales, header and footer built entirely from the database, real content synced.

---

## LAYER 1 — MVP-1 (SHIPS)
*~15–20 working days. Notion tag: `Layer 1 — MVP-1`*

**Pages:** Landing · Classic Gallery · Case File Cover (LivingMap × 3 grammars) · Chapter · Results Table · Linear View · Comparison × 2 · Accessibility · Systems · About · Philosophy · Contact · 404

**Content:** Egypt Acquisition Web (4 chapters) · Neobiz Mobile (2) · UAE Acquisition (cover + 1) · Cervello Cloud (3)

**Exit:** the launch gate in `manifesto.md` passes; `moatazmustapha.com` points at Vercel; Webflow retired.

---

## LAYER 2 — PATHS
*The adaptive layer. The project's distinctive idea.*

The Door (4 steps: word cards → time budget → correctable sentence → persona) · scoring engine (card 2pts primary / 1pt secondary, budget 1pt; tiers SURE / TIE / LIKELY / UNSURE) · five result screens · `/how-this-site-works` · Reverse-UX components (progress, stat side notes, correction prompt) · door events live

**Prerequisite:** MVP-1 shipped and stable. **Exit:** archetype inference logging real data for validation.

---

## LAYER 3 — DEPTH
*Content network and community.*

Cuts network + cross-links · Read/Learn (index, article view, series, subscribe) · comments · Studio + cultural CV download · Experiments

**Exit:** articles publishing on a cadence; Studio serving the Curator path.

---

## LAYER 4 — INTELLIGENCE
*Automation and self-knowledge.*

RAG ingest (published content → `documents` + pgvector) · `/api/ask` · Ask dock/panel · **admin panel** (content CMS — retires the Notion sync) · analytics dashboard (confusion matrices, funnel, kill/keep thresholds)

**Exit:** content editable in-app; the Door's inference validated or falsified against real data.

---

## LAYER 5 — CONTRIBUTION
*The public-figure and generosity layer.*

Open-source community design system · `/systems/this-website` — Case Study Zero (tokens, components, changelog, build log)

**Exit:** the site documents itself; the design system is public and adoptable.

---

## TRACKING

Notion `Build Layer` property is the tracker. `TASKS.md` carries the live queue for the current layer only — not the whole roadmap. Adding a layer's tasks to `TASKS.md` happens when that layer starts, not before.
