-- The Landing page's whole message, in three parts.
--
-- A deliberate progression: position, then intent, then domain. They never
-- repeat each other's words, and nothing else belongs on that page.
--
-- ⚠️ THE ARABIC IS WRITTEN, NOT TRANSLATED. `البساطة تصنع المستحيل` is not a
-- rendering of "Simple, where it's hard" — it is its counterpart, carrying the
-- same idea in Arabic's own logic. Do not "correct" either side toward the
-- other. A future translation pass that aligns them literally destroys both.
--
-- Applied as `seed_tagline_intro_description`.

insert into settings (key, value, sort_order) values
  ('intro',       null, 7),
  ('description', null, 8)
on conflict (key) do nothing;

with copy(key, en, ar) as (values
  ('tagline',
   'Simple, where it''s hard.',
   'البساطة تصنع المستحيل'),
  ('intro',
   'I''m here to make things easier for people.',
   'أسعى لحلول بسيطة، تجعل الحياة أسهل'),
  ('description',
   'Ten years designing regulated banking, IoT platforms, and the systems in between.',
   'عشر سنوات في تصميم الأنظمة البنكية والحلول الذكية وما بينهما')
)
insert into translations (entity_type, entity_id, locale, field, value)
select 'setting', s.id, l.locale::locale_code, 'value', l.value
from copy c
join settings s on s.key = c.key
cross join lateral (values ('en', c.en), ('ar', c.ar)) as l(locale, value)
on conflict (entity_type, entity_id, locale, field) do update
  set value = excluded.value, updated_at = now();
