# CLAUDE.md — moatazmustapha.com

You are building Moataz Mustapha's portfolio. Read this file fully before acting. It is the front door; everything else is in `/docs` and is loaded on demand.

---

## THE PROJECT IN ONE PARAGRAPH

A bilingual (English/Arabic, full RTL) portfolio for a senior product designer with ~10 years in fintech, banking, and IoT. It is not a conventional portfolio: the content is fully dynamic, the site documents its own design system, and later phases add an adaptive visitor-intake ("the Door"), a RAG assistant, articles, and comments. MVP-1 ships the classic portfolio — gallery plus four case files — on the full architecture, so nothing is rebuilt later.

---

## THE SEVEN RULES (non-negotiable)

1. **Nothing hardcoded.** No name, menu label, button text, heading, or any human-readable string in code. All of it comes from Supabase.
2. **Pages never query Supabase directly.** Only `lib/content/*` talks to the database.
3. **Image URLs are never stored.** Cloudinary `public_id` + a named transform preset. `CloudinaryImage` is the only component that builds URLs.
4. **Build in order.** Schema → seed → query layer → tokens → shell → pages. Pages last.
5. **Secrets never enter the repo.** `.env.local` is gitignored. Service-role key is server-side only.
6. **NDA discipline.** No Mashreq screens, files, or unredacted assets in this repo, ever. Git history is permanent.
7. **No fabricated content.** Never invent metrics, outcomes, project details, or copy. If content is missing, stop and ask.

---

## STACK

Next.js (App Router) + TypeScript · Tailwind + CSS-variable tokens · Supabase (Postgres, all content) · Cloudinary (media) · Vercel (hosting, ISR) · `next-intl` (`[locale]` routing, en | ar) · Notion → sync script → Supabase (authoring, until the admin panel in Layer 4)

---

## DIRECTORY MAP

```
app/[locale]/…        routes; see docs/architecture.md Part 2
lib/supabase/         client (anon) + server (service role)
lib/content/          THE ONLY database access layer
components/           layout · case-file · gallery · media · primitives
scripts/sync-notion.ts  Notion → Supabase
docs/                 all project documentation
```

---

## WHICH DOC TO READ WHEN

| If you are… | Read |
|---|---|
| Starting any session | `TASKS.md` |
| Writing SQL, migrations, or queries | `docs/schema.md` |
| Building the sync script | `docs/sync-contract.md` |
| Unsure how a system fits together | `docs/architecture.md` |
| Planning what to build next | `docs/manifesto.md`, `docs/roadmap.md` |
| Wondering why something is the way it is | `docs/decisions.md` |
| Naming things, structuring files, committing | `docs/conventions.md` |
| Asking who this is for / what success means | `docs/brief.md` |
| Styling anything | `docs/design/tokens.md` |
| Reviewing or correcting Arabic copy | `docs/ui-strings-review.md` |
| Asking where the build stands | `docs/status.md` |

---

## WORKING AGREEMENT

- **`TASKS.md` is yours to manage.** Read it at session start. Update status as you work. Add discovered sub-tasks. Commit changes to it with the work they describe.
- **When documents disagree, `docs/decisions.md` wins** — the most recent dated decision is authoritative. Correct the conflicting document in the same session and log the correction.
- **When something is genuinely undecided, stop and ask.** Do not invent a decision to keep moving.
- **Definition of done, per page:** renders from the database with zero hardcoded strings · works in `en` and `ar` with correct RTL · responsive from 320px · real content, no placeholders · images via `CloudinaryImage` · no dead ends · committed and deployed to preview.

---

## CURRENT STATE

*Updated 2026-08-11.*

Phase 0 (Foundation). The repo is under version control as of the first commit; documentation lives in `/docs`. The visual language is decided — Vercel-style, per decision 018 — and the abandoned Neubrutalist system has been removed along with all static content, per decision 022.

Still to come, in order: design tokens (0.6) · Supabase schema (0.2) · seed (0.3) · sync script (0.4) · query layer (0.5) · i18n + RTL shell (0.7). Content lives in Notion and has not yet been synced. **Pages are built last** — nothing in `app/` beyond a placeholder until the query layer and shell exist.
