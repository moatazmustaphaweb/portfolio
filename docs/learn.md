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

## One question per message, not a round

Learned 2026-08-22, task `001220826`, by being told outright: *"إحنا اتفقنا الـ bulk، bulk الأسئلة أنا مش هعرف أجاوب. سؤال سؤال وواضح، كل message بسؤال."*

The `grilling` skill's default shape is a numbered **round** — compute the frontier, ask all of it, wait. That shape does not work with him. He answers by voice, in sequence; a batch of five asks him to hold five open threads at once, and what comes back is an answer to one of them or none.

**Compute the frontier the same way. Send it one question at a time**, recommendation included, and wait. Each message should require exactly one action from him.

**Fact-finding is not one of his actions.** Reading a file, querying Supabase, opening the Figma file — do all of it silently and fold the finding into the question. The one-action rule counts only what he has to decide.

This tightens `CLAUDE.md`'s rule that a question and a prompt never share a message; it does not replace it.

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

## He cuts the credit, not the concession

Learned 2026-08-22, task `001220826`, from what he deleted rather than from what he said.

A chapter draft was returned with four cuts, and every one of them was a sentence about **authorship**:

- *"None of that is mine. Both journeys were decided on the web. I designed both of them for mobile."*
- *"The portal was not redesigned. It was moved."*
- *"In Egypt I designed the web portal, then designed it again for mobile. Here the web was already standing when the brief reached me."*
- *"Written by the designer of the mobile one."*

The last of those was the draft's strongest idea — the deliberate inverse of the Egypt page's *"Written by the designer of both."* It went too. His reason, given plainly: **"This information is not important for the reader."**

**This looks like it contradicts the `portfolio-voice` line that he concedes things nobody asked him to concede. It does not, and the distinction is the lesson.**

What he concedes is about **the work**: an argument he lost, a compromise that shipped, a proposal he would make again. Those are findings, and they make the rest believable.

What he had just cut is about **credit**: which parts he authored and which he inherited. That is internal accounting. Put on the page it turns a description of a product into a defence of a designer, and it asks the reader to hold a question they never had.

**The test is not "is it honest" — the draft's version was honest. The test is "is it for the reader."** A true sentence that only settles a question about the author's standing is not a concession. It is a footnote about him, in the middle of a page about the work.

Corollary, same session: **a sibling-case-file comparison belongs where the case file sets it up, not inside a chapter.** The UAE draft closed on the Egypt contrast; he removed it, and the contrast already lives in that case file's `result` section, once, where a reader arriving at it has the context to use it.

## The two languages are allowed to say different things

**The rule now lives in the `portfolio-voice` skill**, under *What "original, not translated" means in practice*. It is not restated here, for the reason the em-dash entry above gives. What is kept here is the session that produced it, because the mistake is easy to repeat.

Learned 2026-08-22, task `001220826`, across two corrections in one page.

**First: an Arabic page written to every convention still came back rewritten in fifteen places.** `الاستفسار` not `الاستثناء`, tanween before the alif, Arabic punctuation, headings matched to the Egypt Arabic page — all correct, and almost every change he made removed an image that had been carried across from the English:

| written | rewritten to | carried from |
|---|---|---|
| `وبباب للعودة بعده` | `واحتمالية العودة بعده` | *a way back in* |
| `ثلاثة أبواب` | `ثلاثة مسارات` | *three doors* |
| `في صندوق وارد` | `في البريد الإلكتروني` | *an inbox* |
| `ملف يقبع على جهاز` | `ملف موجود على جهاز` | *sitting on a machine* |
| `الاستفسار له بنية` | `الاستفسار منظم` | *is structured* |

**`ثلاثة أبواب` is the one to remember: he left `three doors` standing in the English and replaced it in the Arabic.** The image was not wrong. It was wrong *there*.

**Second, and this was the worse error: a difference between the two languages was reported to him as a defect.** The English said `one product under two names`; the Arabic said `تطبيق واحد`. It went into `status.md` as "not reconciled, because reconciling it means choosing which language is right and that is his call" — which sounds careful and is the wrong frame. His answer:

> الذي يهم القارئ الإنجليزي غير الذي يهم القارئ العربي… عادي جدًا إن الإنجليزي يبقى بيعبر عن حاجة والعربي بيعبر عن حاجة تانية.

**Two different sentences in the same slot is the design working, not a bug awaiting a ruling.** Ask which language is wrong only where the difference touches a claim, a number, or a caveat.

**Two smaller findings from the same rewrite, both about Arabic specifically:**

**He adds the fact over the rhythm.** `على الموبايل يصل.` — three words, deliberately the shortest line on the page — came back as `على الموبايل يصل فورًا.` The point was immediacy; the rhythm was mine.

**He names the agent.** `حتى ينتبه إليه أحد` became `حتى ينتبه إليه العميل`; `الانسحاب` became `سحب الطلب`. English tolerates an unnamed agent in a way his Arabic does not.

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

## An absence may be an exclusion. Check before calling it a gap

Learned 2026-08-22, task `001220826`, after pushing twice on something that was never missing.

A screen in the UAE design file — `49 — Exceptions List + Desktop Redirect`, which tells a customer mid-journey to *"visit the Mashreq NEO BIZ website on desktop"* — was absent from the chapter. It was reported as an open gap, then named **"the clearest gap in the page"**, then put to him a second time with three hypotheses about what triggered it.

His answer closed it in one line. It is the **design tribe lead's** decision, he argued against it, he considers it the worst decision in the design, and it will never appear in his portfolio — not the screen, not the story, not a mention.

**The two rounds spent on it were spent because "this is in the design file and not on the page" was read as an omission.** It was a judgement.

**And the boundary is not "he hides what he opposed" — it is sharper than that, and the sharper version is the useful one.**

He has a published chapter section called **"The argument I lost, in two countries"**. He narrates a proposal he made, argued for, and lost, twice. That is his judgement on display, and it is one of the strongest things on the site.

The difference:

- **An argument he lost is his work.** He made the proposal. The outcome went against him. Showing it shows how he thinks.
- **Somebody else's bad decision is not his work.** Narrating it is either blame or endorsement, and he wants neither in a portfolio.

**So, operationally: before treating something in a source file as missing content, ask whether it was excluded.** The question is not *"why isn't this on the page?"* but *"is this yours?"* — and if the answer is no, there is nothing further to write, no note explaining the absence, and no passing reference. An exclusion that gets a footnote is not an exclusion.

## Notion is the source. A parser that cannot read it is the thing that is broken

Learned 2026-08-23, task `003230826`, by proposing the opposite and being corrected inside a minute.

**The situation.** 75 Arabic paragraphs are written in Notion and refused by the sync, because the Arabic splits and joins paragraphs differently from the English and the pairing gate requires equal counts. I put two options to Moataz and recommended the wrong one: **re-cut the paragraphs in Notion so the counts match.**

His answer, and it is the standing rule for this project:

> جيت لك notion جاهز… وقلت لك إن notion هو اللي هيبقى الـ website بتاعي. فلما تيجي تقولي أنا عندي bug في الـ website، فإحنا هنعدل notion عشان نحل الـ bug ده، فيبقى أنت غلطان.

**Notion is the authoring surface and the content is finished. A defect in the site is fixed in the code.** Editing the source text to suit the parser is not a fix — it is moving the defect somewhere it stops being visible, and it charges the cost to the person whose work was already correct.

**What makes this worth writing down is that the same rule had been applied correctly four hours earlier, by me, in `supabase/migrations/0044`:**

> *"The slot is the structural name, the heading is the prose. This table exists so the prose does not have to bend."*

That migration chose to add three alias rows rather than rename two headings, for exactly this reason. **The principle was not missing — it failed to transfer from headings to paragraphs**, because the paragraph case arrived wearing a plausible cost argument ("only 12 sections, a day's work"). **A rule you apply in one shape and abandon in another is not yet a rule.** When a fix asks the author to change finished writing, that is the signal — regardless of how small the edit is.

**And the technical shape of the right answer was already in the codebase, one paragraph away.** `docs/sync-contract.md` Step 6 says of images:

> *"each locale's body carries its own sequence, and there is nothing to pair."*

Images in this system already accept that the two locales differ in count and order. Prose does not, and there is no principled reason for the difference — **a paragraph is not a translatable unit; a section is.** English has N paragraphs, Arabic has M, both are correct, and the pairing gate exists only because the schema keys translations to individual paragraph rows.

**So the guard is not wrong and should not be loosened** — pairing by index across lists of different lengths really would attach the wrong Arabic to the wrong screenshot. **The model underneath it is wrong.** Loosening the guard and re-cutting the prose are both attempts to satisfy a 1:1 assumption that the content never had.

### And the rule was abandoned again the same week, in writing, on purpose

Added 2026-08-23, task `007230826`. The entry above ends *"a rule you apply in
one shape and abandon in another is not yet a rule."* Migration 0045 fixed
`chapter_paragraphs` the next morning and left `cover_paragraphs` on the old
model, where the UAE cover's `thesis` — 2 English paragraphs, 3 Arabic, both
finished — lost its Arabic on every run.

**What makes this worth a second entry is that it was not an oversight.** The
gap was found, measured, and written down, in `docs/sync-contract.md`:

> ⚠️ **`cover_paragraphs` has the identical defect and it is NOT fixed.** …
> It is the same fix in a second table and is deliberately out of task
> `004230826`'s scope, not overlooked.

Every word of that is true and it still left finished Arabic off the live UAE
cover for another day. **"Named so the gap reads as known rather than missed"
is a good habit that becomes a way of closing a task with the bug still in it.**
Scoping is real and a task cannot swallow everything it touches — but the
second half of scoping something out is saying *when*, and to whom, and that
half was missing.

**Operationally, and it is cheap:** when a fix has an identical twin one table
over, either do both in the pass, or hand the twin back to the orchestrator as
a named follow-up in the same reply. A `⚠️` in a document is addressed to
whoever reads that document next, which may be nobody.

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

### A protection that depends on how the command is typed is not a protection

Learned 2026-08-23, task `007230826`, from a case file disappearing off the
live site overnight.

Two Notion pages claim `/[locale]/work/cervello`: the finished one, and a blank
Layer 3 row whose own notes say it was taken out of MVP-1 **to clear that
collision**. Decision 040 closed the problem by scoping the sync to MVP-1, and
that was a real fix — for a year of ordinary runs. Then someone passed `--all`,
the blank page computed `draft`, the update was keyed on the SLUG rather than
on the Notion page, and it landed on the live row and took seven chapters with
it.

**The fix was correct and it was not a guard.** It was a *default*. A default
protects the path people usually take; a guard protects the path they take at
2am with a flag on. Both are worth having and they are not substitutes, and the
sentence that should have raised the alarm was written in the decision itself:
*"the sync is scoped to MVP-1."* That is a statement about what the command
normally does.

- **Ask of any mitigation: what has to stay true for this to hold?** If the
  answer is a habit, a flag, a filename, or an ordering, it is a default. Write
  the guard as well.
- **A guard belongs at the write, not at the selection.** The collision check
  runs over the row list; the damage happens at the `update … where slug = …`.
  Anything that filters *which rows are considered* can be widened by a flag.
  Anything that refuses *this particular write* cannot.
- **Refuse the whole row; do not merge.** "Keep the higher status" would also
  have stopped the unpublish — silently, leaving the collision in place and
  telling nobody. The refusal names both pages and exits non-zero.
- **And it must not wait on a person.** Archiving the duplicate page is
  Moataz's, he has not done it, and the code may not assume he will. A fix that
  is really a request is not a fix.

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

### And sometimes the two lists are not supposed to be the same length

Learned 2026-08-23, task `003230826`, from the largest single instance of this class found so far: **32 finished Arabic paragraphs discarded on every sync, across eight chapters, by a guard doing exactly what it was written to do.**

Every English chapter closes its `Result` with a pointer to the next chapter, after a horizontal rule. No Arabic page has one. So every `result` slot was off by exactly one, the count gate refused the pair, and the whole Arabic section was dropped. Every `result` slot on the site had zero Arabic except the one English chapter with no pointer.

**The reflex is to widen the guard, and it is wrong.** The counts genuinely differed; a guard that accepted them would have attached the wrong Arabic to the wrong paragraph and, with figures in the sequence, the wrong screenshot. The guard was right. **The list was wrong** — it contained an item the other list is not supposed to have.

**So the question to ask of a length mismatch is not "how do I make the counts match" but "are these two lists the same kind of thing?"** Here they were two: a body and a coda. Splitting them into two groups counted separately fixed it with the gate untouched.

**Corollaries worth keeping:**

- **Find the split in the structure, not in the styling.** The pointer is all-italic, and reading italics as "pointer" would have been the obvious fix and a wrong one: an all-italic paragraph is ordinary content here, and four sections end with one *before* their divider. The divider position was the real signal, and it had zero false positives across all seventeen chapter pages in both locales.
- **Make the rule cost nothing when it misfires.** The split decides only what is *counted against what*; both halves are still written, in the same slot, in the same order. A paragraph the rule misreads loses its Arabic and stays on the page — it does not vanish. **A structural heuristic is safe exactly to the degree that being wrong about it is cheap**, and that property is worth designing for rather than discovering.
- **The corpus is the specification.** Every one of these decisions was settled by dumping all seventeen pages' block structure and looking, not by reasoning about what the writing probably does. The italic false-positives would not have been predicted; they were visible in one grep.

### And sometimes the two lists were never one list. Delete the index

Learned 2026-08-23, task `004230826`, one task after the entry above — and the
two together are the lesson, because the first fix was right and did not go far
enough.

`003230826` found eight slots where a length mismatch was caused by an item one
list was not supposed to have, and fixed it by counting a body and a coda
separately. **The gate stayed, the counts stopped lying, 24 rows landed.** Then
the same query showed twelve more slots still refused — and on those the counts
differ for a reason no regrouping can remove. The Arabic says
`neobiz-mobile/portal`'s context in 5 paragraphs where the English says it in 2.
Both are finished. Both are correct.

**At that point the question changes from "why don't these counts match" to
"why is anything being counted at all".** The answer was in the schema: a
paragraph was one row shared by both languages, so Arabic could only attach by
index, so an index had to be guarded. **The gate was not protecting a rule; it
was protecting an assumption the model had accidentally made.**

The fix was to put `locale` on the paragraph row. Each language owns its own
sequence, nothing pairs, and the gate is not loosened — it is unreachable,
because there is no longer an index. 75 Arabic paragraphs landed, 177 → 252.

**The generalisable form, and it is a sequence, not a single rule:**

1. **Counts differ → is one list carrying something the other should not?**
   If yes, separate the groups. The gate is right. (`003230826`)
2. **Still differing → are these two lists the same list at all?**
   If no, the pairing itself is the defect. **Remove the index, do not widen
   the guard.** (`004230826`)
3. **Never → make the counts match by editing the content.** That is the one
   move that is always wrong here, and it is the one that always looks
   cheapest.

**Two smaller things worth keeping:**

- **The precedent was already in the contract, one file away.** Step 6 has said
  of images since 2026-08-19: *"each locale's body carries its own sequence,
  and there is nothing to pair."* Images had the right model and prose did not,
  for no reason anyone had ever stated. **When a system does the right thing in
  one place and the wrong thing in another, the fix is usually written down
  already** — look for the sibling case before designing.
- **A structural fix can quietly change what a reader sees, and that half needs
  a decision, not a judgement.** Removing the pairing also removed the reason
  the body/tail split existed, and dropping the split would have deleted the
  English cross-chapter pointer from eight Arabic pages. It was kept as the
  fallback's unit instead. **The rule: when a refactor makes some old mechanism
  unnecessary, check what it was incidentally holding up before deleting it.**

### The fix does not transplant unchanged. Check what the FALLBACK pairs on

Learned 2026-08-23, task `015230826`, closing the set the two entries above
opened — `page_sections` and `decisions`, the last two tables where a shared row
forced Arabic to attach by index.

**Deleting the index is only half the fix. The other half is deciding where the
English fallback now lands, and that answer is different in every table:**

| Table | Row that became per-locale | Fallback resolves per |
|---|---|---|
| `chapter_paragraphs` (0045) | a paragraph | `(section, part)` |
| `cover_paragraphs` (0046) | a paragraph | cover **slot** |
| `page_sections` (0048) | a **section** | **page** |
| `decisions` (0049) | a **decision** | **chapter** |

The fallback can only land on something with a **language-independent name**.
A cover slot has one — `thesis`, resolved from either language through
`cover_slot_aliases`. A page section does not: its identity *is* its heading,
and the heading is prose. Neither does a decision: its identity is its name, and
the name is the argument.

**And "just do what 0046 did" would have shipped a worse bug than the one it
fixed.** Falling back per section on the accessibility page — 7 Arabic sections
against 14 English — would have served the Arabic reader their own content back
to them in English, underneath itself: the Arabic writes six headed English
subsections as six numbered paragraphs, so "the sections it lacks" are the six
it has just said. Not a gap filled. The same argument at chapter level for
`egypt-acquisition/workflow`, which argues one decision in English and three in
Arabic.

**So the question to ask when carrying a fix into a fourth table is not "what
shape did the last one take" but "what does this table's fallback have to pair
on, and does that thing have a name in both languages?"** Where it does, the
fallback goes there. Where it does not, it climbs to the parent that does.

**The corollary, and it caught this task:** *when a refactor makes some old
mechanism unnecessary, check what it was incidentally holding up* — the rule one
bullet above — has a second form. **Removing an index can remove an IDENTITY
something else was quietly binding to.** Giving `page_sections` a locale meant
Arabic headings produce Arabic slugs, which is right everywhere except the
Systems page, where the composition attaches an evidence card to a section *by
slug*, deliberately, to stop the cards pairing by index. Two aliases kept that
alive. **Grep for the column you are about to make locale-dependent before you
change it** — the binding was three files away, in `app/`, and nothing would
have failed: the cards would simply have stopped rendering in Arabic.


## A shared reader that makes a policy decision on behalf of every caller

Learned 2026-08-23, task `007230826`, from a defect that was live in both
languages on six pages and was produced by **two correct rules, neither of
which could see the other.**

`readTable` dropped the Notion header row. For **outcomes and targets** that is
right and load-bearing: `Claim | Basis` is not a claim, and the status parser
reads the first column of every row it is handed. The chapter writer then
marked the surviving row 0 as `is_header` — also right, given a grid whose
row 0 is the header. Composed, they published the first **data** row of every
comparison table as its column headings, in `<th scope="col">`, and the real
headings never reached the database at all.

**Neither half is wrong when you read it. The defect only exists in the seam,
and the seam is not in any file.** Both call sites had a correct comment
explaining what they did and why.

- **The tell is a shared helper that returns something less than it read.**
  `readTable` threw a row away before its callers could disagree about whether
  they wanted it. A reader that discards is making a policy decision for
  everyone downstream, and the second caller — the one written months later —
  inherits it without ever being asked.
- **The fix is to return both and let the caller choose.** `{ header, rows }`.
  Outcomes read `.rows`, the grid readers read the header back in. Nothing was
  loosened and nothing was special-cased.
- **Generalises past parsers:** whenever a helper serves two consumers with
  genuinely different needs, the question is not *"which behaviour is correct"*
  but *"is this helper entitled to decide?"* If both answers are correct for
  someone, it is not.

And the smaller half, which is the `data is data` rule again: **whether a table
has a header is authored, not inferred.** Notion carries `has_column_header` —
a checkbox in the UI — and reading it removed the last place position was
standing in for meaning. Measured across the database: 26 tables, all 26
declare one. A table that declares none is refused rather than guessed at,
because the site's only table renderer draws row 0 in `<thead>` regardless, so
storing a headerless grid would reintroduce the same defect by the other door.

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

## Replacing a Cloudinary asset in place cannot reach a browser that already has it

Learned 2026-08-23, task `001220826`, from a replace that succeeded everywhere and appeared nowhere.

An asset was overwritten at the same `public_id` with `overwrite=true` and `invalidate=true`. Every check passed: the version moved, the raw delivery URL served the new bytes, and the **derived** transform the page actually uses — `e_grayscale/c_limit,w_2000/f_auto/q_auto` — returned a 2000×2000 WebP, which is the new image. The page still showed the old one.

**The answer is in one response header:**

```
cache-control: private, no-transform, immutable, max-age=2592000
```

**`immutable` means the browser does not revalidate.** It will not send a conditional request, so there is nothing for an `ETag` or `Last-Modified` to answer. `max-age=2592000` is **30 days**. A normal reload does not help; only a cache-bypassing reload does.

**And `invalidate=true` cannot fix this.** It purges Cloudinary's CDN — which worked, and worked immediately. It has no reach into caches on other people's machines.

**The structural cause is the URL.** `components/media/CloudinaryImage.tsx` builds it with `getCldImageUrl`, which emits a fixed `/v1/` placeholder rather than the asset's real version:

```
…/f_auto/q_auto/v1/<public id>
```

So the URL is **byte-identical before and after a replace**. An immutable response at a stable URL is a promise that the bytes will never change — and replacing in place breaks that promise silently, for every visitor who already loaded the page.

**Two consequences worth holding on to:**

- **A replace is not visible until the URL changes.** Verify it with `curl` against the derived URL, never by reloading a page you have already opened — your own browser is the least reliable observer in the chain.
- **This is invisible in exactly the wrong direction.** The person who has never seen the page gets the new image; the person who has been watching it — the author, reviewing his own work — gets the old one for a month. The more attention someone has paid, the staler what they see.

**The fix, when it is taken, is to put the real version in the URL** — store it on `media` at sync time and pass it to `getCldImageUrl`. That crosses schema, sync and component, so it is a decision rather than a repair.

---

## A Cloudinary asset can return 200 raw and 400 on every single transform

The Neobiz Egypt cover was invisible on its gallery card **and** on its own cover page, and every
obvious explanation was wrong. The row existed. The `public_id` was right. The `-card` variant row
existed too. **And requesting the asset with no transform returned `200` with five megabytes of
valid PNG.**

The transform returned `400`, with an **empty body**. The reason is only in a header:

```
x-cld-error: Maximum image size is 25 Megapixels. Requested 33.6 Megapixels
```

The file was **7728 × 4348**. Cloudinary will store an image that large and serve it untouched, but
it refuses to *derive* from it. Since the site never requests an untransformed URL — rule 3 means
every URL carries a preset — **the asset was unusable in the only way the site can use it.**

**So `curl -o /dev/null -w '%{http_code}'` on the bare delivery URL proves nothing.** It answers
"does this asset exist", which was never the question. Test the URL the page actually emits, and
when it fails, **read `x-cld-error`** — `curl -D -` or `-I`, because the body is empty and tells you
nothing.

**Two ceilings, both silent, both plan-dependent:** 25 megapixels on the source of a transform, and
100 MB on the file. Neither is visible in the Cloudinary UI next to the asset, and neither shows up
until a derived URL is requested. A Figma export at 4× can cross the first one easily.

**The fix is to re-upload smaller at the same `public_id`, and 3840px wide is the sensible ceiling**
— the largest thing this site ever asks for is `w_1280` at `2x`, so 2560, and 3840 leaves headroom
without leaving 33 megapixels lying around. Then re-read the dimensions into `media.width` /
`media.height`, which were `NULL` on both rows and would have given the card the wrong aspect ratio
even once the bytes arrived.


## In Cloudinary, "replace" means the same public_id. A new name is a new asset

Moataz re-exported a cover, uploaded it, and reported the site unchanged. The reasonable suspicions
were all wrong — not a CDN cache, not a browser cache, not something "attached" that needed
reattaching. **The upload had simply landed on a different `public_id`**, one character of intent
away from the one the database holds:

```
EGY_-_NEOBIZ_-_Cover_-_square   <- uploaded
EGY_-_NEOBIZ_-_Cover            <- what the site reads
```

The site resolves images through `media.cloudinary_public_id`. **An asset the row does not name does
not exist as far as the site is concerned**, however recently it was uploaded and however obviously
it is the intended file.

**Check this first, before reasoning about caches**, because it takes one call and eliminates the
whole class:

```
GET /v1_1/<cloud>/resources/search   {"sort_by":[{"created_at":"desc"}]}
```

If the newest asset carries a name nobody references, the mystery is over. If the id the database
names still shows the *old* `version` number, no replacement reached it.

**And repointing the row at the new name is usually the wrong fix.** Derived ids break: this project
looks the gallery-card variant up as `<public_id>-card`, so moving the cover to a new name silently
orphans its card. **Copy the bytes onto the existing id instead** — `overwrite=true`,
`invalidate=true`. One name stays in play, every convention built on it survives.


## When a gravity looks wrong, measure the canvas before touching the preset

The Neobiz gallery card put both phones left of centre and left its right third empty. The obvious
reading is that `g_auto` chose badly and the preset needs a different gravity.

**It had chosen correctly.** Fetching the source uncropped showed the subject genuinely occupying the
left ~62% of the frame, with the rest empty transparency — a Figma export made without clip content,
so the canvas ran on past the artwork. **`g_auto` centred on the subject; the subject was where it
looked.**

Had the preset been "fixed" instead, one bad export would have permanently skewed the gravity for
every card on the site.

**The check is one request:** ask for the source with `c_limit` and no crop, and look at it. If the
artwork does not fill its own canvas, nothing downstream can compose it well.

**And the shape is worth authoring deliberately.** `c_fill,w_640,h_400` is exactly 1.6:1, so **a
source authored at 1.6:1 is cropped by nothing and gravity never gets a vote** — which is why
`uae-acquisition-card` is 2560×1600. Matching that number is not cargo-culting; it is the reason the
UAE card never had this problem.

To rebuild one from a square master: `e_trim` to drop the transparent margin, then
`c_pad,w_2560,h_1600,b_transparent,g_center`. **`c_trim` is not a thing** — it returns
`Invalid crop_mode in transformation: trim`. Trim is an effect, `e_trim`.


## A resized browser window's screenshot dimensions are not proof of the CSS viewport

Testing a mobile-width layout fix, a window resize to 390px was followed by a screenshot that looked
like one clean line, and that was reported as confirmation.

**It was not.** `window.innerWidth`, queried directly with JS immediately after, read `606` — Chrome
silently clamps a window resize below its own minimum content width and does not report the clamp as
an error. The resize call still returns success. Nothing about the tool call or the screenshot's
raw pixel count (which varies with device pixel ratio) reveals that the requested width was not
honoured.

**The check that cannot lie:** `window.innerWidth` (or a DOM element's real `getBoundingClientRect()`),
queried via JS in the same tab, immediately after the resize. Screenshot pixel dimensions divided by
an assumed DPR is a guess; `innerWidth` is the fact.

**And a naive "did it wrap" check is easy to get backwards, too.** Comparing rounded `top` offsets
among flex children flagged a false wrap here — two items had different heights and `items-center`
placed their tops a few px apart with no actual line break. The real test is whether a later child's
`top` reaches or exceeds an earlier child's `bottom`, not whether the tops merely differ.

**When the tool's minimum is wider than the thing you need to test, extrapolate rather than declare
victory at the tool's floor.** At the narrowest achievable width the layout fit with zero slack — that
IS useful data, but it answers "what's the minimum width this needs," not "does it fit a phone." The
two are different questions and only the second was the one being asked.


## A programmatic `.click()` does not reliably trigger a Next.js `<Link>`

Testing the collapsed locale switch, `document.querySelector('a[hreflang]').click()` in the browser
console appeared to do nothing — `location.pathname` read unchanged 400ms later, no error, no
rejected promise, nothing to catch.

**The plain `<button onClick={...}>` from the theme-toggle test one task earlier worked fine with the
identical technique.** The difference is `next/link`'s `<Link>`, which intercepts the click through
its own handler to do client-side routing rather than a full navigation, and a synthetic
`HTMLElement.click()` does not reliably reach or satisfy whatever that handler checks — this was not
diagnosed further, only worked around, because the workaround is both faster and the more honest test
anyway.

**The real test is a real click** — the `computer` tool's `left_click` at actual coordinates,
producing a trusted event a real visitor's browser would also produce. It is not a fallback for when
the programmatic route fails; for anything routed through `<Link>`, it is the only test that proves
the thing a visitor actually experiences.

**The tell, not just the fix:** if a click "worked" (no thrown error) but a value that should have
changed as a direct result — URL, DOM state, a store — reads back unchanged shortly after, suspect
the click didn't reach a framework's own handler before suspecting a timing issue. A longer `setTimeout`
would not have fixed this one; nothing was pending, nothing ever fired.


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
| **The same line, rotting the other way** | The correction to the row above wrote *"the push is refused — the only authenticated GitHub account has no write access"* into `CLAUDE.md`. **It was true, then the account was switched and nobody corrected the sentence.** Three tasks quoted it, one of them into a brief that told devops to expect a refusal. `024210826` ran the command: `gh auth status` has `moatazmustaphaweb` active, the push returns exit 0, the remote moves | **A pessimistic git fact goes stale exactly as fast as an optimistic one, and is less likely to be tested** — nobody re-checks a blocker. The remedy is not a better sentence. **Delete the fact and leave the command:** `git log origin/main..HEAD --oneline`, `gh auth status`. A line that cannot be true or false cannot rot |
| **Correcting half a rotten line** | Two edits after writing the row above, the orchestrator corrected the push verdict in that same `CLAUDE.md` bullet **and left the other stale claim in it** — *"`main` is NOT level with origin"*, in bold, two clauses earlier, inside the sentence it had just added forbidding restated push verdicts. devops **refused to commit it** and returned the finding | **A line that has rotted once has usually rotted more than once — audit the whole line, not the clause you came for.** And the general form: *the agent that runs the command outranks the orchestrator that read the sentence.* An agent must be able to refuse a brief, and this structure protects the orchestrator-reviews-agent direction far better than the reverse |
| **`gh` authenticated as the wrong account** | `git push` returns 403 `Permission … denied`, while `fetch` works normally. Looks like a broken remote or a bad URL; the remote is fine | The credential helper serves whatever account is stored, regardless of `user.email`. Commits get authored as one identity and pushed as another. `gh auth status` names the account actually in use |
| **`--window-size` on headless Chrome** | A 390px shot that is really a desktop layout with its right side cut off — indistinguishable from a broken responsive rule | The flag sizes the CAPTURE, not the layout viewport. Set it over CDP (`Emulation.setDeviceMetricsOverride`). `scripts/screenshot.mjs` |
| **A route file that "only 404s" is not the same as no route** | Added 2026-08-23, task `005230826`. A catch-all was added under `[locale]` to serve local preview pages, gated so that with the flag off it declared no real path. Every URL still returned 404 and the status codes were checked. **What changed is that every unmatched URL on the site stopped being a missing ROUTE and became a missing PARAM** — and Next renders a param miss inside `<html id="__next_error__">`: no `lang`, no `dir`, no font variables, +7.2KB, in both locales, in production. `/en/nonexistent-xyz` was degraded by a feature that had nothing to do with it | **A 404 is not one thing. Compare the `<html>` tag, not the status code** — `grep -o '<html[^>]*>'` on the response. This is the same distinction `app/[locale]/(site)/work/[caseFile]/page.tsx` already documents for `dynamicParams = false`, and `/en/work/east` is the pre-existing instance of it. **To make a route conditional, make the file not be a page:** name it `page.<something>.tsx` and add `<something>.tsx` to `pageExtensions` only under the flag. Then the route does not exist, rather than existing and refusing |
| **Catch-all fall-through depends on WHERE the match fails** | Same task. Two URLs under the same subtree behaved oppositely, and both look like "no route matched". `/work/east` — `work/[caseFile]` REJECTS the param, and the catch-all never sees the request **even when it declares that exact path**. `/work/uae-acquisition/cut/example-cut` — the param RESOLVES, no child matches the rest, and the catch-all serves it | A rejected param short-circuits the whole subtree; an unmatched deeper route falls through. **Test the specific path before designing around either behaviour** — a real `cut/[cut]/page.tsx` was written on the assumption that no fall-through was possible, and it degraded every `/work/<slug>/cut/*` 404 per the row above. It was deleted once the fall-through was measured |
| **`generateStaticParams` returning `[]` does not mean "no paths"** | Same task. With `dynamicParams = false` and an empty param list, Next 16.3 dev stops enforcing the list and the segment answers **200 for every unmatched URL on the site**. The disabled state was the dangerous one | Declare at least one path always, even a sentinel the page 404s. And re-test after: the dev router caches param lists across edits, so a URL that was declared in an earlier attempt keeps answering from the old list until the server is restarted |

## Three claims in one file rotted the same way. The pattern, not the facts

Recorded 2026-08-23, task `018230826`, after the third one in a single night.

`CLAUDE.md` has now carried three confident, load-bearing statements that were **true when written and false when read**:

| the claim | what was measured |
|---|---|
| `main` is level with origin / the push is refused | wrong three separate ways, on one line |
| `media` has **0 rows**; **0 of 4** case files have a cover | **80 rows**; the UAE has one |
| **No deploy. No Vercel project.** Nothing has run on Vercel | a team, a project, **20 deployments**, production `READY` for weeks |

**No one lied and no one was careless.** Each was written by someone who had just checked. The failure is what happened next: **the sentence was quoted into a brief, and the brief was trusted instead of the system.**

**The tell is grammatical.** All three are *states* — a count, a status, an existence claim. A state is exactly the kind of sentence that ages without any of its words changing, and a document cannot tell you it has aged.

**So the fix is not "be more careful", it is to stop writing states into documents.** Where a fact can be produced by a command, the document carries **the command** and not the answer:

```sql
select count(*) from media;
```
```
git fetch origin && git log origin/main..HEAD --oneline
```

**A line that cannot be true or false cannot rot.** All three bullets now read that way, and the history is kept in each — because the third one happened *after* the first two were fixed with exactly this technique, in the same file, which is the strongest evidence there is that reading a warning is not the same as applying it.

**The corollary that costs the most when missed:** these were all *pessimistic* claims — nothing exists, nothing works, nothing shipped. **A pessimistic stale claim is more dangerous than an optimistic one**, because it is never contradicted by a failure. A wrong "it works" breaks loudly the moment someone tries it. A wrong "there is no deploy" just quietly keeps a finished thing out of every plan — this one hid a live production site through an entire launch-readiness review.

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

## A Cloudinary public ID is never derived. It is looked up, then requested

Added 2026-08-22, task `001220826`.

Four `[cld]` tags were authored for the tracking chapter with public IDs **inferred from the naming pattern of the rows already in `media`**. There was reason to think that was the only option: the six index files in `Image mapping/` are all Egypt's, and no UAE index existed anywhere at the time. The inference was careful and it was still **wrong in three of the four**:

| inferred | actual |
|---|---|
| `…/English/Application tracking/44-track-dashboard-application-submitted` | `…/**Pre-Submition**/44-track-dashboard-application-submitted` |
| `…/English/Exceptions/59-exception-detail-moa-**not-clear**` | `…/Pre-Submition/59-exception-detail-moa-**upload-empty**` |
| `…/English/Onboard/01-welcome-**three-doors**` | `…/**Signup and Onboarding**/01-welcome` |

Three separate ways to be wrong: **the group folder is not the one the site's prose would suggest**, the leaf is the Figma frame's own name rather than a description of it, and there is no `/English/` segment at all for an English-only app. The convention held; every value under it was different.

**`Pre-Submition` is misspelled and that spelling is part of the ID.** Egypt's `Exceptians` is the same. `docs/sync-contract.md` Step 6 says public IDs are used verbatim, never slugified — so a tidy-minded correction of either one breaks the image.

**The operational rule, and it is short: a `[cld]` ID that has not returned HTTP 200 is a guess.**

```
curl -s -o /dev/null -w '%{http_code}\n' -L "https://res.cloudinary.com/<cloud>/image/upload/<public id>.png"
```

Each journey has an index — `Image mapping/*.xlsx`, and `docs/Cloudinary_Index_UAE_NEOBIZ_Mobile.xlsx` for this one — carrying the exact ID, the Figma node, the pixel dimensions and a resolvable URL per screen. **Ask whether one exists before deriving anything**, and if the answer is no, ask whether one is coming. Deriving is what you do after both answers are no, and even then the request is what settles it.

**A related waste worth avoiding:** four screens were also exported from Figma by hand, to be uploaded later. They were already on Cloudinary at 786px, twice the resolution the Figma MCP returns, which caps at the node's natural canvas size no matter what `maxDimension` asks for.

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

## A garbled word may be a real word; a design file is not a source

Learned 2026-08-22, task `001220826`. Two errors in one draft, in opposite directions, and they are the same error.

**A real word was thrown away as transcription noise.** Dictating an edit by voice, he said the sentence should read *"an answerable question rather than a **blind** rejection."* It reached me as `Blindly,` at the head of the next sentence, where it made no sense, so I dropped it and flagged it as unintelligible. He put it back in Notion, in its correct place. It was never noise — it was one word that landed in the wrong slot.

**A detail he never gave was imported from Figma.** The same paragraph said a customer can *"replace a file that came back **too large**."* Nobody said that. It came from a frame named `62 — Exception Detail – Emirates ID File Size Error`. He corrected it to *"came back **unclear**"*, and separately corrected *"its own folder"* to *"its own system"* — a word that had been his own, in speech, and was still wrong on the page.

**Both are the same failure: trusting the artefact over the person.** The design file is evidence of what was built. It is not evidence of why, of what it was called, or of what mattered. A frame name is a designer's filing label, not a claim about the product — and treating one as content is how inference gets published in his voice.

**So: when a dictated word does not parse, assume it is a real word in the wrong place before assuming it is noise.** Ask where it belongs. And **never let a screen name become a sentence** — if the detail did not come from him, it is a question, not a fact.
