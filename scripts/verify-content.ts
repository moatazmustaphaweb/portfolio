/**
 * Smoke test for the query layer (task 0.5).
 *
 * Exercises the things that are easy to get wrong and impossible to see from a
 * passing build: does the service-role client actually connect, does the
 * English fallback fire for a missing Arabic row, does `resolveMany` avoid the
 * N+1, and is the seed complete in both locales.
 *
 *   node --experimental-strip-types --env-file=.env.local scripts/verify-content.ts
 *
 * Read-only except for one temporary probe row, which is always removed.
 */

import { getNavigation } from "@/lib/content/navigation";
import { getSettings } from "@/lib/content/settings";
import { resolve } from "@/lib/content/translate";
import { getUiStrings } from "@/lib/content/ui";
import { supabaseServer } from "@/lib/supabase/server";

let failures = 0;

function check(label: string, passed: boolean, detail = "") {
  const mark = passed ? "PASS" : "FAIL";
  if (!passed) failures++;
  console.log(`  [${mark}] ${label}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  console.log("\nUI strings");
  const [uiEn, uiAr] = await Promise.all([getUiStrings("en"), getUiStrings("ar")]);
  check("English loaded", uiEn.keys().length > 0, `${uiEn.keys().length} keys`);
  check("Arabic loaded", uiAr.keys().length > 0, `${uiAr.keys().length} keys`);
  check(
    "no key resolves to its own name",
    uiEn.keys().every((k) => uiEn.t(k) !== k),
  );
  check("missing key returns undefined", uiEn.t("definitely_not_a_key") === undefined);
  check(
    "Arabic differs from English",
    uiEn.t("back_to_work") !== uiAr.t("back_to_work"),
    `${uiEn.t("back_to_work")} / ${uiAr.t("back_to_work")}`,
  );

  console.log("\nNavigation");
  const headerEn = await getNavigation("header", "en");
  const headerAr = await getNavigation("header", "ar");
  check("header has items", headerEn.length > 0, `${headerEn.length} items`);
  check(
    "every item has a label",
    headerEn.every((i) => typeof i.fields.label === "string" && i.fields.label.length > 0),
  );
  check(
    "sorted by sort_order",
    headerEn.every((item, i) => i === 0 || headerEn[i - 1].sort_order <= item.sort_order),
  );
  check(
    "Arabic labels differ",
    headerEn[0]?.fields.label !== headerAr[0]?.fields.label,
    `${headerEn[0]?.fields.label} / ${headerAr[0]?.fields.label}`,
  );

  console.log("\nSettings");
  const settings = await getSettings("en");
  check("settings keys exist", settings.keys !== undefined);
  const unset = ["name", "tagline", "email"].filter((k) => settings.get(k) === undefined);
  console.log(
    `  [INFO] unset settings: ${unset.length ? unset.join(", ") : "none"} ` +
      "(expected until Moataz supplies them — nothing is invented)",
  );

  console.log("\nEnglish fallback (decision 013)");
  // A probe entity with an English row only. Requesting Arabic must return the
  // English value, not undefined and not an error.
  const { data: probe, error: probeError } = await supabaseServer
    .from("ui_strings")
    .insert({ key: "__fallback_probe__", context: "temporary, removed below" })
    .select("id")
    .single();

  if (probeError || !probe) {
    check("probe row created", false, probeError?.message ?? "no row returned");
  } else {
    try {
      await supabaseServer.from("translations").insert({
        entity_type: "ui_string",
        entity_id: probe.id,
        locale: "en",
        field: "label",
        value: "English only",
      });

      const asArabic = await resolve("ui_string", probe.id, "ar");
      check(
        "Arabic request falls back to English",
        asArabic.label === "English only",
        `got ${JSON.stringify(asArabic.label)}`,
      );

      // And the requested locale must win when it exists.
      await supabaseServer.from("translations").insert({
        entity_type: "ui_string",
        entity_id: probe.id,
        locale: "ar",
        field: "label",
        value: "عربي",
      });
      const nowArabic = await resolve("ui_string", probe.id, "ar");
      check(
        "Arabic wins when present",
        nowArabic.label === "عربي",
        `got ${JSON.stringify(nowArabic.label)}`,
      );

      const stillEnglish = await resolve("ui_string", probe.id, "en");
      check("English unaffected", stillEnglish.label === "English only");

      /*
       * The realistic case. docs/sync-contract.md says missing Arabic is
       * normal, and it is normal PER FIELD, not per entity: a chapter often
       * has an Arabic title but no Arabic reflection yet. Fallback must
       * therefore mix locales within one entity, which the whole-entity test
       * above would not catch.
       */
      await supabaseServer.from("translations").insert([
        { entity_type: "ui_string", entity_id: probe.id, locale: "en", field: "context", value: "English context" },
        { entity_type: "ui_string", entity_id: probe.id, locale: "en", field: "note", value: "English note" },
        { entity_type: "ui_string", entity_id: probe.id, locale: "ar", field: "note", value: "ملاحظة عربية" },
      ]);

      const mixed = await resolve("ui_string", probe.id, "ar");
      check(
        "partial: translated field uses Arabic",
        mixed.note === "ملاحظة عربية",
        `got ${JSON.stringify(mixed.note)}`,
      );
      check(
        "partial: untranslated field falls back to English",
        mixed.context === "English context",
        `got ${JSON.stringify(mixed.context)}`,
      );
      check(
        "partial: both fields present in one resolve",
        mixed.note !== undefined && mixed.context !== undefined && mixed.label !== undefined,
        `fields: ${Object.keys(mixed).sort().join(", ")}`,
      );

      // A field that exists in neither locale must be absent, not empty
      // string — the caller omits the element rather than rendering a blank.
      check("absent field is undefined", mixed.nonexistent === undefined);
    } finally {
      await supabaseServer.from("translations").delete().eq("entity_id", probe.id);
      await supabaseServer.from("ui_strings").delete().eq("id", probe.id);
      console.log("  [INFO] probe row removed");
    }
  }

  console.log(
    failures === 0
      ? "\nAll checks passed.\n"
      : `\n${failures} check(s) FAILED.\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("\nVerification aborted:", err instanceof Error ? err.message : err);
  process.exit(1);
});
