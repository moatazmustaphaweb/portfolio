-- Settings values supplied by Moataz 2026-08-11.
-- Applied as `seed_settings_values`.

-- Locale-independent values live in the column.
update settings set value = 'moataz.mustapha@outlook.com'                where key = 'email';
update settings set value = 'https://www.linkedin.com/in/moatazmustapha' where key = 'linkedin_url';

-- Locale-dependent values live in translations, field = 'value'.
insert into translations (entity_type, entity_id, locale, field, value)
select 'setting', s.id, v.locale::locale_code, 'value', v.text
from settings s
cross join (values ('en', 'Moataz Mustapha'), ('ar', 'مُعتز مصطفى')) as v(locale, text)
where s.key = 'name'
on conflict (entity_type, entity_id, locale, field) do update
  set value = excluded.value, updated_at = now();

-- tagline, cv_url and og_image stay NULL on purpose: genuinely undecided, and a
-- placeholder would be worse than an absence. All three are launch-gate
-- blockers in TASKS.md, not optional polish.
