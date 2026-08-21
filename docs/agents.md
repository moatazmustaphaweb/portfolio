# docs/agents.md — The agent structure

**Five roles. One orchestrator, four subagents.** Written 2026-08-21, task `001210826`.

This file is the constitution. `docs/workflows.md` is the procedure — how a task that
crosses two or three agents actually moves. `.claude/agents/*.md` are the definitions the
harness loads.

---

## ⚠️ THE FIRST RULE, AND IT GOVERNS EVERYTHING BELOW

**Do not start work, and do not write a prompt or issue an instruction to anyone, until Moataz has answered your open questions.**

If something is genuinely undecided, stop and ask. Never a question and a prompt in the
same message — he sends prompts verbatim, so a question left open above one means he
sends it without knowing whether it was answered.

This rule is written verbatim into every one of the four agent definitions and into
`CLAUDE.md`. It is the single most important thing in this structure.

**For a subagent it means:** you do not talk to Moataz. Return the question to the
orchestrator and stop. Do not answer it yourself to keep moving, do not implement "the
obvious one" and note the alternative below it, and do not deliver work with an open
question attached.

**For the orchestrator it means:** a brief is an instruction. Do not write one while a
question is open. Ask Moataz, wait, then brief.

---

## THE SHAPE

```
                          Moataz
                            │
                     ┌──────┴──────┐
                     │ orchestrator │   this session
                     └──────┬──────┘   routes · briefs · reviews · corrects · reports
                            │
        ┌────────────┬──────┴──────┬────────────┐
        │            │             │            │
   ┌────┴────┐  ┌────┴────┐  ┌─────┴────┐  ┌────┴────┐
   │ frontend│  │ backend │  │  devops  │  │ content │
   └─────────┘  └─────────┘  └──────────┘  └─────────┘
    writes        writes       writes git    writes no
    files         files        + envs        code, no db
```

**Agents do not message each other.** Every handoff goes through the orchestrator. This is
deliberate: the orchestrator is the only thing holding the whole task, and a chain of
agents briefing each other loses the constraints at every link.

### orchestrator — this session

Routes, briefs, reviews, corrects, reports to Moataz. Assigns the task id. Writes
`docs/status.md` and `TASKS.md`.

**It does not do the work itself when an agent exists for it.** The temptation is to make
a one-line component fix directly because spawning an agent feels heavier. That one-line
fix is how the boundary erodes, and the boundary is what stops two writers landing in the
same file. Route it.

What the orchestrator *does* do directly: reading, deciding, asking Moataz, assigning
ids, reconciling entries, and writing `docs/status.md`, `docs/agents.md`,
`docs/workflows.md`, `TASKS.md`.

### frontend — `.claude/agents/frontend.md`

Components, tokens, layout, RTL, rendering. `components/**` · `app/**` ·
`app/globals.css` · `tailwind.config.ts` · `fonts/**` · `i18n/**`.

**Writes files only.**

### backend — `.claude/agents/backend.md`

Supabase, migrations, the sync script, `lib/content/*`. Also `lib/supabase/**` ·
`lib/media/**` · `lib/utils/**` · `supabase/migrations/**` · `scripts/**` ·
`docs/schema.md` · `docs/sync-contract.md`.

**Writes files only.** Migrations it applies are live in Supabase and their SQL is
uncommitted until devops commits it — that gap is real and it says so in its report.

### devops — `.claude/agents/devops.md`

git commit and push, Vercel, Cloudinary, cache warming, the dev server on `:3000`.

**The ONLY agent that writes to git history.**

### content — `.claude/agents/content.md`

Notion, writing, Arabic, content integrity.

**Never touches code or the database.** Notion is read-only to it except for a specific
edit Moataz has explicitly approved, relayed verbatim in the brief.

---

## THE PERMISSION BOUNDARY

**Reading is open. Any agent may read anything**, so it understands what it is touching
rather than asking about every file. Reading `lib/content` is how frontend knows the shape
it is handed; reading `components` is how backend knows whether a return value is usable.

**Writing is scoped. An agent writes only inside its own area.**

| | frontend | backend | devops | content |
|---|---|---|---|---|
| `components/**`, `app/**`, `globals.css`, `tailwind.config.ts` | **write** | read | read | read |
| `lib/**`, `supabase/migrations/**`, `scripts/**` | read | **write** | read | read |
| the Supabase database | read | **write** | read | — |
| Notion | read | read | — | **read; write only on an approved, verbatim edit** |
| git history | — | — | **write** | — |
| Vercel · Cloudinary · `:3000` | read | read | **write** | — |
| `docs/status/<own>.md` | **write** | **write** | **write** | **write** |
| `docs/status.md` · `TASKS.md` · `docs/agents.md` · `docs/workflows.md` | — | — | — | — |
| every other file in `docs/` | read | `schema.md`, `sync-contract.md` | read | audit reports, `ui-strings-review.md` |

**Only devops commits or pushes.** frontend and backend write files and stop. This is
deliberate and it is not a style preference: **two sessions committing in parallel
interleaved this project's history last week and made `status.md` sort wrongly.** One
serialisation point removes the failure mode rather than managing it.

**Consequence to plan for:** when frontend and backend both finish, their work is sitting
uncommitted in one working tree. The orchestrator routes both to devops in one brief, and
devops splits it into commits by logical change — not one commit per agent, and not one
commit for everything.

**The founding exception, recorded so it is not read as precedent:** the commit that
created this structure was made by the orchestrator, because devops did not exist until
that commit landed. It is the only one.

---

## THE TASK ID

Every entry in every status file carries a **nine-digit id, no separators**.

```
014210826  =  task 014, day 21, month 08, year 26
   ↑  ↑ ↑ ↑
   │  │ │ └── year   26
   │  │ └──── month  08
   │  └────── day    21
   └───────── task   014, resets daily
```

**The orchestrator assigns it when the task starts and passes it in the brief.** Every
agent that touches that task writes it in its entry. That id is what ties the
orchestrator's entry to the agents' entries for the same work — without it, a task that
crossed three agents cannot be reassembled afterwards from four files.

- **The task number resets daily**, starting at `001`.
- **The id belongs to the task, not to the agent.** Three agents on one task all write
  `014210826`. It is not incremented per handoff.
- **A task that is briefed and then refused still consumes its id.** The number is a
  record of what was attempted, not of what shipped.
- Numbering began with this task, `001210826`. Work done earlier on 2026-08-21 predates
  the scheme and carries no id; it is not retrofitted.

**Entries are dated to match the commit time, never ahead of it.** Seventeen invented
dates have already had to be corrected to their commit times on this project. devops holds
the commit time exactly (`git log -1 --format=%ad`) and is the agent positioned to catch a
future-dated entry before it lands.

---

## THE STATUS FILES

| File | Owner |
|---|---|
| `docs/status.md` | **the orchestrator's file.** It writes here, and reads it when opening a new session. Every task is recorded here |
| `docs/status/frontend.md` | frontend, its own |
| `docs/status/backend.md` | backend, its own |
| `docs/status/devops.md` | devops, its own |
| `docs/status/content.md` | content, its own |

Newest first in every file.

`docs/status.md` is the only channel Moataz reads. **He reads the file, not the terminal.
An unchanged `status.md` is indistinguishable from work that never ran**, and three
separate exchanges have been spent establishing whether a completed fix had happened at
all.

- No task is finished until its entry is saved. A change too small to log gets **two
  lines**, not silence.
- If a task ends with no entry, **say so explicitly in the reply**, so the silence is
  legible as a decision rather than a failure.
- This applies hardest to **diagnoses, refusals and questions answered** — the ones most
  likely to be skipped and the ones most needed. A refusal with its reasoning is a result;
  an empty file is not.
- "Do only what was asked" does not override this. Scoping instructions bound **which code
  to touch**; they do not suspend the log.

The per-agent files are the detail. `docs/status.md` is what Moataz reads, so the
orchestrator's entry must stand alone — it summarises the outcome and points at the agent
files by task id, rather than assuming he opens four files.

---

## THE STANDING RULES, IN EVERY AGENT

Written into all four definitions, in these words:

1. **Stop and ask rather than invent a decision.**
2. **Report gaps; never fill them.** Content belongs to Moataz.
3. **Verify by looking, on `:3000`, on `localhost`** — not an ephemeral port.
4. **Guards stay. Widen what they accept, never weaken what they protect.**
5. **The status entry is part of the task, not offered afterwards.**
6. **Say what was not verified.**

---

## A SUBAGENT STARTS WITH AN EMPTY CONTEXT

**The prompt string is the only channel in.** A subagent has not read this conversation,
does not know which decision was made ten minutes ago, and cannot see what Moataz said. It
has the files on disk and the prompt, and nothing else.

So **the orchestrator's brief must carry, explicitly:**

- **The task id.** Nine digits. Without it the entry cannot be tied back.
- **The file paths.** Not "the cover component" — `components/case-file/CoverSections.tsx`.
  An agent that has to search for the file will find a plausible wrong one.
- **The decisions that bind this task**, by number and in one line each. Decision 053 and
  decision 023 are not discoverable from the code, and "read `decisions.md`" is 75KB of
  reading to find two lines.
- **What was already tried and what it did.** Otherwise the agent repeats it.
- **What is out of scope**, named. Especially: which adjacent thing looks broken and is
  deliberately not being fixed in this task.
- **What "done" is**, and how it will be checked.
- **Which skills to load** — `rtl-guard`, `metric-integrity`, `motion-system`,
  `perf-budget`. The definitions say when, but naming it in the brief removes the judgement
  call.
- **The open questions that are already answered**, if the task sits near one. An agent
  told to stop and ask will stop on a question Moataz answered yesterday unless the answer
  travels with the brief.

A brief that omits these does not produce a cautious agent. It produces one that invents
the missing piece, and the invention is indistinguishable from the work.

---

## VISUAL VERIFICATION IS MOATAZ'S, FOR NOW

**No agent owns it.** Agents produce screenshots and report measurements; Moataz looks.

An agent's output is *"the prose column measures 836px at 1440 in `/ar`"*. It is never
*"the layout is fixed"* or *"it looks right"*. The bugs that mattered most on this project
were all invisible to structural checks and all obvious to a person looking: `OBJECTIVE`
rendered twice, both copies correct in isolation; a sun icon that reads as a snowflake at
20px; evidence cards attached to the wrong argument, each one plausible.

**A visual-review agent is a planned addition, deliberately not built yet.** It is
recorded here so the gap is a decision rather than an oversight. It becomes possible when
there is a reliable way for an agent to see a rendered page rather than describe one — the
browser has never once reached the local server across multiple sessions on this project,
which is the longest-standing untested claim in it and what let a 404 be reported as
working for weeks. Until that is fixed, an agent claiming a visual verdict would be
inventing it.

Prerequisites, if it is ever built: the browser reaching `localhost:3000` · device metrics
set over CDP, not `--window-size` · shots in both locales at 390 and 1440 minimum · and a
definition that forbids a verdict and permits only a measurement.

---

## WHAT THE SKILLS AND `docs/learn.md` NOW BELONG TO

The four skills in `.claude/skills/` stay **project-wide** and are unchanged by this
structure. Each is loaded by more than one agent, and splitting one into an agent
definition would create a second copy that drifts:

| Skill | Loaded by |
|---|---|
| `rtl-guard` | frontend (all of it) · backend (translation resolution, `fieldLocales`) · content (Arabic typography, glyphs) |
| `metric-integrity` | content (the writing) · backend (the parser, the enums) · frontend (status pills, count-up) |
| `motion-system` | frontend, effectively alone — but it gates a whole future layer, not one agent's files |
| `perf-budget` | frontend (per-frame, bundle) · backend (query caching, per-request) |

`docs/learn.md` likewise stays project-wide and is read in full by every agent, every
time. Parts of it are now *emphasised* per agent rather than owned: Part 2 (writing) and
Part 3 (content integrity) sit hardest on content, Part 4 (how he wants code built) and
Part 5 (the bug classes) on backend, Part 5 and Part 7 (measure before reasoning) on
frontend, Part 6 (environment traps) on devops. **Emphasised, not partitioned** — the
index-pairing bug class has already appeared in the sync, in the query layer and in
rendered components, and an agent that had not read it would have shipped it in all three.

**`docs/learn.md` is still appended to as part of the task**, the same way `status.md` is,
by whoever learned the thing. The test is unchanged: *would reading it beforehand have
saved time?*

---

## LOADING

`.claude/agents/*.md` is read at session start. **The four agents do not exist until
Claude Code is restarted.**
