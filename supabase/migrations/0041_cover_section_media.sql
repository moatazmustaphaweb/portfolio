-- 0041 — An image belongs to a cover SECTION, not to a case file.
--
-- ── WHAT THIS REPLACES ──────────────────────────────────────────────────────
--
-- `case_files.lead_media_id` (0033) gave a cover exactly one image, fixed to the
-- leading run. That was right when there was one image. There are now two, and
-- the pattern is clear: an image is a property of a SECTION. Any section may
-- have one; most will not.
--
-- The `map` section already rendered at two-thirds width with empty space
-- beside it, which read as a slot waiting for an image. It was not — that space
-- was not addressable. Now it is.
--
-- ── ⚠️ WHY A COLUMN HERE NEEDED A CHANGE TO THE SYNC ─────────────────────────
--
-- `cover_sections` is DELETED and re-inserted for a case file on every sync,
-- where `case_files` is UPSERTed. That asymmetry is the only reason
-- `lead_media_id` was durable: a column on a table that is deleted and
-- re-inserted every run is a column that silently loses its data.
--
-- The sync now UPSERTs `cover_sections` on the existing `unique (case_file_id,
-- slot)` constraint, so a section row survives a sync and `media_id` with it.
-- The row is never deleted, so there is nothing to preserve and nothing to
-- forget to preserve — the failure is unrepresentable rather than handled.
--
-- The cost, stated: delete-all removed a slot that left Notion for free, and
-- upsert does not. The sync therefore deletes the slots NOT in the set it just
-- wrote, from the same array that drove the upsert. One list, used twice, in
-- one function.
--
-- ── NO ENUM SPLIT ───────────────────────────────────────────────────────────
--
-- Nothing adds an `entity_type` label. Alt and caption stay on the media row as
-- `entity_type = 'media'`, exactly as before. The splits in 0030/0031, 0034/0035
-- and 0037/0038 were forced by new enum values; there are none here, so this is
-- one migration.

/* ---------------------------------------------------------------- column */

alter table cover_sections
  add column media_id uuid references media(id) on delete set null;

comment on column cover_sections.media_id is
  'Optional image beside this section. A section with one renders text at two '
  'thirds and the image at one third; a section without renders full width. '
  'NOT the cover image — see case_files.cover_media_id, which is unrelated.';

/* ------------------------------------------- carry the one existing value */

-- Egypt's lead image becomes the image on its `thesis` slot, which is where it
-- already rendered. Keyed by slug and slot rather than by a literal id.
update cover_sections cs
   set media_id = cf.lead_media_id
  from case_files cf
 where cf.id = cs.case_file_id
   and cf.slug = 'egypt-acquisition'
   and cs.slot = 'thesis'
   and cf.lead_media_id is not null;

/* --------------------------------------------- forward guard, NEW TABLE */

-- ⚠️ THIS DOES NOT TRANSFER FROM 0033. `assert_cover_not_redacted` is bound to
-- `case_files` and reads `new.lead_media_id`; a column on another table needs
-- its own function and its own trigger.
--
-- The column list carries 0033's lesson: a trigger declared `update of X` does
-- NOT fire for a write touching only Y, so a guard living in the function body
-- would be unreachable from the table.
create or replace function assert_cover_section_not_redacted()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
begin
  if new.media_id is not null
     and exists (select 1 from media m
                 where m.id = new.media_id and m.redacted) then
    raise exception
      'cover_sections.media_id references a redacted asset (%). Section images '
      'render on the case file cover page — the most-shared URL of the four — '
      'and must use non-NDA imagery only. See decision 028 and rule 6.',
      new.media_id;
  end if;
  return new;
end;
$$;

drop trigger if exists cover_sections_media_not_redacted on cover_sections;
create trigger cover_sections_media_not_redacted
  before insert or update of media_id on cover_sections
  for each row execute function assert_cover_section_not_redacted();

/* ------------------------------ reverse guard: one EXISTS, no recreation */

-- The trigger's column list is `update of redacted` and does not change, so
-- only the function is replaced. This half DOES transfer from 0033.
create or replace function assert_redacted_not_in_use()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
begin
  if new.redacted and not coalesce(old.redacted, false) then
    if exists (select 1 from case_files c where c.cover_media_id = new.id) then
      raise exception
        'media % cannot be marked redacted: it is in use as a case_files '
        'cover. Replace the cover first — see decision 028.', new.id;
    end if;
    if exists (select 1 from cover_sections cs where cs.media_id = new.id) then
      raise exception
        'media % cannot be marked redacted: it is in use as a cover section '
        'image. Replace that section image first — see decision 028.', new.id;
    end if;
    if exists (select 1 from settings s
               where s.key = 'og_image' and s.value = new.cloudinary_public_id) then
      raise exception
        'media % cannot be marked redacted: it is in use as settings.og_image. '
        'Replace the OG image first — see decision 028.', new.id;
    end if;
  end if;
  return new;
end;
$$;

/* --------------------------------------------------- retire lead_media_id */

-- Order matters. The trigger's column list names `lead_media_id`, so the
-- trigger is dropped first, the function narrowed, the column dropped, and the
-- trigger recreated against `cover_media_id` alone.
drop trigger if exists case_files_cover_not_redacted on case_files;

create or replace function assert_cover_not_redacted()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
begin
  if new.cover_media_id is not null
     and exists (select 1 from media m
                 where m.id = new.cover_media_id and m.redacted) then
    raise exception
      'case_files.cover_media_id references a redacted asset (%). Covers are '
      'shared into link previews outside our control and must use non-NDA '
      'imagery only — see decision 028.', new.cover_media_id;
  end if;
  return new;
end;
$$;

alter table case_files drop column lead_media_id;

create trigger case_files_cover_not_redacted
  before insert or update of cover_media_id on case_files
  for each row execute function assert_cover_not_redacted();
