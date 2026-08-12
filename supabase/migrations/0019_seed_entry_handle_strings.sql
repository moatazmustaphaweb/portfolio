-- 0019 — UI strings for the two new cover blocks.
--
-- ⚠️ The Arabic here is MINE and needs review. Unlike the tagline — which was
-- written in Arabic rather than translated — these two were produced by
-- rendering the English, which is exactly the thing the review file exists to
-- catch. Logged in docs/ui-strings-review.md.

with new_keys as (
  insert into ui_strings (key, context) values
    ('entry_handles_heading', 'Cover — heading above the three entry handles'),
    ('sibling_case_files',    'Cover — heading above links to sibling case files')
  on conflict (key) do update set context = excluded.context
  returning id, key
)
insert into translations (entity_type, entity_id, locale, field, value)
select 'ui_string'::entity_type, new_keys.id, v.locale::locale_code, 'label', v.value
from new_keys, (values
  ('entry_handles_heading','en','Three ways in'),
  ('entry_handles_heading','ar','ثلاث طرق للدخول'),
  ('sibling_case_files','en','Sibling case files'),
  ('sibling_case_files','ar','ملفات شقيقة')
) as v(k, locale, value)
where v.k = new_keys.key
on conflict (entity_type, entity_id, locale, field) do update set value = excluded.value;
