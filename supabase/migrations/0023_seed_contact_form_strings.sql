-- 0023 — Contact form strings that Notion's form spec adds.
--
-- `form_name`, `form_email`, `form_message`, `form_submit`, `form_required`,
-- `form_sending`, `form_success` and `form_error` already exist and were
-- reviewed on 2026-08-11 — they are not touched here.
--
-- ⚠️ The Arabic below is MINE, rendered from the English rather than authored.
-- Flagged in TASKS.md with the others.

with k as (
  insert into ui_strings (key, context) values
    ('form_subject',             'Contact form — the "What''s this about?" select label'),
    ('form_subject_hiring',      'Contact form — subject option'),
    ('form_subject_project',     'Contact form — subject option'),
    ('form_subject_speaking',    'Contact form — subject option'),
    ('form_subject_other',       'Contact form — subject option'),
    ('form_message_placeholder', 'Contact form — placeholder in the message field')
    -- ('download_cv') RETIRED 2026-08-15 — see 0003. Replaced by request_cv.
  on conflict (key) do update set context = excluded.context
  returning id, key
)
insert into translations (entity_type, entity_id, locale, field, value)
select 'ui_string'::entity_type, k.id, v.locale::locale_code, 'label', v.value
from k, (values
  ('form_subject','en','What''s this about?'),
  ('form_subject','ar','عن ماذا تودّ الحديث؟'),
  ('form_subject_hiring','en','Hiring'),
  ('form_subject_hiring','ar','توظيف'),
  ('form_subject_project','en','A project'),
  ('form_subject_project','ar','مشروع'),
  ('form_subject_speaking','en','Speaking or writing'),
  -- Reviewed 2026-08-13: was 'مشاركة أو كتابة', which reads *participation*.
  -- This file runs AFTER 0003 and its ON CONFLICT DO UPDATE would otherwise
  -- overwrite the approved wording on a rebuild.
  ('form_subject_speaking','ar','ندوة أو مقال'),
  ('form_subject_other','en','Something else'),
  ('form_subject_other','ar','شيء آخر'),
  ('form_message_placeholder','en','The more context you give, the more useful my first reply will be.'),
  ('form_message_placeholder','ar','كلما أعطيتني سياقاً أوضح، كان ردّي الأول أكثر فائدة.')
) as v(key, locale, value)
where v.key = k.key
on conflict (entity_type, entity_id, locale, field) do update set value = excluded.value;
