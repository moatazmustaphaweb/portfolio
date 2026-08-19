-- 0031 — Case file covers become NAMED SECTION SLOTS.
--
-- ── WHAT THIS REPLACES ──────────────────────────────────────────────────────
--
-- A cover's prose lived in three fixed `case_file` translation fields — thesis,
-- role, reflection — chosen by matching the Notion heading against a six-name
-- vocabulary in `COVER_FIELDS`. A heading outside that list hit
-- `if (!field) continue` and the passage was DISCARDED, silently. Cervello's
-- opening section is headed "What it is", which was not in the list, so its
-- opening has never once reached this database.
--
-- That is the contract pointing the wrong way: the writing had to match the
-- parser. Here it inverts.
--
-- ── THE MODEL ───────────────────────────────────────────────────────────────
--
-- A cover is composed of named SLOTS. The slot is structure; the heading text
-- is content. Three things vary per case file and all three are data:
--
--   1. WHICH slots are present      → rows in cover_sections
--   2. WHAT heading each carries    → translations(cover_section, 'heading')
--   3. WHAT ORDER they appear in    → cover_sections.sort_order
--
-- An absent slot renders nothing. No default heading is invented, no empty slot
-- is shown. Neobiz has no `role` slot — its role is stated inside its thesis.
-- Cervello has no `thesis` slot — it opens with a description. Neither is an
-- error to correct.
--
-- ⚠️ `thesis` and `what-it-is` are SEPARATE SLOTS and must never be aliased to
-- one another. Neobiz carries BOTH: its Thesis is an argument, its "What it is"
-- describes two components. Aliasing them would make the second overwrite the
-- first — silently, because the old code did `fields[field] = value` and let the
-- last one win. `unique (case_file_id, slot)` below makes that overwrite
-- impossible at the database level rather than by convention.

/* ---------------------------------------------------------------- sections */

create table cover_sections (
  id           uuid primary key default gen_random_uuid(),
  case_file_id uuid not null references case_files(id) on delete cascade,
  /*
   * TEXT, not an enum, deliberately.
   *
   * An enum on entity_type is precisely what made this a migration at all.
   * Repeating that on the set most likely to grow — slots are added whenever a
   * cover needs a new kind of section — would mean a migration every time. A
   * CHECK constraint has the same cost and the same failure mode: a Postgres
   * error rather than a sentence.
   *
   * The valid set is enforced in the sync (lib/sync/cover-slots.ts), where an
   * unknown slot fails that cover with a message naming the slots that exist.
   */
  slot         text not null,
  sort_order   integer not null,

  -- THE TRAP, ENFORCED BY THE DATABASE. Two sections resolving to the same slot
  -- on one cover cannot both be written: the second insert fails rather than
  -- silently replacing the first.
  unique (case_file_id, slot)
);

create index cover_sections_case_file_idx on cover_sections (case_file_id, sort_order);

/* -------------------------------------------------------------- paragraphs */

-- Each paragraph is its OWN ROW with its own order, not one string with "\n\n"
-- inside it.
--
-- This is not tidiness. The cover component rendered the joined string in a
-- single <p> with no `whitespace-pre-line`, so five paragraphs of Egypt's
-- thesis arrived as one unbroken run of text. Storing rows makes that collapse
-- IMPOSSIBLE rather than fixed: there is no separator to lose and no CSS
-- property to forget.
--
-- It is also what the admin panel needs — write a paragraph, press a button,
-- write another. Never type a separator that something parses later.
create table cover_paragraphs (
  id               uuid primary key default gen_random_uuid(),
  cover_section_id uuid not null references cover_sections(id) on delete cascade,
  sort_order       integer not null,
  unique (cover_section_id, sort_order)
);

create index cover_paragraphs_section_idx on cover_paragraphs (cover_section_id, sort_order);

/* ------------------------------------------------------------ slot aliases */

-- The heading text a cover uses → the slot it fills.
--
-- ⚠️ THIS IS NOT `COVER_FIELDS` MOVED INTO A TABLE. Four differences, and they
-- are the whole point:
--
--   1. It NEVER DISCARDS. An unrecognised heading does not vanish; it fails the
--      cover loudly, naming the heading and listing the slots. Silent discard
--      is the defect being fixed and it must not survive in a new form.
--   2. It NEVER GUESSES. No nearest-match, no fuzzy alias. `what it is` and
--      `thesis` are separate rows pointing at separate slots.
--   3. It changes WITHOUT A DEPLOY. A new heading is an INSERT.
--   4. It has a DEFINED END. When the admin panel lands, the slot is a field in
--      the UI and the heading is typed beside it; this table becomes vestigial
--      for anything authored there.
--
-- Locale-agnostic on purpose: an Arabic heading and an English one never
-- collide, and a locale column would mean seeding every alias twice for no
-- discrimination it could make.
create table cover_slot_aliases (
  -- Lowercased, whitespace-collapsed, punctuation-normalised. See
  -- normaliseHeading() in lib/sync/cover-slots.ts — the sync normalises the
  -- same way before looking up, so the two cannot drift.
  heading_norm text primary key,
  slot         text not null,
  -- Which cover this spelling was observed on. Documentation, not a key: it
  -- answers "why is this row here" a year from now.
  observed_on  text
);

/* --------------------------------------------------------------------- RLS */

-- Enabled with NO POLICY, matching every other content table. That denies
-- everything to the anon key, which is the intent: reads happen server-side
-- through the service role in lib/content/*, which bypasses RLS.
alter table cover_sections     enable row level security;
alter table cover_paragraphs   enable row level security;
alter table cover_slot_aliases enable row level security;

comment on table cover_sections is
  'Which slots a case file cover has, and in what order. The slot is structure; the heading text is content and lives in translations.';
comment on table cover_paragraphs is
  'One row per paragraph, ordered. Never a joined string — the join is what collapsed five paragraphs into one run on the Egypt cover.';
comment on table cover_slot_aliases is
  'Heading text as written → slot. An unrecognised heading FAILS the cover; it is never discarded and never guessed at.';
