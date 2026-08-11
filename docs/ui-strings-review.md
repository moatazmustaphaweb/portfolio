# docs/ui-strings-review.md — Arabic UI String Review

> **Generated** by `npm run export:ui-strings` from the live database.
> Do not hand-edit: apply corrections to the database, then regenerate.
> Sent for review 2026-08-11.

Every interface word on the site. No component may contain a user-facing
literal — these are the strings they resolve instead (rule 1).

**Register target:** modern professional Arabic — the tone of a well-made Gulf
banking product. Not classical/newspaper, not casual.

**Convention:** technical and brand terms (Governance, Compliance, OTP, OCR,
RTL, KYC, NDA, LinkedIn) stay in English inside Arabic text rather than being
forced into Arabic equivalents.

---

## Flagged before review

### Collisions — two English concepts on one Arabic word

| Arabic | Used for | Why it matters |
|---|---|---|
| `الهدف` | `target` (Target) **and** `objective` (Objective) | They collide in the same place: Results Table columns are Target/Outcome, chapter beats are Objective/Result |
| `النتيجة` | `outcome` (Outcome) **and** `result` (Result) | Same — an Arabic reader sees the same two words in two different structures |

### Convention breach

`redacted_notice` translates **NDA** to "اتفاقية سرية". By the convention above
it should stay Latin: `محجوب بموجب NDA`.

### Length risk

Character count is a rough proxy for Arabic — treat these as "measure it",
not "it's broken".

| Key | English | Arabic | Note |
|---|---|---|---|
| `form_submit` → `form_sending` | 4 → 8 | 5 → 13 | Worst case: the **same button** resizes mid-interaction |
| `form_email` | 5 | 17 | Largest ratio, 3.4× |
| status pills | 6–14 | 5–15 | Vary 3× **against each other** in one table column |
| `read_linear` | 20 | 27 | |
| `redacted_notice` | 18 | 24 | |
| `home` | 4 | 8 | |
| `error_cta` | 9 | 13 | |

### Register — where I was unsure, most doubt first

1. `reflection` → **تأمّل** — reads contemplative, almost devotional. You want a
   professional retrospective. Consider "مراجعة" or "خلاصة".
2. `status_projected` → **متوقّع** — reads "expected", which quietly over-claims
   versus "projected/forecast". Carries decision-007 weight. Consider
   "مُستهدَف" or "تقديري".
3. `status_achieved` / `status_missed` → **تحقّق / لم يتحقّق** are verbs; a status
   chip usually reads better as an adjective: محقَّق / غير محقَّق.
4. `skip_to_content` → **تخطَّ إلى المحتوى** — imperative carrying a diacritic,
   unusual in UI chrome. Consider "انتقل إلى المحتوى".
5. `case_file` → **ملف حالة** — reads clinical/legal, closer to a patient or
   court file than a design case study.

### Not bugs

`lang_en` is "English" and `lang_ar` is "العربية" in **both** locales — each
language is labelled in its own script so the switch is legible whichever
locale you are in.

---

## The strings

| key | English | Arabic | Flag |
|---|---|---|---|
| `all` | All | الكل |  |
| `back_to_work` | Back to work | العودة إلى الأعمال |  |
| `breadcrumb_label` | Breadcrumb | مسار التنقل |  |
| `case_file` | Case file | ملف حالة | Register — reads clinical/legal in Arabic |
| `chapter` | Chapter | الفصل |  |
| `chapter_of` | Chapter {current} of {total} | الفصل {current} من {total} |  |
| `context` | Context | السياق |  |
| `cv` | CV | السيرة الذاتية |  |
| `decision` | Decision | القرار |  |
| `error_cta` | Try again | حاول مرة أخرى |  |
| `error_title` | Something went wrong | حدث خطأ ما |  |
| `evidence` | Evidence | الدليل |  |
| `filter_by` | Filter by | تصفية حسب |  |
| `filter_domain` | Domain | المجال |  |
| `form_email` | Email | البريد الإلكتروني | **Length** — 3.4× English |
| `form_error` | That didn’t send. Try again, or email me directly. | لم يتم الإرسال. حاول مرة أخرى، أو راسلني مباشرة. |  |
| `form_message` | Message | الرسالة |  |
| `form_name` | Name | الاسم |  |
| `form_required` | This field is required. | هذا الحقل مطلوب. |  |
| `form_sending` | Sending… | جارٍ الإرسال… | **Length** — button grows mid-interaction vs `form_submit` |
| `form_submit` | Send | إرسال |  |
| `form_success` | Thanks — I’ll reply soon. | شكراً — سأردّ قريباً. |  |
| `home` | Home | الرئيسية |  |
| `lang_ar` | العربية | العربية | By design — labelled in its own script in both locales |
| `lang_en` | English | English | By design — labelled in its own script in both locales |
| `language` | Language | اللغة |  |
| `linkedin` | LinkedIn | LinkedIn | Brand name — stays Latin in Arabic |
| `next_chapter` | Next chapter | الفصل التالي |  |
| `no_results` | Nothing matches that filter yet. | لا يوجد ما يطابق هذه التصفية بعد. |  |
| `not_found_body` | The link may be out of date. The work is all still here. | قد يكون الرابط قديماً. جميع الأعمال ما زالت هنا. |  |
| `not_found_cta` | Go to the work | اذهب إلى الأعمال |  |
| `not_found_title` | That page doesn’t exist | هذه الصفحة غير موجودة |  |
| `objective` | Objective | الهدف | **Collision** — same Arabic as `target` |
| `outcome` | Outcome | النتيجة | **Collision** — same Arabic as `result` |
| `previous_chapter` | Previous chapter | الفصل السابق |  |
| `read_linear` | Read start to finish | اقرأ من البداية إلى النهاية | Length — 20 → 27 |
| `read_more` | Read more | اقرأ المزيد |  |
| `redacted_notice` | Redacted under NDA | محجوب بموجب اتفاقية سرية | **NDA translated** — convention says it stays Latin |
| `reflection` | Reflection | تأمّل | **Register** — reads contemplative/devotional |
| `result` | Result | النتيجة | **Collision** — same Arabic as `outcome` |
| `results` | Results | النتائج |  |
| `role_label` | Role | الدور |  |
| `skip_to_content` | Skip to content | تخطَّ إلى المحتوى | Register — imperative with a diacritic, unusual in UI |
| `status_achieved` | Achieved | تحقّق | Register — verb, not adjective |
| `status_missed` | Missed | لم يتحقّق | Register — verb, not adjective |
| `status_not_measurable` | Not measurable | غير قابل للقياس | Length — longest of the three status pills |
| `status_projected` | Projected | متوقّع | **Register** — reads 'expected'; carries decision-007 weight |
| `target` | Target | الهدف | **Collision** — same Arabic as `objective` |
| `theme_dark` | Dark | داكن |  |
| `theme_light` | Light | فاتح |  |
| `theme_toggle` | Toggle theme | تبديل المظهر |  |
| `view_all` | View all | عرض الكل |  |
---

**52 strings.** Every one present in both locales.

To apply corrections: update the database, then re-run
`npm run export:ui-strings` so this document stays true. The seed migration
`supabase/migrations/0003_seed_site_chrome.sql` must be updated to match, or
a rebuild from scratch will reintroduce the old strings.
