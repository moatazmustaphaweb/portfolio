# CLAUDE.md — moatazmustapha.com

You are building Moataz Mustapha's portfolio. Read this file fully before acting. It is the front door; everything else is in `/docs` and is loaded on demand.

---

## ⚠️ THE FIRST RULE, AND IT GOVERNS EVERYTHING BELOW

**Do not start work, and do not write a prompt or issue an instruction to anyone, until Moataz has answered your open questions.**

If something is genuinely undecided, stop and ask. Never a question and a prompt in the same message — he sends prompts verbatim, so a question left open above one means he sends it without knowing whether it was answered.

This outranks the seven rules below, the skill precedence, and every scoping instruction in a brief. A guess that keeps the session moving costs more than the pause.

**It applies to agents too.** A subagent does not talk to Moataz: it returns the question to the orchestrator and stops. The orchestrator does not answer it to keep moving — it asks Moataz, in a message with no prompt in it, and waits. See `docs/agents.md`.

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
6. **NDA discipline.** No client screens or files in this repo, ever — assets live in Cloudinary, and git history is permanent. **The NDA treatment is a signal, not concealment** (amendment 036, which supersedes 027): the Mashreq screens are design files carrying dummy data Moataz wrote himself, so there is nothing to hide. NDA work renders full grayscale via a live Cloudinary transform, driven by `case_files.nda` — never by baking the treatment into the pixels, and never by a per-image flag a call site can forget. `media.redacted` stays `false`.
7. **No fabricated content.** Never invent metrics, outcomes, project details, or copy. If content is missing, stop and ask.

---

## THE AGENT STRUCTURE

Five roles. **`docs/agents.md` is the constitution** — the shape, who owns what, the permission boundary, the task-id scheme and the standing rules. **`docs/workflows.md` is the procedure** — every known workflow and the handoffs inside it. Read both before briefing or accepting a brief.

| Role | Owns | Writes |
|---|---|---|
| **orchestrator** | routing, briefs, review, correction, reporting to Moataz | `docs/status.md`, `TASKS.md`, `docs/agents.md`, `docs/workflows.md`, **`CLAUDE.md`**, **`docs/decisions.md`**, **`.claude/agents/*.md`**, **`.claude/skills/**`** |
| **frontend** | components, tokens, layout, RTL, rendering | files only — never git. Plus `i18n/**`, `fonts/**`, `designs/` |
| **backend** | Supabase, migrations, the sync script, `lib/content/*` | files only — never git. Plus all of `supabase/**` |
| **devops** | git commit and push, Vercel, Cloudinary, cache warming | **the only agent that writes to git history**. Plus root config, `.claude/settings*.json`, `.mcp.json`, hooks |
| **content** | Notion, writing, Arabic, content integrity | never code, never the database. Plus `Image mapping/` |

**Reading is open; writing is scoped.** Any agent may read anything so it understands what it is touching. An agent writes only inside its own area. **The full table is in `docs/agents.md` and it is the authority** — every tracked path has a row, or is marked UNOWNED in full.

**`docs/learn.md` is the exception: all five append to it**, to the section the lesson belongs in. **None of them restructure, rewrite or reorder it — its shape is Moataz's.**

**Only devops commits or pushes.** frontend and backend write files and stop — two sessions committing in parallel interleaved this history last week and made `status.md` sort wrongly.

**The orchestrator does not do the work itself when an agent exists for it.** **The one exception, and it is a list rather than a principle:** it writes `.claude/agents/*.md`, `.claude/skills/**`, `CLAUDE.md` and `docs/decisions.md` itself. There is no agent to route those to that would not be editing the rules it is judged against.

**Machine-level files are outside every agent's scope, devops included** — `~/.mcp.json`, `~/.claude/settings.json`, `~/.claude/helpers/**`. Readable by all; changing one is Moataz's explicit decision.

**Every reply ends with a closing line, on its own, nothing after it:** `DONE — <task id>` or `BLOCKED — <task id>`. A question returned to the orchestrator is `BLOCKED`. **The status entry gates `DONE`** — it is the last thing written before closing, and work finished without one is not a finished task.

**The orchestrator replies to Moataz in Arabic**, in the four-part shape — what changed · what needs his decision · what stayed open · what was not verified. **Briefs to agents stay in English.** It reviews its agents rather than relaying them: an agent that claims success without verifying is sent back. See `docs/agents.md`.

**Every status entry carries a nine-digit task id** — `014210826` is task 014, day 21, month 08, year 26; the number resets daily. **Moataz never writes it.** The orchestrator derives it by reading the highest id in `docs/status.md`, takes the next number on the same date (or restarts at `001` on a new day), announces it in the first line of its reply, passes it in the brief, and every agent that touches that task writes it in its entry. **Entries are dated to match the commit time, never ahead of it.**

**Visual verification is Moataz's.** No agent owns it. Agents produce screenshots and report measurements; he looks. A visual-review agent is a planned addition, recorded in `docs/agents.md` so the gap is deliberate.

---

## SKILL PRECEDENCE

Five project skills live in `.claude/skills/` and govern this repo. Where a global or plugin skill covers the same ground, **the project skill decides and the global skill executes.**

| Skill | Read it when | Takes precedence over |
|---|---|---|
| `portfolio-voice` | Any prose that will appear on the site, in either language | `docs/learn.md` Part 2 and `docs/content-brief.md` on **how a sentence is written** |
| `motion-system` | Any animation, transition, scroll effect, canvas, or interactive surface | `motion-framer`, `gsap-scrolltrigger`, `threejs-webgl`, `react-three-fiber`, `babylonjs-engine` |
| `metric-integrity` | Any number, outcome, target, or results table | — |
| `rtl-guard` | Any component, style, layout, or directional glyph | `artifact-design`, any Figma design-to-code skill |
| `perf-budget` | Anything running per frame or on every request | The animation and 3D skills above |

The library skills describe **how to use a library**. The project skills decide **what is permitted here**. Reaching for the library skill first is how a correct implementation ships a wrong one — a redacted region rendered as dissolving points is technically fine WebGL and a hard failure under rule 6.

### `portfolio-voice` — what passes through it

Added 2026-08-21, task `023210826`. It was drawn from the captions and pages already written, so it describes this site's prose rather than prescribing prose in general.

**Everything that a visitor reads goes through it:** case-file covers, chapters, captions and alt text, section headings, outcome and target labels and notes, entry handles, About, Philosophy, Systems, Contact, the 404, UI strings — English and Arabic alike. **Revising an existing line counts**, not only writing a new one.

**Nothing that only a maintainer reads goes through it:** code comments, commit messages, `docs/**` including `status.md` and `learn.md`, agent briefs, and replies to Moataz. Those have their own conventions and the voice does not apply to them.

**It owns voice, not permission.** `metric-integrity` still governs every number, rule 7 still forbids invented content, and content still reports gaps rather than filling them. A sentence that is perfectly in voice and unsourced is still refused.

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
| **Starting any session — read this first** | **`docs/learn.md`** — what has been learned across sessions: the working agreement, writing conventions in both languages, content-integrity rules, the bug classes that keep recurring, the environment traps, and where a previous session was wrong and was corrected. It records **why**, in a form that generalises. `decisions.md` records what was decided; `status.md` what happened; this is the one that stops the same mistake twice |
| Starting any session | `TASKS.md` |
| Writing SQL, migrations, or queries | `docs/schema.md` |
| Building the sync script | `docs/sync-contract.md` |
| Unsure how a system fits together | `docs/architecture.md` |
| Planning what to build next | `docs/manifesto.md`, `docs/roadmap.md` |
| Wondering why something is the way it is | `docs/decisions.md` |
| Naming things, structuring files, committing | `docs/conventions.md` |
| Asking who this is for / what success means | `docs/brief.md` |
| Styling anything | `docs/design/tokens.md` |
| Animating anything | `docs/design/motion-system.md` (post-launch Motion Layer; MVP-1 has no animation per decision 023) |
| **Writing, reviewing or auditing any content — read this first** | **`docs/content-brief.md`** — how Notion actually behaves, the writing conventions that settled in both languages, the editorial decisions and their reasoning, and where the previous content conversation was wrong. **content's file; it appends, never restructures.** An operating manual, **not a source of truth about content state** — the live page and the database win when they disagree with it |
| Reviewing or correcting Arabic copy | `docs/ui-strings-review.md` |
| Asking where the build stands | `docs/status.md` (the orchestrator's), plus `docs/status/{frontend,backend,devops,content}.md` |
| **Routing work, or briefing an agent** | **`docs/agents.md`** — the five roles, the permission boundary, the task-id scheme, what a brief must carry |
| A task that crosses more than one agent | `docs/workflows.md` — the known workflows, the handoffs, and the ledger |
| Designing or implementing redaction | `docs/redaction-brief.md` |

---

## WORKING AGREEMENT

- **`TASKS.md` is yours to manage.** Read it at session start. Update status as you work. Add discovered sub-tasks. Commit changes to it with the work they describe.
- **When documents disagree, `docs/decisions.md` wins** — the most recent dated decision is authoritative. Correct the conflicting document in the same session and log the correction.
- **When something is genuinely undecided, stop and ask.** Do not invent a decision to keep moving.
- **`docs/status.md` is written as part of the task, never offered afterwards.** It is the only channel Moataz reads — he reads the file, not the terminal. **An unchanged `status.md` is indistinguishable from work that never ran**, and that confusion has already cost three exchanges establishing whether a completed fix had happened at all.
  - No task is finished until its entry is saved. A change too small to log gets **two lines**, not silence.
  - If a task ends with no entry, **say so explicitly in the reply** so the silence is legible as a decision rather than a failure.
  - This applies hardest to **diagnoses, refusals and questions answered** — the ones most likely to be skipped, and the ones most needed. A refusal with its reasoning is a result; an empty file is not.
  - "Do only what was asked" does not override this. Scoping instructions bound **which code to touch**; they do not suspend the log.
- **`docs/learn.md` is appended to as part of the task, the same way `status.md` is.** When something is learned that would change how the next task is approached — a bug class, a preference discovered by being corrected, an environment trap that cost a session, a rule that turned out to have an exception — add it to the **right section** of that file, in that task.
  - Not individual decisions: those go to `docs/decisions.md`. Not session outcomes: those go to `docs/status.md`. Not anything true of only one file.
  - **The test: would reading it beforehand have saved time?** If no, it does not belong there.
  - Do not restructure the file or rewrite its sections. Append to the section it belongs in. It is written the way Moataz wants to read it.
- **Definition of done, per page:** renders from the database with zero hardcoded strings · works in `en` and `ar` with correct RTL · responsive from 320px · real content, no placeholders · images via `CloudinaryImage` · no dead ends · committed and **verified on production**. ⚠️ It used to read *"deployed to preview"* — that is now unsatisfiable: Preview has no environment variables and every branch build fails (decision 059). Verify on `gate.moatazmustapha.com` or on a local server, never on a branch URL.

---

## CURRENT STATE

*Updated 2026-08-26, task `009250826`. Source: `docs/mvp1-launch-gate.md` for the survey and
`docs/status.md` for the detail — this is the orientation.*

**MVP-1 IS CLOSED AND THE SITE IS LIVE.** `gate.moatazmustapha.com`, public, no login wall. The
launch gate was worked through item by item on 2026-08-26 and every one is closed, tested, or
deferred with a reason. **`docs/mvp1-launch-gate.md` is the record and it is measured, not
quoted.** Read it before reasoning about what is left.

⚠️ **THIS SECTION USED TO ROT, AND THAT IS WHY IT NOW HOLDS ALMOST NO FACTS.**

Five claims in this file were found false on 2026-08-26 alone — `media` counts, cover counts, the
git state, `/how-this-site-works` 404ing, draft slugs rendering `__next_error__`. Every one was
true when written, quoted into a brief afterwards, and never re-run. **The fix is the same every
time: replace the number with the command that answers it.** Do not write a fresher count back
in — a line that cannot be true or false cannot rot.

```
# Is it live, and on what?
curl -s -o /dev/null -w '%{http_code}\n' https://gate.moatazmustapha.com/en
gh api repos/moatazmustaphaweb/portfolio/commits/main --jq '.sha[0:7]'

# Git, all of it
git fetch origin && git log origin/main..HEAD --oneline && gh auth status

# Content: what is actually in the database
select count(*) from media;
select slug, cover_kind, cover_media_id is not null from case_files where status='published';

# Notion vs the database
npm run sync:notion -- --dry-run --all
```

**What is known and is not a count:**

- **Every route returns 200 in both locales**; unmatched URLs render the designed 404.
- **The device frames are live** — a laptop on landscape screenshots, a phone on portrait ones,
  decided by the picture's own aspect ratio rather than by route or folder name.
- **The contact form works.** Moataz submitted it and the message arrived.
- **Accessibility, structural pass: 17 routes, 0 findings.** ⚠️ **Contrast, focus order and
  screen-reader behaviour have NOT been exercised.** The semantics are right; the experience is
  unestablished. Do not read the pass as an audit.

**Carried to MVP-2, none of it blocking a reader:**

- **Vercel Preview has no environment variables** (decision 059), so **every branch build fails**
  on `NEXT_PUBLIC_SUPABASE_URL is not set` whatever is on the branch. A red check on a PR is not
  evidence of a problem — check what it says before repeating it.
- **`scripts/sync-notion.ts` creates media rows without dimensions.** Migration 0060 backfilled
  160; the next `[cld]` tag written in Notion arrives NULL and its figure renders unframed.
- **Three pages have no sync write path** — both comparison pages and the accessibility page.
  They match Notion today, but a future edit there will never appear and nothing reports it.
- **`/api/revalidate` returns 400.** Nothing depends on it: every route is `server-rendered on
  demand`, so content changes appear without it.
- **A blank duplicate Notion page** claims the Cervello cover route and fails the sync every run.
  Archiving it is Moataz's.

**Open content questions, still his:** the four mini case files are live at direct links only,
deliberately (they are not linked from `/work` and not in the sitemap) — whether they get real
content is open question B.

### What is not being built

MVP-1 ships plain, per decision 023. The **Motion Layer** (`docs/design/motion-system.md` v2.0) is specified and its token amendments are logged (decisions 046–048), but it is Layer 2 work: permitted only **after** the launch gate passes, in full, and only behind a feature flag (decision 047). **The gate passed on 2026-08-26**, so the first condition is met and the flag is now the only one — that is a change in status, not permission to start. Nothing in it may be partially implemented inside MVP-1 — not a prototype, not one page. Layers 2–5 otherwise stand as in `docs/roadmap.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
