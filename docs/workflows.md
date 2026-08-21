# docs/workflows.md — Workflows and handoffs

**Every known workflow, and the handoffs inside it.** A task that passes from one agent to
another is recorded here with its task id, so a multi-agent task can be followed end to
end rather than reassembled from four status files afterwards.

Read `docs/agents.md` first — it carries the shape, the permission boundary and the
task-id scheme. This file is the procedure.

---

## ⚠️ THE FIRST RULE, AND IT GOVERNS EVERY WORKFLOW BELOW

**Do not start work, and do not write a prompt or issue an instruction to anyone, until Moataz has answered your open questions.**

**A brief is an instruction.** So no workflow below starts while a question is open. If an
agent returns a question mid-workflow, **the workflow stops there** — the orchestrator does
not brief the next agent "in the meantime". The remaining steps keep the same task id when
it resumes.

---

## HOW A WORKFLOW RUNS

1. **Orchestrator assigns the task id** — nine digits, `NNNDDMMYY`, number resets daily.
2. **Orchestrator briefs the first agent**, carrying the id, the file paths, the binding
   decisions, what was already tried, what is out of scope, what "done" is, and which
   skills to load. A subagent starts with an empty context; the prompt is the only channel in.
3. **The agent works, writes its own status file, and reports back.** It does not brief the
   next agent. Agents do not message each other.
4. **Orchestrator reviews the report**, decides whether the finding actually belongs to the
   next agent, and briefs it — with the same id and with the previous agent's finding
   restated in the brief, not referenced.
5. **devops commits, last**, splitting the uncommitted tree into commits by logical change.
6. **Orchestrator writes `docs/status.md`**, dated to the commit time, and records the
   workflow in the ledger at the bottom of this file if it crossed more than one agent.

**Parallel is allowed only where the write scopes do not touch.** frontend and backend can
run at once. Nothing runs in parallel with devops, because devops commits the tree both of
them are writing into.

---

## W1 — Content fix → sync → deploy

**The common case, and it crosses three agents.** A wording change, a corrected Arabic
paragraph, an added outcome marker.

```
content ──▶ backend ──▶ devops
 audit /     re-sync,     commit,
 approved    verify the   push,
 edit        row landed   deploy
```

| Step | Agent | Does | Must not |
|---|---|---|---|
| 1 | **content** | Reads the Notion page. Reports exactly what is there and what is missing. If the brief carries an edit Moataz approved verbatim, applies **that** edit and **reads the page back** | Write anything not approved verbatim. Touch the sync, the database, or a component |
| 2 | **backend** | Runs the sync. Confirms the row **landed**, by querying it — not by reading the sync's own summary | Edit Notion. Loosen a guard that refused the row |
| 3 | *(verify)* | Open the page the content lands on, on `localhost:3000`, **in both locales** | Conclude from a 200 |
| 4 | **devops** | Commits `content(<slug>):`, pushes if the brief said push, deploys, warms | Fix a component or a query on the way past |

**The trap this workflow exists to catch:** a Notion write reporting success and never
landing, and a synced row that is in the database but not on the page. Both have happened
here. **Three separate confirmations — Notion read back, row queried, page opened — and
none of them substitutes for another.**

**When the sync refuses the row:** stop. Do not edit the writing so the parser can read
it. That is backwards on this project and Moataz has said so directly. The heading goes
into the vocabulary **as data**, or the finding is reported and the task stops.

---

## W2 — Content is written but never reaches the site

The most common shape of "Arabic is missing" on this project. **Roughly half of it is
written in Notion and is being dropped by the sync**, and the two causes have opposite
owners.

```
content ──▶ backend ──▶ backend ──▶ devops
 which is    why it      fix the     commit
 written     drops       matcher
 where
```

1. **content** — counts what exists on each side. `109 of 248 chapter paragraphs`, per
   chapter, not "most". Reports the asymmetry and **names nothing as a fabrication**.
2. **backend** — diagnoses. The prior of record: it is usually an index-based pairing bug
   or a heading the parser does not know, not a naming pattern. **Equal length is necessary
   and not sufficient** — compare what was *found* against what was *kept*.
3. **backend** — fixes by removing the positional relationship, not by widening a zip.
   Prints the resolved shape on every run so a section disappearing shows as a line that
   changed rather than as nothing.
4. **devops** — commits.

**Absence is invisible here by design** (decision 013 makes a missing translation normal),
so a systematic failure and "not written yet" produce identical output. Three matcher bugs
survived months on exactly this.

---

## W3 — A rendering bug in one locale

frontend alone, then devops. The single most productive area on this site.

1. **frontend** — reproduces on `localhost:3000` in **both** locales. Runs the selector
   against the running page, not a grep of the source: `document.querySelectorAll(…).length`
   on every page that could be affected.
2. **frontend** — fixes with logical properties, loads `rtl-guard`, measures at 390 **and**
   1440 (two tokens that differ at 1440 can be identical at 390).
3. **frontend** — screenshots both locales, both widths, and reports the **measurements**.
4. **Moataz looks.** No agent gives a visual verdict.
5. **devops** — commits `fix(rtl):` or `fix(<component>):`.

**Do not route this to backend because the data looks wrong on screen.** Check what
`lib/content` actually returns first; if the value is right and the render is wrong, it
never leaves frontend.

---

## W4 — A page needs a field that does not exist yet

```
backend ──▶ frontend ──▶ devops
 schema +    render it    one commit
 query                    per logical
                          change
```

1. **backend** — migration (enums get their own migration; `alter type … add value` cannot
   run in the same transaction), `lib/content` query and type, seed, `docs/schema.md`.
   Reports the exact returned shape.
2. **frontend** — consumes it. Receives the shape **in the brief**, restated, not as
   "backend added a field".
3. **devops** — commits the migration and the component separately.

**These two can run in parallel only when the shape is already agreed and written down.**
Otherwise frontend builds against a guess.

---

## W5 — Cover images and Cloudinary

Currently blocked: `media` has 0 rows, 0 of 4 case files have a cover, so the NDA grayscale
treatment is invisible. When the assets arrive:

```
devops ──▶ backend ──▶ frontend ──▶ devops
 upload +   record      render via   commit
 warm       public_id   CloudinaryImage
```

- **Rule 3 is absolute: image URLs are never stored.** Cloudinary `public_id` plus a named
  transform preset. `CloudinaryImage` is the only component that builds a URL.
- **Rule 6: the NDA treatment is a signal, not concealment.** Full grayscale via a live
  Cloudinary transform driven by `case_files.nda` — never baked into the pixels, never a
  per-image flag a call site can forget. `media.redacted` stays `false`.
- **devops warms every derivative after upload.** The first derivative takes 7–12 seconds
  and it is paid by the first visitor.
- A folder renamed in the Cloudinary UI does not change the id. **Read the id, not the
  folder name.**

---

## W6 — An audit or a report, no code

One agent, no handoff, and **the report is the whole deliverable**.

- **content** for the writing, the Arabic, a metric's defensibility, an asymmetry between
  languages.
- **backend** for what is actually in the database, what the sync drops, what a query
  returns.
- **frontend** for what a page actually renders.

**Report gaps; never fill them.** This has been breached once: an audit scoped to
report-only produced additions to both languages, both defensible on the merits, neither
asked for.

Output goes to a **named file under `docs/`** — the filename is part of the answer, not
just the chat. The agent's status entry records the counts. If devops commits nothing
because nothing but the report changed, the report itself is what devops commits.

---

## W7 — Deploy and the launch gate

**devops alone**, and it is gated on things that are Moataz's, not code:

`settings.og_image` · `settings.cv_url` · cover images · dates, employers and job titles ·
domain and Vercel account.

devops **does not supply a placeholder to make a deploy green.** A blocked launch gate is
reported as blocked.

Never verified in any environment, and listed rather than assumed: the visual pass · any
accessibility audit · the contact form submitted through a browser · ISR observed working
in production · `/api/revalidate` against a production build · anything at all on Vercel's
runtime.

---

## W8 — A question is returned

Not a workflow so much as the thing that interrupts every one of them.

1. Agent hits something genuinely undecided, **stops**, and returns the question.
2. **Orchestrator does not answer it.** It asks Moataz — as a question, in a message with
   no prompt in it.
3. The work stays where it is, uncommitted, and the task keeps its id.
4. When the answer comes, the orchestrator re-briefs **with the answer inside the brief**.
   An agent starting fresh cannot see the reply Moataz sent.
5. **The stop gets a status entry** in the agent's file and in `docs/status.md`, with the
   question and the reasoning. A refusal with its reasoning is a result; an empty file is not.

---

## THE HANDOFF LEDGER

Every task that crosses more than one agent, newest first. Single-agent tasks live in the
status files only.

| Task id | Date | Chain | What | Ended |
|---|---|---|---|---|
| `001210826` | 2026-08-21 | orchestrator only | Established the five-agent structure, the permission boundary, the task-id scheme, and these two docs | Complete. Founding commit made by the orchestrator, before devops existed — see `docs/agents.md` |

