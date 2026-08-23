/**
 * Probe: the per-PAGE and per-CHAPTER English fallback added by migrations
 * 0048 and 0049.
 *
 *   npx tsx --conditions=react-server --env-file=.env.local scripts/probe-locale-fallback.ts
 *
 * ── WHY THIS EXISTS AS A SCRIPT AND NOT A NOTE IN A STATUS ENTRY ────────────
 *
 * After task `015230826` every page and every chapter with decisions has an
 * Arabic sequence, so **the fallback branch is unreachable from live content**
 * — there is nothing to point a browser at that proves it works. Reasoning
 * about three lines of code is not verification, and "not tested" and "working"
 * have been conflated on this project before.
 *
 * So it writes a probe, reads it back through the real `lib/content` path, and
 * deletes it. Same shape as `verify-content.ts`'s decision-013 probe.
 *
 * ⚠️ IT WRITES TO THE LIVE DATABASE AND CLEANS UP AFTER ITSELF, including on
 * failure. The page probe uses a page key nothing routes to. The decision probe
 * has to attach to a PUBLISHED chapter — `getChapter` refuses a draft — so it
 * sits on `cervello/method`, which has zero decisions of its own, for the
 * second or two between the write and the delete.
 */

import { supabaseServer } from "@/lib/supabase/server";
import { getChapter } from "@/lib/content/chapters";
import { getPageSections } from "@/lib/content/pages";

const PROBE_PAGE = "probe/locale-fallback";
const PROBE_HEADING = "PROBE — English only";
const PROBE_DECISION = "PROBE — English-only decision";

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  if (!ok) failures++;
  console.log(`  [${ok ? "PASS" : "FAIL"}] ${label}${detail ? ` — ${detail}` : ""}`);
}

async function cleanUpPage() {
  const { data } = await supabaseServer
    .from("page_sections")
    .select("id")
    .eq("page", PROBE_PAGE);
  const ids = (data ?? []).map((r) => r.id);
  if (ids.length > 0) {
    await supabaseServer
      .from("translations")
      .delete()
      .eq("entity_type", "page_section")
      .in("entity_id", ids);
    await supabaseServer.from("page_sections").delete().eq("page", PROBE_PAGE);
  }
  return ids.length;
}

async function main() {
  console.log("\nPer-page fallback (page_sections, migration 0048)\n");

  await cleanUpPage(); // in case an earlier run died mid-probe

  try {
    const { data: row, error } = await supabaseServer
      .from("page_sections")
      .insert({ page: PROBE_PAGE, slug: "probe", sort_order: 0, kind: "prose", locale: "en" })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "no row");

    await supabaseServer.from("translations").insert([
      { entity_type: "page_section", entity_id: row.id, locale: "en", field: "heading", value: PROBE_HEADING },
      { entity_type: "page_section", entity_id: row.id, locale: "en", field: "body", value: "English body." },
    ]);

    const ar = await getPageSections(PROBE_PAGE, "ar");
    check("a page with no Arabic serves the English sequence", ar.sections.length === 1,
      `${ar.sections.length} section(s)`);
    check("...with the English text", ar.sections[0]?.fields.heading === PROBE_HEADING,
      String(ar.sections[0]?.fields.heading));
    check("...marked as English so decision 053 can mark it",
      ar.sections[0]?.fieldLocales.body === "en",
      String(ar.sections[0]?.fieldLocales.body));

    // And the other direction: an Arabic row makes the English one invisible.
    const { data: arRow } = await supabaseServer
      .from("page_sections")
      .insert({ page: PROBE_PAGE, slug: "بروب", sort_order: 0, kind: "prose", locale: "ar" })
      .select("id")
      .single();
    if (arRow) {
      await supabaseServer.from("translations").insert([
        { entity_type: "page_section", entity_id: arRow.id, locale: "ar", field: "heading", value: "بروب" },
        { entity_type: "page_section", entity_id: arRow.id, locale: "ar", field: "body", value: "نص عربي." },
      ]);
      /*
       * `getPageSections` is wrapped in React `cache`, which memoises per
       * REQUEST. Outside a request — which is where this script runs — it is a
       * passthrough, so this second call really does re-query. The two results
       * below differing is the evidence of that, not an assumption about it.
       */
      const ar2 = await getPageSections(PROBE_PAGE, "ar");
      check("an Arabic sequence replaces the English one, not adds to it",
        ar2.sections.length === 1, `${ar2.sections.length} section(s)`);
      check("...and it is the Arabic row", ar2.sections[0]?.fields.heading === "بروب",
        String(ar2.sections[0]?.fields.heading));
      const en2 = await getPageSections(PROBE_PAGE, "en");
      check("English is unaffected", en2.sections[0]?.fields.heading === PROBE_HEADING,
        String(en2.sections[0]?.fields.heading));
    }
  } finally {
    const removed = await cleanUpPage();
    console.log(`  [INFO] probe page removed (${removed} row(s))`);
  }

  console.log("\nPer-chapter fallback (decisions, migration 0049)\n");

  const { data: chapter } = await supabaseServer
    .from("chapters")
    .select("id, case_files!inner(slug)")
    .eq("slug", "method")
    .maybeSingle();

  if (!chapter) {
    console.log("  [SKIP] cervello/method not found");
  } else {
    let probeId: string | null = null;
    try {
      const { data: dec, error } = await supabaseServer
        .from("decisions")
        .insert({ chapter_id: chapter.id, sort_order: 0, locale: "en" })
        .select("id")
        .single();
      if (error || !dec) throw new Error(error?.message ?? "no row");
      probeId = dec.id;

      await supabaseServer.from("translations").insert([
        { entity_type: "decision", entity_id: dec.id, locale: "en", field: "name", value: PROBE_DECISION },
      ]);

      const ar = await getChapter("cervello", "method", "ar");
      check("a chapter with no Arabic decisions serves the English list",
        ar?.decisions.length === 1, `${ar?.decisions.length} decision(s)`);
      check("...with the English name", ar?.decisions[0]?.fields.name === PROBE_DECISION,
        String(ar?.decisions[0]?.fields.name));
      check("...marked as English", ar?.decisions[0]?.fieldLocales.name === "en",
        String(ar?.decisions[0]?.fieldLocales.name));
    } finally {
      if (probeId) {
        await supabaseServer.from("translations").delete()
          .eq("entity_type", "decision").eq("entity_id", probeId);
        await supabaseServer.from("decisions").delete().eq("id", probeId);
        const { data: left } = await supabaseServer
          .from("decisions").select("id").eq("id", probeId);
        // Read back after writing — a delete reporting success is not evidence.
        console.log(`  [INFO] probe decision removed (${(left ?? []).length} left)`);
      }
    }
  }

  console.log(failures === 0 ? "\nAll fallback probes passed.\n" : `\n${failures} FAILED.\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("\nProbe aborted:", err instanceof Error ? err.message : err);
  process.exit(1);
});
