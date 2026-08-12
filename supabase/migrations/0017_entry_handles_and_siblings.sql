-- 0017 — Entry handles and sibling case files.
--
-- Two cover elements that existed in Notion from the start but had nowhere to
-- land: the "Three ways in" block, and the cross-links between case files that
-- cover the same requirement in different markets (decision 004).
--
-- ── entry_handles ───────────────────────────────────────────────────────────
--
-- Each handle is written as  <invitation> → <payoff>  and offers the reader a
-- different reason to enter the same case file:
--
--   "Show me the hardest decision." → The language fight. I proposed Arabic-
--   first and lost. … Onboarding journey → Decision.
--
-- The row carries STRUCTURE ONLY. Both halves of the text live in
-- `translations`, under the fields `invitation` and `payoff`.
--
-- That is deliberate. `outcomes` keeps its human-readable copy in
-- `outcomes.value` AND accepts a `label` translation, and the two drifted into
-- holding the same string — Egypt's outcome rendered twice on the cover. A
-- table whose text lives in exactly one place cannot develop that fault.
--
-- `target_chapter_id` is NULLABLE and stays null unless the handle names a
-- chapter unambiguously. Some handles point at a chapter by its exact title
-- ("Application workflow → Craft"), some point by position ("Chapter 2"), and
-- some name something that is not a chapter at all ("Results table → What
-- broke"). Guessing the last kind would manufacture a link to a page that does
-- not exist, so an unresolved handle renders as text. The living map directly
-- below it lists every chapter, so nothing becomes a dead end.
--
-- ── case_file_siblings ──────────────────────────────────────────────────────
--
-- Directed, not symmetric. UAE points at both Egypt files; Egypt points at
-- Neobiz. Each cover states its own relationships in its own words, and the
-- note explaining the relationship ("the same requirement, in a market without
-- the infrastructure") belongs to the pointing cover, not to the pair.

create table entry_handles (
  id                uuid primary key default gen_random_uuid(),
  case_file_id      uuid not null references case_files(id) on delete cascade,
  -- Null when the handle's pointer does not name a chapter unambiguously.
  target_chapter_id uuid references chapters(id) on delete set null,
  sort_order        int not null default 0
);

create index entry_handles_case_file_idx on entry_handles (case_file_id, sort_order);

create table case_file_siblings (
  id           uuid primary key default gen_random_uuid(),
  case_file_id uuid not null references case_files(id) on delete cascade,
  sibling_id   uuid not null references case_files(id) on delete cascade,
  sort_order   int not null default 0,
  -- A case file is not its own sibling.
  constraint case_file_siblings_not_self check (case_file_id <> sibling_id),
  -- The same pair stated twice is a content error, not two links.
  constraint case_file_siblings_unique unique (case_file_id, sibling_id)
);

create index case_file_siblings_case_file_idx
  on case_file_siblings (case_file_id, sort_order);

alter table entry_handles      enable row level security;
alter table case_file_siblings enable row level security;

-- Parent-derived visibility (decision 026): a handle is readable exactly when
-- its case file is.
create policy "public reads published" on entry_handles
  for select using (
    exists (
      select 1 from case_files c
      where c.id = entry_handles.case_file_id and c.status = 'published'
    )
  );

-- BOTH ends must be published. A link from a live cover to a draft case file
-- would render as a dead end — the one thing the cover is not allowed to do.
create policy "public reads published" on case_file_siblings
  for select using (
    exists (
      select 1 from case_files c
      where c.id = case_file_siblings.case_file_id and c.status = 'published'
    )
    and exists (
      select 1 from case_files s
      where s.id = case_file_siblings.sibling_id and s.status = 'published'
    )
  );
