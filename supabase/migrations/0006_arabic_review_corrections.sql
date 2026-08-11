-- Arabic corrections from Moataz's review pass, 2026-08-11.
-- See docs/ui-strings-review.md.
--
-- Two were genuine bugs: `objective` and `outcome` shared their Arabic with
-- `target` and `result`, and the pairs collide in the same place — Results
-- Table columns are Target/Outcome while chapter beats are Objective/Result.
--
-- `redacted_notice` had NDA translated, against the convention that technical
-- and brand terms stay Latin inside Arabic text.
--
-- The rest are register: `تقديري` over `متوقّع` matters most, because `متوقّع`
-- reads "expected" and quietly over-claims against decision 007.
--
-- 0003 has been updated to match, so a rebuild from scratch produces these
-- values directly. This migration exists so an already-seeded database
-- converges to the same place.
--
-- Applied as `arabic_review_corrections`.

update translations t set value = v.correct, updated_at = now()
from (values
  ('objective',        'الغاية'),
  ('outcome',          'الحصيلة'),
  ('redacted_notice',  'محجوب بموجب NDA'),
  ('reflection',       'خلاصة'),
  ('status_projected', 'تقديري'),
  ('status_achieved',  'محقَّق'),
  ('status_missed',    'غير محقَّق'),
  ('skip_to_content',  'انتقل إلى المحتوى'),
  ('case_file',        'ملف المشروع')
) as v(key, correct)
join ui_strings u on u.key = v.key
where t.entity_type = 'ui_string'
  and t.entity_id = u.id
  and t.field = 'label'
  and t.locale = 'ar';
