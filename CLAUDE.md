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

Four project skills live in `.claude/skills/` and govern this repo. Where a global or plugin skill covers the same ground, **the project skill decides and the global skill executes.**

| Skill | Read it when | Takes precedence over |
|---|---|---|
| `motion-system` | Any animation, transition, scroll effect, canvas, or interactive surface | `motion-framer`, `gsap-scrolltrigger`, `threejs-webgl`, `react-three-fiber`, `babylonjs-engine` |
| `metric-integrity` | Any number, outcome, target, or results table | — |
| `rtl-guard` | Any component, style, layout, or directional glyph | `artifact-design`, any Figma design-to-code skill |
| `perf-budget` | Anything running per frame or on every request | The animation and 3D skills above |

The library skills describe **how to use a library**. The project skills decide **what is permitted here**. Reaching for the library skill first is how a correct implementation ships a wrong one — a redacted region rendered as dissolving points is technically fine WebGL and a hard failure under rule 6.

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
- **Definition of done, per page:** renders from the database with zero hardcoded strings · works in `en` and `ar` with correct RTL · responsive from 320px · real content, no placeholders · images via `CloudinaryImage` · no dead ends · committed and deployed to preview.

---

## CURRENT STATE

*Updated 2026-08-13. Source: `docs/status.md`, which is the detail — this is the orientation.*

**Phase 0 is complete and MVP-1's page set is built.** The project is at the **launch gate**, not in foundation work. Schema, seed, Notion sync, query layer, tokens, i18n + RTL shell, Cloudinary and instrumentation all exist and are exercised. Real content is synced. Every route in the route map renders from the database in both locales, and the page compositions have been rebuilt against the twelve `.dc.html` design files.

**What passes.** 36/36 route-locale combinations return 200 against a real production build (`next build` + `next start`, not dev). Build, typecheck, sync tests and content verification all exit 0. ESLint is installed and at **zero** errors — the three `set-state-in-effect` errors are gone because the cause is gone, rewritten onto `useSyncExternalStore`, nothing suppressed. Per-page metadata, the sitemap's three missing route families, and 44px primary tap targets are all fixed. The LLM read test has been run with real content and the verdict was *"yes — interview him"*, with role clarity and metric labelling singled out as the site's strongest properties.

### The launch gate is NOT passed. What it still lists as open:

**Never tested, in any environment** — "not tested" and "working" have been conflated on this project before, so these are listed rather than assumed:

- **The visual pass has never happened.** Not once, across multiple sessions — the browser cannot reach the local server. Everything is verified by DOM inspection only. This is the longest-standing untested claim in the project, and it is what let the 404 be reported as working for weeks.
- **No accessibility audit.** No axe, no Lighthouse, no keyboard-only walkthrough, no screen-reader pass. Semantics were written carefully and verified structurally; they have never been exercised.
- **The contact form has never been submitted through a browser.** Four route branches tested with `curl`; the rendered form, its validation, the honeypot in a real DOM and the success state have not been clicked once.
- **ISR has never been observed working in production**, and `/api/revalidate` has never been called against a production build.
- **No deploy.** No Vercel project. Nothing has ever run on Vercel's runtime. *(Corrected 2026-08-21, task `001210826`: the "no git remote" half of this was stale — `origin` is `github.com/moatazmustaphaweb/portfolio.git`.)* **`main` is NOT level with origin, and this line claimed it was for two days.** Corrected 2026-08-21, task `018210826`, by running the command rather than reading the sentence. **The push is refused**: the only authenticated GitHub account has no write access to the repository, so commits are authored as Moataz and pushed as someone else. **Do not restate a commit count here** — a number goes stale the moment the next commit lands, and this line going stale is what let a task-014 commit be reported as pushed when it never left the machine. Run `git log origin/main..HEAD --oneline` and read the answer.

**Known broken or half-done:**

- **`notFound()` thrown inside a locale route** (a draft slug like `/en/work/east`) still renders Next's `__next_error__` shell — no `lang`, no `dir` on `<html>`. Mitigated by `app/not-found.tsx` setting both on its own wrapper. Unmatched URLs *are* fixed and render the designed 404 in the correct locale.
- **The `Achieved` label carries two different claims** — "live in production for 18 months" and "ten people in a usability lab" — and the gallery card shows the label without the evidence line. The read test caught this as the one place the metric discipline leaks. Content and design problem, not purely either.
- **The privacy claims render nowhere.** `privacy_no_ip`, `privacy_no_tracking`, `privacy_location`, `privacy_title` are seeded in both languages and resolved by no component; `/how-this-site-works` is Layer 2 and 404s.
- **Arabic falls back to English in chapter prose, not on the static pages.** Corrected 2026-08-21 against the database — the previous claim here (46 `page_sections`, 12 `entry_handles`, About/Philosophy/Systems/Contact English-only) was stale and wrong in both directions. Measured now: About 7/7, Philosophy 5/5, Contact 5/5, Systems 5/5 sections translated, and `entry_handles` at 24/24. **The static pages are done.** What remains is **109 of 248 chapter paragraphs** and roughly half the `media` alt/captions — and most of that Arabic *is written in Notion and is being dropped by the sync*, not missing. The whole `page_section` gap is one page, the accessibility page, which has 8 Arabic sections in Notion and 0 in the database. See `docs/status.md` 2026-08-21 14:15 for the per-chapter table and the three causes.
- **`NEXT_PUBLIC_SITE_URL` is unset**, so absolute URLs emit `localhost:3000`. The helper logic is correct and a production build now warns loudly; this resolves at deploy and is a domain decision, not a code gap.

**Blocked on content, not code — Moataz owns these:**

Cover images (`media` has **0 rows**; 0 of 4 case files have a cover, so the NDA grayscale treatment is also still invisible) · `settings.og_image` · `settings.cv_url` · **dates, employers and job titles** — the About design has had a career timeline component since before the site existed, the component was never built because there was nothing to put in it, and the read test named this gap first · Arabic review of the 11 strings written from English · mini case files in or cut (open question B) · domain + Vercel account.

The read test's sharpest finding is a **content** one and no amount of building answers it: across four case files, one is live with real users, one was never built, one is in controlled release, one is five years old with no metrics — and three of the four are the same account-opening programme at the same bank.

### What is not being built

MVP-1 ships plain, per decision 023. The **Motion Layer** (`docs/design/motion-system.md` v2.0) is specified and its token amendments are logged (decisions 046–048), but it is Layer 2 work: permitted only **after** the launch gate passes, in full, and only behind a feature flag (decision 047). Nothing in it may be partially implemented inside MVP-1 — not a prototype, not one page. Layers 2–5 otherwise stand as in `docs/roadmap.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
