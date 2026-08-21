# docs/learn.md — What we have learned

**Living document. Newest lessons appended to their section, not to the end.**

This is not `decisions.md` and not `status.md`. Those record *what* was decided and *what* happened. This records **why**, in a form that generalises to situations that have not come up yet.

## When to write here

Add an entry when something is learned that would change how the next task is approached — a bug class, a preference discovered by being corrected, an environment trap that cost a session, a rule that turned out to have an exception.

Do **not** add: individual decisions (those go to `decisions.md`), session outcomes (`status.md`), or anything that is true only of one file.

The test: *would this have saved time if it had been read before starting?* If no, it does not belong here.

---

# PART 1 — HOW MOATAZ WORKS

## `docs/status.md` is the only channel

He reads the file, not the terminal. An unchanged `status.md` is indistinguishable from work that never ran, and three separate exchanges have been spent establishing whether a task had happened.

**So: the entry is written as part of the task, not offered afterwards.** If a change seems too small to log, log it in two lines. If a task ends without an entry — a refusal, a question answered, a diagnosis — say so explicitly in the reply, so the silence is legible as deliberate.

**And a rule written in a file that is read at session start is not a guarantee.** In `018210826` devops finished its git work and closed **twice** without writing its entry. The rule was in its own definition, it had read the file, and it went past the rule anyway; it took two returns from the orchestrator to get an entry. **The guarantee is to make the close itself conditional on the rule** — the status entry is the last thing written, and `DONE` may not be used without it — rather than to state the rule more emphatically in a place the agent has already read and skimmed.

Generalises past this one rule: **if a standing rule is being violated, adding words to it is the weakest available fix.** Attach it to a step that cannot be skipped.

## One prompt at a time, and never below an open question

He sends prompts to Claude Code verbatim. A question left open above a prompt means he sends the prompt without knowing whether it was answered.

**Either a question or a prompt. Never both in one message.**

And no prompt until the decision is actually made. "Here are three options, and here is the prompt for option B" is a prompt he cannot use.

## Stop and ask rather than invent

When something is genuinely undecided, stopping is the correct output. A guess that keeps the session moving costs more than the pause.

This applies hardest to anything editorial — what a number means, whose words a sentence is, whether an absence is deliberate. Those are his, and the information needed to answer them is not in the repo.

## Report gaps; do not fill them

Finding that a section has no Arabic, or that a paragraph is missing, or that a claim has no source — that is the deliverable. Writing the missing thing is not.

This was breached once: an audit that was scoped to *report only* produced prompts that added a section to the English and two sentences to the Arabic. Both additions were defensible on the merits and neither was asked for.

**A structural gap between two languages is not a licence to write content.** Report it and name it.

## Direct answers when a direct answer is asked for

If the question is "which one", answer with one. A table of options in response to a request for a recommendation is an evasion, and he will say so.

---

# PART 2 — WRITING

## The em dash is not a tell. The test is whether it turns

**Corrected 2026-08-21, task `023210826`.** This section used to read *"Long dashes read as machine-written"* and prescribe replacing them by function. **That is wrong as an absolute, and the absolute did damage** — Moataz's own writing is full of em dashes, they work, and the blanket ban broke sentences that were already right. Measured against the live database in this task: 53 of 58 English captions carry one, and the Arabic carries them at a *higher* rate per word than the English does. A rule that condemns most of the corpus it governs is not describing the corpus.

**The real distinction, and it is a distinction, not a quota:**

- **His dash pivots.** It turns from the object to what the object means. The second half says something the first half could not.
- **The machine dash balances.** Two clauses of matching length and matching shape, held in symmetry, neither earning its place.

**The test on every dash: does the second half say what the first half could not?** If it is restating, decorating or balancing, cut it — and then replace it by *function*, per the table below. If it is turning, keep it.

**`.claude/skills/portfolio-voice` carries the full description**, with his examples and the machine counterexample, and it decides where this file and `docs/content-brief.md` disagree with it about how a sentence is written. Do not restate the rule from memory; the memory of it is what was wrong.

The same test extends past the dash: **AI prose is recognisable by its evenness**, not by its punctuation. Clauses of matching length, sentences of matching shape, every paragraph landing the same way. His prose is uneven on purpose.

Where a dash does fail the test, replace by **function**, not with a single substitute:

| What the dash was doing | Use instead |
|---|---|
| Parenthetical aside | Two commas, or brackets |
| Introducing an explanation or list | Colon |
| Joining two independent clauses | Full stop, or semicolon |
| Separating a label from its description | Colon |
| Trailing qualifier | Comma |

**Do not touch:** dashes inside Notion page titles (`النسخة العربية — …`) — those are structure the sync reads. Entry-handle arrows (`←` / `→`). Numeric ranges (`2018–2021`). Fixed terms (`maker–checker`).

**There is no Arabic exception, and the one that used to be here was invented.** This section said *"in Arabic the dash is doubly wrong: it is not native to Arabic punctuation at all"* — deleted 2026-08-21, task `024210826`. Measured on the site's own Arabic: it carries the dash **more** densely than the English does, in every corpus that has one — 5.97 per 100 words in captions against the English 4.79, 2.04 in chapter prose against 1.58. **One rule, both languages: does it turn, or is it balancing?**

**And this rule now lives in one place.** The copies in `docs/content-brief.md` and `.claude/agents/content.md` were deleted in the same task and replaced with pointers to `.claude/skills/portfolio-voice`. Three copies of one rule is how three versions of it appear, and it is how this one drifted into a ban.

## Each project is written in its own way

This is the reason the site is a custom build rather than Webflow. Four case files, four shapes:

- **Cervello** has no thesis. It opens with `What it is` — a product definition, not an argument.
- **Neobiz** has no role section. Its role sentence lives inside its thesis.
- **Neobiz and Cervello** have no outcomes table, because neither has numbers, and both say so in prose.
- **`why-it-matters`** carries two different English headings across two covers.

None of these is an error to correct. **A parser that enforces one shape will throw away correct writing** — see Part 5.

## Arabic is original, not translated

The Arabic is written from inside the language. It is read by an Arabic-speaking recruiter or curator as the primary text, not as a translation layer.

Consequences that have come up repeatedly:

- **Do not "correct" idiomatic Arabic back towards the English.** `اطّلعت على أعمالك` is not `صادفت` and should not become it. The English line is casual; the Arabic is considered; both are right for their reader.
- **Cultural adaptation is legitimate.** The Philosophy page adds `الإعلان` to a list the English renders as graphics and illustration, because in the Arabic professional context the confusion comes from advertising first. Flagged at the time, approved, kept.
- **Explain from inside the language.** The English explains the word `تصميم` to a foreign reader. The Arabic cannot do that — it would be defining the reader's own word to him.
- **Register:** modern professional Arabic, the tone of a well-made Gulf banking product. Not classical, not newspaper, not casual.

## Standing Arabic conventions

- **Technical and brand terms stay Latin inside Arabic text:** `KYC` `OTP` `RTL` `NDA` `WCAG` `IoT` `LinkedIn` `Governance` `Mashreq` `Cervello`.
- **Numerals are Western:** `2024`, `1,500+`.
- **Product name:** `نيوبيزنس` in Arabic, `Neobiz` in Latin.
- **`accessibility`** → `قابلية الوصول والاستخدام`, unified site-wide.
- **`exception`** → `الاستفسار`, not `الاستثناء`. In this system an exception is a directed query, not an anomaly.
- Arabic page titles in Notion: `النسخة العربية — [name]`, fully Arabic suffix.

## Writing to Moataz in Arabic

Egyptian colloquial mixed with formal Arabic is hard to follow. Pick a register and hold it. When the sentence is technical, plain modern Arabic with the Latin terms left in Latin is clearest.

---

# PART 3 — CONTENT INTEGRITY

## The three markers, and nothing else

`[achieved]` · `[projected]` · `[not-measurable]` for outcomes. `[achieved]` · `[missed]` · `[not-measurable]` for targets. No default, ever. A missing marker aborts that row and reports it.

**The marker records whether it happened. The note records how it is known.** A figure marked `[achieved]` on prototype evidence is defensible only because the note says prototype.

**Provenance stays out of visible copy.** Where or how a number was learned — an announcement, a meeting — is not published. Caveats that change how the figure should be read are: *"the figure covers web and mobile together"*.

**A baseline is not an outcome.** It was not achieved, it is not projected, and it is measurable. It has no marker because it is not that kind of claim. It belongs in Context prose, attributed.

## When something looks fabricated, ask whose it is

An audit found a paragraph in the Arabic with no English counterpart — three accessibility categories and a ranking claim — and it was ruled a fabrication and marked for deletion.

**It was Moataz's own, said in an earlier session.** The correct outcome was the opposite: the English was missing it.

**So: report the asymmetry, name what is on each side, and ask.** Do not rule on authorship. The information needed is not in the repo.

## Generated imagery can be the honest choice

An AI-generated image of two ID cards was flagged on provenance grounds. The counter-argument is stronger and is now the standing position:

**The alternative to a generated ID card is photographing a real one with a real person's data on it.** The generated image is not a lapse in honesty; it is the only responsible option. Same logic as amendment 036 — the Mashreq screens are design files with dummy data, and the treatment is a signal rather than concealment.

The test is not *was this generated*. It is *does it depict something real as though it were a record*. An illustrative comparison is not a document.

## The metric discipline is what makes the site credible

An independent read test called the labelling *"the single best thing about the site… someone who has been on the receiving end of a fabricated metric and refuses to add to the pile."*

It also found the one place it leaks: `Achieved` carries both *live in production for eighteen months* and *ten people in a usability lab*. The label is accurate and the evidence line is right there, but a gallery card shows the label without the evidence.

---

# PART 4 — HOW HE WANTS CODE BUILT

## Data is data; code is code

The recurring split, and the one he reaches for unprompted:

| Data | Code |
|---|---|
| Which slots a cover has | How a slot renders |
| Which heading maps to which slot | The mapping mechanism |
| Cloudinary `public_id` | The transform preset |
| The order sections appear in | The layout |

An editorial decision living in a TypeScript object literal is the thing to avoid. A decision in the database, executed by code, is the shape.

## The contract adapts to the writing

Stated by him directly, after a parser refused a legitimate line:

> The flexibility is supposed to be in my favour, not against me. Structure should not constrain how I write.

Any parser that enforces a fixed vocabulary will silently discard correct content. Cervello's opening passage never reached the database for the life of the project because its heading was `What it is` and the parser knew six names.

**The remedy is not a longer list.** It is moving the vocabulary out of code and into data, so an unrecognised heading is a row to add rather than a deploy — and making an unrecognised heading **fail loudly** rather than be skipped.

## Guards stay. Widen what they accept; never weaken what they protect

Every hardening this project has done came from a real incident. When a guard refuses valid content, the fix is to teach it the construct, not to remove it.

If a newly added guard refuses content that previously synced, that means something has been dropping silently all along. **Find out what. Do not loosen the guard to make it pass.**

## Verify by looking

The bugs that mattered most were all invisible to structural checks:

- `OBJECTIVE` rendered twice, both copies correct in isolation
- English prose in an Arabic page with its full stop on the wrong side
- A prose column at 248px instead of 836px
- A sun icon that reads as a snowflake at 20px
- Evidence cards attached to the wrong argument, each one plausible

**A passing build, a 200, and a correct DOM are not evidence that a page reads right.** Open it.

And verify on the server he is watching. Verification on an ephemeral port is true about code nobody is looking at.

## Say what was not verified

"Not tested" and "working" have been conflated on this project. A report that names its own gaps is worth more than one that reads clean.

---

# PART 5 — THE BUG CLASSES THAT KEEP RECURRING

## Index-based pairing across two lists that vary independently

The single most productive bug class in this project. Two lists zipped by position, guarded by equal length.

**Equal length is necessary and not sufficient.** The drop and the guard measure different things, so a count that matches *after* an item was dropped reads as success.

Instances found: Arabic entry handles pairing under the wrong English handle; Systems evidence cards attached to the wrong argument for the life of the page; four more sites in the sync.

**The remedy:** compare what was *found* against what was *kept*, and refuse when they differ. Better still, remove the positional relationship — bind by slug, by id, by anything that is not an array index.

## Silent success

A write returning success is not evidence it landed.

- Six Notion tags reported successful writes and were never in the page.
- A multi-edit batch **succeeds if any element matches**, so success proves nothing about the rest. Single calls return `No matches found` correctly.
- A trigger declared `update of column_a` does not fire on a write that touches only `column_b` — the guard exists in the function body and is unreachable from the table.

**Read back after writing. One call at a time when it matters.**

## Absence is invisible

Decision 013 makes a missing translation *normal*, so a systematic sync failure and "not written yet" produce identical output. That is how three matcher bugs survived for months.

**The remedy:** print the resolved shape on every run, so a section disappearing shows as a line that *changed* rather than as nothing.

## A grep is not the DOM

A CSS rule was added and reported as matching nothing, on the strength of grepping the components for `<span>` inside a heading. Querying the twelve rendered Arabic pages for the actual selector found **eight** elements it matched — all `<a>`, none of them spans, on two pages that were never opened.

**A claim about what a selector matches is a claim about the DOM.** The source is not the DOM: elements arrive from `map()`, from shared layout components, from a wrapper a page adds around a heading. Grepping finds the shapes you thought to look for.

The same holds for "nothing uses this" before a deletion. Grepping the symbol is right for an import — that IS in the source. Grepping for rendered structure is not.

Run the selector against the running page. `document.querySelectorAll(<the selector>).length`, on every page that could be affected, is one line and settles it.

## A container that loses a child keeps its tracks

A two-track grid whose first child stopped rendering put its only remaining child in the first track — 256px. Nothing errored.

Generalises: when two things must agree — a grid and its rail, a flag and its condition — make the disagreement **unrepresentable**, not merely corrected. One decision, not two free to drift.

---

## Replacing a span between two anchors deletes whatever else lives between them

Rewriting a document section by slicing from one heading to the next heading — `s[start:end]` where `end` is the *next* landmark — silently removes every section that happens to sit in between. In `020210826` the orchestrator replaced the `app/api/**` section by slicing to `### ⚠️ THE ONE EXPLICIT EXCEPTION` and destroyed the `### .claude/** — why it splits three ways` section that sat between the two. The reasoning for a rule survived; the reasoning for a *different* rule did not.

**It is invisible at the point of edit.** The script asserts its anchors, the replacement lands, the file parses, the headings that remain all look right. Nothing fails.

- **Slice to the end of the thing you are replacing, not to the start of the next thing you can find.**
- **After a structural edit, diff the heading list** — `grep -n '^### '` before and after. A section that vanished shows up instantly and shows up nowhere else.
- **This is what review is for.** It was caught by devops reading the staged diff before committing, not by the author. An agent that reads the whole diff rather than trusting the intent of the edit is the last defence against this class.

---

## Ambiguity in a permissions table is a vulnerability, not an editorial detail

The ownership table in `docs/agents.md` used a dash for two different facts: *"this agent does not touch this"* and *"nobody owns this at all."* Reading a row of dashes, both look like a decision. **One of them was a hole**, and it stayed invisible until a task routed straight into it — `.claude/**` had no owner, and that was only discovered by needing to write there.

**A table that grants permissions has to distinguish "does not apply" from "unassigned",** and say the second one in words. The fix was to write `UNOWNED` in full wherever it is true, so the next sweep reads it as decided rather than missed, and to give the table a column for the orchestrator — whose absence was the actual cause, since a row of four dashes could not distinguish *"the orchestrator owns this"* from *"nobody does."*

**The generalisation: in any table that governs what may be written, silence is not a value.** Every cell means something, and a blank that could mean two things means neither.

---

# PART 6 — ENVIRONMENT TRAPS

Each of these cost at least one session.

| Trap | Symptom | Fix |
|---|---|---|
| **`127.0.0.1` vs `localhost`** | Page renders, nothing interactive, no console error | Use `localhost`. `allowedDevOrigins` in `next.config.mjs` |
| **`next start` on :3000** | Source changes never appear; verification passes on a port nobody is watching | `npm run dev` |
| **`.env.local` changed** | Old value still in effect | Restart the dev server |
| **`next.config.mjs` changed** | Config ignored | Restart |
| **Stale route cache** | A single 404 or an old string after a successful sync | Cache-bust; re-test more than once |
| **Cloudinary folder renamed in the UI** | Every stored `public_id` is stale | Rename does not change the id. Read the id, not the folder name |
| **First Cloudinary derivative** | 7–12 seconds, paid by the first visitor | Warm every derivative after upload |
| **Postgres enum** | `alter type … add value` cannot be used in the same transaction | Its own migration |
| **Service role** | RLS does not filter | The filter is an explicit `.eq("status","published")` in `lib/content/*` |
| **`:root:lang(ar)`** | Arabic overrides silently do nothing | Matches `<html>` only. And unlayered beats layered whatever the specificity |
| **Notion `plain_text`** | A backtick regex matches nothing | Backticks are stripped. Read `annotations.code` |
| **`<figure>` in `<p>`** | Renders *almost* right | Browser closes the paragraph early and reparents. Make paragraphs rows |
| **SVG in `<img>`** | No token resolves, no theme | An SVG in an `<img>` is an isolated document. Inline it |
| **`<span>` inside an Arabic heading** | Two Arabic faces in one sentence — body face under heading face, and a real bold where the heading is 400 | `:lang(ar)` matches the span DIRECTLY, and a direct match beats an inherited value from the `h1`. `font-synthesis-weight: none` stops a *faked* bold; it cannot stop a real weight in a family that ships one, and Meral does. Scope the heading rules to descendants |
| **A status line that states a git fact** | `status.md` said *"`main` is level with origin — `git log origin/main..HEAD` returns 0"*. True when written. Two days and several commits later it was still being read as current, quoted into a brief, and a task-014 commit was reported as pushed having never left the machine | **A git fact goes stale the moment the next commit lands.** Never carry one forward from a document; run the command. And do not write a count into a doc that outlives it — write how to get the count |
| **`gh` authenticated as the wrong account** | `git push` returns 403 `Permission … denied`, while `fetch` works normally. Looks like a broken remote or a bad URL; the remote is fine | The credential helper serves whatever account is stored, regardless of `user.email`. Commits get authored as one identity and pushed as another. `gh auth status` names the account actually in use |
| **`--window-size` on headless Chrome** | A 390px shot that is really a desktop layout with its right side cut off — indistinguishable from a broken responsive rule | The flag sizes the CAPTURE, not the layout viewport. Set it over CDP (`Emulation.setDeviceMetricsOverride`). `scripts/screenshot.mjs` |

---

# PART 7 — MEASURE BEFORE REASONING

The Arabic type scale is the standing example. Measured, not inferred:

- `--text-statement` renders at **29.9px in Arabic**, *larger* than `--text-h3` at 28px, because it takes `--type-scale` (1.15) where display sizes take `--type-scale-display` (1.0).
- The scale has **no step between 16px body and 26px statement** in English. The gap is real; a section-heading token had to be added.
- Arabic headings force `font-weight: 400` with `font-synthesis-weight: none`, so **there is no weight axis** and hierarchy is size alone. A 9% size increase is not a heading.
- At the same pixel width the Arabic line holds **fewer** characters, not more — so the longest line on the cover is the English one, the opposite of the expectation it was measured under.

A later instance, from the two-size h1 trial. The expectation was that Arabic carries more punctuation than English for the same meaning, so a rule that cuts a sentence at its first mark would cut **earlier** in Arabic. Measured across ten chapter objectives it is the opposite on six of them: Arabic strings clauses with `و` where English uses commas, so `submitted, verified, machine-readable` is `مُقدَّم ومُتحقَّق منه ومقروء آليًا` — three adjectives and no mark at all. On one chapter the two languages swap places entirely, the Arabic giving the best cut of the ten and the English the worst.

From the objective-size trial, two more, both of which decide token choices:

- **A size token cannot change the register in Arabic.** `:lang(ar) h1` binds the LANTX display face to the ELEMENT, not to the size, so an Arabic heading shrunk to 23px is still a heading — a smaller one. In English, Geist runs the whole page, so size and weight alone move a line from "heading" to "opening statement". Any "make this read as X rather than Y" decision that rests on size will half-work: it lands in English and does nothing in Arabic. Changing the element is the only thing that moves it there.
- **Two tokens that differ at 1440 can be identical at 390.** `--text-statement` and `--text-lead` both floor at 20px, so below roughly 770px they are the same number — and in Arabic they are identical in every property, since `:lang(ar) h1` overrides both the line-height and the weight. A comparison run only at a desktop width will report a difference that does not exist on a phone. Measure both ends of the clamp.

The generalisation: **in a bilingual system, the intuition formed in one language is often inverted in the other.** Measure.

---

# PART 8 — WHERE THE MODEL WAS WRONG AND WAS CORRECTED

Recorded so the same error is not repeated by a fresh session.

| Belief | Correction |
|---|---|
| Content should be edited so the parser can read it | Backwards. The parser adapts. Stated by Moataz directly |
| Unpublishing the case file was the right withdrawal | The audit's 18 passages were all in chapters; the cover was clean. His instinct — cover stays, chapters down — was more precise |
| `media` was empty | Two covers already had artwork. Asserted from `status.md` rather than checked |
| `cv_url` was a gap | It is a decision. The CV is requested by email, not downloaded |
| An AI-generated image is a provenance risk | The alternative is photographing real data. Generated is the responsible choice |
| A paragraph with no English counterpart was fabricated | It was Moataz's, from an earlier session |
| Local work was at risk of being lost | It had already been pushed. Reasoned from a stale mental model rather than checking |
| Making the repo public would allow reading it | GitHub blocks automated access regardless. The step was wasted |
| The Egypt thesis was one unsplit paragraph in Notion | It was already five. The loss was at render, not at source |
| The Arabic child-page naming pattern was the sync bug | It was three unrelated matcher bugs. The hypothesis was wrong and saying so first mattered |
| A rule broken twice needs a mechanism, not a third mention | The orchestrator future-dated its own status entry in `020210826`, noted it, wrote a lesson about it, and **did it again in `021210826`**. Writing the timestamp before the work is finished guarantees it. **Read the clock at the moment of writing the heading** — `date '+%H:%M'` — rather than estimating when the entry will be done |
| Writing a rule protects the writer from breaking it | The orchestrator codified *"entries are dated to match the commit time, never ahead of it"* and then, **in the same task**, dated its own entry twenty minutes in the future. It resolved only because the clock caught up — nothing was corrected. **Authorship confers no immunity;** check your own output against the rule you just wrote |

**The pattern in most of these:** a conclusion drawn from a document rather than from the system it describes. `status.md` is a narrative and is behind in places. When a fact is checkable, check it.
