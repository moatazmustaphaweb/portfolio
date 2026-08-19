-- Seed: site chrome (navigation + ui_strings + settings keys)
-- Task 0.3. Idempotent — safe to re-run.
--
-- SCOPE, and why it stops where it does:
--
-- Rule 7 forbids fabricated content, and decision 021 says every string in the
-- Claude Design files is dummy. So this seeds only what the project's own
-- documentation specifies or what is generic interface vocabulary:
--
--   navigation  — the four header routes named in docs/manifesto.md 0.3
--                 ("Work · Systems · About · Contact") plus footer items
--   ui_strings  — interface words. "Read more" is vocabulary, not a claim
--                 about Moataz, so writing it is not fabrication
--
--   settings    — KEYS ONLY, with NULL values and NO translations.
--                 name, tagline, email, linkedin_url, cv_url and og_image are
--                 personal facts. Inventing a tagline would break rule 7, and
--                 guessing a public contact address would be worse. The rows
--                 exist so the structure is real; the values are Moataz's to
--                 supply — see 0004, which fills in name, email and
--                 linkedin_url. tagline, cv_url and og_image remain NULL.
--
-- Arabic below is translation of structural labels, not authored content.
-- It still needs a native review pass before launch — see the language QA
-- gate in docs/manifesto.md.

-- ---------------------------------------------------------------------------
-- SETTINGS — keys only. Values deliberately NULL. See the note above.
-- ---------------------------------------------------------------------------

insert into settings (key, value, sort_order) values
  ('name',         null, 1),
  ('tagline',      null, 2),
  ('email',        null, 3),
  ('linkedin_url', null, 4),
  ('cv_url',       null, 5),
  ('og_image',     null, 6)
on conflict (key) do nothing;   -- never clobber a value Moataz has set

-- ---------------------------------------------------------------------------
-- NAVIGATION
-- ---------------------------------------------------------------------------

insert into navigation (route, location, sort_order, visible) values
  ('/work',     'header', 1, true),
  ('/systems',  'header', 2, true),
  ('/about',    'header', 3, true),
  ('/contact',  'header', 4, true),
  ('/work',     'footer', 1, true),
  ('/systems',  'footer', 2, true),
  ('/about',    'footer', 3, true),
  ('/contact',  'footer', 4, true)
on conflict (location, route) do update
  set sort_order = excluded.sort_order,
      visible    = excluded.visible;

-- Nav labels.
with labels(route, location, en, ar) as (values
  ('/work',    'header', 'Work',     'الأعمال'),
  ('/systems', 'header', 'Systems',  'الأنظمة'),
  ('/about',   'header', 'About',    'عن مُعتز'),
  ('/contact', 'header', 'Contact',  'تواصل'),
  ('/work',    'footer', 'Work',     'الأعمال'),
  ('/systems', 'footer', 'Systems',  'الأنظمة'),
  ('/about',   'footer', 'About',    'عن مُعتز'),
  ('/contact', 'footer', 'Contact',  'تواصل')
)
insert into translations (entity_type, entity_id, locale, field, value)
select 'nav_item', n.id, l.locale::locale_code, 'label', l.value
from labels
cross join lateral (values ('en', labels.en), ('ar', labels.ar)) as l(locale, value)
join navigation n
  on n.route = labels.route
 and n.location = labels.location::nav_location
on conflict (entity_type, entity_id, locale, field) do update
  set value = excluded.value, updated_at = now();

-- ---------------------------------------------------------------------------
-- UI STRINGS — every interface word. No component may hold a literal.
-- ---------------------------------------------------------------------------

with strings(key, context, en, ar) as (values
  -- Navigation and wayfinding
  ('skip_to_content',  'Skip link, first focusable element',  'Skip to content',        'انتقل إلى المحتوى'),
  ('back_to_work',     'Case file cover → gallery',           'Back to work',           'العودة إلى الأعمال'),
  ('next_chapter',     'Chapter footer',                      'Next chapter',           'الفصل التالي'),
  ('previous_chapter', 'Chapter footer',                      'Previous chapter',       'الفصل السابق'),
  ('read_more',        'Card and teaser links',               'Read more',              'اقرأ المزيد'),
  ('view_all',         'Section headers',                     'View all',               'عرض الكل'),
  ('home',             'Breadcrumb root',                     'Home',                   'الرئيسية'),
  ('breadcrumb_label', 'aria-label for the breadcrumb nav',   'Breadcrumb',             'مسار التنقل'),

  -- Case file structure
  ('case_file',        'Kicker on a case file cover',         'Case file',              'ملف المشروع'),
  ('chapter',          'Chapter label',                       'Chapter',                'الفصل'),
  ('chapter_of',       'Progress, e.g. "Chapter 1 of 3"',     'Chapter {current} of {total}', 'الفصل {current} من {total}'),
  ('role_label',       'Role line on a cover',                'Role',                   'الدور'),
  ('objective',        'Chapter beat heading',                'Objective',              'الغاية'),
  ('context',          'Chapter beat heading',                'Context',                'السياق'),
  ('decision',         'Chapter beat heading',                'Decision',               'القرار'),
  ('evidence',         'Chapter beat heading',                'Evidence',               'الدليل'),
  ('result',           'Chapter beat heading',                'Result',                 'النتيجة'),
  ('reflection',       'Cover reflection block',              'Reflection',             'خلاصة'),
  ('read_linear',      'Cover → linear view',                 'Read start to finish',   'اقرأ من البداية إلى النهاية'),

  -- Results table. Labels match the schema enums exactly (decision 024).
  ('results',          'Results table heading',               'Results',                'النتائج'),
  ('target',           'Results table column',                'Target',                 'الهدف'),
  ('outcome',          'Results table column',                'Outcome',                'الحصيلة'),
  ('status_achieved',       'target_status = achieved',       'Achieved',               'محقَّق'),
  ('status_missed',         'target_status = missed',         'Missed',                 'غير محقَّق'),
  ('status_not_measurable', 'status = not-measurable',        'Not measurable',         'غير قابل للقياس'),
  ('status_projected',      'outcome_status = projected',     'Projected',              'تقديري'),

  -- Gallery and filters
  ('all',              'Default filter option',               'All',                    'الكل'),
  ('filter_domain',    'Filter group label',                  'Domain',                 'المجال'),
  ('filter_by',        'aria-label for the filter bar',       'Filter by',              'تصفية حسب'),
  ('no_results',       'Empty filter state',                  'Nothing matches that filter yet.', 'لا يوجد ما يطابق هذه التصفية بعد.'),

  -- Media
  ('redacted_notice',  'Caption on a redacted image',         'Redacted under NDA',     'محجوب بموجب NDA'),

  -- Contact form
  ('form_name',        'Contact form field',                  'Name',                   'الاسم'),
  ('form_email',       'Contact form field',                  'Email',                  'البريد الإلكتروني'),
  ('form_message',     'Contact form field',                  'Message',                'الرسالة'),
  ('form_submit',      'Contact form button',                 'Send',                   'إرسال'),
  ('form_sending',     'Submit button, pending state',        'Sending…',               'جارٍ الإرسال…'),
  ('form_success',     'Contact form confirmation',           'Thanks — I’ll reply soon.', 'شكراً — سأردّ قريباً.'),
  ('form_error',       'Contact form failure',                'That didn’t send. Try again, or email me directly.', 'لم يتم الإرسال. حاول مرة أخرى، أو راسلني مباشرة.'),
  ('form_required',    'Validation message',                  'This field is required.', 'هذا الحقل مطلوب.'),

  -- ───────────────────────────────────────────────────────────────────────
  -- Backfilled 2026-08-13. These eleven were written straight to the database
  -- on 2026-08-12 and never landed in a migration, so `check:seed-drift`
  -- reported them for a day: the site read them correctly, but a rebuild from
  -- scratch would have dropped them silently — no error, just unlabelled
  -- controls and a contact form whose subject field had no options.
  --
  -- Values copied from the live database, not retyped.
  --
  -- ⚠️ THE ARABIC BELOW IS UNREVIEWED. The review pass in
  -- docs/ui-strings-review.md is dated 2026-08-11 and covered 52 strings;
  -- every one of these was created the day after it. They are recorded here so
  -- a rebuild is faithful, NOT because the wording is settled. Flagged in
  -- scripts/export-ui-strings.ts until reviewed.
  -- ───────────────────────────────────────────────────────────────────────
  ('form_subject',     'Contact form — the "What''s this about?" select label', 'What''s this about?', 'عن ماذا تودّ الحديث؟'),
  ('form_subject_hiring',   'Contact form — subject option',  'Hiring',                 'توظيف'),
  ('form_subject_project',  'Contact form — subject option',  'A project',              'مشروع'),
  -- ندوة أو مقال, not مشاركة أو كتابة (reviewed 2026-08-13). The English means
  -- being invited to speak at an event or to write a piece; مشاركة reads as
  -- "participation", so a visitor wanting to invite him to a panel would not
  -- recognise the option. This names the two real occasions.
  ('form_subject_speaking', 'Contact form — subject option',  'Speaking or writing',    'ندوة أو مقال'),
  ('form_subject_other',    'Contact form — subject option',  'Something else',         'شيء آخر'),
  ('form_message_placeholder', 'Contact form — placeholder in the message field', 'The more context you give, the more useful my first reply will be.', 'كلما أعطيتني سياقاً أوضح، كان ردّي الأول أكثر فائدة.'),
  -- ('download_cv') RETIRED 2026-08-15 — replaced by the CV request flow.
  -- The CV is not published as a file; a visitor asks and Moataz sends it.
  -- `cv` (the footer label) was retired with it: both call sites now use one
  -- key, `request_cv`, so the two buttons cannot drift apart in wording.
  ('request_cv',       'CV request — the button that opens the request panel', 'Request CV', 'اطلب السيرة الذاتية'),

  -- The CV request panel. Styled as a mail compose window: everything is
  -- fixed except the visitor's email and one optional line. The To address is
  -- NOT seeded here — it is `settings.email`, so there is one source for it.
  ('cv_to_label',      'CV request panel — the To field label', 'To:',        'إلى:'),
  ('cv_subject_label', 'CV request panel — the Subject field label', 'Subject:', 'الموضوع:'),
  ('cv_subject_value', 'CV request panel — the fixed subject line', 'CV request — moatazmustapha.com', 'طلب السيرة الذاتية — moatazmustapha.com'),
  ('cv_greeting',      'CV request panel — the fixed greeting', 'Hi Moataz,', 'مرحباً معتز،'),
  ('cv_body',          'CV request panel — the fixed body line', 'I came across your portfolio and I''d like to see your CV.', 'اطّلعت على أعمالك وأودّ الحصول على سيرتك الذاتية.'),
  ('cv_optional_placeholder', 'CV request panel — placeholder for the one optional line', 'Optional: who you are and what this is about', 'اختياري: من أنت وسبب التواصل'),
  ('cv_email_placeholder', 'CV request panel — placeholder for the required email', 'your@email.com', 'your@email.com'),
  ('cv_close',         'CV request panel — close button label', 'Close',      'إغلاق'),
  ('entry_handles_heading', 'Cover — heading above the three entry handles', 'Three ways in', 'ثلاث طرق للدخول'),
  -- ملفات مرتبطة, not ملفات شقيقة (reviewed 2026-08-13). شقيقة is a literal
  -- rendering of "sibling" and reads biological; مرتبطة states the actual
  -- relationship between the case files.
  ('sibling_case_files', 'Cover — heading above links to sibling case files', 'Sibling case files', 'ملفات مرتبطة'),
  ('results_table',    'Results Table page — title and the link to it from the cover', 'Results table', 'جدول النتائج'),
  -- الحالة KEPT (reviewed 2026-08-13). The flagged collision risk with the
  -- status_* values in the column beneath does not exist: those are محقَّق /
  -- غير محقَّق / غير قابل للقياس, all adjectives, while الحالة is a column
  -- heading. The only real collision was with case_file, resolved when it
  -- became ملف المشروع. الحالة is also the standard term for Status in Gulf
  -- product interfaces, which is the register target in ui-strings-review.md.
  -- Settled — do not re-raise.
  ('status_label',     'Results Table — the Status column header', 'Status',            'الحالة'),

  -- Language and theme
  ('language',         'aria-label on the locale switch',     'Language',               'اللغة'),
  ('lang_en',          'Locale switch option',                'English',                'English'),
  ('lang_ar',          'Locale switch option',                'العربية',                 'العربية'),
  ('theme_toggle',     'aria-label on the theme group',       'Toggle theme',           'تبديل المظهر'),
  -- The default. Follows the OS preference; selecting it clears any override.
  -- Arabic approved 2026-08-13: تلقائي ("automatic") rather than النظام —
  -- it describes the behaviour, not the machine.
  ('theme_system',     'Theme option — follows the OS',       'System',                 'تلقائي'),
  ('theme_light',      'Theme option',                        'Light',                  'فاتح'),
  ('theme_dark',       'Theme option',                        'Dark',                   'داكن'),

  -- 404 and errors
  ('not_found_title',  '404 heading',                         'That page doesn’t exist', 'هذه الصفحة غير موجودة'),
  ('not_found_body',   '404 body',                            'The link may be out of date. The work is all still here.', 'قد يكون الرابط قديماً. جميع الأعمال ما زالت هنا.'),
  ('not_found_cta',    '404 primary action',                  'Go to the work',         'اذهب إلى الأعمال'),
  ('error_title',      'Error boundary heading',              'Something went wrong',   'حدث خطأ ما'),
  ('error_cta',        'Error boundary action',               'Try again',              'حاول مرة أخرى')
)
, upsert_keys as (
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
