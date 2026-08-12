-- Domains, from the four named in docs/brief.md: Banking & Identity ·
-- Smart Things (IoT) · AI & Conversation · Branding.
--
-- Grammar picks the LivingMap layout. Egypt's own Notion note says
-- "country-culture (journey through a market)"; Neobiz and UAE are the same
-- journey in other forms. Cervello is a platform — atom-and-orbit.
--
-- NEITHER IS IN NOTION, and scripts/sync-notion.ts no longer writes them: an
-- upsert including domain/grammar/nda reset all three on every run, which is
-- how `domain` came to be "work" for every case file and the gallery filter
-- came to have one option.
--
-- Applied as `set_domains_grammars_and_gallery_strings`.

update case_files set domain = 'banking', grammar = 'country-culture'
  where slug in ('egypt-acquisition', 'neobiz-mobile', 'uae-acquisition');
update case_files set domain = 'smart-things', grammar = 'ecosystem'
  where slug = 'cervello';

-- `gallery_intro` is deliberately NOT seeded: it is copy, and copy is written.
-- The page renders without it and gains it the moment a translation exists.
with strings(key, context, en, ar) as (values
  ('domain_banking',      'Gallery filter option — case_files.domain = banking',      'Banking',      'الخدمات المصرفية'),
  ('domain_smart_things', 'Gallery filter option — case_files.domain = smart-things', 'Smart Things', 'الأنظمة الذكية'),
  ('domain_ai',           'Gallery filter option — case_files.domain = ai',           'AI',           'الذكاء الاصطناعي'),
  ('domain_branding',     'Gallery filter option — case_files.domain = branding',     'Branding',     'الهوية'),
  ('nda_label',           'Gallery card marker on NDA work. Pairs with the grayscale treatment so the signal is never colour alone.', 'Under NDA', 'تحت اتفاقية سرية')
), upsert_keys as (
  insert into ui_strings (key, context)
  select key, context from strings
  on conflict (key) do update set context = excluded.context
  returning id, key
)
insert into translations (entity_type, entity_id, locale, field, value)
select 'ui_string', k.id, l.locale::locale_code, 'label', l.value
from strings s
join upsert_keys k on k.key = s.key
cross join lateral (values ('en', s.en), ('ar', s.ar)) as l(locale, value)
on conflict (entity_type, entity_id, locale, field) do update
  set value = excluded.value, updated_at = now();
