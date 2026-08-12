-- 0020 — `results_table`: the Results Table page title, and the cover's link to it.
--
-- ⚠️ The Arabic (`جدول النتائج`) is mine, rendered from the English rather than
-- authored. Flagged in TASKS.md with the other two.
--
-- Every status label the page needs already exists: status_achieved,
-- status_missed, status_not_measurable. `target` and `evidence` serve as the
-- two column headers.

with k as (
  insert into ui_strings (key, context) values
    ('results_table', 'Results Table page — title and the link to it from the cover'),
    ('status_label',  'Results Table — the Status column header')
  on conflict (key) do update set context = excluded.context
  returning id, key
)
insert into translations (entity_type, entity_id, locale, field, value)
select 'ui_string'::entity_type, k.id, v.locale::locale_code, 'label', v.value
from k, (values
  ('results_table','en','Results table'),
  ('results_table','ar','جدول النتائج'),
  ('status_label','en','Status'),
  ('status_label','ar','الحالة')
) as v(key, locale, value)
where v.key = k.key
on conflict (entity_type, entity_id, locale, field) do update set value = excluded.value;
