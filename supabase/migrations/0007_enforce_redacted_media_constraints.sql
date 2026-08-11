-- Decision 028: a redacted asset may never be a case-file cover or the OG
-- image. Both travel outside the site — into LinkedIn and WhatsApp link
-- previews — where they cannot be recalled.
--
-- Enforced in the database rather than only in application code because the
-- writers are plural and will grow: the Notion sync script today, an admin
-- panel in Layer 4, and any manual fix in the Supabase table editor. A rule
-- that lives only in lib/content is a rule the table editor does not have.
--
-- SECURITY INVOKER, not DEFINER: these only read media / case_files / settings,
-- and every writer that can fire them already reads those tables.
--
-- Note on the revokes: Supabase's default privileges grant EXECUTE on new
-- public functions to anon and authenticated EXPLICITLY, so `revoke ... from
-- public` alone is a no-op here — unlike the platform's rls_auto_enable(),
-- where the grant WAS on PUBLIC. Check pg_proc.proacl rather than assuming.
--
-- Applied as `enforce_redacted_media_constraints` then
-- `redaction_triggers_security_invoker`.

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

create trigger case_files_cover_not_redacted
  before insert or update of cover_media_id on case_files
  for each row execute function assert_cover_not_redacted();

-- The reverse direction: flagging an already-referenced asset as redacted.
-- Without this the constraint is trivially bypassed by uploading a cover and
-- marking it redacted afterwards.
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

create trigger media_redacted_not_in_use
  before update of redacted on media
  for each row execute function assert_redacted_not_in_use();

-- settings.og_image holds a Cloudinary public_id (rule 3: never a URL).
create or replace function assert_og_image_not_redacted()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
begin
  if new.key = 'og_image' and new.value is not null
     and exists (select 1 from media m
                 where m.cloudinary_public_id = new.value and m.redacted) then
    raise exception
      'settings.og_image references a redacted asset (%). The OG image is '
      'embedded in every shared link preview and must use non-NDA imagery '
      'only — see decision 028.', new.value;
  end if;
  return new;
end;
$$;

create trigger settings_og_image_not_redacted
  before insert or update of value on settings
  for each row execute function assert_og_image_not_redacted();

revoke execute on function assert_cover_not_redacted()    from public, anon, authenticated;
revoke execute on function assert_redacted_not_in_use()   from public, anon, authenticated;
revoke execute on function assert_og_image_not_redacted() from public, anon, authenticated;
