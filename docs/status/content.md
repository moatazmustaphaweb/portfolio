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
