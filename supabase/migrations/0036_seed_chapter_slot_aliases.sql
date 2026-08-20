-- 0036 — The remaining twelve chapters join the slot model.
--
-- 0035 seeded Chapter One only, and said the rest "will FAIL LOUDLY on the next
-- sync with a message naming the heading and the fix. That is the model working."
-- This is that fix, taken: every refusal it produced is answered by a ROW.
--
-- ── WHAT THE SET ACTUALLY IS ────────────────────────────────────────────────
--
-- Twelve chapters, not nine. The route map undercounts; the database is the
-- authority:
--
--   Egypt        workflow · portal · fulfilment · accessibility ·
--                web-vs-mobile-onboarding · web-vs-mobile-portal
--   Neobiz       onboarding · portal
--   UAE          onboarding
--   Cervello     on-premises-to-cloud · permission-architecture · method
--
-- Comparison and accessibility pages are `chapter`-like rows and carry sections
-- like any other, which is why they are here rather than excluded.
--
-- ── TWO DECISIONS WORTH THE READING TIME ────────────────────────────────────
--
-- 1. `the-fight-i-lost` is SHARED between Egypt/Onboarding ("The fight I lost")
--    and UAE ("The argument I lost in two countries"). Same structural move,
--    different chapters — which is exactly what a slot is for. Safe because
--    `unique (chapter_id, slot)` forbids two sections on ONE chapter, and no
--    chapter carries both. This is an authored alias, not a fuzzy match: 0031's
--    warning is against GUESSING, and nothing here was guessed.
--
-- 2. The accessibility page's six NUMBERED principles get six slots
--    (`principle-1` … `principle-6`), not one shared `principle`. They sit on a
--    single page, so a shared slot would collide on the unique constraint and
--    fail the page for being written exactly as intended.
--
-- Arabic resolves through the same table on its own merits, never by pairing
-- with English. Where a locale has no counterpart section — the accessibility
-- page has no Arabic for its six principles, and two Egypt chapters have no
-- Arabic `The interface` — that slot simply has no Arabic. Decision 013's
-- fallback applies per slot.

insert into chapter_slot_aliases (heading_norm, slot, observed_on) values
  ('why this chapter exists', 'why-this-chapter-exists', 'Cervello / Method & Design System (en)'),
  ('four principles written down', 'principles', 'Cervello / Method & Design System (en)'),
  ('ideas before screens', 'ideas-before-screens', 'Cervello / Method & Design System (en)'),
  ('the design system and handoff', 'design-system-handoff', 'Cervello / Method & Design System (en)'),
  ('the feature catalogue', 'feature-catalogue', 'Cervello / Method & Design System (en)'),
  ('what this became', 'what-this-became', 'Cervello / Method & Design System (en)'),
  ('الهدف', 'objective', 'Cervello / Method & Design System (ar) · Cervello / On-Premises to Cloud (ar) · Cervello / Permission Architecture (ar) '),
  ('لماذا يوجد هذا الفصل', 'why-this-chapter-exists', 'Cervello / Method & Design System (ar)'),
  ('أربعة مبادئ مكتوبة', 'principles', 'Cervello / Method & Design System (ar)'),
  ('الأفكار قبل الشاشات', 'ideas-before-screens', 'Cervello / Method & Design System (ar)'),
  ('نظام التصميم والتسليم', 'design-system-handoff', 'Cervello / Method & Design System (ar)'),
  ('الـ feature catalogue', 'feature-catalogue', 'Cervello / Method & Design System (ar)'),
  ('ما صار إليه هذا المنهج', 'what-this-became', 'Cervello / Method & Design System (ar)'),
  ('السياق', 'context', 'Cervello / On-Premises to Cloud (ar) · Cervello / Permission Architecture (ar) · Egypt / Application Workflow (ar) · Egy'),
  ('النتيجة', 'result', 'Cervello / On-Premises to Cloud (ar) · Cervello / Permission Architecture (ar) · Egypt / Application Workflow (ar) · Egy'),
  ('the problems as they actually presented', 'problems-as-presented', 'Cervello / On-Premises to Cloud (en)'),
  ('المشكلات كما ظهرت فعلًا', 'problems-as-presented', 'Cervello / On-Premises to Cloud (ar)'),
  ('the rule that governs every row', 'the-rule', 'Web vs Mobile / Onboarding (en)'),
  ('the differences decision by decision', 'the-differences', 'Web vs Mobile / Onboarding (en)'),
  ('what this table is actually evidence of', 'what-this-is-evidence-of', 'Web vs Mobile / Onboarding (en)'),
  ('القاعدة التي تحكم كل صف في الجدول', 'the-rule', 'Web vs Mobile / Onboarding (ar)'),
  ('الفروق قرارًا قرارًا', 'the-differences', 'Web vs Mobile / Onboarding (ar)'),
  ('ما يدل عليه هذا الجدول فعلًا', 'what-this-is-evidence-of', 'Web vs Mobile / Onboarding (ar)'),
  ('what never changes', 'what-never-changes', 'Web vs Mobile / Customer Portal (en)'),
  ('what mobile changes', 'what-mobile-changes', 'Web vs Mobile / Customer Portal (en)'),
  ('the one line version', 'the-one-line-version', 'Web vs Mobile / Customer Portal (en)'),
  ('ما لا يتغير بين المنصتين', 'what-never-changes', 'Web vs Mobile / Customer Portal (ar)'),
  ('ما يغيره الموبايل', 'what-mobile-changes', 'Web vs Mobile / Customer Portal (ar)'),
  ('الخلاصة في سطر', 'the-one-line-version', 'Web vs Mobile / Customer Portal (ar)'),
  ('the position', 'the-position', 'Bilingual, RTL & Regulatory Comprehension (en)'),
  ('why this became the argument that won', 'why-this-argument-won', 'Bilingual, RTL & Regulatory Comprehension (en)'),
  ('what shipped', 'what-shipped', 'Bilingual, RTL & Regulatory Comprehension (en)'),
  ('1 bilingual parity as structure not translation', 'principle-1', 'Bilingual, RTL & Regulatory Comprehension (en)'),
  ('2 language switching at the point of legal consequence', 'principle-2', 'Bilingual, RTL & Regulatory Comprehension (en)'),
  ('3 plain language over regulatory language', 'principle-3', 'Bilingual, RTL & Regulatory Comprehension (en)'),
  ('4 error prevention upstream in both languages', 'principle-4', 'Bilingual, RTL & Regulatory Comprehension (en)'),
  ('5 confirming instead of typing the ocr model', 'principle-5', 'Bilingual, RTL & Regulatory Comprehension (en)'),
  ('6 cognitive load as an accessibility concern', 'principle-6', 'Bilingual, RTL & Regulatory Comprehension (en)'),
  ('the design system contribution', 'design-system-contribution', 'Bilingual, RTL & Regulatory Comprehension (en)'),
  ('conformance what was designed what was verified', 'conformance', 'Bilingual, RTL & Regulatory Comprehension (en)'),
  ('the component library named honestly', 'component-library', 'Bilingual, RTL & Regulatory Comprehension (en)'),
  ('why this matters beyond compliance', 'why-beyond-compliance', 'Bilingual, RTL & Regulatory Comprehension (en)'),
  ('الموقف', 'the-position', 'Bilingual, RTL & Regulatory Comprehension (ar)'),
  ('لماذا كسبت هذه الحجة دون غيرها', 'why-this-argument-won', 'Bilingual, RTL & Regulatory Comprehension (ar)'),
  ('ما صدر عن هذا القرار', 'what-shipped', 'Bilingual, RTL & Regulatory Comprehension (ar)'),
  ('سجل المطابقة ما صُمم وما جرى التحقق منه', 'conformance', 'Bilingual, RTL & Regulatory Comprehension (ar)'),
  ('مكتبة المكونات باسمها الصحيح', 'component-library', 'Bilingual, RTL & Regulatory Comprehension (ar)'),
  ('لماذا يهم هذا بما يتجاوز الامتثال', 'why-beyond-compliance', 'Bilingual, RTL & Regulatory Comprehension (ar)'),
  ('what carries over natively', 'what-carries-over', 'Neobiz Mobile / Customer Portal (en)'),
  ('ما يعبر إلى الموبايل كما هو', 'what-carries-over', 'Neobiz Mobile / Customer Portal (ar)'),
  ('tracking and exceptions', 'tracking-and-exceptions', 'UAE / Mobile Onboarding Journey (en)'),
  ('the argument i lost in two countries', 'the-fight-i-lost', 'UAE / Mobile Onboarding Journey (en)'),
  ('what id change', 'what-id-change', 'UAE / Mobile Onboarding Journey (en)'),
  ('المتابعة والاستثناءات', 'tracking-and-exceptions', 'UAE / Mobile Onboarding Journey (ar)'),
  ('الحجة التي خسرتها في بلدين', 'the-fight-i-lost', 'UAE / Mobile Onboarding Journey (ar)'),
  ('ما كنت سأغيّره', 'what-id-change', 'UAE / Mobile Onboarding Journey (ar)'),
  ('notifications', 'notifications', 'Egypt / Customer Portal & Notifications (en)'),
  ('withdrawal', 'withdrawal', 'Egypt / Customer Portal & Notifications (en)'),
  ('الإشعارات', 'notifications', 'Egypt / Customer Portal & Notifications (ar)'),
  ('الانسحاب', 'withdrawal', 'Egypt / Customer Portal & Notifications (ar)'),
  ('الأدلة', 'evidence', 'Egypt / Onboarding Journey (ar)'),
  ('ما صمّمته', 'what-i-designed', 'Egypt / Onboarding Journey (ar)'),
  ('المعركة التي خسرتها', 'the-fight-i-lost', 'Egypt / Onboarding Journey (ar)'),
  ('what the first version got wrong', 'what-v1-got-wrong', 'Egypt / Application Workflow (en)'),
  ('how the problems were found', 'how-problems-were-found', 'Egypt / Application Workflow (en)'),
  ('on preventing errors', 'on-preventing-errors', 'Egypt / Application Workflow (en)'),
  ('ما أخطأت فيه النسخة الأولى mvp 1', 'what-v1-got-wrong', 'Egypt / Application Workflow (ar)'),
  ('كيف اكتُشفت هذه المشكلات', 'how-problems-were-found', 'Egypt / Application Workflow (ar)'),
  ('موقفي من منع الخطأ', 'on-preventing-errors', 'Egypt / Application Workflow (ar)'),
  ('the physical layer', 'the-physical-layer', 'Egypt / Fulfilment & AOF (en)'),
  ('the constraint the whole case file opened with', 'the-opening-constraint', 'Egypt / Fulfilment & AOF (en)'),
  ('الطبقة المادية', 'the-physical-layer', 'Egypt / Fulfilment & AOF (ar)'),
  ('القيد الذي افتُتح به الملف كله', 'the-opening-constraint', 'Egypt / Fulfilment & AOF (ar)')
on conflict (heading_norm) do nothing;