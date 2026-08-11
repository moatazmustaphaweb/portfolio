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
