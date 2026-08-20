-- 0035 — Chapters become NAMED SECTION SLOTS, and body prose can carry images.
--
-- ── WHAT THIS REPLACES ──────────────────────────────────────────────────────
--
-- A chapter's prose lived in six fixed `chapter` translation fields — objective,
-- context, decision, evidence_note, result, milestone — chosen by matching the
-- Notion heading against the `CHAPTER_FIELDS` vocabulary. A heading outside that
-- list hit `if (!field) continue` and the passage was DISCARDED, silently.
--
-- This is the SAME defect 0031 fixed for covers, still standing for chapters.
-- 0031 put it plainly: "That is the contract pointing the wrong way: the writing
-- had to match the parser." It still did here.
--
-- Measured on Chapter One (Egypt / Onboarding Journey), 2026-08-19:
--
--   Objective                        1 prose            → objective       ok
--   Context                          6 prose ·  2 tags  → context         ok
--   Decision · The language fight   10 prose ·  2 tags  → decisions table
--   Evidence                         5 prose ·  1 tag   → evidence_note   ok
--   What I designed                  6 prose ·  8 tags  → DISCARDED
--   The interface                    5 prose ·  0 tags  → DISCARDED
--   The fight I lost                 4 prose ·  1 tag   → DISCARDED
--   Result                           3 prose ·  2 tags  → result          ok
--
-- Nine of sixteen image tags per locale sat in sections that reached no field.
-- Arabic was worse: the page is headed `الأدلة` and `HEADING_SYNONYMS` carried
-- only `الدليل`, so Arabic Evidence failed to map on top of everything else.
--
-- ── THE MODEL ───────────────────────────────────────────────────────────────
--
-- Identical to 0031, deliberately. A chapter is composed of named SLOTS; the
-- slot is structure, the heading text is content. Three things vary per chapter
-- and all three are data:
--
--   1. WHICH slots are present    → rows in chapter_sections
--   2. WHAT heading each carries  → translations(chapter_section, 'heading')
--   3. WHAT ORDER they appear in  → chapter_sections.sort_order
--
-- An absent slot renders nothing. No default heading is invented.
--
-- ⚠️ Decision headings (`Decision · The language fight`, `القرار · معركة اللغة`)
-- are NOT sections. They are parsed into the `decisions` table by their own
-- pass and must never resolve to a slot — a chapter carries several of them and
-- `unique (chapter_id, slot)` would reject the second, failing the chapter for
-- being written correctly.

/* ---------------------------------------------------------------- sections */

create table chapter_sections (
  id         uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  /*
   * TEXT, not an enum — the same reasoning as cover_sections.slot. Slots are
   * added whenever a chapter needs a new kind of section, and an enum would
   * mean a migration every time. The valid set is enforced in the sync
   * (lib/sync/chapter-slots.ts), where an unknown slot fails that chapter with
   * a message naming the slots that exist.
   */
  slot       text not null,
  sort_order integer not null,

  -- THE TRAP, ENFORCED BY THE DATABASE. Two sections resolving to one slot on
  -- a single chapter cannot both be written: the second insert fails rather
  -- than silently replacing the first, which is what `fields[field] = value`
  -- did for the life of the project.
  unique (chapter_id, slot)
);

create index chapter_sections_chapter_idx on chapter_sections (chapter_id, sort_order);

/* -------------------------------------------------------------- paragraphs */

-- One row per paragraph, in order.
--
-- ⚠️ THIS IS ALSO WHAT MAKES IMAGES POSSIBLE, and it is the reason a paragraph
-- is a row rather than a blob of joined text.
--
-- An image tag in Notion is its own paragraph block, never inline inside a
-- prose paragraph. It therefore becomes its own `chapter_paragraphs` row whose
-- body is exactly `[image:<uuid>]`. The renderer emits a <figure> for that row
-- and a <p> for the others, as SIBLINGS.
--
-- That matters because <figure> is flow content and is invalid inside <p>. Had
-- paragraphs stayed joined into one field, every figure would have had to be
-- spliced out of the middle of a <p>, and the browser would silently close the
-- paragraph early and reparent the rest — a bug that renders "almost right"
-- and is very hard to see.
create table chapter_paragraphs (
  id                 uuid primary key default gen_random_uuid(),
  chapter_section_id uuid not null references chapter_sections(id) on delete cascade,
  sort_order         integer not null,
  unique (chapter_section_id, sort_order)
);

create index chapter_paragraphs_section_idx
  on chapter_paragraphs (chapter_section_id, sort_order);

/* ------------------------------------------------------------ slot aliases */

-- The heading text a chapter uses → the slot it fills.
--
-- A new spelling is a ROW, not a deploy. That is the whole point: the writing
-- leads and the parser follows it, rather than the other way round.
create table chapter_slot_aliases (
  -- Lowercased, whitespace-collapsed, punctuation-normalised. See
  -- normaliseHeading() in lib/sync/cover-slots.ts, which chapter-slots.ts
  -- re-exports so the two models cannot drift apart.
  heading_norm text primary key,
  slot         text not null,
  -- Which chapter this spelling was observed on. Documentation, not a key: it
  -- answers "why is this row here" a year from now.
  observed_on  text
);

/* --------------------------------------------------------------------- RLS */

-- Enabled with NO POLICY, matching every other content table. That denies
-- everything to the anon key, which is the intent: reads happen server-side
-- through the service role in lib/content/*.
alter table chapter_sections     enable row level security;
alter table chapter_paragraphs   enable row level security;
alter table chapter_slot_aliases enable row level security;

/* ------------------------------------------------------------------- seeds */

-- Observed in Notion on 2026-08-19, normalised by normaliseHeading().
--
-- SCOPE: Chapter One (Egypt / Onboarding Journey) in both languages, plus the
-- three headings that recur across the whole chapter set — `Objective` (10
-- pages), `Context` (9) and `Result` (9), and their Arabic counterparts.
--
-- The other nine chapters carry section headings that are not seeded here.
-- They will FAIL LOUDLY on the next sync with a message naming the heading and
-- the fix. That is the model working: those sections are being discarded
-- silently today, and a named refusal is strictly better than a quiet loss.
insert into chapter_slot_aliases (heading_norm, slot, observed_on) values
  -- objective — what the chapter set out to do
  ('objective',                       'objective',        'all 10 chapters (en)'),
  ('الهدف',                            'objective',        'all 10 chapters (ar)'),
  ('الغاية',                           'objective',        'synonym carried from HEADING_SYNONYMS'),

  -- context — the situation before the work
  ('context',                         'context',          '9 chapters (en)'),
  ('السياق',                           'context',          '9 chapters (ar)'),

  -- evidence — what was actually observed. NOTE both Arabic spellings: the
  -- singular الدليل was the only one the old map carried, and Chapter One is
  -- written with the plural الأدلة, so Arabic Evidence never synced.
  ('evidence',                        'evidence',         'Egypt Onboarding (en)'),
  ('الأدلة',                           'evidence',         'Egypt Onboarding (ar)'),
  ('الدليل',                           'evidence',         'synonym carried from HEADING_SYNONYMS'),

  -- what-i-designed — the design response. Eight image tags live here in
  -- Chapter One, more than any other section, and none of them has ever synced.
  ('what i designed',                 'what-i-designed',  'Egypt Onboarding (en)'),
  ('ما صمّمته',                          'what-i-designed',  'Egypt Onboarding (ar)'),

  -- the-interface — the screens themselves. English only in Chapter One; the
  -- Arabic page has no counterpart section, which is an absence, not an error.
  ('the interface',                   'the-interface',    'Egypt Onboarding · Neobiz Onboarding (en)'),

  -- the-fight-i-lost — the argument that did not survive
  ('the fight i lost',                'the-fight-i-lost', 'Egypt Onboarding (en)'),
  ('المعركة التي خسرتها',                 'the-fight-i-lost', 'Egypt Onboarding (ar)'),

  -- result — what happened
  ('result',                          'result',           '9 chapters (en)'),
  ('النتيجة',                           'result',           '9 chapters (ar)'),

  -- milestone / close — the chapter's closing note
  ('milestone',                       'milestone',        'carried from CHAPTER_FIELDS'),
  ('close',                           'milestone',        'carried from CHAPTER_FIELDS'),
  ('المعالم',                           'milestone',        'carried from HEADING_SYNONYMS'),
  ('الخلاصة',                           'milestone',        'carried from HEADING_SYNONYMS')
on conflict (heading_norm) do nothing;
