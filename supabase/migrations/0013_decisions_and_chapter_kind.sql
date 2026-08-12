-- Amendment 032 — a chapter carries an ORDERED LIST of decisions, not one.
-- Amendment 033 — case-file pages that are not chapters.
-- Applied as `entity_type_add_decision` then `decisions_table_and_chapter_kind`.

-- Own migration: a new enum value cannot be used in the transaction that
-- creates it.
alter type entity_type add value if not exists 'decision';

-- ---------------------------------------------------------------------------

create table decisions (
  id         uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  sort_order int not null default 0
);

create index on decisions (chapter_id, sort_order);
alter table decisions enable row level security;

create policy "public reads published" on decisions
  for select using (
    exists (
      select 1 from chapters ch
      join case_files c on c.id = ch.case_file_id
      where ch.id = decisions.chapter_id
        and ch.status = 'published'
        and c.status = 'published'
    )
  );

create type chapter_kind as enum ('chapter', 'comparison', 'accessibility');

alter table chapters add column kind chapter_kind not null default 'chapter';

create index on chapters (case_file_id, kind, sort_order);

comment on column chapters.kind is
  'chapter = numbered narrative, in the linear view. comparison/accessibility = standalone case-file pages, excluded from the sequence.';
