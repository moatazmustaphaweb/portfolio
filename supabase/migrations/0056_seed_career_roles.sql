-- 0056 — The career timeline's rows.
--
-- ── PROVENANCE ──────────────────────────────────────────────────────────────
--
-- Task `044240826`. Transcribed from the CV Moataz supplied on 2026-08-24
-- (`docs/career-history.md`), and confirmed by him in conversation. **No date,
-- title or place here is inferred.**
--
-- ── EMPLOYER NAMES ARE ABSENT BY CONSTRUCTION ───────────────────────────────
--
-- His instruction: the domain, the job title, the dates, the city and the
-- country — **without the names.** `career_roles` has no `employer` column
-- (0053), so this file could not seed one even by mistake. Rule 6.
--
-- ── DOMAINS: FIVE STATED, TWO LEFT NULL ────────────────────────────────────
--
-- Only the domains Moataz named himself are seeded:
--
--   `financial-products`  his words, on the Mashreq role.
--   `iot`                 his words, on the IoTBlue role.
--   `fintech-medical`     his words — and the CV agrees: that role covered both
--                         an award-winning medical platform AND the AAM
--                         Financial Advisor wealth-management portal.
--
--   `medical-elearning`   his words, on the 2018 role.
--   `engineering-ecommerce` his words, on the 2016 role.
--
-- **The two oldest roles carry no domain at all**, and that is deliberate — the
-- freelance years and the first graphics job. He has not named them, the CV
-- describes their projects rather than a domain, and rule 7 forbids inventing
-- the label. A role with no `domain` translation renders without one; the
-- renderer must not substitute a guess.
--
-- ── DATES ───────────────────────────────────────────────────────────────────
--
-- The CV gives months, not days. First of the month for a start, last of the
-- month for an end — the only lossless reading of "Jul 2022" into a `date`, and
-- the renderer shows months anyway. `ended` NULL on row 1 means current.
--
-- `sort_order` is newest first, matching how the timeline reads.
--
-- ── ⚠️ THE ARABIC IS NOT APPROVED ───────────────────────────────────────────
--
-- Every Arabic value below is written from the English by the assistant and has
-- **NOT been reviewed by Moataz.** Seeded so the Arabic timeline is not a row of
-- English job titles. Tracked in TASKS.md with the pairs from 0051, 0052 and
-- 0054.
--
-- One judgement worth flagging rather than burying: **the job titles are
-- translated into Arabic** rather than kept Latin. `docs/learn.md` records that
-- Arabic copy here deliberately keeps `Governance`, `OTP`, `KYC` and `NDA` in
-- Latin, and job titles could defensibly join that list — Arabic CVs often keep
-- them English. They are translated here because the timeline is prose a person
-- reads, not a technical term list. **If he wants them Latin, it is one edit per
-- row and this comment is why.**

with roles(sort_order, started, ended, domain_en, domain_ar, title_en, title_ar, city_en, city_ar, country_en, country_ar) as (values
  (0, date '2022-07-01', null::date,
      'Financial products', 'المنتجات المالية',
      'Senior UI/UX Consultant, Regional', 'استشاري أول لتجربة وواجهة المستخدم — إقليمي',
      'Dubai', 'دبي', 'United Arab Emirates', 'الإمارات العربية المتحدة'),
  (1, date '2021-09-01', date '2022-06-30',
      'Fintech and medical', 'التقنية المالية والطب',
      'Principal Product Designer', 'مصمم منتجات رئيسي',
      'San Diego', 'سان دييغو', 'United States (remote)', 'الولايات المتحدة (عن بُعد)'),
  (2, date '2018-09-01', date '2021-08-31',
      'IoT', 'إنترنت الأشياء',
      'Lead Product Designer', 'مصمم المنتجات الأول',
      'Madrid', 'مدريد', 'Spain', 'إسبانيا'),
  (3, date '2018-01-01', date '2018-08-31',
      'Medical and e-learning', 'الطب والتعليم الإلكتروني',
      'UI/UX Designer', 'مصمم تجربة وواجهة المستخدم',
      'Cairo', 'القاهرة', 'Egypt', 'مصر'),
  (4, date '2016-06-01', date '2017-12-31',
      'Engineering and e-commerce', 'الهندسة والتجارة الإلكترونية',
      'Visual UI/UX Designer', 'مصمم بصري لتجربة وواجهة المستخدم',
      'Cairo', 'القاهرة', 'Egypt', 'مصر'),
  (5, date '2014-03-01', date '2016-03-31',
      null, null,
      'Freelance UI/UX Designer', 'مصمم تجربة وواجهة المستخدم — عمل حر',
      null, null, 'Remote', 'عن بُعد'),
  (6, date '2012-08-01', date '2014-02-28',
      null, null,
      'Graphics & UI Designer', 'مصمم جرافيك وواجهات',
      'Cairo', 'القاهرة', 'Egypt', 'مصر')
),
/* One row per locale, per 0053 — the same shape as chapter_paragraphs. */
inserted as (
  insert into career_roles (locale, sort_order, started, ended)
  select l.locale::locale_code, r.sort_order, r.started, r.ended
  from roles r
  cross join (values ('en'), ('ar')) as l(locale)
  on conflict (locale, sort_order) do update
    set started = excluded.started,
        ended   = excluded.ended,
        updated_at = now()
  returning id, locale, sort_order
)
insert into translations (entity_type, entity_id, locale, field, value)
select 'career_role', i.id, i.locale, f.field, f.value
from inserted i
join roles r on r.sort_order = i.sort_order
cross join lateral (values
  ('title',   case when i.locale = 'ar' then r.title_ar   else r.title_en   end),
  ('domain',  case when i.locale = 'ar' then r.domain_ar  else r.domain_en  end),
  ('city',    case when i.locale = 'ar' then r.city_ar    else r.city_en    end),
  ('country', case when i.locale = 'ar' then r.country_ar else r.country_en end)
) as f(field, value)
/* A NULL domain or city is an ABSENCE, not an empty string. No row is written. */
where f.value is not null
on conflict (entity_type, entity_id, locale, field) do update
  set value = excluded.value, updated_at = now();
