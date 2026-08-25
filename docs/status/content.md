# docs/status/content.md — content agent log

**Living document. Newest first.** Written by the `content` agent as part of the task, never
offered afterwards. An unchanged status file is indistinguishable from work that never ran.

Every entry carries the nine-digit task id the orchestrator assigned — `NNNDDMMYY`, e.g.
`014210826` is task 014 on 21/08/26. That id ties this entry to `docs/status.md` and to
the other agents' entries for the same work. **Entries are dated to match the commit time,
never ahead of it.**

A task that ends in a diagnosis, a refusal, or a question returned still gets an entry.
Two lines, not silence.

The shape of an entry is in `.claude/agents/content.md`. The structure is in `docs/agents.md`;
the handoffs are in `docs/workflows.md`.

---

## 002250826 — 2026-08-25 12:10 — Egypt Acquisition em-dash pass: 334 dashes resolved by function across twelve pages; zero left

**Brief:** Remove every em dash (—) and en dash (–) a visitor reads from the six Egypt
Acquisition rows and their Arabic child pages, replacing each by **function**, not by
character. Notion only. No database, no code, no git, no sync runs.

**Read:** `.claude/skills/portfolio-voice/SKILL.md`, `docs/content-brief.md`, and all twelve
pages in full — each one re-fetched and re-read after editing, because a Notion batch that
reports success can silently drop non-matching entries:

- `Case File Cover - Egypt Acquisition (Web)` + `النسخة العربية — الغلاف (مصر)`
- `Chapter - Egypt / Onboarding Journey` + `النسخة العربية — الفصل الأول: رحلة فتح الحساب`
- `Chapter - Egypt / Application Workflow` + `النسخة العربية — الفصل الثاني: نظام مراجعة الطلبات`
- `Chapter - Egypt / Customer Portal & Notifications` + `النسخة العربية — الفصل الثالث: بوابة العميل والإشعارات`
- `Chapter - Egypt / Fulfilment & AOF` + `النسخة العربية — الفصل الرابع: التحقق النهائي ونموذج فتح الحساب`
- `Results Table - Egypt Acquisition (Web)` + `النسخة العربية — النتائج`

**Found and resolved — 318 dashes, per page per language:**

| Page | EN | AR |
|---|---|---|
| Cover | 2 | 1 |
| Ch1 · Onboarding Journey | 44 | 35 |
| Ch2 · Application Workflow | 39 | 22 |
| Ch3 · Customer Portal & Notifications | 35 | 24 |
| Ch4 · Fulfilment & AOF | 36 | 31 |
| Results table | 29 | 20 |
| **Total** | **185** | **133** |

**Breakdown by rule applied:**

- **Colon** — lead-in to a definition, a list or a quotation. The single largest category, and
  the dominant caption shape on this case file is exactly that: `X — Y` where Y *defines* X.
- **Full stop, next word capitalised** — pivot or consequence, used wherever the second half
  is a full clause rather than a definition. This is also what keeps the sentence lengths
  uneven rather than machine-even.
- **Comma, `،` in Arabic** — trailing tag phrase, non-restrictive relative clause, or a
  conjunction (`and` / `so` / `و` / `فـ` / `بل` / `لأن`) already carrying the join.
- **Parentheses — 26 paired dashes (52 characters): 15 EN, 11 AR.** A departure from the
  brief's table, which says a dash pair becomes commas. See *Open questions*.
- **Conjunction added — 1**, the only one: `regardless of interface language, because the form
  goes to a foreign authority…` (EN Ch1). Everywhere else a conjunction was already present.
- **Numeric range → plain hyphen — 4**: `24 hours - 3 days` on the EN cover and EN results
  table, `٢٤ ساعة - ٣ أيام` on the AR cover and AR results table.
- **En dash in a fixed term → plain hyphen — 2**: `maker-checker`, EN cover and EN Ch2.

**Arabic:** every replacement comma is `،` (U+060C), never `,`. Where `و` / `فـ` / `بل` /
`لأن` already carried the join the dash became `،` rather than a full stop, so no conjunction
had to be invented in Arabic at all.

**Words unchanged.** No clause reordered, no sentence deleted, no rephrasing, no tightening.
The only word-level changes are the capital letters a new full stop forces, and the single
added `because` above.

**Untouched, deliberately:** `[cld]` / `[alt]` / `[caption]` tag syntax and public IDs · every
middot `·` · every entry-handle arrow `→` / `←` · table structure · image blocks · hyphens
inside words (`re-typing`, `front-side`, `cross-team`, `twenty-four-hour`, `non-Egyptian`,
`friends-and-family`, `Arabic-first`) · Notion page titles · every `[achieved]` /
`[not-measurable]` marker and every figure beside one.

**Gaps reported, not filled — twelve title-shaped dashes, all still in place:**

These are the case-file name and page names rendered as headings, not punctuation inside a
sentence. `docs/content-brief.md` §2 lists case-file names as *structure the sync reads*, and
the brief said titles were already done. The brief's decision table has no row for a name, so
I left them and am reporting rather than guessing:

1. `# Business Banking Acquisition — Egypt` — EN cover H1
2. `# الاستحواذ في الخدمات المصرفية للشركات — مصر` — AR cover H1
3–10. `*Business Banking Acquisition — Egypt*` and `*الاستحواذ … — مصر*` — the subtitle line on
   all four EN chapters and all four AR chapters, eight instances
11. `# Results — Business Banking Acquisition, Egypt` — EN results H1. **This is the weakest
   case for leaving it:** the dash separates a section label from the name and a colon is
   plainly right. Left only for consistency with the other ten.
12. ~~The sibling and cross-cutting names.~~ **Resolved later in the same task — see the
   follow-up below.** Eleven title-shaped dashes remain, not twelve.

**Belongs to someone else:** nothing. No sync bug, render bug or schema question surfaced in
this pass. Whether the sync matches on those headings is a **backend** question, and it is
what open question 1 needs answered before anyone edits them.

**Not verified:**

- **Nothing was checked on `localhost:3000`.** This pass was Notion-only, as briefed. Whether
  these pages have re-synced to Supabase, and whether the site renders the new punctuation, is
  untested by me.
- **The per-rule split above is not a counted tally.** The per-page totals are derived from the
  edit operations and the paired-dash figure is counted exactly; the colon / full-stop / comma
  split is ordered by frequency but I did not tally it, and I am not going to state a number I
  did not count.
- The **Accessibility** cross-cutting page, the two **Comparison** pages, the **Linear View**
  row and the Egypt **mini case files** were outside this brief and were not opened. The
  Accessibility and comparison pages were covered separately under `006250826`.
- I did not read the Egypt content in Supabase, and did not open `docs/ui-strings-review.md`.

**Six spacing repairs were needed and made.** Where a replacement anchored on the dash alone,
Notion kept the leading space and produced `… مُدَّعى . وهذا` or `مرصودًا : الخطورة`. All six
were found by the re-fetch and fixed. Two edits were dropped silently by the batch API and
were also caught only by the re-fetch: one where JSON escaping mangled a quoted string
(`"document rejected"`), and one where I retyped Arabic from memory and got the tanween order
wrong (`مثلاً` for `مثلًا`) — the exact failure `docs/content-brief.md` §1 warns about.

**Follow-up, same task — two rulings arrived after the pass and were applied:**

**Ruling 1 — ranges in prose take the word (`to` / `إلى`), not a hyphen; a data value in a
table cell, metric row or label keeps the plain hyphen.** This supersedes the original brief's
blanket "plain hyphen".

**Nothing had to be undone.** All four ranges I converted sit inside `<td>` in an outcomes or
results table — they are metric rows, so the plain hyphen is the correct side of the line:

- `**24 hours - 3 days**` — EN cover outcomes table
- `24 hours - 3 days` — EN results table
- `**٢٤ ساعة - ٣ أيام**` — AR cover outcomes table
- `٢٤ ساعة - ٣ أيام` — AR results table

**Every range in prose on these twelve pages already used the word and was never touched:**
`Two weeks to one month`, `twenty-four hours to three days`, `2 weeks to 1 month`,
`من أسبوعين إلى شهر`, `٢٤ ساعة إلى ثلاثة أيام`. The only other hyphen I introduced is
`maker-checker`, a fixed term, not a range. **I did not add `to` or `إلى` anywhere.**

**Ruling 2 — bracketed references naming a Notion row must match the row title as it now
stands.** The 69 rows were renamed earlier today and the em dash is gone from row titles.

Queried the live row titles rather than assuming them. The SQL endpoint returned a workspace
usage limit, so I read them through `notion-search` against the data source instead:

- `Accessibility - Bilingual, RTL & Regulatory Comprehension` (`3b6d4c6d…a1b5`)
- `Case File Cover - Neobiz Mobile (Egypt)` (`3b3d4c6d…2de7`)

Five references updated, each re-fetched and confirmed:

| Page | Was | Now |
|---|---|---|
| EN cover, *Sibling case file* | `[Neobiz Mobile — Egypt]` | `[Neobiz Mobile (Egypt)]` |
| EN cover, *Cross-cutting* link text | `Accessibility — Bilingual, RTL & Regulatory Comprehension` | `Accessibility - Bilingual, RTL & Regulatory Comprehension` |
| EN Ch4, closing line | `[Accessibility — Bilingual, RTL & …]` | `[Accessibility - Bilingual, RTL & …]` |
| EN Ch4, closing line | `[Neobiz Mobile — Egypt]` | `[Neobiz Mobile (Egypt)]` |
| AR cover, *ملف شقيق* | `Neobiz Mobile — مصر` | `Neobiz Mobile (مصر)` |

**Two judgements inside that, both reported rather than assumed:**

- **I did not carry the `Case File Cover - ` prefix into the prose.** The row is
  `Case File Cover - Neobiz Mobile (Egypt)`, but `Case File Cover` is an authoring prefix, not
  the case file's name, and a visitor reading `[Case File Cover - Neobiz Mobile (Egypt)]` in a
  sentence would read it as a mistake. I took the ruling's own sentence — *where a row carries
  its market in parentheses, the reference takes parentheses* — as deciding exactly this, and
  wrote `Neobiz Mobile (Egypt)`.
- **The Arabic keeps `مصر`.** `Neobiz Mobile (مصر)` is not character-for-character with the
  row title, which says `(Egypt)`. Changing it to `Egypt` would be a word change in Arabic
  prose, which the brief forbids, and `Neobiz Mobile — مصر` had to lose its dash regardless.
  Parentheses with the Arabic word is the minimum change that satisfies both rules.

`EN results` already read `Neobiz Mobile (Egypt)` and needed nothing. The AR cover's
cross-cutting link text is Arabic prose (`قابلية الوصول والاستخدام في منتج مصرفي ثنائي اللغة`),
carries no dash, and was left alone.

**Second follow-up, 11:56 — the link-label ruling reversed one of the five edits above.**

Ruling: *a bracketed reference that NAMES a row matches the row as named now; a human-readable
**link label** is prose — resolve only the dash, by function, and leave the wording alone.*
This replaces the earlier instruction to match a label to a row title.

**One of my five was a link label, and it is now corrected.** EN cover, *Cross-cutting*:

- was `[Accessibility — Bilingual, RTL & Regulatory Comprehension](url)`
- I had made it `[Accessibility - Bilingual, RTL & Regulatory Comprehension](url)` — a row title
- **now `[Accessibility: Bilingual, RTL & Regulatory Comprehension](url)`** — the dash resolved
  by function (a name, then the scope that defines it → colon), wording untouched, URL untouched

Re-fetched and confirmed. `notion-search` still served the old string from a stale index at the
time; only the page fetch is evidence, which is the rule and it held.

**The other four stand, and one of them now differs from the label on purpose.** EN Ch4's
closing line carries `\[Accessibility - Bilingual, RTL & Regulatory Comprehension\]` — brackets,
no URL, inside a *See also* list. That is a bracketed reference naming a row, so it keeps the
row's hyphen. The EN cover renders the same name with a colon because it is a link label. **The
two are deliberately different under the ruling**, and that is worth knowing before someone
"fixes" one to match the other.

`[Neobiz Mobile (Egypt)]` (EN cover, EN Ch4) and `Neobiz Mobile (مصر)` (AR cover) are unchanged.

**On ranges, re-checked against the reminder that Egypt is where this reaches a visitor.**
Every range in **prose** on these twelve pages already reads with the word and never carried a
dash — including the cover's summary line, which is the one a visitor meets first:

> **Two weeks to one month → about fifteen minutes to submit, twenty-four hours to three days to activate.**
> **من أسبوعين إلى شهر ← نحو خمس عشرة دقيقة للتقديم، و٢٤ ساعة إلى ثلاثة أيام للتفعيل.**

The four hyphens that remain are all inside `<td>`, bolded as the metric value of a metric row:
`**24 hours - 3 days**` (EN cover), `24 hours - 3 days` (EN results), `**٢٤ ساعة - ٣ أيام**`
(AR cover), `٢٤ ساعة - ٣ أيام` (AR results). By the ruling's own second half — *a data value in
a table cell or a metric keeps a plain hyphen* — that is the correct side of the line, so I did
not change them. **No `to` or `إلى` was added anywhere, and no connective was rewritten.** If
the intent was that these four read `24 hours to 3 days` / `٢٤ ساعة إلى ٣ أيام`, it is four
edits and one sentence from the orchestrator; see open question 3.

**Third follow-up, 12:04 — four reports never reached the orchestrator, and why.**

Recorded because it nearly cost the launch a reassignment of finished work. Four complete
reports across four turns were written as plain assistant text and delivered to nobody. From
this side every one of them looked sent; from the orchestrator's side this scope was silent and
about to be taken over.

**The cause was mechanical, not carelessness: `SendMessage` was a deferred tool** — named in a
system reminder with its schema unloaded, so it was not callable. Fixed by loading it
(`ToolSearch("select:SendMessage")`) and sending; the tool returned `success` and the report is
in the inbox. Appended to `docs/learn.md` under the existing section on this failure, as the
subsection that names the cause, because the rule already there — *every reply goes through
`SendMessage`* — cannot be followed by an agent that does not have the tool.

**Nothing about the Egypt content changed in this round.** No page was edited. The pass was
already complete and verified; only the delivery was broken.

**Also answered for the orchestrator, and worth having in writing: every `[cld]` tag is
intact.** Caption *text* was edited inside those lines, but every replacement was an inline
substitution containing no newline, so no tag paragraph was split. Confirmed by reading the
`` `[cld]` `` / `` `[alt]` `` / `` `[caption]` `` triples on their own single lines, backticks
present, in the verification fetch of all twelve pages. No public ID, no alt value, and no tag
syntax was touched anywhere in this task.

**Fourth follow-up, 12:10 — the last two open items were ruled on and closed. Egypt is at zero.**

**Ruling A: the eleven title-shaped dashes — resolve them, colon.** Measured by another agent:
`resolveCoverSections` and `resolveChapterSections` both skip `if (block.level < 2)`, so an H1
and the subtitle beneath it never publish and these reach no visitor. Done anyway, because
Moataz asked for all of Notion including titles, and leaving the one dash his own instruction
most obviously names is how a rule gets quietly re-litigated later.

| Where | Now reads |
|---|---|
| EN cover H1 | `# Business Banking Acquisition: Egypt` |
| AR cover H1 | `# الاستحواذ في الخدمات المصرفية للشركات: مصر` |
| EN chapter subtitle ×4 | `*Business Banking Acquisition: Egypt*` |
| AR chapter subtitle ×4 | `*الاستحواذ في الخدمات المصرفية للشركات: مصر*` |
| EN results H1 | `# Results: Business Banking Acquisition, Egypt` |

The ten chapter/cover instances were ruled as one decision, in both languages, as proposed.

**Ruling B: the line is bare-value versus claim, not table versus prose.** `25-30` on its own
keeps a hyphen; a cell that reads as a sentence takes the word. All four of mine read as
sentences (`… to an active account`, `… لتفعيل الحساب`), so all four took the word:

- EN cover outcomes table → `**24 hours to 3 days** to an active account`
- EN results table → `24 hours to 3 days to an active account`
- AR cover outcomes table → `**٢٤ ساعة إلى ٣ أيام** لتفعيل الحساب`
- AR results table → `٢٤ ساعة إلى ٣ أيام لتفعيل الحساب`

**No connective was rewritten and no claim reworded.** The stacked-`to` escape hatch was not
needed: `24 hours to 3 days to an active account` reads cleanly, the two `to`s doing different
work (range, then destination). The figures and the `[not-measurable]` markers are untouched.

**Ruling C: parentheses over commas for the 26 paired dashes — accepted**, and every other
agent reached it independently, which makes it a house convention rather than my preference.

**Final state, verified by re-fetching all twelve pages after these 15 edits:**

| Page | EN | AR |
|---|---|---|
| Cover | 5 | 3 |
| Ch1 · Onboarding Journey | 45 | 36 |
| Ch2 · Application Workflow | 40 | 23 |
| Ch3 · Customer Portal & Notifications | 36 | 25 |
| Ch4 · Fulfilment & AOF | 39 | 32 |
| Results table | 30 | 20 |
| **Total** | **195** | **139** |

**334 dashes resolved. Zero `—` and zero `–` remain in the content of any of the twelve pages.**
The only em dashes left anywhere in scope are in Notion **page titles**
(`النسخة العربية — …`) and in **database properties** (`Layer 1 — MVP-1`, `Notes`, `Purpose`,
`Blockers`) — neither is visitor content and both were out of scope throughout.

**Nothing is open on Egypt.**

**Noted, not mine to act on:** `scripts/sync-notion.ts` stripped the row-title prefix with an
em dash baked into a regex, so the row rename made case files take their full row title as
their English title and broke four sibling links. Fixed at source by the orchestrator, with the
split now coming from `classifyTitle` in one place. If a sibling notice appears in a later sync
run it belongs to that, not to this pass.

**Open questions — all three now answered; kept for the record:**

1. **The eleven title-shaped dashes above — still open, and narrower than it was.** Ruling 2
   covered bracketed references naming a row; it did not cover the case-file H1 and the eight
   chapter subtitles, which are body headings and were never row titles. Moataz's rule says no
   dash anywhere a visitor reads, and a visitor reads all eleven. **If he wants one answer:**
   change `# Results — Business Banking Acquisition, Egypt` to a colon now — it is a label, not
   a name — and rule on the ten `Business Banking Acquisition — Egypt` / `… — مصر` instances as
   one decision, since they are the same string in two languages.
2. **The four metric-cell ranges.** I read `**24 hours - 3 days**` as a data value in a metric
   row and kept the hyphen, which is what the ruling says. But the same ruling flagged Egypt as
   where this reaches a visitor, and a claim cell is a sentence more than it is a bare value
   like `2018-2021`. **One line either way closes it**, and it is four edits.
3. **Paired dashes became parentheses, not commas.** In all 26 places the enclosed clause is
   itself a comma-separated list (`— a blurred document, a missing page, a question about a
   partner —`), so commas around it produce a garden-path sentence in which the reader cannot
   tell the aside from the subject. Parentheses preserve the meaning exactly and add no words.
   If he wants commas regardless, it is a small reversible pass — but those 26 sentences will
   read worse, and `Anything unclear …` becomes genuinely ambiguous.

## 006250826 — 2026-08-25 11:35 — Accessibility and the two comparison pages: 108 dashes resolved by function across six pages; two null-marker dashes left and reported

**Brief:** Remove every em dash (—) and en dash (–) a visitor reads, on the `Accessibility`
row and the two `Comparison` rows, English and Arabic. Replace by function, not by character.
Notion only. Report and verify.

**Read, in full, both languages:**

- `Accessibility - Bilingual, RTL & Regulatory Comprehension` (`3b6d4c6d…a1b5`) and its Arabic
  child `النسخة العربية — قابلية الوصول والاستخدام` (`3b7d4c6d…f4ad`)
- `Comparison - Web vs Mobile / Onboarding` (`3b7d4c6d…802b`) and `النسخة العربية — مقارنة: رحلة الانضمام` (`3b7d4c6d…c051`)
- `Comparison - Web vs Mobile / Customer Portal` (`3b7d4c6d…09d4`) and `النسخة العربية — مقارنة: بوابة العميل` (`3b7d4c6d…28e0`)
- `.claude/skills/portfolio-voice/SKILL.md`, `docs/content-brief.md`, `docs/learn.md` Parts 2–3

**Found and resolved — 108 dashes, by page:**

| Page | dashes | resolved | left |
|---|---|---|---|
| Accessibility EN | 39 | 39 | 0 |
| Accessibility AR | 30 | 30 | 0 |
| Comparison Onboarding EN | 15 | 15 | 0 |
| Comparison Onboarding AR | 12 | 12 | 0 |
| Comparison Portal EN | 12 | 11 | **1** |
| Comparison Portal AR | 12 | 11 | **1** |

By function, across all six: **colon 41** (lead-in to a list, a definition or a quotation;
label separated from its description) · **comma 34** (`,` in English, `،` in Arabic — trailing
qualifier, appositive, or a joining dash where `and`/`so`/`و`/`فـ`/`بل` was already in the
sentence) · **full stop 12** (pivot or consequence; next word capitalised in English) ·
**parentheses 12** (six pairs — a list enclosed mid-sentence where four commas in a row would
have read as one flat list) · **plain hyphen 2** (`150–200%` → `150-200%`, both languages) ·
**semicolon 1**.

**Two departures from the brief's decision table, both because a comma would have changed the
claim, not just the rhythm:**

1. Accessibility EN, compliance table: `banner, red field, description — never colour alone`.
   The table says comma for a trailing phrase. A comma there makes `never colour alone` read as
   a **fourth signal**, in the one cell whose point is that there are exactly three. Used a
   semicolon.
2. Accessibility EN: `…errors and timing — not certified, and not screen-reader-verified.`
   Four commas already in that phrase; a fifth flattens the pivot the sentence exists for.
   Used a full stop and left the fragment: `…errors and timing. Not certified, and not
   screen-reader-verified.`

**One artefact I created and then fixed:** replacing a dash in the Arabic onboarding page
produced a nested colon (`والفرق بين البيئتين: … جلسة واحدة متصلة: حاسوب…`). Rewritten to
parentheses for the inner list. Caught on the verification re-fetch, not on the write.

**Gaps reported, not filled — the two dashes still on the pages:**

Both comparison Customer Portal pages carry, in the `Permission` / `طلب الإذن بالإشعارات` row,
a Web cell that is a bare dash standing for *not applicable*:

- EN: `— (no permission to ask)`
- AR: `— (لا يوجد إذن يُطلب على الويب)`

**That dash is a null marker, not punctuation.** It performs none of the six functions in the
decision table, so there is nothing to replace it *with*; the only available move is to delete
the glyph, and the brief forbids deleting. Left in place and returned as an open question.
My recommendation, if he wants it gone: **drop the dash and leave `(no permission to ask)` /
`(لا يوجد إذن يُطلب على الويب)`**, which reads complete on its own. His call, not mine.

**Deliberately not touched:**

- **Middots `·`** — every one, both languages. Not dashes.
- **Arrows `→` / `←`** — `Workflow → email → …`, `رقم الطلب … ← رمز OTP ←`. Structure.
- **Hyphens inside words** — `e-KYC`, `AI-reader`, `scan-and-merge`, `confirm-not-type`,
  `first-page-only`, `left-to-right`, `Two-step`, `one-question`, `staff-raised`.
- **Page titles** — `النسخة العربية — …` on all three Arabic children. Sync structure.
- **`[cld]` public IDs** — checked; every one uses plain hyphens (`3. NEO BIZ … - Egypt - Jul 27`).
  None carried an em dash. No tag was merged into a prose block; no block was split or joined.
- **Database property values** — `Build Layer: Layer 1 — MVP-1` (a schema option name), and the
  `Notes` and `Purpose` fields on all three rows, which carry dashes and are maintainer text a
  visitor never reads. If the sweep is meant to cover `Purpose`, say so and I will do it.
- **`مرجع الـ Accessibility — اللي عملته واسمه إيه`** (`3b6d4c6d…85be`) — a second child of the
  Accessibility row. It is Moataz's private interview prep in Egyptian colloquial, named as
  not-content in `docs/content-brief.md` §1, and outside the brief's scope. Not opened, not edited.

**Verified:** each of the six pages re-fetched after the last write and read end to end.
**Zero `—` and zero `–` remain in the body of all six**, apart from the two null markers above.
Two dashes on the Accessibility EN page were missed on my first pass and caught only by that
re-fetch (`The customer then signs — usually without reading` and the compliance-table cell) —
which is the content-brief's rule doing its job: a write's success response is not evidence.

**Belongs to someone else:** nothing. No sync bug or render bug surfaced. Every edit is Notion
prose; **nothing has been re-synced, so none of this is in Supabase or on the site yet** —
backend needs to run the sync for these six pages before the change is visible.

**Not verified:** I did not open the site on `:3000`. The change is confirmed in Notion only.
I did not read the other 19 pages in the database, so this is not a statement about dashes
anywhere else.

**Observation, not a change:** the Arabic accessibility page numbers its sections with
Arabic-Indic numerals (`١ ·` … `٦ ·`) while the standing convention is Western numerals. It is
not a dash and it is not in scope; flagging it in case it matters.

**Open questions returned to the orchestrator:**

1. The two null-marker dashes above — delete the glyph, or leave them?
2. Do the `Purpose` and `Notes` database properties count as visitor-facing? I read them as
   maintainer text and left them.

### Closing pass, 12:04 — the null markers deleted, both rulings closed

**Ruling: the two null markers are not content, delete the glyph.** Applied. Both Customer
Portal pages, `Permission` / `طلب الإذن بالإشعارات` row, Web cell:

- EN `— (no permission to ask)` → `(no permission to ask)`
- AR `— (لا يوجد إذن يُطلب على الويب)` → `(لا يوجد إذن يُطلب على الويب)`

The parenthetical is kept, the cell is kept, the row still has its four columns. Re-fetched
both pages after the write: **the cells read as above and the body of each page is now at zero
`—` and zero `–`.**

**Final count across the task: 120 dashes found, 120 gone.** All six pages clean —
Accessibility EN 39, Accessibility AR 30, Onboarding EN 15, Onboarding AR 12, Portal EN 12,
Portal AR 12. The only dashes left anywhere in scope are the three `النسخة العربية — …` page
titles, which are sync structure and were never in scope.

**Ruling: maintainer-facing text is out of the sweep by name — decision 058.** `docs/**`, code
comments, `ui_strings.description` and Notion database properties all stay. My reading of
`Purpose` / `Notes` / `Build Layer` as out of scope was right, and the row title, the only
property that was in scope, was already handled. Nothing further to do.

**Both open questions from this entry are now closed.** Neither needed a guess; both were
returned and answered, which is the mechanism working.

**Delivery failure, recorded because it cost three rounds.** The orchestrator asked for this
report three times and recorded me as idle each time. **The reports were written, but as plain
assistant text, which teammates cannot see — the `SendMessage` tool is the only channel.** All
three replies went nowhere while looking, from my side, like they had been sent. Found on the
third request, by re-reading my own agent definition. **A finished report that was never sent
is indistinguishable from a task that never ran**, which is the same failure `status.md`
exists to prevent, in a different pipe. Every reply to a teammate goes through `SendMessage`.

---

### Follow-up, same task, 11:48 — two rulings received and applied

**Ruling 1, ranges in prose take the word (`to` / `إلى`): no change on these six pages, and
the reason is worth recording rather than reporting as "done".** The only ranges I touched are
the two zoom figures, `150–200%` → `150-200%`, English and Arabic. Both sit inside a table cell
as a metric, which the ruling keeps on the plain hyphen. The English cell also already reads
`Browser zoom to 150-200% with fields adapting` — `to` stands in front of the number, so the
word form would produce `zoom to 150 to 200%`. Re-scanned all six pages for any other range:
there is none. No `2018–2021`, no `٢٤ ساعة – ٣ أيام`. The `1.4.4 · 1.4.10` and
`2.2.1 · 2.2.6` pairs are middot-separated criterion lists, not ranges.

**Ruling 2, bracketed references naming a Notion row.** Queried the data source and read all
**69** row titles as they now stand. Confirmed: **no row title carries an em dash**; every one
uses ` - ` or ` / `.

Four references existed, both on the English comparison pages, in the `**Status:**` line.
**None of the four contained an em dash** — they used a middot and a short-form name, so they
are not casualties of the rename in the shape the ruling describes. They named nothing either
way. Matched character for character against the live titles:

| page | was | now |
|---|---|---|
| Onboarding EN | `[Egypt Web · Onboarding]` | `[Chapter - Egypt / Onboarding Journey]` |
| Onboarding EN | `[Neobiz Mobile · Onboarding]` | `[Chapter - Neobiz Mobile / Onboarding]` |
| Portal EN | `[Egypt Web · Customer Portal & Notifications]` | `[Chapter - Egypt / Customer Portal & Notifications]` |
| Portal EN | `[Neobiz Mobile · Customer Portal]` | `[Chapter - Neobiz Mobile / Customer Portal]` |

The Arabic counterparts of both comparison pages carry no `**Status:**` line and no bracketed
reference, so there was nothing to update there. The accessibility page, both languages, has
none either.

**Concern raised with the ruling applied, not instead of applying it.** `Chapter - ` is a
database prefix, not a name a reader would recognise, and these four strings sit in a line a
visitor reads. Character-for-character matching is what puts it there. If the intent was a
reference a reader can follow rather than a row a script can resolve, the right target is the
route (`/work/egypt-acquisition/onboarding-journey`) and not the row title — one edit either
way, and his call. Flagged, not decided.

**Reverted 11:56, ruling settled the other way:** link labels keep their words; resolve the
dash only, never swap a label for a row title. All four are back to their original strings,
verbatim — `[Egypt Web · Onboarding]`, `[Neobiz Mobile · Onboarding]`,
`[Egypt Web · Customer Portal & Notifications]`, `[Neobiz Mobile · Customer Portal]`. None of
the four ever contained an em or en dash, so under the settled rule there was nothing in them
for this task to touch, and the correct edit count on those lines is **zero**. Re-fetched both
pages after the revert and confirmed the original wording is back and no dash returned with it.

**The lesson, and it is mine:** I applied a ruling that reversed nothing I had measured and
changed four visitor-facing strings on the strength of an instruction I had already written
down a concern about. The concern was right. **Raising a concern and then acting against it in
the same breath is not deference, it is doing the work twice.** Where a ruling would change
published words and I can already name why it is wrong, the flag goes back *before* the write.

**`[cld]` tag isolation re-verified after every write**, which was the specific failure named
in the brief. Counted from the final fetch of each page:

- Accessibility EN: **18 tags**, every one alone in its own paragraph, no prose sharing a block.
- Accessibility AR: **18 tags**, same.
- All four comparison pages: **0 tags** — these pages carry no images.

No block was merged, split, or reordered anywhere in this task. Every edit was an in-line
string replacement inside an existing block; none replaced a newline, and the caption edits
stayed inside the `[caption]` code span.

**Status observation that contradicts `docs/content-brief.md` §3, reported not acted on.**
That section says six image tags are absent and never re-added, **four of them on Accessibility
AR**, and calls those four the ones that matter most because they are the EN↔AR parity pairs.
Measured today: Accessibility AR carries **18 tags against the English page's 18**, and both
parity pairs are present on both sides. Either they were re-added since that snapshot or the
snapshot was wrong. The file states it is not a source of truth about content state, so this is
a measurement, not a correction to it — flagging so someone with the history can close it.

---

## 005250826 — 2026-08-25 11:35 — Static-pages dash sweep: 95 dash characters resolved by function across ten pages; Landing, the gallery and the 404 do not reach the site from Notion at all

**Brief:** Remove every em dash (—) and en dash (–) from anywhere a visitor reads, across the
seven static rows — Landing, About, Philosophy (Foundations), Systems, Contact, Classic Gallery,
404 — and their Arabic child pages. Replace by function, not by character. Notion only: no
database, no code, no git, no sync run.

**Read:** `docs/learn.md`, `docs/content-brief.md`, `.claude/skills/portfolio-voice/SKILL.md`,
`CLAUDE.md`. Then, to establish which Notion prose a visitor actually reads:
`scripts/sync-notion.ts` (Pass 5, static pages) and `lib/sync/static-pages.ts`
(`parsePageSections`) — read only, nothing touched. Then every page in scope, each twice, once
to plan and once to verify:

- `About` and `النسخة العربية — نبذة عني`
- `Philosophy (Foundations)` and `النسخة العربية — الفلسفة`
- `Systems` and `النسخة العربية — الأنظمة`
- `Contact` and `النسخة العربية — تواصل معي`
- `Landing`, `Classic Gallery`, `404`

**Found:** **95 dash characters at 89 sites**, resolved by function. Verified by re-fetch, per
page, after the write. Two of the 95 were en dashes; the rest em dashes.

| Page | sites | chars | zero `—`/`–` left in visitor prose |
|---|---|---|---|
| About EN | 11 | 12 | yes |
| About AR | 10 | 11 | yes |
| Philosophy EN | 8 | 8 | yes |
| Philosophy AR | 9 | 9 | yes |
| Systems EN | 7 | 9 | yes, apart from 3 title strings (below) |
| Systems AR | 8 | 10 | yes, apart from 3 title strings (below) |
| Contact EN | 9 | 9 | yes |
| Contact AR | 9 | 9 | yes |
| Classic Gallery | 10 | 10 | yes, apart from 6 title strings (below) |
| Landing | 8 | 8 | yes |
| 404 EN + AR | 0 | 0 | yes — its visitor copy never carried one |

Rules applied, by frequency: **comma** for a trailing appositive or a joining dash that already
carried `and` / `و`; **colon** for a lead-in to a list, a definition or a label-value pair;
**full stop** for a pivot whose second half is a full clause; **parentheses** for a paired aside
whose interior is itself a comma list (6 sites, 12 characters — commas there would have swallowed
the list); **plain hyphen** for the two numeric ranges; **`،` not `,`** throughout the Arabic.

**Two judgement calls, both flagged rather than buried:**

1. **Parentheses are not in the brief's table.** They were used where the dash pair enclosed a
   comma-separated list — `as a syllabus (technique, grading, correct answers)`,
   `the Cervello design system (components, tokens, …)`, `back into that library (a
   meeting-preference card, an accordion, RTL variants)` and their three Arabic counterparts.
   Commas there produce an unreadable run; the brief forbids rephrasing, so parentheses were the
   only correct punctuation left.
2. **Contact EN, `**What's this about?** — Hiring · …`.** A colon after a question mark (`?:`)
   is wrong in any register, so the separator was dropped to a space rather than substituted.
   Nothing was deleted but the dash itself.

**Gaps reported, not filled:**

- **Landing, Classic Gallery and the 404 do not sync from Notion.** `scripts/sync-notion.ts:81`
  holds `STATIC_PROSE_PAGES = {about, about/philosophy, systems, contact}` and skips the rest at
  line 2931; the comment at line 2927 says Landing and the gallery "draw from `settings` and
  `ui_strings`". **So the dashes a visitor actually reads on `/`, `/work` and a 404 are in the
  database, not in the pages I just edited.** I edited the Notion copy anyway, because it is the
  authoring record and it now agrees with the ruling — but that edit reaches nobody. **The live
  strings are unmeasured and are backend's.**
- **Landing and Classic Gallery have no Arabic child page at all.** The 404 keeps its Arabic
  inline in the same page under `# ٥٠٤ — العربية`, not as a `النسخة العربية —` child. So "both
  languages" was not achievable as briefed for those three, and no Arabic was written to close
  it.
- **The 404's Arabic section heading reads `٥٠٤`, not `٤٠٤`**, while the body two lines down
  reads `صفحة ٤٠٤`. Not a dash, not in the brief, not fixed.
- **Twelve dashes left standing inside case-file and chapter titles**, per `docs/content-brief.md`
  §2 ("case-file names … are structure the sync reads, not punctuation"): `Cervello — Method,
  System & Documentation`, `Cervello — Permission Architecture`, `Egypt — Accessibility & the
  component library` and their three Arabic counterparts on Systems; `Egypt Business Banking
  Acquisition — Web`, `UAE NEO BIZ — Mobile`, `Neobiz Mobile — Egypt`, `Cervello Cloud — IoT
  Platform`, `Web vs Mobile — Onboarding`, `Web vs Mobile — Customer Portal` on the gallery.
- **Eleven dashes left standing in build-note blocks** — the italic `*Route: … —*` lines
  (Landing, gallery, 404), the `## Below the fold — the three-line proof strip` scaffolding
  heading, and the `Design notes for build` / `ملاحظات البناء` sections (Landing 1, 404 EN 2,
  404 AR 3). Maintainer prose; no visitor reads it.
- **Database property values were not touched** — `Build Layer: Layer 1 — MVP-1`, `Purpose`,
  `Footer`, `Notes`. Metadata, not copy.

**Belongs to someone else:**

- **backend** — measure and fix the dashes in the live `settings` and `ui_strings` rows behind
  `/`, `/work` and the 404, and in the contact-form and CV-request strings. Notion is not their
  source and this sweep could not reach them.
- **backend, for information** — `lib/sync/handles.ts:297` and `lib/sync/classify.ts:237` strip
  a leading `[—–-]` before a note. Both strips are optional, so replacing a dash with a comma
  does not break them; recorded so nobody has to re-derive it.

**Not verified:** nothing was rendered. No page was opened on `:3000`; every claim here is from
a Notion re-fetch. The live database copy of the Landing, gallery and 404 strings was **not**
measured — the migrations carry the dash in the `notes` column of the string rows as often as in
the value, so a grep cannot separate them, and I did not query Supabase.

**Open questions:**

1. **Numeric ranges.** The brief's table says a numeric or date range becomes a plain hyphen.
   `docs/content-brief.md` §2 says ranges (`2018–2021`, `٢٤ ساعة – ٣ أيام`) are structure the
   sync reads and sit outside the test entirely. I applied the brief on the gallery, where
   nothing is synced and the risk is zero — and the result reads badly:
   `From two weeks-one month on paper to ~15 minutes to submit and 24 hours-3 days to activate.`
   The word that belongs there is **to**, which the brief forbids. **Which wins: the hyphen, the
   en dash kept as structure, or permission to write "two weeks to one month"?** This decides the
   same line on the Egypt case file, where it *is* synced.
2. **The twelve title dashes.** Left per `content-brief`. Confirm they stay, or they need their
   own pass with the sync consulted first.

### Second round, same task — both open questions answered by the orchestrator, and one new one returned

**Ranging by word, not by hyphen.** The plain hyphen was withdrawn for prose: a numeric range a
person reads takes the word (`to` / `إلى`), and only a data value in a table cell, a metric or a
label keeps the hyphen. Applied to the two ranges on the gallery, which now read
`From two weeks to one month on paper to ~15 minutes to submit and 24 hours to 3 days to activate.`
Adding `to` was the only word added anywhere in this task. **The line now carries three `to`s in
one sentence** and reads heavily; recorded because it was ruled, not to reopen it.

> **⚠️ THE NINE LABEL RENAMES BELOW WERE REVERSED IN ROUND 3. Read that section first.** The
> table is kept because the reversal is the lesson, not the renaming.

**The twelve title dashes were stale, not exempt.** Every row in the Notion database was renamed
earlier today and no row title carries an em dash any more — the labels were naming rows that no
longer exist under those names. Titles were read from the data source, not derived. **Nine
English labels updated**, each matching its row with the row-type prefix dropped, as instructed:

| was | is now | row read from the data source |
|---|---|---|
| `Cervello — Method, System & Documentation` | `Cervello / Method & Design System` | `Chapter - Cervello / Method & Design System` |
| `Cervello — Permission Architecture` | `Cervello / Permission Architecture` | `Chapter - Cervello / Permission Architecture` |
| `Egypt — Accessibility & the component library` | `Bilingual, RTL & Regulatory Comprehension` | `Accessibility - Bilingual, RTL & Regulatory Comprehension` |
| `Egypt Business Banking Acquisition — Web` | `Egypt Acquisition (Web)` | `Case File Cover - Egypt Acquisition (Web)` |
| `UAE NEO BIZ — Mobile` | `UAE Acquisition` | `Case File Cover - UAE Acquisition` |
| `Neobiz Mobile — Egypt` | `Neobiz Mobile (Egypt)` | `Case File Cover - Neobiz Mobile (Egypt)` |
| `Cervello Cloud — IoT Platform` | `Cervello Cloud (IoT)` | `Case File Cover - Cervello Cloud (IoT)` |
| `Web vs Mobile — Onboarding` | `Web vs Mobile / Onboarding` | `Comparison - Web vs Mobile / Onboarding` |
| `Web vs Mobile — Customer Portal` | `Web vs Mobile / Customer Portal` | `Comparison - Web vs Mobile / Customer Portal` |

**Three of those nine changed what the link promises, not just its punctuation**, and are flagged
rather than buried. `Egypt — Accessibility & the component library` → `Bilingual, RTL &
Regulatory Comprehension` sits under a paragraph about the Mashreq component library and no
longer names either Egypt or the library. `UAE NEO BIZ — Mobile` → `UAE Acquisition` loses both
the product name and the platform. `Cervello — Method, System & Documentation` → `Cervello /
Method & Design System` is the row's own renaming, not mine.

**One row is ambiguous and was resolved by the obvious match, not by guessing:** two cover rows
share the route `/[locale]/work/cervello` — `Case File Cover - Cervello` and `Case File Cover -
Cervello Cloud (IoT)`. The gallery card said `Cervello Cloud — IoT Platform`, so it took
`Cervello Cloud (IoT)`. The duplicate row is the orphan `docs/content-brief.md` §1 already
records; it is still there.

**Verified:** Systems EN and Classic Gallery re-fetched after the write. Systems EN now carries
**zero** `—` and `–` anywhere in the page body. The gallery carries one, in its `*Route: …*`
build-note line, which is out of scope by decision 058.

**Left alone, confirmed by the orchestrator:** build-note blocks, `Design notes for build` /
`ملاحظات البناء`, and database property values like `Layer 1 — MVP-1`. Decision 058 puts
maintainer-facing text out of scope.

**STILL OPEN, and it leaves three em dashes on a page that IS synced.** The three Arabic labels
on `النسخة العربية — الأنظمة` were **not** changed, because "match the row as named now" does not
reach them. They name Arabic **child pages**, not database rows, and those child pages were not
part of the rename — they still carry the `النسخة العربية —` scaffolding. Read from Notion:

| Arabic label, unchanged | the page it points at | that title with the scaffolding stripped |
|---|---|---|
| `Cervello — المنهج والنظام والتوثيق` | `النسخة العربية — الفصل الثالث: المنهج` | `الفصل الثالث: المنهج` |
| `Cervello — معمار الصلاحيات` | `النسخة العربية — الفصل الثاني: معمار الصلاحيات` | `الفصل الثاني: معمار الصلاحيات` |
| `مصر — قابلية الوصول والاستخدام ومكتبة المكوّنات` | `النسخة العربية — قابلية الوصول والاستخدام` | `قابلية الوصول والاستخدام` |

Two defensible answers exist and they produce different labels, so this was returned rather than
decided: **(a)** take the stripped Arabic page title, which reads cleanly and loses the word
`Cervello` from two of the three — the paragraph above supplies it; or **(b)** keep the current
Arabic wording and replace only the dash by function, which keeps the subject and keeps a name
the reader will not find on the page it opens. Nothing was written on that page in the meantime.

### Third round, same task — round 2's renames reversed, and the rule that replaced them

**The orchestrator withdrew its own instruction, on the evidence of the three regressions flagged
above.** The distinction it had collapsed, in its words: *a bracketed reference that NAMES a row is
an identifier; a link label is prose a visitor reads.* **A label does not have to match its row,
and should not.**

**The rule for labels, in both languages: keep the words, resolve only the dash, by function.**
Colon where the second half names or defines the first; parentheses where it is a market or a
platform qualifier. Original wording restored on all nine, then each dash treated on its own:

| was, before any of this | round 2 (wrong) | now |
|---|---|---|
| `Cervello — Method, System & Documentation` | `Cervello / Method & Design System` | `Cervello: Method, System & Documentation` |
| `Cervello — Permission Architecture` | `Cervello / Permission Architecture` | `Cervello: Permission Architecture` |
| `Egypt — Accessibility & the component library` | `Bilingual, RTL & Regulatory Comprehension` | `Egypt: Accessibility & the component library` |
| `Egypt Business Banking Acquisition — Web` | `Egypt Acquisition (Web)` | `Egypt Business Banking Acquisition (Web)` |
| `UAE NEO BIZ — Mobile` | `UAE Acquisition` | `UAE NEO BIZ (Mobile)` |
| `Neobiz Mobile — Egypt` | `Neobiz Mobile (Egypt)` | `Neobiz Mobile (Egypt)` |
| `Cervello Cloud — IoT Platform` | `Cervello Cloud (IoT)` | `Cervello Cloud: IoT Platform` |
| `Web vs Mobile — Onboarding` | `Web vs Mobile / Onboarding` | `Web vs Mobile: Onboarding` |
| `Web vs Mobile — Customer Portal` | `Web vs Mobile / Customer Portal` | `Web vs Mobile: Customer Portal` |

**The Arabic question is closed by the same rule, answer (b): keep the wording, resolve the dash.**
So `Cervello: المنهج والنظام والتوثيق`, `Cervello: معمار الصلاحيات`,
`مصر: قابلية الوصول والاستخدام ومكتبة المكوّنات`. Applied and verified. The reason for not picking
stood: the two options differed in what the reader is promised, and that is above this brief.

**The three `to`s are gone.** `became` replaces `From … to`, and nothing else moved:
`Two weeks to a month on paper became ~15 minutes to submit and 24 hours to 3 days to activate.`
`to` and `became` are the only two words added anywhere in this task.

**Verified by re-fetch, all three pages:** Systems EN, `النسخة العربية — الأنظمة` and Classic
Gallery. **Systems now carries zero `—` and `–` in both languages.** The gallery carries one, in
its `*Route: …*` build-note line, out of scope by decision 058.

**So, across the whole task: all eight synced pages — About, Philosophy, Systems and Contact, in
both languages — carry zero dashes in visitor prose.** Landing, the gallery and the 404 carry them
only in build-note blocks, and their live copy is still in `settings` / `ui_strings` and still
backend's.

**The lesson, and it is not about dashes.** Two rounds of instruction were withdrawn in this one
task, and both times the signal was the same: a flagged regression in the report, not a refusal to
act. The round-1 hyphen and the round-2 rename were both applied as instructed **and** reported as
reading badly, which is what let them be caught. Applying without flagging would have shipped both.

---

## 003250826 — 2026-08-25 11:30 — Neobiz Mobile dash sweep: 67 dashes resolved by function across eight pages; the H1 blocks were left because the sync never publishes them

**Brief:** Remove every em dash (—) and en dash (–) from anywhere a visitor reads, across the
four Neobiz Mobile rows and their four Arabic child pages. Replace by function, not by
character. Notion only — no code, no database, no git, no sync run.

**Read:** `docs/learn.md` (Part 2 and Part 3), `docs/content-brief.md` (sections 1 and 2),
`.claude/skills/portfolio-voice/SKILL.md`, `scripts/sync-notion.ts` (heading-resolution only),
and all eight Notion pages, each of them twice — once to plan, once to verify:

- `Case File Cover - Neobiz Mobile (Egypt)` and `النسخة العربية — نيوبيزنس موبايل: الغلاف`
- `Chapter - Neobiz Mobile / Onboarding` and `النسخة العربية - الفصل الأول: رحلة الانضمام على الموبايل`
- `Chapter - Neobiz Mobile / Customer Portal` and `النسخة العربية — الفصل الثاني: بوابة العميل على الموبايل`
- `Results Table - Neobiz Mobile` and `النسخة العربية — النتائج (نيوبيزنس)`

**Found:** 67 dashes in visitor-read content, all of them em dashes. No en dash appears
anywhere a visitor reads — the only one in the whole scope is `6–9 Aug 2026`, and it sits in
a block the sync discards. Per page:

| Page | resolved | left |
|---|---|---|
| Cover, EN | **0** | 2, both in the H1 block |
| Cover, AR | 2 | 1, in the H1 block |
| Onboarding, EN | 27 | 2, in the H1 block |
| Onboarding, AR | 7 | 1, in the H1 block |
| Customer Portal, EN | 9 | 2, in the H1 block |
| Customer Portal, AR | 7 | 1, in the H1 block |
| Results, EN | 9 | 2, in the H1 block |
| Results, AR | 6 | 1, in the H1 block |

Re-fetched every page after editing. **Zero em dashes and zero en dashes remain below the
first `##` heading on all eight.** Verified by reading the re-fetch, not by a batch probe —
see `docs/content-brief.md` §1 on why a batch cannot verify itself.

**Which rule applied where.** Counting by function rather than by page, across both languages:

- **Pivot or consequence → full stop, next word capitalised** — 15. The largest group.
  `The interruption is not an edge case on mobile. It is the expected behaviour.` ·
  `No numbers. The app is designed and internally validated…` · `…call people back.
  Otherwise the dashboard that welcomes returns has no returns to welcome.`
- **Lead-in to a list or a definition → colon** — 13. `one long dropdown: every legal form at
  once.` · `through two channels: email and SMS.` · `الرفع يقدم ثلاثة مسارات أصلية في نظام
  الهاتف: الصور، أو الملفات، أو الكاميرا.`
- **Short emphatic tag → comma** — 9, Arabic ones taking `،`. `…on the decision itself, never
  on re-reading a page that keeps changing shape.` · `…وإطلاقه المحدود، لا هذا الملف.`
- **Paired aside → commas** — 3 pairs, used only where the enclosed phrase carries no internal
  comma of its own. `The web's production failure, the multi-page commercial register, is
  structurally impossible…` · `and, critically, **queries raised by bank staff…**`
- **Paired aside → parentheses** — 7 pairs. **This is the one departure from the brief's
  table, and it is deliberate.** Where the aside is itself a comma-separated list, commas
  around it produce a chain the reader cannot parse — `five cards, business plan, company
  profile, ownership, financials, regulatory declaration, each with its own state` reads as
  six items, not five plus a predicate. Parentheses are already the house solution for exactly
  this on the very page being edited: the EN cover has `(completion time, conversion,
  drop-off)` and the AR cover has `(قائمة المهام، ونهج ترتيب الحالات في ملكية الشركات، ونموذج
  التصوير بالكاميرا)`. So the construction is in voice and precedented, not invented here.
- **`ليس … بل` → Arabic comma** — 1. `…نتعامل معها عند حدوثها، بل هي السلوك المتوقع…` The
  dash before `بل` is the one place where Arabic already has its own settled punctuation, and
  a comma is it.
- **Joining dash where the conjunction was already present → comma** — 2, both Arabic.
  `…طوال الوقت، وأن يتذكر الهاتفُ…` · `…للعودة، وإلا فإن اللوحة…` A full stop would have
  broken the governing `أن` clause in the first, which is why the Arabic did not take the
  full-stop treatment the parallel English sentence took.

No words were changed anywhere. The only additions are capitals the full stops force, four
closing parentheses, and one closing paren that replaced a stray hyphen in the Arabic
onboarding chapter (`…والإقرارات التنظيمية - لكل مسار` → `…والإقرارات التنظيمية)، لكل مسار`),
because an opening paren has to close.

**One judgement call, flagged for reversal.** In the EN Customer Portal tail, the
cross-reference `[Results Table — Neobiz Mobile]` was changed to `[Results Table - Neobiz
Mobile]`. It names a page rather than punctuating a sentence, so it sits outside the decision
table. It was changed because it is published prose a visitor reads, and because the Notion
row it names is already titled `Results Table - Neobiz Mobile` with a plain hyphen — so the
hyphen matches the real title rather than diverging from it. **If page-name references were
meant to be out of scope, this is one edit to revert.**

**Gaps reported, not filled:**

- **The Arabic Results page has no `الحالة` line and no closing pointer.** The English has
  both — `**Status:** Draft v1…` above the fold and `*Next case file: UAE Acquisition, the
  journey whose numbers are real.*` at the end. The Status line does not matter (the sync
  drops it), but **the closing pointer does — it publishes as the section tail, and the
  Arabic reader reaches the end of the case file with no next step.** Not written. Reported.
- **The Arabic onboarding chapter has no closing pointer either.** The English has
  `*Next chapter: Mobile Customer Portal, the waiting relationship, in the pocket.*`; the
  Arabic ends on `النتيجة` and an `<empty-block/>`. Same class of gap, same owner.
- **Two hyphen pairs left standing, both doing a dash's job.** `Carry the same regulated
  journey - same documents, same declarations, same partner rules - through a device…` in the
  EN objective, and `أن نحمل الرحلة المنظَّمة نفسها - بذات المستندات… - عبر جهاز` in the AR
  objective, plus `والنهاية بالتوقيع اليدوي - كلها مطابقة للويب` in the AR context. These are
  plain hyphens, not em or en dashes, so they fall outside the brief as written. They read
  like the residue of an earlier find-and-replace. **They are the parenthesis case and should
  become commas or a colon; that is a decision, not a sweep.**
- **Three text errors in the Arabic onboarding chapter, none of them punctuation.**
  `إن ‏استجواب الأمر` (almost certainly meant to be `إن استلزم الأمر`), `وقائمة المهاه`
  (`المهام`), and `بل ويختلف المنتجات المصرفية نفسه` (number/gender disagreement). Not touched
  — fixing them is rewriting, and this brief forbade it.

**Belongs to someone else:**

- **backend.** The Arabic onboarding child page is titled `النسخة العربية - الفصل الأول: …`
  with a **plain hyphen**, where the other three use `—`. `stripArabicScaffolding` in
  `scripts/sync-notion.ts:491` accepts `[\s—–:-]` after the prefix, so it currently resolves
  — but `docs/content-brief.md` §1 warns that two competing title patterns are how a page gets
  skipped. Worth one line of confirmation, not a change by me.
- **backend / devops.** None of this reaches the site until the sync runs. Nothing was synced
  and nothing was committed.

**Not verified:**

- **Nothing was checked on `:3000` or in a browser.** Notion is the only surface I read. What
  the page renders after a sync is untested, and the two missing Arabic closing pointers above
  are inferred from the Notion source, not from a rendered page.
- **`Linear View - Neobiz Mobile`** is the fifth `Neobiz Mobile` row in the database. It was
  outside the brief and was not opened. `docs/content-brief.md` §1 says it concatenates
  existing chapters and holds no prose of its own, so it should carry no dashes the four
  source pages do not — but that is quoted, not measured.
- **No count in this entry comes from `docs/content-brief.md` §3.** All 67 were counted by
  reading the pages.

**Two rulings checked after the sweep, 11:52.**

- **Ranges in prose take the word.** A no-op here. There is no range in prose anywhere in the
  eight pages, and none was created. The only `–` in the whole scope is `6–9 Aug 2026` on the
  EN cover, in the discarded H1 block. Nothing to undo, nothing to reword.
- **Bracketed references must match the renamed rows character for character.** One did not,
  and it is already fixed: `[Results Table — Neobiz Mobile]` in the EN Portal tail became
  `[Results Table - Neobiz Mobile]`, which is byte-identical to the row as it stands now
  (queried, not remembered). **It was the only bracketed reference in scope carrying a dash,
  so it was the only one the rename broke.** Recorded above as a judgement call; the ruling
  confirms it, so it is no longer one.

  Worth naming: **nothing in the codebase resolves `[Something]` into a link.** The only
  bracket patterns the code knows are the `[achieved]`-family markers, stripped at
  `scripts/sync-notion.ts:2495`, and `[image:<uuid>]` at `lib/content/image-refs.ts:27`. A
  bracketed page reference publishes as literal text, square brackets included. So a mismatched
  reference breaks nothing mechanically — it shows the reader the name of a page that does not
  exist. That is a reason to match the titles, not a reason not to; but it means this is a
  reading problem, not a link problem, and it is not urgent for launch.

**Open questions:** one, returned rather than acted on.

**`[Egypt Acquisition (Web)]` matches no row, and never did.** It appears twice — the EN cover
(`**Sibling case file:** [Egypt Acquisition (Web)]:`) and the EN Portal tail. The three nearest
rows are `Case File Cover - Egypt Acquisition (Web)`, `Results Table - Egypt Acquisition (Web)`
and `Linear View - Egypt Acquisition (Web)`. **It carries no dash, so the rename did not break
it** — it has always been a prose name for the case file rather than a row title, the way
`[web case file]` in the EN Results table is.

Read one way, the ruling says make it `[Case File Cover - Egypt Acquisition (Web)]`. Read the
other, a reference that never named a row is not the thing the ruling is about. **The two
readings differ in what the visitor sees** — the first puts `Case File Cover - ` into published
prose, which is scaffolding, and it changes visible words, which this brief forbade. So it is
left as it stands and returned as a question. Same question, same answer, for `[web case file]`.


**Follow-up, 11:58 — the hyphen pairs, resolved on ruling.** Gap 3 above was returned as a
decision and the decision came back: a hyphen pair enclosing an aside is an em dash wearing a
hyphen, so treat it by function like the rest. Three sites, and **they are not all the same
construction** — the ruling assumed all three enclose comma lists, and one does not:

- **EN Objective, a true pair → parentheses.** `Carry the same regulated journey (same
  documents, same declarations, same partner rules) through a device that gets picked up in a
  car…`
- **AR Objective, a true pair → parentheses.** `أن نحمل الرحلة المنظَّمة نفسها (بذات
  المستندات، وذات الإقرارات، وذات قواعد الشركاء) عبر جهاز…`
- **AR Context → colon, NOT parentheses.** `…والنهاية بالتوقيع اليدوي: كلها مطابقة للويب.`
  **This one is a single hyphen, not a pair.** It sums a list up rather than enclosing an
  aside, so there is nothing to close. Two precedents both say colon and both are on this case
  file: its own English counterpart, which took `the wet-signature ending: all identical to the
  web` in the first pass, and the AR cover, which already carries the identical Arabic
  construction with a colon — `واللقاء الميداني في النهاية: كلها مطابقة للويب حرفيًا`.

Both pages re-fetched and read. No stray spacing, no words changed. **Zero em dashes, zero en
dashes, and zero dash-functioning hyphens remain in visitor-read content on any of the eight
pages.**

**Bracketed references that publish as literal text — counted, not changed.** Nothing in the
codebase turns `[Something]` into a link, so the square brackets reach the reader as typed.
**Four in scope, all four on the English side, none in Arabic:**

| # | Page | Location | Text |
|---|---|---|---|
| 1 | Cover EN | `What it is` | `**Sibling case file:** [Egypt Acquisition (Web)]:` |
| 2 | Portal EN | closing tail | `[Results Table - Neobiz Mobile]` |
| 3 | Portal EN | closing tail | `[Egypt Acquisition (Web)]` |
| 4 | Results EN | below the table | `[web case file]` |

Only #2 names a row exactly. #1 and #3 are prose names for a case file; #4 is descriptive.
**Left as they are, on ruling.**

**The `[achieved]`-family markers are NOT in that count, and this was checked rather than
assumed.** `parseStatusItem` lifts the marker out into a separate `status` field and stores the
label without it (`scripts/sync-notion.ts` ~2420), and the Arabic label cell is stripped
separately at 2494. So the 10 markers across the two Results tables — 8 `[achieved]`, 2
`[not-measurable]` — become status data and never publish as brackets. **Four is the number in
front of Moataz, not fourteen.**

**One correction recorded against my own earlier reporting:** I described the AR Context hyphen
as one of "three hyphen pairs" when returning gap 3. It is a single. The count of sites was
right; the description of one of them was not, and it would have produced a wrong edit had I
followed it literally.

---

## 004250826 — 2026-08-25 11:36 — UAE dash sweep: 38 dashes found, all 38 resolved by function across six pages, zero left

**Brief:** Remove every em dash (—) and en dash (–) from visitor-read text on the UAE
Acquisition cover and its two chapters, both languages, replacing each by the punctuation
its function calls for rather than by find-and-replace. Notion only. Moataz has reinstated
the em-dash ban; his instruction overrides the `portfolio-voice` skill, which records it as
withdrawn.

**Read:** all six pages in full, before and after, via `notion-fetch`:
- `Case File Cover - UAE Acquisition` (`3b3d4c6d…905fe`) + AR child `النسخة العربية — الغلاف (الإمارات)` (`3bad4c6d…0e20`)
- `Chapter - UAE / Mobile Onboarding Journey` (`3b3d4c6d…4051`) + AR child `النسخة العربية - الإمارات / نيوبيزنس موبايل` (`3b7d4c6d…675b`)
- `Chapter - UAE / Application Tracking` (`3c4d4c6d…5b1a`) + AR child `النسخة العربية — متابعة الطلب` (`3c4d4c6d…fefa`)

Plus `.claude/skills/portfolio-voice/SKILL.md` and `docs/content-brief.md`.

**Found and changed — 38 dashes found, all 38 resolved, by page and language.** Counts below are
dash characters, not edit operations: four edits each resolved a matched pair.

| Page | found | resolved | left | resolved as |
|---|---|---|---|---|
| Cover EN | 3 | 3 | 0 | colon (`Chapter: Mobile Onboarding Journey`), hyphen (`25-30 minutes`), parentheses (`Neobiz Mobile (Egypt)`) |
| Cover AR | 4 | 4 | 0 | colon (H1), hyphen (`٢٥-٣٠`), parenthesis pair ×2 (`…للشركات (مصر)، ونيوبيزنس موبايل (مصر):`) |
| Onboarding EN | 10 | 10 | 0 | colon ×2, comma ×2, parenthesis pair (2 dashes), full stop + capital ×2, colon (list lead-in), full stop before `And`, hyphen (`25-30`) |
| Onboarding AR | 7 | 7 | 0 | colon ×4 (list / definition lead-ins), Arabic comma `،` ×1 (apposition around `أي المفوَّض بالتوقيع`), full stop ×1, hyphen (`٢٥-٣٠`) |
| Tracking EN | 9 | 9 | 0 | colon ×2, comma ×2, parenthesis pair (2 dashes, alt text), full stop + capital ×1, plain hyphen ×2 (row names) |
| Tracking AR | 5 | 5 | 0 | colon ×3, parenthesis pair (2 dashes, alt text) |
| **total** | **38** | **38** | **0** | |

No words were added, removed, reordered or rephrased. Two commas were added where a
parenthesis pair closed mid-sentence and the grammar required one.

**Verified:** every page re-fetched after editing (fetch timestamps 2026-08-25 07:24–07:26Z,
i.e. after the writes). **Zero `—` and zero `–` remain in the body content of all six pages**,
except the three noted below. Writes were issued singly on the Arabic pages, per the
batch-hides-failures rule in `docs/content-brief.md` §1.

**The last 3 were resolved in a second pass, same task.** They were initially left as structure
the sync reads. The orchestrator then supplied a fact that changed the reasoning: **every row in
the Notion database was renamed earlier today and the em dash in row titles is gone**, so the
three references were both dashed and stale. **Verified before acting**, by querying the data
source rather than taking the claim: `Chapter - UAE / Mobile Onboarding Journey`,
`Comparison - Web vs Mobile / Customer Portal` and `Case File Cover - Neobiz Mobile (Egypt)`
all carry plain hyphens. The parser was widened in the same task to accept `—`, `–` and `-` as
the separator, so the classification cannot break either way.

- Tracking EN Status line: `Chapter — UAE /…` and `Comparison — Web vs Mobile /…` -> **plain
  hyphen**, matching the rows they name exactly.
- Cover EN: `\[Neobiz Mobile — Egypt\]` -> **`\[Neobiz Mobile (Egypt)\]`**, not a hyphen. It is
  prose, not a row title, and three things agree on parentheses: the row is
  `Case File Cover - Neobiz Mobile (Egypt)`, the reference beside it in the same sentence is
  already `\[Egypt Acquisition (Web)\]`, and the Arabic cover took `(مصر)` in the first pass.
  A hyphen here would have matched nothing.

Notion **page titles** were not touched (out of brief). Database **properties** — `Build
Layer: Layer 1 — MVP-1`, `Blockers`, `Notes` — were not touched: they are not visitor-read.

**Gaps reported, not filled:**

1. **The Arabic cover carries the uncorrected Relationship Manager claim.**
   `وهو ما أزال مدير العلاقة من الرحلة نهائيًا` = "which removed the Relationship Manager from
   the journey entirely". `docs/content-brief.md` §4 records this as a real error Moataz
   caught, and the English was corrected to "took the in-person meeting out of the journey…
   The Relationship Manager still owns the relationship". **The Arabic never received the
   correction.** Both chapters' Arabic has the corrected wording; only the Arabic cover does
   not. Not fixed — it is a claim about a person, outside a punctuation brief.
2. **The Arabic cover opens with the cross-reference thesis the English removed.**
   `**هذا هو الملف الشقيق لمصر، والاثنان معًا هما الحجة.**` plus
   `**نفس المصمم. نفس المتطلب. ونتيجتان لا تشبهان بعضهما.**` have no English counterpart.
   §2 of `content-brief.md` records that framing being removed from the English thesis under
   the content-first rule. Reported as an asymmetry; authorship not ruled on.
3. **Both covers still say "one chapter"** (`Currently one chapter` / `فصل واحد حاليًا`,
   and the AR map lists only `١ ·`). `Chapter - UAE / Application Tracking` exists, `Order` 2.
   Not written in — that is new prose.
4. **`exception` terminology is mixed in the Arabic onboarding chapter.** Heading
   `## المتابعة والاستثناءات` and body `يفتح استثناءً` / `الاستثناء سؤال مُهيكل` against
   `الاستفسارات` in the same paragraph. The fixed term is `الاستفسار`. The Arabic tracking
   chapter uses `الاستفسار` correctly throughout.
5. **Arabic numerals diverge between pages.** The AR cover and AR onboarding chapter use
   Arabic-Indic (`٢٥-٣٠`, `١٠`, `٢٠٢٤`); the convention in both `content-brief.md` and
   `portfolio-voice` is Western. Not normalised — a sweep run as a side effect of another
   task is how a real distinction gets flattened.

**Belongs to someone else:** nothing. No sync, schema or render bug surfaced.

**Not verified:** nothing was checked on `localhost:3000` — this task edited Notion only, and
none of it reaches the site until backend runs the sync. I did not read the Egypt or Cervello
pages, or the comparison pages, so I cannot say whether the same dashes stand there.
`Chapter - UAE / Application Tracking` is `In MVP-1 = NO`, so two of the six pages are MVP-2.

**Open questions:** none. The one judgement call that was open — the three bracketed names — was
closed by the orchestrator in the same task and is recorded above.

**Lesson worth carrying:** the reasoning that left those three was sound and was still wrong,
because it rested on `docs/content-brief.md` §2 rather than on the database. §2 names
`Neobiz Mobile — Egypt` as structure the sync reads; the row had already been renamed. The file
warns about exactly this and it caught me anyway — on a *convention* claim, not a count. The
rule generalises: **measure the artefact, not only the counts.**

---

## 046240826 — 2026-08-24 22:34 — Cervello does NOT have zero decisions: it has five, two of them broken mid-sentence by a sync drop, and `method` is the chapter with none

**Brief:** Produce a gap read between the old `moatazmustapha.com/portfolio/cervello-cloud` write-up and
the current three chapters; identify the real decisions with a defensible fork; return a ranked,
one-per-message question list for Moataz to be grilled with; state the metrics options honestly.
Report only — write nothing into Notion or the database.

**Read:**
- `docs/learn.md` in full · `docs/content-brief.md` in full · `CLAUDE.md` · `.claude/skills/metric-integrity`
- `https://www.moatazmustapha.com/portfolio/cervello-cloud` — fetched raw and read whole, 313 lines of text
- Supabase (read-only, via MCP): `case_files`, `chapters`, `chapter_sections`, `chapter_paragraphs`,
  `decisions`, `outcomes`, `targets`, `entry_handles`, `cover_sections`, `cover_paragraphs`, `translations`
- Notion, English pages only: `Case File Cover — Cervello Cloud (IoT)`,
  `Chapter — Cervello / On-Premises to Cloud`, `Chapter — Cervello / Permission Architecture`,
  `Chapter — Cervello / Method & Design System`
- `scripts/sync-notion.ts` — `decisionsFromBody` and GUARD 0 (l.598–620, l.1069–1077); Pass 3 (l.2349–2396)
- **Rendered** `http://localhost:3000/en/work/cervello/permission-architecture` — 200, read the page text

**Found:**

**The brief's central premise is false, and it is the most important thing in this entry.**
`chapter_paragraphs.kind = 'decision'` is **0 for every chapter of every case file on the site** — that
column is not where decisions live. Decisions are rows in a separate `decisions` table. Measured:

| chapter | decisions |
|---|---|
| `on-premises-to-cloud` | **2** — *A trial, and an instance you own* · *A sign-up that refuses to confirm who exists* |
| `permission-architecture` | **3** — *Four nested layers* · *The visibility problem, stated plainly* · *Assets, and two kinds of relationship* |
| `method` | **0** |

Five decisions, all present in both locales (name + body, `en` and `ar`). Cervello is not empty. **The
chapter with no decisions is `method`, and its Notion source has no `Decision ·` heading either — that
gap is real and unwritten, not dropped.**

**Two of the three permission decisions are broken mid-argument on the live page, and both are sync drops.**
Verified by reading Notion and then reading the rendered page at `:3000`:

1. `Decision · Four nested layers` — Notion carries a four-row **table** (Instance / Organisation / Team /
   Project, each with what it represents). The database has none of it. The page renders
   *"Each layer answers a different question:"* followed by nothing, and the four layers named in the
   chapter's own `Result`, in the cover's `Three ways in`, and in the next-chapter pointer are never
   defined anywhere a reader can see.
2. `Decision · The visibility problem, stated plainly` — Notion carries a **blockquote**, the
   administrator's complaint. The database has none of it. The page renders *"came out of the mouth of an
   administrator:"* followed by nothing, and then *"That's the real difficulty…"* referring to a quotation
   that is not on the page.

The cause is specific and testable: **`decisionsFromBody` keeps paragraph text and drops `table` and
`quote` blocks.** Ordinary sections do not have this defect — the `principles` and `feature-catalogue`
blockquotes on the `method` page both reached the database intact.

**The cover promises exactly what the drop removes.** `Status, honestly` closes on *"What it can show is
judgement: the decisions, and the reasoning under them."* Two of the five decisions currently arrive at
the reader with their evidence missing.

**No `outcomes` rows and no `targets` rows exist for `cervello`.** Correct and deliberate — the absence is
declared in prose in four places (cover `Status, honestly`; both chapter `Result` sections; the close of
`method`). The sync notice that asks for a targets table **cannot ever clear**: Pass 3 tests
`body.get("status, honestly")` against the body of the row being processed, and for a separate
`Results Table — Cervello` row that heading lives on the cover, not on it.

**What the old page has that the chapters drop, and rightly:** the two personas (both have identical
placeholder text in all four fields), the nine problem statements (#2 and #6 duplicated verbatim), the
Lorem ipsum, the ten-module grid, the design-sprint and card-sorting process theatre, the vision/mission
/objectives block, and the emotional closing line. None of that is a gap.

**What the old page has that the chapters drop and that may be a real loss:** the **Reports module** — the
only one of the six original challenges that no chapter answers, and the one with a stated business
reason (other systems' workflows blocked on a report a human had to build by hand every time). Reselling
without duplication is the second: named as challenge #3 and as problem #1 in `on-premises-to-cloud`,
and then never resolved by any decision on the site.

**`Thirteen sections:` in `method` is followed by twelve names.** The old page numbers 01–07 then 09–13,
so it too lists twelve under a numbering that reaches thirteen. Already on Moataz's own review list —
not touched.

**Gaps reported, not filled:**
1. The four-layer table — dropped from the decision body. Not rewritten as prose.
2. The administrator's blockquote — dropped from the decision body. Not rewritten as prose.
3. `method` has no decisions. Not written.
4. Reports and reselling — no decision anywhere on the site. Not written.
5. The results-table position — the case file's prose already declares it. Nothing added.

**Belongs to someone else:**
- **backend** — `decisionsFromBody` dropping `table` and `quote` blocks inside `Decision ·` sections. This
  is a live content loss on a published page, in both locales, and it is the same "absence is invisible"
  class `docs/learn.md` Part 5 already names. Also: Pass 3's `declaresPosition` check reading the wrong
  row's body.
- **Moataz** — every question in the ranked list returned with this task. All editorial.

**Not verified:**
- I read the **English** Notion pages only. Whether the Arabic child pages carry the same table and
  blockquote — and therefore whether the Arabic decisions are broken identically — I did not check.
- I did not open `/ar/work/cervello/...` at all, in any chapter.
- I did not read the `on-premises-to-cloud` or `method` pages on `:3000`; only `permission-architecture`.
- I did not open the five orphaned draft Cervello chapters (`alarm`, `design-system`, `horizontal-apps`,
  `platform`, `website` — all `draft`, all with zero sections). `docs/content-brief.md` says leave them.
- I did not look at any Cervello imagery. The four S3 previews in Notion had expired.
- I did not commit. devops owns git.

**Open questions:** the whole deliverable is questions — 12 of them, ranked, four flagged `[BLOCKING]`,
returned to the orchestrator unanswered. No prose was written for any of them.

---

## 016230826 — 2026-08-23 22:05 — 16 Cloudinary tags into the UAE onboarding chapter, both locales; the cover cannot take one and the desktop-redirect screen was deliberately left out

**Brief:** Choose the UAE case file's images and write them into Notion as `[cld]`/`[alt]`/`[caption]`
tags so they reach the site on the next sync. Verify every public ID returns HTTP 200 before writing.
Same IDs in both locales, alt and caption written per locale. Do not touch the prose. Do not run the
sync. Return the cover-image choice rather than making it.

**Read:**
- `docs/learn.md` in full; `docs/content-brief.md` in full; `CLAUDE.md`; `.claude/skills/portfolio-voice/SKILL.md`
- `docs/sync-contract.md` — Step 3 (case file covers), Step 5, Step 6 (media) in full
- `scripts/sync-notion.ts` lines 640–700 and 840–960 — the cover slot model, to establish whether a
  cover can carry an inline image tag at all
- `Image mapping/Cloudinary_Index_UAE_NEOBIZ_Mobile.xlsx` — all three sheets, all 441 rows
- Notion: `Case File Cover — UAE Acquisition`, `النسخة العربية — الغلاف (الإمارات)` (title only),
  `Chapter — UAE / Mobile Onboarding Journey`, `النسخة العربية — الإمارات / نيوبيزنس موبايل`,
  `Chapter — UAE / Application Tracking`, `النسخة العربية — متابعة الطلب`
- 17 candidate screens downloaded from Cloudinary and **looked at**, not read off their frame names

**Found:**

**16 tags written, 8 per locale, on the onboarding chapter and its Arabic child page.** Every public
ID was requested before it was written; all 14 downloads returned **HTTP 200** and every one of the
8 chosen IDs is among them. Both pages were re-fetched after writing and all 16 tags are present,
each as its own paragraph carrying exactly three code spans and no prose.

| Section | Public ID (under `00. UAE NEOBIZ - Mobile - Jul 27/`) | HTTP |
|---|---|---|
| Decision · Face recognition | `Regulatory Declaration - Single/49-facial-recognition-consent` | 200 |
| Decision · Face recognition | `Regulatory Declaration - Single/57-verification-failed-continue-with-docs` | 200 |
| Decision · Remote verification | `Regulatory Declaration - Single/61-efr-verification-link-generated` | 200 |
| Decision · Remote verification | `Regulatory Declaration - Single/23-key-individuals-list-verification-link-sent` | 200 |
| Decision · The dashboard | `Regulatory Declaration - Single/02-application-dashboard-with-header` | 200 |
| Decision · The dashboard | `Signup and Onboarding/30-ownership-structure-picker` | 200 |
| Tracking and exceptions | `Pre-Submition/45-track-dashboard-standard-exceptions-raised` | 200 |
| The argument I lost | `Financial Details - Single/23-sanction-q1-default` | 200 |

**The onboarding chapter carries FOUR uploaded S3 previews, not three.** `uae-efr-consent`,
`uae-remote-verification-link`, `uae-application-dashboard`, `uae-track-dashboard-exceptions` — the
same four, in the same positions, on both the English page and the Arabic child page, so eight blocks
in total. All eight were **left in place**. Each of my four figures at those positions covers the same
screen in intent, but the S3 URLs had expired by the time I could compare them pixel to pixel, and a
Notion image block cannot be restored by API. Deleting on an unverified guess is irreversible; leaving
them costs nothing, because Step 6 skips `image` blocks structurally.

**Looking at the screens changed two captions.** `45 — Track Dashboard – Standard Exceptions Raised`
carries **five** stages, not the four that `44` carries and that the tracking chapter's existing caption
correctly states. And `75 — Partner / Sanction Q1 – Default` is **pixel-identical** to the single-owner
`23`, so the chapter's *"are you…?" becomes "is any of the partners…?"* does not hold on that screen;
no caption was written that asserts it. Both would have been wrong if the frame name had been trusted.

**Gaps reported, not filled:**

1. **The cover cannot take an inline image tag, so none was written.** `resolveCoverSections` reads
   `lines`, which is prose only; image tags live in `items` and are never seen on the cover path. A
   cover's image is `cover_sections.media_id` and the gallery card's is `case_files.cover_media_id`,
   both set by hand in the database. A `[cld]` paragraph on the cover would be inert, not wrong — and
   writing one would have looked like the gap was closed. **Choosing the cover image is Moataz's and
   attaching it is backend's.** Returned to the orchestrator unanswered.

2. **The layered-ownership redirect has no screen I may use.** The chapter says the app "sends them to
   the web journey built for that structure." The only screen in all 441 that shows a desktop redirect
   is `Signup and Onboarding/48 — Complete Application on Desktop`, and its body is *"For the best
   experience, please visit the Mashreq NEO BIZ website on desktop."* That is the decision `docs/learn.md`
   records as the design tribe lead's, argued against, and **never to appear in the portfolio — not the
   screen, not the story, not a mention.** Deliberately excluded. Frame 49 in `Pre-Submition` — the one
   learn.md names — is absent from the index entirely; the numbering skips 48 → 50.

3. **`exception` is `الاستثناء` on this Arabic page and `الاستفسار` everywhere else.** The onboarding
   Arabic page heading is `## المتابعة والاستثناءات` and its prose says `يفتح استثناءً`. The site-wide
   convention, set by Moataz's own correction and recorded in three places, is `الاستفسار`. The tracking
   Arabic page follows the convention. I wrote the convention into the alt and kept the word out of the
   caption entirely, so no caption contradicts the paragraph above it. **Not fixed. His ruling.**

4. **`replace a file that came back too large` still stands in the onboarding chapter's Tracking section**,
   in both languages (`ملفًا رجع بحجم أكبر من المسموح`). `docs/learn.md` records that he corrected exactly
   this phrase to *"came back unclear"* — the correction landed on the tracking chapter and not here. Not
   touched.

5. **The tracking chapter's `44-track-dashboard-application-submitted` is a 4322×4323 angled 3D phone
   mockup on a black ground**, where every other screen in the index is a flat 786px frame. Nothing was
   done about it; it is a visual call, and visual verification is his.

**Belongs to someone else:**
- **backend** — the cover's `media_id` write, once Moataz has chosen an image.
- **devops** — running the sync. Not run, per the brief.
- Nobody yet: the missing preview positions are now doubled (a live preview block plus my tag). If the
  previews are ever to be removed, that is a manual Notion-UI action, not an API one.

**Not verified:**
- **I did not open the rendered page.** Nothing was synced, so there is nothing on `:3000` to look at.
  Whether the eight figures land where I put them, and whether the Arabic captions read right in RTL at
  the real type size, is untested.
- **I did not compare my four figures against the four S3 previews.** The URLs expire in 300 seconds and
  had lapsed. The match is inferred from the preview filenames and their positions in the body.
- **I looked at 17 of 441 screens.** Any claim here about what the other 424 do or do not show is one I
  did not make.
- **I did not read the Arabic cover page's body**, only its title — the cover carries no media path, so
  there was nothing to place there.
- I checked one Single-vs-Partnership pair for a reworded question. The index's own notes say 26 sets are
  pixel-identical; I did not check the other 25.

**Open questions:** one, returned to the orchestrator and unanswered — **which screen goes in the UAE
cover's two empty image slots.** The choice is his and the write is backend's, so nothing was picked.

*(This paragraph originally said the gallery card had no cover and that the NDA grayscale treatment had
never been seen on one. Both came from `CLAUDE.md` and I quoted them without testing — the exact failure
that file's own bullet warns about. Measured below: the card cover IS set. Corrected rather than left
standing, since the amendment underneath contradicts it.)*

**Amended 22:09 after a scope change** — `Chapter — UAE / Application Tracking` ruled out of scope,
targets narrowed to the cover and the onboarding chapter. Three things this added:

**The tracking chapter was never written to.** It and its Arabic child were fetched to read the
established tag format and caption voice. Read only, zero writes, both still exactly as devops left
them last night.

**The onboarding chapter was already complete** when the narrowed brief arrived — 8 tags per locale,
written and read back earlier in this same task. The brief's "0 inline images today" was true when it
was written and was not re-checked before being sent.

**The cover claim was re-verified at the source rather than restated**, because the narrowed brief
still framed the cover as a Notion-tag job. Two lines settle it:

- `readOrderedBlocks` — a `[cld]` paragraph becomes `target.items.push({ kind: "image", tag })` and
  then `continue`s. **It never reaches `lines`.**
- `resolveCoverSections` — `paragraphs: block.lines.map((l) => l.trim()).filter(Boolean)`. It reads
  `lines` and never touches `items`.

So a tag on a cover is parsed, classified as an image, and dropped. No `media` row, no
`[image:<uuid>]`, no error. **Writing one would have been inert and would have looked done.**

**Measured in Supabase, not quoted:**

| | |
|---|---|
| `uae-acquisition` cover slots | **3** — `thesis` (0), `role` (1), `map` (2) |
| slots carrying a `media_id` | **0 of 3** |
| `role` as a candidate | **excluded by the code** — the role card renders full width, `CoverSections` ignores `media_id` on that slot, and the sync emits a notice if one is set |
| `case_files.cover_media_id` | **set**, to media `uae-acquisition` — the designed artwork, not a product screen |
| card covers on the other three published case files | **0** — `cervello`, `egypt-acquisition`, `neobiz-mobile` all null |

So the gallery card is not the gap; **the two empty in-cover slots are**, and they are `thesis` and
`map`. Filling either is a `cover_sections.media_id` write, which is **backend's**, on a screen
**Moataz** chooses. Nothing was written. The question stands, now narrowed to two named slots.

---

## 002230826 — 2026-08-23 03:20 — Per-chapter audit: 99 of the 109 missing Arabic paragraphs are written in Notion and dropped by the sync; 10 were never written

**Brief:** Audit only, report only, touch no code and no database beyond reading. Establish,
chapter by chapter, whether each missing Arabic paragraph is `NOT WRITTEN`, `WRITTEN BUT NOT
SYNCED`, or `SYNCED` — and for every dropped one, say why. Same treatment, more briefly, for the
image `alt` gap. `CLAUDE.md`'s claim that *most of that Arabic is written in Notion and is being
dropped by the sync* had never been verified per chapter.

**Read:**
- Supabase `cidxctilamdxbzjjzppb`, read-only: per-slot EN/AR paragraph counts for all 13 published
  chapters, `translations` totals by `entity_type`, `page_sections` per page, `media` alt/caption
  coverage joined to the chapter that references each row, and the full text of every English
  `result` slot.
- Notion, read-only, no page opened for editing: the data source `collection://7a8ab2e1-08d1-4286-a4df-f2e87b85c219`
  (all 67 rows, properties only) · English + Arabic child page for **egypt/onboarding**,
  **egypt/workflow**, **egypt/fulfilment**, **egypt/portal** (AR only), **egypt/web-vs-mobile-onboarding**,
  **neobiz/onboarding**, **neobiz/portal**, **cervello/on-premises-to-cloud** (AR only),
  **cervello/permission-architecture** (AR only), and the **Accessibility** page in both languages ·
  a title search returning the 24 pages carrying `النسخة العربية`.

**Found:**

*Chapter paragraphs — 262 en / 153 ar in Supabase, 109 missing. Split:*
- **`WRITTEN BUT NOT SYNCED`: 99.**
- **`NOT WRITTEN`: 10** — the section `The interface`, on egypt/onboarding (5 ¶) and egypt/workflow
  (5 ¶). Both Arabic pages have no counterpart section at all. Nothing else on any page is unwritten.
- **`SYNCED` in full: 4 of 13 chapters** — cervello/method 25/25, egypt/web-vs-mobile-portal 9/9,
  uae/onboarding 21/21, uae/application-tracking 14/14.

*Ranked causes of the 99:*
1. **The Arabic splits or joins a paragraph the English does not — 53 ¶**, across 6 chapters. Largest
   single slot: egypt/workflow `context` (11), egypt/fulfilment `context` (15), egypt/workflow
   `what-v1-got-wrong` (10).
2. **The trailing cross-chapter pointer paragraph — 32 ¶**, across 8 chapters. Every English chapter
   ends with an italic `*Next chapter: …*` or `*This completes the … case file.*` line after the final
   `---`; the sync counts it as a `result` paragraph. **No Arabic page has one.** This is the sole cause
   of every failing `result` slot in the project — each is off by exactly one, and the one is the pointer.
   The only `result` that pairs, uae/onboarding, is the only English chapter with no pointer line.
3. **One English paragraph with no Arabic counterpart — 14 ¶.** egypt/onboarding `what-i-designed`:
   the English line *"Nine features carry the journey: signup · company documents and OCR · …"* is not
   on the Arabic page. 14 vs 13, so 13 finished Arabic paragraphs are discarded for one missing sentence.
4. **Never written — 10 ¶.** As above.

*One structural finding that is not a count:* the `[cld]` tags authored under a `Decision ·` heading
are written into the **preceding** slot. egypt/workflow's `context` holds 4 prose + **7 image**
paragraphs, 6 of which are authored under `Decision`. egypt/fulfilment's `context` holds 5 prose + 10
images from three Decision sections. This inflates `context` on exactly the chapters whose Arabic
splits its prose differently, and it is why the two largest single-slot losses are both `context`.

*Media — the brief's "33 of 65" does not hold.* 80 `media` rows: 65 carry an English `alt`, 32 an
Arabic one, **17 carry both**. So the EN-without-AR figure is **48**, not 33 (65−32 subtracts an
overlap that isn't there), and 15 rows are Arabic-only. Of the 48: **20 `WRITTEN BUT NOT SYNCED`**
(egypt/workflow 10, egypt/fulfilment 10 — both Arabic pages carry Arabic `[alt]` and `[caption]` on the
same English-folder public IDs, because those are internal bank tools with no Arabic UI); **26 NOT A
GAP** (egypt/onboarding 12, egypt/portal 14 — the Arabic pages reference their own `/Arabic/…` screens,
which `docs/sync-contract.md` Step 6 says not to report); **2 unclassified** cover assets.

*A larger media finding the alt framing hides:* **23 public IDs authored in Notion have no `media` row
at all**, so those images render nowhere in either locale. 10 Arabic-only screens on the egypt/onboarding
Arabic page and 1 on egypt/portal (they sit in slots that fail to pair, and the media write sits inside
the same gate); and **12 on the Accessibility page, in both languages** — that page carries 18 English
and 15 Arabic `[cld]` tags and produced **zero** `media` rows, including its four EN↔AR parity pairs.

*The `page_section` gap is one page.* 68 en / 41 ar; about 7/7, philosophy 5/5, contact 5/5, systems 5/5
are complete, and **all 27 missing fields are the Accessibility page**. Cause: the English page splits
`What shipped` into a heading plus six numbered `### 1 ·` … `### 6 ·` sub-sections; the Arabic keeps one
`## ما صدر عن هذا القرار` with the same six as bold inline paragraphs. English also has a separate
`The design system contribution` section the Arabic folds into `مكتبة المكونات`. 14 sections against 8.
**The Arabic page is complete prose covering the same argument** — it is a section-structure difference,
not missing content.

*Contradicting `docs/content-brief.md` §3, which is the section it warns about itself:* the six image
tags listed as "absent and never re-added" are **all present in Notion now** — `36-exception-trail` on the
Arabic workflow page, `57-group-app-overview-with-queries` on the Arabic portal page, and four parity
pairs on the Arabic accessibility page. They are not missing; their slots do not pair.

**Gaps reported, not filled:**
- `The interface` has no Arabic on egypt/onboarding and egypt/workflow. **Not written by me. This may be
  an exclusion rather than an omission** — both English sections are screenshot galleries built on
  Notion-uploaded images, which the sync skips structurally anyway. Whether the Arabic should have one
  is Moataz's call.
- The English line *"Nine features carry the journey: …"* has no Arabic counterpart. Reported, not written.
- No Arabic page carries a closing cross-chapter pointer line. Reported, not written — and the fix here is
  almost certainly the parser, not the Arabic.

**Belongs to someone else — all of it, and none of it is content's:**
- **backend.** (a) The `result` pointer paragraph: 32 ¶ recoverable by excluding a trailing italic
  pointer from the `result` slot, or by pairing on something other than count. (b) `[cld]` tags under
  `Decision ·` landing in the preceding slot. (c) The `page_section` writer creating no `media` rows —
  the Accessibility page's 33 tags produce nothing in either locale. (d) The paragraph-count gate itself,
  which is correct in principle and is discarding 99 finished paragraphs; widening it is a decision, not
  a repair.
- Nothing for frontend. Nothing for devops beyond committing this entry.

**Not verified:**
- Four chapters were **not opened in Notion** — cervello/method, egypt/web-vs-mobile-portal,
  uae/onboarding, uae/application-tracking. They are marked `SYNCED` on an exact per-slot EN=AR match in
  Supabase, not on a Notion read.
- The English pages for egypt/portal, cervello/on-premises-to-cloud and cervello/permission-architecture
  were not opened; their English paragraph counts come from Supabase and from the `result`-slot text dump.
- **Nothing was verified on `:3000`.** This audit is Notion against the database; no page was rendered.
- The exact arithmetic of the Accessibility 14-vs-8 notice (whether the intro block and the table are
  counted) was not reproduced from the script — the two structural causes above are read off the pages.
- The private child page `مرجع الـ Accessibility — اللي عملته واسمه إيه` is still under the English
  Accessibility page. Its title does not open with `النسخة العربية`, so the current matcher skips it.
  Confirmed by title only; the script was not read.

**Open questions:** none returned. The brief asked for a report; the report is above and in the reply.

---

## 021210826 — 2026-08-21 23:03 — `docs/content-brief.md` checked against Notion and against `learn.md`

**Brief:** Read `docs/content-brief.md` (284 lines, untracked, written from memory by an earlier
conversation) and `docs/learn.md` in full. Answer three questions: what the file contradicts in
Notion as it is now, what it duplicates in `learn.md` and which file should own each rule, and
what it lacks. Reading and comparison only. No Notion write, no copy written, no file edited
except this one.

**Read:** the database `collection://7a8ab2e1-08d1-4286-a4df-f2e87b85c219` (schema + every row
where `In MVP-1` is checked, 34 rows) · Accessibility EN and its AR child · Egypt Ch2 EN + AR ·
Egypt Ch3 EN + AR · Egypt cover EN + AR · Cervello Ch1, Ch2, Ch3 (EN) · Systems (EN) · Landing ·
Classic Gallery · 404 · one title search returning 23 pages carrying `النسخة العربية —`.
Sixteen Notion pages in total. Loaded `metric-integrity` and `rtl-guard`.

**Found:**
- **`In MVP-1` is 34 rows, not 25.** 26 are `Content ready = Done` and all 26 are
  `Bilingual = EN + AR full`; the other 8 are the 5 `FOUNDATION —` and 3 `Linear View —` rows,
  all `Not started`. The file's own enumerated list beneath the number totals 26, so the prose
  count "25" disagrees with its own list as well as with the database.
- **All six "absent" image tags are present.** Ch2 AR `36-exception-trail` present (11 tags,
  matching EN's 11). Ch3 AR `57-group-app-overview-with-queries` present (14 tags, matching EN's
  14). Accessibility AR carries 18 tags against EN's 18, including all four of the EN↔AR parity
  pairs the file says are missing. The file's highest-priority claim no longer holds.
- **The Egypt cover's six-system diagram is still English-only.** `## الخريطة` on the Arabic
  cover carries no image. That claim stands.
- **The three named Cervello risks are all still in place, unrepaired** — correct, since the file
  says not to repair them. The other 15 of the 18 are not named anywhere in the repo.
- **"Thirteen sections" with twelve listed is still there**, on the Cervello Method chapter, and
  the number repeats on the Systems page and in the Method chapter's `Notes` property.
- **The private page and the Arabic naming pattern are as described**, with two exceptions the
  file does not cover: the Neobiz cover is `النسخة العربية — نيوبيزنس موبايل: الغلاف`
  (colon form, not the `الغلاف (سوق)` form the other three covers use), and `الغلاف (Cervello)`
  is a Latin suffix, which `content-brief.md` permits and `learn.md` forbids.
- **Three structural shapes for Arabic among the static pages, where the file describes one.**
  404 holds its Arabic inline under `# ٥٠٤ — العربية`; Landing and Classic Gallery carry no
  Arabic in either form while both are flagged `EN + AR full` / `Done`.
- **Arabic numerals are Arabic-Indic throughout the prose**, contradicting the "numerals are
  Western" rule as written in `content-brief.md`, `learn.md` and the `rtl-guard` skill alike.
- **Em dashes are pervasive in Arabic prose and captions** — 28 hand-counted on the Accessibility
  Arabic page alone — against a rule both files state as settled.
- **Two metric findings not in the file:** the Classic Gallery promises figures labelled
  "Measured, agreed target, reported, or projected", naming a four-term vocabulary that includes
  the rejected `reported` and none of the three real markers; and the Landing proof strip
  compresses the `2 weeks – 1 month` baseline to "Two weeks on paper", keeping only the
  flattering end of a range.
- **Two probable defects found in passing:** the 404's Arabic heading reads `٥٠٤`, not `٤٠٤`; and
  Ch3 AR carries the public ID `…/07-reminder-on-raised-exception-by-governance-governance`,
  doubled, where EN has it once.
- **Roughly 13 rules are stated in both files.** Full table in the report to the orchestrator.
  Recommendation: `learn.md` owns every rule; `content-brief.md` keeps only mechanisms, the
  terminology glossary and worked examples; and three rules (numerals, the marker set, the
  marker/basis split) leave both files to the skills that already state them more precisely.

**Gaps reported, not filled:** the Egypt cover Arabic diagram · Landing and Classic Gallery
Arabic · the 15 unnamed Cervello passages · the twelve-vs-thirteen count · the `٥٠٤` heading ·
the doubled `governance` public ID · the Gallery's four-term label vocabulary · the Landing
baseline. Nothing was written, corrected or added anywhere. `docs/content-brief.md` untouched.

**Belongs to someone else:** whether the tags now present in Notion reach the database is
**backend** — I read Notion only. Whether the doubled `-governance-governance` public ID resolves
in Cloudinary is **devops**. Whether Landing and Classic Gallery have Arabic rows regardless of
the Notion shape is **backend**.

**Not verified:** every `notion-fetch` returned a cached snapshot dated 2026-08-10 to 2026-08-19,
so every count above is as-of that snapshot, not as-of today; the file's own currency probe is a
single-edit write, which this task forbids, so I had no read-only way to refresh. I did not read
Egypt Ch1 or Ch4, the Egypt or Neobiz results tables, either comparison page, the Neobiz or UAE
covers or chapters, About, Philosophy or Contact, so I did not check the "140 Cloudinary tags
across ten pages" figure. I checked 3 of the 18 Cervello passages because only 3 are named. The
title search was capped at 25 results and returned 23 Arabic pages; that is a floor, not a total.
I opened no page on `:3000`.

**Open questions:** (1) Numerals — three documents say Western, the artefact is uniformly
Arabic-Indic in prose while keeping WCAG criteria and percentages Western. Which is right?
(2) Em dashes in Arabic — has the sweep never run, or is the rule narrower than written?
(3) The Neobiz Arabic cover title uses a colon where the other three use a bracketed suffix, and
`(Cervello)` is Latin where `learn.md` requires a fully Arabic suffix. Which pattern is canonical?
(4) Landing and Classic Gallery show no Arabic in an 11-day-old snapshot while marked
`EN + AR full` — is it unwritten, written since, or held somewhere I did not look?
(5) The Classic Gallery's "Measured, agreed target, reported, or projected" — is that a stale
sentence, or a deliberately different reader-facing vocabulary?
All five returned to the orchestrator, unanswered, and none acted on.

---

*Entries before this one: none. The agent structure was created 2026-08-21 under task
`001210826`.*
