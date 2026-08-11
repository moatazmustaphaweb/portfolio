-- Strings for the MVP-1 route stubs. Rule 1 holds for scaffolding too: a stub
-- with a hardcoded heading is a hardcoded heading, and it survives into the
-- real page because nobody remembers to remove it.
--
-- Page titles live here rather than in the route files. When a page's real
-- content arrives from the sync it will supply its own title; until then the
-- stub resolves the same key.
--
-- ⚠️ Arabic needs a review pass.
--
-- Applied as `seed_stub_and_page_strings`.

with strings(key, context, en, ar) as (values
  ('stub_in_progress', 'Shown on every scaffolded route until its content lands',
   'This page is being built. The structure is in place; the writing is not.',
   'هذه الصفحة قيد الإنشاء. البنية جاهزة، أمّا المحتوى فلا.'),

  ('page_work',        'Classic Gallery heading + nav',            'Work',        'الأعمال'),
  ('page_systems',     'Systems page heading',                     'Systems',     'الأنظمة'),
  ('page_about',       'About page heading',                       'About',       'عن مُعتز'),
  ('page_philosophy',  'Philosophy page heading',                  'Philosophy',  'الفلسفة'),
  ('page_contact',     'Contact page heading',                     'Contact',     'تواصل'),
  ('linear_view',      'Linear view heading — the whole case file in one page',
   'Read start to finish', 'اقرأ من البداية إلى النهاية')
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
