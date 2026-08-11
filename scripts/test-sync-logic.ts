/**
 * Tests for the sync classification and parsing rules.
 *
 *   npm run test:sync
 *
 * No credentials and no network: the rules that matter are pure functions, so
 * they can be proven before the sync ever touches Notion or Supabase. The
 * fixtures below are REAL titles and routes read from the live Notion database
 * on 2026-08-11, including all four known data issues.
 */

import {
  classifyTitle,
  findEmptyMvpRows,
  findRouteCollisions,
  OUTCOME_STATUSES,
  parseStatusItem,
  routeToSlug,
  TARGET_STATUSES,
} from "@/lib/sync/classify";

let failures = 0;

function check(label: string, passed: boolean, detail = "") {
  if (!passed) failures++;
  console.log(`  [${passed ? "PASS" : "FAIL"}] ${label}${detail ? ` — ${detail}` : ""}`);
}

function eq(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  check(label, a === e, a === e ? "" : `got ${a}, want ${e}`);
}

console.log("\nTitle classification");
eq("case file cover", classifyTitle("Case File Cover — Egypt Acquisition (Web)").kind, "case_file");
eq("mini case file", classifyTitle("Mini Case File — PideTaxi").kind, "case_file");
eq("results table", classifyTitle("Results Table — Neobiz Mobile").kind, "targets");
eq("comparison", classifyTitle("Comparison — Web vs Mobile / Onboarding").kind, "comparison");
eq("accessibility", classifyTitle("Accessibility — Bilingual, RTL & Regulatory Comprehension").kind, "accessibility");
eq("static page", classifyTitle("Landing").kind, "static");
eq("FOUNDATION skipped", classifyTitle("FOUNDATION — i18n + RTL").kind, "skip");
eq("Linear View skipped", classifyTitle("Linear View — Cervello").kind, "skip");

const chapter = classifyTitle("Chapter — Egypt / Customer Portal & Notifications");
eq("chapter kind", chapter.kind, "chapter");
eq("chapter parent", chapter.parent, "Egypt");
eq("chapter name", chapter.name, "Customer Portal & Notifications");

// A chapter whose title cannot be resolved to a parent must be skipped and
// reported, never guessed at.
const malformed = classifyTitle("Chapter — Orphan With No Separator");
eq("unresolvable chapter skipped", malformed.kind, "skip");
check("unresolvable chapter explains itself", Boolean(malformed.reason));

console.log("\nRoute → slug");
eq("cover", routeToSlug("/[locale]/work/egypt-acquisition"), { caseFile: "egypt-acquisition", slug: "egypt-acquisition" });
eq("chapter", routeToSlug("/[locale]/work/egypt-acquisition/onboarding"), { caseFile: "egypt-acquisition", slug: "onboarding" });
eq("results table annotation stripped", routeToSlug("/[locale]/work/cervello (close)"), { caseFile: "cervello", slug: "cervello" });
eq("landing", routeToSlug("/[locale]"), { caseFile: null, slug: "landing" });
eq("static", routeToSlug("/[locale]/about/philosophy"), { caseFile: null, slug: "philosophy" });
check("non-path route errors", Boolean(routeToSlug("(infrastructure)").error));
check("empty route errors", Boolean(routeToSlug("").error));

console.log("\nStatus markers — decision 007 (never default, never guess)");
eq(
  "outcome with note",
  parseStatusItem("Completion time reduction [not-measurable] — no baseline captured", OUTCOME_STATUSES),
  { label: "Completion time reduction", status: "not-measurable", note: "no baseline captured" },
);
eq(
  "outcome without note",
  parseStatusItem("1,500+ SME accounts [projected]", OUTCOME_STATUSES),
  { label: "1,500+ SME accounts", status: "projected", note: null },
);
eq(
  "target achieved",
  parseStatusItem("Cut onboarding time by 50% [achieved]", TARGET_STATUSES),
  { label: "Cut onboarding time by 50%", status: "achieved", note: null },
);

const noMarker = parseStatusItem("30% increase in conversion rate", OUTCOME_STATUSES);
check("MISSING MARKER IS AN ERROR", noMarker instanceof Error);
check(
  "  ...and the error names decision 007",
  noMarker instanceof Error && noMarker.message.includes("007"),
);
check(
  "  ...and no status is invented",
  noMarker instanceof Error && !("status" in (noMarker as object)),
);

const wrongStatus = parseStatusItem("Some outcome [confirmed]", OUTCOME_STATUSES);
check("design-file status vocabulary rejected", wrongStatus instanceof Error);

/*
 * An invented-but-plausible status must be REJECTED, not coerced to the
 * nearest valid one. [reported] appeared in the real database and reads like
 * it could mean "achieved" — which is exactly why coercion would be dangerous:
 * it would silently upgrade an unverified figure to a confirmed outcome.
 */
const reported = parseStatusItem(
  "Thousands of new business accounts through the digital journey [reported]",
  OUTCOME_STATUSES,
);
check("[reported] REJECTED, not coerced", reported instanceof Error);
check(
  "  ...error names what was found and what was expected",
  reported instanceof Error &&
    reported.message.includes("reported") &&
    reported.message.includes("[achieved]"),
);
check(
  "  ...and returns no usable status at all",
  reported instanceof Error && !("status" in (reported as object)),
);
for (const invented of ["[verified]", "[confirmed]", "[measured]", "[live]", "[done]", "[estimated]"]) {
  check(
    `  ${invented} rejected`,
    parseStatusItem(`Some figure ${invented}`, OUTCOME_STATUSES) instanceof Error,
  );
}
check(
  "target status not accepted for an outcome",
  parseStatusItem("Something [missed]", OUTCOME_STATUSES) instanceof Error,
);
check(
  "outcome status not accepted for a target",
  parseStatusItem("Something [projected]", TARGET_STATUSES) instanceof Error,
);

/*
 * Table form (contract Step 3): column 1 holds the label AND the marker,
 * column 2 holds the note. The sync splits on the unit separator before
 * parsing, so parseStatusItem only ever sees the label cell.
 */
console.log("\nTable-form outcomes — real Egypt rows");
eq(
  "label cell with marker, note in column 2",
  parseStatusItem("~15 minutes to complete an application [achieved]", OUTCOME_STATUSES),
  { label: "~15 minutes to complete an application", status: "achieved", note: null },
);
eq(
  "SLA row",
  parseStatusItem("24 hours – 3 days to an active account [projected]", OUTCOME_STATUSES),
  { label: "24 hours – 3 days to an active account", status: "projected", note: null },
);
eq(
  "projection row",
  parseStatusItem("1,500+ new SME accounts in year one [projected]", OUTCOME_STATUSES),
  { label: "1,500+ new SME accounts in year one", status: "projected", note: null },
);
// The baseline row has no marker BY DESIGN — it is not an outcome and belongs
// in Context prose (contract Step 3, "A baseline is not an outcome"). If it is
// left in the table it must still fail rather than be guessed at.
check(
  "baseline row without a marker still fails",
  parseStatusItem("2 weeks – 1 month under the paper model", OUTCOME_STATUSES) instanceof Error,
);

console.log("\nRoute collisions — the real Cervello case");
const collisions = findRouteCollisions([
  { title: "Case File Cover — Cervello", route: "/[locale]/work/cervello", kind: "case_file" },
  { title: "Case File Cover — Cervello Cloud (IoT)", route: "/[locale]/work/cervello", kind: "case_file" },
  { title: "Case File Cover — UAE Acquisition", route: "/[locale]/work/uae-acquisition", kind: "case_file" },
]);
check("collision detected", collisions.size === 1, `${collisions.size} found`);
eq(
  "both claimants named",
  collisions.get("/[locale]/work/cervello"),
  ["Case File Cover — Cervello", "Case File Cover — Cervello Cloud (IoT)"],
);
check(
  "non-colliding route not flagged",
  !collisions.has("/[locale]/work/uae-acquisition"),
);

/*
 * A results table legitimately shares its parent's route with a "(close)"
 * annotation. True of Egypt, Neobiz AND Cervello in the live database, so an
 * over-eager check would abort six valid rows. Kind is part of the collision
 * key precisely to prevent that.
 */
const annotated = findRouteCollisions([
  { title: "Case File Cover — Neobiz Mobile", route: "/[locale]/work/neobiz-mobile", kind: "case_file" },
  { title: "Results Table — Neobiz Mobile", route: "/[locale]/work/neobiz-mobile (close)", kind: "targets" },
]);
check(
  "cover + its results table is NOT a collision",
  annotated.size === 0,
  `${annotated.size} found`,
);

// But two results tables for the same case file genuinely ARE a collision.
const twoTables = findRouteCollisions([
  { title: "Results Table — Cervello", route: "/[locale]/work/cervello (close)", kind: "targets" },
  { title: "Results Table — Cervello Cloud", route: "/[locale]/work/cervello (close)", kind: "targets" },
]);
check("two results tables for one case file IS a collision", twoTables.size === 1);

// Skipped rows never participate.
const withSkips = findRouteCollisions([
  { title: "Linear View — Cervello", route: "/[locale]/work/cervello/all", kind: "skip" },
  { title: "Linear View — Egypt", route: "/[locale]/work/cervello/all", kind: "skip" },
]);
check("skipped rows cannot collide", withSkips.size === 0);

console.log("\nEmpty MVP-1 rows — the four mini case files");
const empty = findEmptyMvpRows([
  { title: "Mini Case File — PideTaxi", inMvp: true, contentReady: "Not started" },
  { title: "Mini Case File — EAST Rebrand", inMvp: true, contentReady: "Not started" },
  { title: "Case File Cover — UAE Acquisition", inMvp: true, contentReady: "Done" },
  { title: "Some Layer 3 page", inMvp: false, contentReady: "Not started" },
]);
check("two empty rows reported", empty.length === 2, empty.join("; "));
check("complete row not reported", !empty.some((e) => e.includes("UAE")));
check("non-MVP row not reported", !empty.some((e) => e.includes("Layer 3")));

console.log(
  failures === 0 ? "\nAll sync-logic checks passed.\n" : `\n${failures} FAILED.\n`,
);
process.exit(failures === 0 ? 0 : 1);
