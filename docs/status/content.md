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
