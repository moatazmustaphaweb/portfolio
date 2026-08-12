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
  selectItemLines,
  findEmptyMvpRows,
  findRouteCollisions,
  OUTCOME_STATUSES,
  parseStatusItem,
  routeToSlug,
  TARGET_STATUSES,
} from "@/lib/sync/classify";
import {
  normalizeTitle,
  parseEntryHandle,
  parseSiblingLine,
  resolveHandleTarget,
} from "@/lib/sync/handles";
import {
  headingToSlug,
  parsePageSections,
  routeToPageKey,
} from "@/lib/sync/static-pages";

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

/*
 * The guard that the previous false-clean run depended on. These prove the
 * behaviour, not that the current data happens to match it.
 */
console.log("\nItem selection — the any-heading fallback");

// The real Egypt/Neobiz shape: a table under a heading the contract never named.
const oddHeading = new Map<string, string[]>([
  ["where this stands", ["prose line, not an item"]],
  ["every number, and where it came from::table", ["A [achieved]", "B [projected]"]],
]);
eq(
  "targets page finds a table under ANY heading",
  selectItemLines(oddHeading, true),
  { lines: ["A [achieved]", "B [projected]"], source: "table-fallback" },
);
eq(
  "outcomes do NOT use the fallback — only a named heading",
  selectItemLines(oddHeading, false),
  { lines: [], source: "none" },
);

// An expected heading wins over the fallback.
const bothTables = new Map<string, string[]>([
  ["targets::table", ["expected [achieved]"]],
  ["something else::table", ["stray [missed]"]],
]);
eq(
  "expected heading beats the fallback",
  selectItemLines(bothTables, true),
  { lines: ["expected [achieved]"], source: "table" },
);

// A table beats loose prose under the same heading — the summary-sentence bug.
const tableAndProse = new Map<string, string[]>([
  ["outcomes", ["A summary sentence spanning several figures."]],
  ["outcomes::table", ["Real outcome [achieved]"]],
]);
eq(
  "table beats prose under the same heading",
  selectItemLines(tableAndProse, false),
  { lines: ["Real outcome [achieved]"], source: "table" },
);

// A cover written with "## Results" rather than "## Outcomes".
eq(
  "outcomes accept a Results heading",
  selectItemLines(new Map([["results::table", ["Live 18 months [achieved]"]]]), false),
  { lines: ["Live 18 months [achieved]"], source: "table" },
);
// Arabic covers use النتائج, which readBody folds to `outcomes` before this runs.
eq(
  "outcomes accept the folded Arabic heading",
  selectItemLines(new Map([["outcomes::table", ["حي منذ ١٨ شهرًا [achieved]"]]]), false),
  { lines: ["حي منذ ١٨ شهرًا [achieved]"], source: "table" },
);

// Legacy prose form still parses when there is no table at all.
eq(
  "prose form still works",
  selectItemLines(new Map([["outcomes", ["Legacy [projected] — note"]]]), false),
  { lines: ["Legacy [projected] — note"], source: "prose" },
);

// Cervello: no table anywhere. Must be reportable, never silently skipped.
eq(
  "no table anywhere returns source 'none'",
  selectItemLines(new Map([["what i cannot claim", ["I don't have numbers for this."]]]), true),
  { lines: [], source: "none" },
);

console.log("\nRoute collisions — the real Cervello case");

/*
 * The live pair, with its real flags: a finished MVP-1 cover and a Layer 3 row
 * parked with no content. NOT a collision. A row deliberately excluded from
 * this release cannot block one that ships in it — it was blocking Cervello's
 * cover and all seven chapters underneath it.
 */
const parkedPair = findRouteCollisions([
  { title: "Case File Cover — Cervello", route: "/[locale]/work/cervello", kind: "case_file", inMvp: false },
  { title: "Case File Cover — Cervello Cloud (IoT)", route: "/[locale]/work/cervello", kind: "case_file", inMvp: true },
]);
check(
  "MVP-1 row + parked row is NOT a collision",
  parkedPair.size === 0,
  `${parkedPair.size} found`,
);

// Two rows that both ship still collide — the check that earns its keep.
const collisions = findRouteCollisions([
  { title: "Case File Cover — Cervello", route: "/[locale]/work/cervello", kind: "case_file", inMvp: true },
  { title: "Case File Cover — Cervello Cloud (IoT)", route: "/[locale]/work/cervello", kind: "case_file", inMvp: true },
  { title: "Case File Cover — UAE Acquisition", route: "/[locale]/work/uae-acquisition", kind: "case_file", inMvp: true },
]);
check("two MVP-1 rows DO collide", collisions.size === 1, `${collisions.size} found`);
eq(
  "both claimants named",
  collisions.get("/[locale]/work/cervello"),
  ["Case File Cover — Cervello", "Case File Cover — Cervello Cloud (IoT)"],
);
check(
  "non-colliding route not flagged",
  !collisions.has("/[locale]/work/uae-acquisition"),
);

// Two parked rows are nobody's problem yet.
const bothParked = findRouteCollisions([
  { title: "Layer 3 — Door A", route: "/[locale]/door", kind: "case_file", inMvp: false },
  { title: "Layer 3 — Door B", route: "/[locale]/door", kind: "case_file", inMvp: false },
]);
check("two parked rows are not reported", bothParked.size === 0);

/*
 * A results table legitimately shares its parent's route with a "(close)"
 * annotation. True of Egypt, Neobiz AND Cervello in the live database, so an
 * over-eager check would abort six valid rows. Kind is part of the collision
 * key precisely to prevent that.
 */
const annotated = findRouteCollisions([
  { title: "Case File Cover — Neobiz Mobile", route: "/[locale]/work/neobiz-mobile", kind: "case_file", inMvp: true },
  { title: "Results Table — Neobiz Mobile", route: "/[locale]/work/neobiz-mobile (close)", kind: "targets", inMvp: true },
]);
check(
  "cover + its results table is NOT a collision",
  annotated.size === 0,
  `${annotated.size} found`,
);

// But two results tables for the same case file genuinely ARE a collision.
const twoTables = findRouteCollisions([
  { title: "Results Table — Cervello", route: "/[locale]/work/cervello (close)", kind: "targets", inMvp: true },
  { title: "Results Table — Cervello Cloud", route: "/[locale]/work/cervello (close)", kind: "targets", inMvp: true },
]);
check("two results tables for one case file IS a collision", twoTables.size === 1);

// Skipped rows never participate.
const withSkips = findRouteCollisions([
  { title: "Linear View — Cervello", route: "/[locale]/work/cervello/all", kind: "skip", inMvp: true },
  { title: "Linear View — Egypt", route: "/[locale]/work/cervello/all", kind: "skip", inMvp: true },
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

/* -------------------------------------------------------------------------
 * Entry handles and siblings.
 *
 * Every string below is copied verbatim from the live Notion covers on
 * 2026-08-12. The point is to prove the parser against what is actually
 * written, including the two forms that do NOT resolve — those are the cases
 * where a looser parser would invent a destination.
 * ---------------------------------------------------------------------- */

console.log("\nEntry handles");

const cervelloHandle = parseEntryHandle(
  "If you want the hardest architectural problem → a single-customer installation became a multi-tenant platform, and every assumption about ownership, visibility and billing had to be rebuilt. Chapter 1.",
);
eq(
  "invitation split on the arrow",
  cervelloHandle?.invitation,
  "If you want the hardest architectural problem",
);
eq("positional pointer found", cervelloHandle?.pointer, "Chapter 1.");

const egyptHandle = parseEntryHandle(
  '"Show me the hardest decision." → The language fight. I proposed Arabic-first and lost. I proposed switching language anywhere in the journey and lost again. Then I found the one place where neither objection held, and won that. Onboarding journey → Decision.',
);
eq("quotes stripped", egyptHandle?.invitation, "Show me the hardest decision.");
check(
  "payoff kept whole, arrows and all",
  egyptHandle?.payoff.startsWith("The language fight.") === true,
  egyptHandle?.payoff.slice(0, 30),
);
eq(
  "pointer is the LAST sentence, not the first arrow",
  egyptHandle?.pointer,
  "Onboarding journey → Decision.",
);

const uaeHandle = parseEntryHandle(
  "If you want the decision I'm proudest of → remote verification. Every Key Individual must verify and sign, but only one person applies. I proposed pushing verification to the person instead of pushing a person to them — which removed the Relationship Manager from the journey entirely.",
);
check("handle with no destination parses", uaeHandle !== null);
eq("...and reports no pointer", uaeHandle?.pointer, null);

eq("a paragraph with no arrow is not a handle", parseEntryHandle("Just a sentence."), null);

console.log("\nResolving pointers to chapters");

const egyptChapters = [
  { slug: "onboarding", title: "Onboarding Journey", sortOrder: 1, isChapter: true },
  { slug: "workflow", title: "Application Workflow", sortOrder: 2, isChapter: true },
  { slug: "portal", title: "Customer Portal & Notifications", sortOrder: 3, isChapter: true },
  { slug: "fulfilment", title: "Fulfilment & AOF", sortOrder: 4, isChapter: true },
  { slug: "accessibility", title: "Accessibility — Bilingual, RTL & Regulatory Comprehension", sortOrder: 0, isChapter: false },
];

eq(
  "title match ignores case",
  resolveHandleTarget("Onboarding journey → Decision.", egyptChapters),
  "onboarding",
);
eq(
  "matches on the segment before the arrow",
  resolveHandleTarget("Application workflow → Craft.", egyptChapters),
  "workflow",
);
eq(
  "a results table is NOT guessed at a chapter",
  resolveHandleTarget("Results table → What broke.", egyptChapters),
  null,
);
eq("no pointer resolves to nothing", resolveHandleTarget(null, egyptChapters), null);

const cervelloChapters = [
  { slug: "on-premises-to-cloud", title: "On-Premises to Cloud", sortOrder: 1, isChapter: true },
  { slug: "permission-architecture", title: "Permission Architecture", sortOrder: 2, isChapter: true },
  { slug: "method", title: "Method & Design System", sortOrder: 3, isChapter: true },
];
eq(
  "positional pointer resolves by sort_order",
  resolveHandleTarget("Chapter 2.", cervelloChapters),
  "permission-architecture",
);
eq(
  "out-of-range chapter number resolves to nothing",
  resolveHandleTarget("Chapter 9.", cervelloChapters),
  null,
);

// A substring match would let this claim UAE's "Mobile Onboarding Journey".
eq(
  "no substring matching across differing titles",
  resolveHandleTarget("Onboarding → Decision.", [
    { slug: "onboarding", title: "Mobile Onboarding Journey", sortOrder: 1, isChapter: true },
  ]),
  null,
);

console.log("\nSibling case files");

const uaeSiblings = parseSiblingLine(
  "Sibling case file: [Egypt Acquisition (Web)] and [Neobiz Mobile — Egypt] — the same requirement, in a market without the infrastructure.",
);
eq("both siblings found", uaeSiblings?.titles, [
  "Egypt Acquisition (Web)",
  "Neobiz Mobile — Egypt",
]);
eq(
  "note taken from after the last bracket",
  uaeSiblings?.note,
  "the same requirement, in a market without the infrastructure.",
);

// The real reason normalizeTitle exists: the cover and the case file disagree
// on punctuation, and an exact match would drop this link in silence.
eq(
  "em-dash title matches parenthesised title",
  normalizeTitle("Neobiz Mobile — Egypt"),
  normalizeTitle("Neobiz Mobile (Egypt)"),
);
check(
  "different case files still do not collide",
  normalizeTitle("Egypt Acquisition (Web)") !== normalizeTitle("Neobiz Mobile (Egypt)"),
);

// Egypt's trailing line points at a CHAPTER. It must not become a sibling.
eq(
  "cross-cutting line is not a sibling declaration",
  parseSiblingLine(
    "Cross-cutting: Accessibility — Bilingual, RTL & Regulatory Comprehension — the informed-consent argument that decided the language architecture, and the RTL contribution to the bank's shared design system.",
  ),
  null,
);
eq(
  "a sibling prefix with no bracketed title is not a declaration",
  parseSiblingLine("Sibling case file: coming soon"),
  null,
);

/* -------------------------------------------------------------------------
 * Static pages. Real headings from the live Notion pages, 2026-08-12.
 * ---------------------------------------------------------------------- */

console.log("\nStatic pages");

eq("route → page key", routeToPageKey("/[locale]/about"), "about");
eq("nested route keeps its path", routeToPageKey("/[locale]/about/philosophy"), "about/philosophy");
eq("route annotation stripped", routeToPageKey("/[locale]/contact (close)"), "contact");
eq("a non-locale route is not a page", routeToPageKey("/api/health"), null);

eq("heading → slug", headingToSlug("What that year actually taught me"), "what-that-year-actually-taught-me");
eq("apostrophes dropped, not hyphenated", headingToSlug("The Artist's Book"), "the-artists-book");
eq("arabic headings survive slugging", headingToSlug("عن مُعتز"), "عن-مُعتز");

const about = parsePageSections(
  [
    { heading: "About", lines: ["I'm here to make things easier for people.", "If you have a good idea, I'd like to help."] },
    { heading: "Now", lines: ["I'm a product designer in Dubai."] },
    { heading: "Before", lines: ["I studied at the Faculty of Art Education in Cairo."] },
    { heading: "The Artist's Book", lines: ["These were children who couldn't hear."] },
  ],
  "About",
);
eq("title-echo heading becomes the lede, not a section", about.sections.length, 3);
check(
  "...and its paragraphs are kept",
  about.intro.startsWith("I'm here to make things easier"),
  about.intro.slice(0, 30),
);
eq("paragraphs joined with a blank line", about.intro.includes("\n\n"), true);
eq("section order preserved", about.sections.map((s) => s.slug), [
  "now",
  "before",
  "the-artists-book",
]);
eq("heading text kept verbatim for rendering", about.sections[2].heading, "The Artist's Book");

// Notion titles this page "Philosophy (Foundations)" and opens with an H2
// "Philosophy" — an equality test would miss the echo and print a section
// heading identical to the page title.
const phil = parsePageSections(
  [
    { heading: "Philosophy", lines: [] },
    { heading: "To design is to build, not to draw", lines: ["I have had the same conversation for ten years."] },
  ],
  "Philosophy (Foundations)",
);
eq("parenthetical in the page name still counts as an echo", phil.sections.length, 1);
eq("...and an empty echo yields no intro", phil.intro, "");

// (page, slug) is unique — a repeated heading must not collide or vanish.
const dupes = parsePageSections(
  [
    { heading: "Coming", lines: ["One."] },
    { heading: "Coming", lines: ["Two."] },
  ],
  "Systems",
);
eq("duplicate headings are suffixed, not dropped", dupes.sections.map((s) => s.slug), [
  "coming",
  "coming-2",
]);

// Prose before any heading is lede material, not a headless section.
const leadIn = parsePageSections(
  [{ heading: "", lines: ["An opening line."] }, { heading: "Now", lines: ["Body."] }],
  "About",
);
eq("prose before any heading becomes the intro", leadIn.intro, "An opening line.");
eq("...and does not become a section", leadIn.sections.length, 1);

console.log(
  failures === 0 ? "\nAll sync-logic checks passed.\n" : `\n${failures} FAILED.\n`,
);
process.exit(failures === 0 ? 0 : 1);
