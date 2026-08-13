/**
 * Writes docs/ui-strings-review.md from the live database.
 *
 *   npm run export:ui-strings
 *
 * Generated rather than hand-written on purpose: transcribing these by hand is
 * how the typographic drift between the seed migration and the database got in
 * (see supabase/migrations/README.md). Re-run after applying corrections and
 * the document is true again.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { supabaseServer } from "@/lib/supabase/server";
import type { Locale } from "@/lib/content/types";

const OUT = path.join(process.cwd(), "docs", "ui-strings-review.md");

/**
 * Review notes. Maintained by hand — update or delete entries as they are
 * resolved. Keyed by ui_strings.key.
 */
const NOTES: Record<string, string> = {
  // Resolved in Moataz's review pass, 2026-08-11.
  objective: "✅ Corrected — `الغاية`, freeing `الهدف` for `target`",
  outcome: "✅ Corrected — `الحصيلة`, freeing `النتيجة` for `result`",
  redacted_notice: "✅ Corrected — NDA now stays Latin",
  reflection: "✅ Corrected — `خلاصة`",
  status_projected: "✅ Corrected — `تقديري`; `متوقّع` over-claimed against decision 007",
  status_achieved: "✅ Corrected — adjective form",
  status_missed: "✅ Corrected — adjective form",
  skip_to_content: "✅ Corrected — no diacritic",
  case_file: "✅ Corrected — `ملف المشروع`",

  // Reviewed and deliberately kept.
  form_email: "Kept — correct Arabic; length is a layout problem, handled in CSS",
  read_linear: "Kept — correct Arabic; length is a layout problem",
  lang_en: "By design — labelled in its own script in both locales",
  lang_ar: "By design — labelled in its own script in both locales",
  linkedin: "Brand name — stays Latin in Arabic",

  // Privacy + consent copy, added 2026-08-11. These four claims carry more
  // weight than ordinary interface copy — they are the honesty the brand rests
  // on, so a clumsy Arabic rendering undercuts exactly the regional audience
  // the site most wants to reach.
  privacy_no_tracking: "🔴 **Hardest to state naturally** — see notes above",
  privacy_no_ip: "⚠️ Review — `عناوين IP` keeps IP Latin per convention",
  privacy_location: "⚠️ Review — register",
  privacy_ga: "⚠️ Review — register",
  privacy_title: "⚠️ Review — heading register",
  consent_message: "⚠️ Review — longest string; also check banner width",
  consent_accept: "⚠️ Review — must read as clearly as the decline",
  consent_decline: "⚠️ Review — must not read as softer than accept",

  // Added 2026-08-13 with the three-state theme control; Arabic approved the
  // same day. `تلقائي` — "automatic" — describes the behaviour rather than
  // naming the machine, which is what النظام did.
  theme_system: "Approved 2026-08-13 — `تلقائي` describes the behaviour, not the device",

  // Added 2026-08-12, the day AFTER the review pass, and never reviewed. They
  // were also missing from the seed until 2026-08-13; the migration now carries
  // them so a rebuild is faithful, which is a separate question from whether
  // the wording is right.
  form_subject: "🔴 Not reviewed — added after the 2026-08-11 pass",
  form_subject_hiring: "🔴 Not reviewed — added after the 2026-08-11 pass",
  form_subject_project: "🔴 Not reviewed — added after the 2026-08-11 pass",
  form_subject_speaking: "🔴 Not reviewed — `مشاركة` can read as *participation* rather than *speaking*; check against the intent",
  form_subject_other: "🔴 Not reviewed — added after the 2026-08-11 pass",
  form_message_placeholder:
    "🔴 Not reviewed — longest unreviewed string, and it sets the tone of the contact form",
  download_cv: "🔴 Not reviewed — also the longest control label; see `--control-min-w`",
  entry_handles_heading: "🔴 Not reviewed — added after the 2026-08-11 pass",
  sibling_case_files:
    "🔴 Not reviewed — `ملفات شقيقة` is a literal rendering of *sibling*; check it does not read biological",
  results_table: "🔴 Not reviewed — added after the 2026-08-11 pass",
  status_label: "🔴 Not reviewed — `الحالة` is a table column header, so it must not collide with `status_*` values",

  // Open: layout constraints, not translation problems.
  form_sending: "⚠️ Layout — submit button needs a min-width so it cannot resize mid-interaction",
  form_submit: "⚠️ Layout — see `form_sending`",
  status_not_measurable: "⚠️ Layout — status pills need a shared min-width",
};

const PREAMBLE = `# docs/ui-strings-review.md — Arabic UI String Review

> **Generated** by \`npm run export:ui-strings\` from the live database.
> Do not hand-edit: apply corrections to the database, then regenerate.
> Reviewed and corrected 2026-08-11. Verified drift-free by \`npm run check:seed-drift\`.

Every interface word on the site. No component may contain a user-facing
literal — these are the strings they resolve instead (rule 1).

**Register target:** modern professional Arabic — the tone of a well-made Gulf
banking product. Not classical/newspaper, not casual.

**Convention:** technical and brand terms (Governance, Compliance, OTP, OCR,
RTL, KYC, NDA, LinkedIn) stay in English inside Arabic text rather than being
forced into Arabic equivalents.

---

## Review status

**Reviewed and corrected 2026-08-11.** Nine strings changed; the two collisions
and the NDA convention breach were the real bugs.

| Key | Was | Now | Why |
|---|---|---|---|
| \`objective\` | الهدف | **الغاية** | Collided with \`target\` |
| \`outcome\` | النتيجة | **الحصيلة** | Collided with \`result\` |
| \`redacted_notice\` | …اتفاقية سرية | **محجوب بموجب NDA** | Technical terms stay Latin |
| \`reflection\` | تأمّل | **خلاصة** | Read contemplative, not professional |
| \`status_projected\` | متوقّع | **تقديري** | متوقّع reads "expected" — over-claims against decision 007 |
| \`status_achieved\` | تحقّق | **محقَّق** | Adjective, not verb, in a status chip |
| \`status_missed\` | لم يتحقّق | **غير محقَّق** | Adjective, not verb |
| \`skip_to_content\` | تخطَّ إلى المحتوى | **انتقل إلى المحتوى** | Diacritic unusual in UI |
| \`case_file\` | ملف حالة | **ملف المشروع** | Read clinical/legal |

Verified after applying: **no Arabic value serves more than one key, and no
English value serves more than one key**, across all 52.

### Kept as-is

\`form_email\` and \`read_linear\` are correct Arabic. Their length is a layout
problem, not a translation problem.

### Open — layout, not language

Handled in CSS rather than by shortening Arabic:

- **Submit button** needs a \`min-width\` so \`form_submit\` → \`form_sending\`
  (إرسال → جارٍ الإرسال…) cannot resize the button mid-interaction.
- **Status pills** need a shared \`min-width\` so محقَّق / غير محقَّق /
  غير قابل للقياس do not vary against each other down a table column.

Both are tokens in \`docs/design/tokens.md\`; the components that consume them
are Phase 1.

### Privacy and consent copy — added 2026-08-11, needs review

These eight are new. The four privacy claims are not ordinary interface copy: they are the site's honesty statement, and they are what an Arabic-speaking recruiter or curator reads before deciding whether to trust anything else. Flagging where I was least confident:

1. **\`privacy_no_tracking\` — "I cannot follow you between visits."** The hardest to state naturally. My rendering is **\`لا أستطيع تتبّعك بين الزيارات.\`** The problem is \`تتبّع\` — it carries a surveillance connotation closer to "stalk/trace" than the neutral technical "track", so the sentence can read as protesting too much, almost defensive. Alternatives worth weighing: \`لا يمكنني التعرّف عليك عند عودتك\` ("I can't recognise you when you return") — softer and arguably more accurate to what actually happens, since the mechanism is that the session id dies with the tab. Your call which is more honest and less loaded.

2. **\`privacy_no_ip\` — "I never store IP addresses."** Rendered **\`لا أخزّن عناوين IP إطلاقاً.\`** IP stays Latin per the convention. \`إطلاقاً\` is doing the work of "never" emphatically; check it does not tip into overclaiming.

3. **\`privacy_location\` — "I record approximate location — country and city."** Rendered **\`أسجّل الموقع التقريبي — الدولة والمدينة.\`** Straightforward, but \`أسجّل\` ("I record/register") could also be read as "I register" in a bureaucratic sense.

4. **\`privacy_ga\`** and **\`consent_message\`** both name Google Analytics in Latin, which follows the convention. \`consent_message\` is the longest string in the set — worth checking it does not wrap awkwardly in the banner at mobile width.

5. **\`consent_accept\` / \`consent_decline\`** — \`أوافق\` / \`لا شكراً\`. Decision 030 requires decline to read as no harder a choice than accept. \`لا شكراً\` is polite and natural; confirm it does not read as *more* hesitant than \`أوافق\` is affirmative, which would be a soft dark pattern in the opposite direction from the usual one.

### Not bugs

\`lang_en\` is "English" and \`lang_ar\` is "العربية" in **both** locales — each
language is labelled in its own script so the switch is legible whichever
locale you are in.

---

## The strings
`;

async function main() {
  const { data: keys, error: keysError } = await supabaseServer
    .from("ui_strings")
    .select("id, key")
    .order("key");

  if (keysError) throw new Error(`Failed to load ui_strings: ${keysError.message}`);

  const ids = (keys ?? []).map((k) => k.id);
  const { data: rows, error: rowsError } = await supabaseServer
    .from("translations")
    .select("entity_id, locale, value")
    .eq("entity_type", "ui_string")
    .eq("field", "label")
    .in("entity_id", ids);

  if (rowsError) throw new Error(`Failed to load translations: ${rowsError.message}`);

  const byEntity = new Map<string, Partial<Record<Locale, string>>>();
  for (const row of rows ?? []) {
    const entry = byEntity.get(row.entity_id) ?? {};
    entry[row.locale] = row.value;
    byEntity.set(row.entity_id, entry);
  }

  // Escape pipes so a string containing "|" cannot break the table.
  const cell = (value: string | undefined) =>
    value === undefined ? "—" : value.replace(/\|/g, "\\|");

  const lines: string[] = [
    "| key | English | Arabic | Flag |",
    "|---|---|---|---|",
  ];

  let missing = 0;
  for (const { id, key } of keys ?? []) {
    const t = byEntity.get(id) ?? {};
    if (!t.ar || !t.en) missing++;
    lines.push(
      `| \`${key}\` | ${cell(t.en)} | ${cell(t.ar)} | ${NOTES[key] ?? ""} |`,
    );
  }

  const total = (keys ?? []).length;
  const footer = [
    "",
    "---",
    "",
    `**${total} strings.** ${
      missing === 0
        ? "Every one present in both locales."
        : `⚠️ ${missing} missing a locale — the English fallback (decision 013) covers them, but they should be completed.`
    }`,
    "",
    "To apply corrections: update the database, then re-run",
    "`npm run export:ui-strings` so this document stays true. The seed migration",
    "`supabase/migrations/0003_seed_site_chrome.sql` must be updated to match, or",
    "a rebuild from scratch will reintroduce the old strings.",
    "",
  ];

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, PREAMBLE + "\n" + lines.join("\n") + footer.join("\n"), "utf8");

  console.log(`Wrote ${OUT}`);
  console.log(`${total} strings, ${missing} incomplete.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
