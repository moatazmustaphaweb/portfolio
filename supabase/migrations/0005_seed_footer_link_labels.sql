-- Found while building the footer (0.7): the LinkedIn link label was a literal
-- in SiteFooter.tsx, which rule 1 forbids. `cv` added alongside it so the CV
-- link has a label ready for when settings.cv_url is decided.
--
-- LinkedIn stays Latin in Arabic per the convention that technical and brand
-- terms are not forced into Arabic equivalents.
--
-- Applied as `seed_footer_link_labels`.

with strings(key, context, en, ar) as (values
  ('linkedin', 'Footer link label. Brand name — stays Latin in Arabic.', 'LinkedIn', 'LinkedIn')
  -- ('cv') RETIRED 2026-08-15. The CV is not published as a file, so a footer
  -- link to one has nothing to point at. Both CV call sites now use the single
  -- `request_cv` key seeded in 0003, which opens the request panel.
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
