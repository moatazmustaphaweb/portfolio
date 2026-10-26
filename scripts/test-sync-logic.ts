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
import { readDeviceProperty, resolveDeviceFrame } from "@/lib/sync/device-frame";
import { deviceFrameOrDefault } from "@/lib/media/device-frame";
import { readImageLayoutProperty, resolveImageLayout } from "@/lib/sync/image-layout";
import { imageLayoutOrDefault } from "@/lib/media/image-layout";
import {
  dimensionPatch,
  getinfoUrl,
  needsDimensions,
  parseGetinfo,
} from "@/lib/sync/media-dimensions";
import {
  finalizeRevalidatePaths,
  parseRevalidateUrls,
  pathsForCaseFile,
  pathsForChapter,
  pathsForPage,
  postRevalidate,
} from "@/lib/sync/revalidate";
import {
  invalidTagMessage,
  parseImageTag,
  tagWarningMessage,
  type NotionRun,
} from "@/lib/sync/image-tags";

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

/* -------------------------------- page-section slug aliases (0050) ------- */

// The Arabic Systems page. Its headings slug to Arabic, and two of them carry
// a binding the page composition makes by slug — the evidence cards. Both
// slugs below were produced by running headingToSlug, not typed.
const systemsAr = parsePageSections(
  [
    { heading: "ما بنيته فعلاً", lines: ["أنظمة."] },
    { heading: "العمل داخل نظام لا أملكه", lines: ["مشرق."] },
    { heading: "الأنماط التي تتكرر عبر العمل", lines: ["أنماط."] },
  ],
  "النسخة العربية — الأنظمة",
  new Map([
    ["ما-بنيته-فعلاً", "what-ive-actually-built"],
    ["العمل-داخل-نظام-لا-أملكه", "working-inside-a-system-i-didnt-own"],
  ]),
);
eq("an aliased Arabic heading takes the structural slug", systemsAr.sections.map((s) => s.slug), [
  "what-ive-actually-built",
  "working-inside-a-system-i-didnt-own",
  // No alias: the slug stays in the language the heading is written in, which
  // is the right anchor id for that page and binds to nothing.
  "الأنماط-التي-تتكرر-عبر-العمل",
]);
eq(
  "...and the DERIVED slugs are reported so a stale alias can be caught",
  systemsAr.derived,
  ["ما-بنيته-فعلاً", "العمل-داخل-نظام-لا-أملكه", "الأنماط-التي-تتكرر-عبر-العمل"],
);

// An alias must not be able to steal a slug a heading on the same page already
// claimed. It competes on the same terms as a derived slug and loses to
// whichever came first, rather than overwriting it.
const aliasCollision = parsePageSections(
  [
    { heading: "Coming", lines: ["First."] },
    { heading: "قادم", lines: ["Second."] },
  ],
  "Systems",
  new Map([["قادم", "coming"]]),
);
eq("an alias cannot overwrite a slug already claimed", aliasCollision.sections.map((s) => s.slug), [
  "coming",
  "coming-2",
]);

// No alias map at all is the normal case: four of the five pages have none.
const noAliases = parsePageSections([{ heading: "Now", lines: ["Body."] }], "About");
eq("no alias table leaves the derived slug alone", noAliases.sections[0].slug, "now");

/* ------------------------------ chapter Device -> device_frame (0062) ---- */

console.log("\nChapter Device property (task 003221026)");

const sel = (name: string | null) => ({ type: "select", select: name === null ? null : { name } });
const txt = (text: string) => ({ type: "rich_text", rich_text: text ? [{ plain_text: text }] : [] });
const frameOf = (prop: unknown) => resolveDeviceFrame(readDeviceProperty(prop));

eq("select Android -> android", frameOf(sel("Android")), { frame: "android", problem: null });
eq("select iPhone -> iphone", frameOf(sel("iPhone")), { frame: "iphone", problem: null });
eq("case-insensitive and trimmed", frameOf(sel("  ANDROID ")).frame, "android");
eq("text Android -> android", frameOf(txt("android")), { frame: "android", problem: null });
eq("empty select -> iphone, no notice", frameOf(sel(null)), { frame: "iphone", problem: null });
eq("empty text -> iphone, no notice", frameOf(txt("")), { frame: "iphone", problem: null });

// The property does not exist on the database yet. Must not throw.
eq("property ABSENT reads as absent", readDeviceProperty(undefined), { state: "absent" });
eq("property ABSENT -> iphone, no per-row notice", frameOf(undefined), { frame: "iphone", problem: null });

// Defaulted AND reported — never silently mapped.
const pixel = frameOf(sel("Pixel"));
eq("unknown value -> iphone", pixel.frame, "iphone");
check("unknown value IS REPORTED, naming the value", pixel.problem?.includes('"Pixel"') === true, String(pixel.problem));
check("iOS is not silently read as iPhone", frameOf(sel("iOS")).problem !== null);

const both = frameOf({ type: "multi_select", multi_select: [{ name: "iPhone" }, { name: "Android" }] });
check("two multi_select options are reported, not chosen between", both.problem !== null, String(both.problem));
eq("one multi_select option is read", frameOf({ type: "multi_select", multi_select: [{ name: "Android" }] }).frame, "android");

const box = frameOf({ type: "checkbox", checkbox: true });
check("an unsupported property type is reported", box.problem?.includes("checkbox") === true, String(box.problem));

// Content-layer default: before 0062 the column is simply missing from the row.
eq("content: undefined column -> iphone", deviceFrameOrDefault(undefined), "iphone");
eq("content: null -> iphone", deviceFrameOrDefault(null), "iphone");
eq("content: android kept", deviceFrameOrDefault("android"), "android");
eq("content: junk -> iphone", deviceFrameOrDefault("Android"), "iphone");

/* --------------------------- chapter Image layout -> image_layout (0063) -- */

console.log("\nChapter Image layout property (task 004221026)");

const layoutOf = (prop: unknown) => resolveImageLayout(readImageLayoutProperty(prop));

eq("select Grid -> grid", layoutOf(sel("Grid")), { layout: "grid", problem: null });
eq("select Stacked -> stacked", layoutOf(sel("Stacked")), { layout: "stacked", problem: null });
eq("layout case-insensitive and trimmed", layoutOf(sel("  GRID ")).layout, "grid");
eq("text grid -> grid", layoutOf(txt("grid")), { layout: "grid", problem: null });
// Decision 068, task 012261026, migration 0066.
eq("select Editorial -> editorial", layoutOf(sel("Editorial")), { layout: "editorial", problem: null });
eq("editorial case-insensitive and trimmed", layoutOf(sel(" EDITORIAL ")).layout, "editorial");
check("a typo (Editoral) is reported, not read as Editorial", layoutOf(sel("Editoral")).problem !== null);
eq("empty layout select -> stacked, no notice", layoutOf(sel(null)), { layout: "stacked", problem: null });
eq("empty layout text -> stacked, no notice", layoutOf(txt("")), { layout: "stacked", problem: null });

// The property does not exist on the database yet. Must not throw.
eq("layout property ABSENT reads as absent", readImageLayoutProperty(undefined), { state: "absent" });
eq("layout property ABSENT -> stacked, no per-row notice", layoutOf(undefined), { layout: "stacked", problem: null });

// Defaulted AND reported — never silently mapped.
const carousel = layoutOf(sel("Carousel"));
eq("unknown layout -> stacked", carousel.layout, "stacked");
check("unknown layout IS REPORTED, naming the value", carousel.problem?.includes('"Carousel"') === true, String(carousel.problem));
check("a typo (Gird) is not silently read as Grid", layoutOf(sel("Gird")).problem !== null);

const bothLayouts = layoutOf({ type: "multi_select", multi_select: [{ name: "Stacked" }, { name: "Grid" }] });
check("two layout options are reported, not chosen between", bothLayouts.problem !== null, String(bothLayouts.problem));
eq("one layout multi_select option is read", layoutOf({ type: "multi_select", multi_select: [{ name: "Grid" }] }).layout, "grid");

const layoutBox = layoutOf({ type: "checkbox", checkbox: true });
check("an unsupported layout property type is reported", layoutBox.problem?.includes("checkbox") === true, String(layoutBox.problem));
check("the layout notice names Image layout, not Device", layoutBox.problem?.startsWith("Image layout") === true, String(layoutBox.problem));

// Content-layer default: before 0063 the column is simply missing from the row.
eq("content: undefined layout column -> stacked", imageLayoutOrDefault(undefined), "stacked");
eq("content: null layout -> stacked", imageLayoutOrDefault(null), "stacked");
eq("content: grid kept", imageLayoutOrDefault("grid"), "grid");
eq("content: editorial kept", imageLayoutOrDefault("editorial"), "editorial");
eq("content: junk layout -> stacked", imageLayoutOrDefault("Grid"), "stacked");

console.log("\nMedia dimensions from Cloudinary (007231026)");

// The URL: slashes kept as folder separators, everything else percent-encoded.
eq("getinfo url, plain id",
  getinfoUrl("vewhrkzj", "PideTaxi/iOS/booking-payment"),
  "https://res.cloudinary.com/vewhrkzj/image/upload/fl_getinfo/PideTaxi/iOS/booking-payment");
eq("getinfo url encodes spaces, keeps folders",
  getinfoUrl("vewhrkzj", "Neobiz/Arabic/Post-Submit/Scheduling visit/screen (1)"),
  "https://res.cloudinary.com/vewhrkzj/image/upload/fl_getinfo/Neobiz/Arabic/Post-Submit/Scheduling%20visit/screen%20(1)");
check("getinfo url encodes ? and # so they cannot truncate the path",
  !getinfoUrl("c", "a?b#c").includes("?") && !getinfoUrl("c", "a?b#c").includes("#"));

// Parsing: `input` (the original) and nothing else.
eq("parse: input read",
  parseGetinfo({ input: { width: 750, height: 1624 }, output: { width: 375, height: 812 } }),
  { width: 750, height: 1624 });
check("parse: OUTPUT IS NOT A FALLBACK for a missing input",
  "error" in parseGetinfo({ output: { width: 720, height: 1440 } }));
check("parse: null body is an error", "error" in parseGetinfo(null));
check("parse: string body is an error", "error" in parseGetinfo("<html>"));
check("parse: string dimensions rejected, not coerced",
  "error" in parseGetinfo({ input: { width: "750", height: "1624" } }));
check("parse: zero width rejected", "error" in parseGetinfo({ input: { width: 0, height: 1624 } }));
check("parse: fractional height rejected", "error" in parseGetinfo({ input: { width: 750, height: 1624.5 } }));
check("parse: one dimension missing rejected", "error" in parseGetinfo({ input: { width: 750 } }));

// When to fetch.
check("needs: no row yet", needsDimensions(null));
check("needs: both NULL", needsDimensions({ width: null, height: null }));
check("needs: height NULL only", needsDimensions({ width: 750, height: null }));
check("needs: width NULL only", needsDimensions({ width: null, height: 1624 }));
check("needs: both set -> NO fetch", !needsDimensions({ width: 750, height: 1624 }));

// NEVER OVERWRITE a non-NULL dimension.
const fetched = { width: 720, height: 1440 };
eq("patch: new row gets both", dimensionPatch(null, fetched), { width: 720, height: 1440 });
eq("patch: both NULL gets both", dimensionPatch({ width: null, height: null }, fetched), { width: 720, height: 1440 });
eq("patch: width set -> ONLY height written", dimensionPatch({ width: 786, height: null }, fetched), { height: 1440 });
eq("patch: height set -> ONLY width written", dimensionPatch({ width: null, height: 1700 }, fetched), { width: 720 });
eq("patch: both set -> NOTHING written, even when Cloudinary disagrees",
  dimensionPatch({ width: 786, height: 1700 }, fetched), null);

console.log("\nRevalidate paths (decision 061 item 6)");
eq("case file: cover, linear, results", pathsForCaseFile("uae-onboarding"),
  ["/work/uae-onboarding", "/work/uae-onboarding/all", "/work/uae-onboarding/results"]);
eq("chapter: own route, cover, linear", pathsForChapter("uae-onboarding", "comparison"),
  ["/work/uae-onboarding/comparison", "/work/uae-onboarding", "/work/uae-onboarding/all"]);
eq("page: about/philosophy", pathsForPage("about/philosophy"), ["/about/philosophy"]);
eq("page: stray slashes trimmed", pathsForPage("/systems/"), ["/systems"]);
eq("nothing written -> nothing sent", finalizeRevalidatePaths([]), []);
eq("anything written -> adds / and /work, dedupes, sorts",
  finalizeRevalidatePaths([...pathsForCaseFile("x"), ...pathsForChapter("x", "a"), "/contact"]),
  ["/", "/contact", "/work", "/work/x", "/work/x/a", "/work/x/all", "/work/x/results"]);
let threw = false;
try { finalizeRevalidatePaths(["/en/work/x"]); } catch { threw = true; }
check("a localised path is refused (the route adds the locale itself)", threw);
threw = false;
try { finalizeRevalidatePaths(["work/x"]); } catch { threw = true; }
check("a path without a leading slash is refused", threw);
eq("urls: split, trimmed, trailing slash removed",
  parseRevalidateUrls(" https://www.moatazmustapha.com/ ,https://preview.moatazmustapha.com,, "),
  ["https://www.moatazmustapha.com", "https://preview.moatazmustapha.com"]);
eq("urls: unset -> none", parseRevalidateUrls(undefined), []);

async function revalidatePostChecks() {
  let sent: { url: string; body: unknown } | null = null;
  const okFetch = (async (url: string, init: RequestInit) => {
    sent = { url, body: JSON.parse(String(init.body)) };
    return new Response(JSON.stringify({ revalidated: ["/en", "/ar"] }), { status: 200 });
  }) as unknown as typeof fetch;
  const ok = await postRevalidate("https://a.example", "s3cret", ["/"], okFetch);
  check("post: ok on 200", ok.ok, ok.detail);
  eq("post: url and body", sent, { url: "https://a.example/api/revalidate", body: { secret: "s3cret", paths: ["/"] } });
  check("post: detail never carries the secret", !ok.detail.includes("s3cret"));

  const bad = await postRevalidate("https://a.example", "s3cret", ["/"],
    (async () => new Response('{"error":"Unauthorized"}', { status: 401 })) as unknown as typeof fetch);
  check("post: 401 -> not ok, no throw", !bad.ok && bad.detail.startsWith("HTTP 401"), bad.detail);

  const down = await postRevalidate("https://a.example", "s3cret", ["/"],
    (async () => { throw new Error("ECONNREFUSED"); }) as unknown as typeof fetch);
  check("post: network error -> not ok, no throw", !down.ok && down.detail === "ECONNREFUSED", down.detail);
}

/* --------------------------------- image tag [frame] none (decision 069) ---- */

console.log("\nImage tag [frame] (task 013261026, decision 069)");

{
  const code = (t: string): NotionRun => ({ plain_text: t, annotations: { code: true } });
  const gap: NotionRun = { plain_text: " ", annotations: { code: false } };
  const tagOf = (...spans: string[]): NotionRun[] =>
    spans.flatMap((sp, i) => (i === 0 ? [code(sp)] : [gap, code(sp)]));
  const base = ["[cld] Egypt/FATCA forms (v2)", "[alt] The FATCA form", "[caption] FATCA, as a form"];

  const plain = parseImageTag(tagOf(...base));
  eq("three spans: still a usable tag", plain.kind, "tag");
  if (plain.kind === "tag") {
    check("three spans: no frame flag at all", !("frame" in plain.tag), JSON.stringify(plain.tag));
    eq("three spans: no warnings", plain.warnings, []);
  }

  const none = parseImageTag(tagOf(...base, "[frame] none"));
  eq("[frame] none -> frame: none", none.kind === "tag" ? none.tag.frame : none.kind, "none");
  eq("[frame] none -> no warnings", none.kind === "tag" ? none.warnings : none.kind, []);
  eq("[frame] none keeps cld/alt/caption verbatim", none.kind === "tag" ? none.tag : null, {
    cld: "Egypt/FATCA forms (v2)", alt: "The FATCA form", caption: "FATCA, as a form", frame: "none",
  });

  for (const v of ["None", "NONE", "  none  ", "nOnE"]) {
    const r = parseImageTag(tagOf(...base, `[frame] ${v}`));
    eq(`case-insensitive and trimmed: ${JSON.stringify(v)}`, r.kind === "tag" ? r.tag.frame : r.kind, "none");
  }

  // Order of the spans after [cld] is free.
  const early = parseImageTag(tagOf(base[0], "[frame] none", base[1], base[2]));
  eq("[frame] between [cld] and [alt] is read", early.kind === "tag" ? early.tag.frame : early.kind, "none");

  // Unrecognised value: tag still usable, flag absent, and REPORTED.
  for (const v of ["laptop", "off", "no", ""]) {
    const r = parseImageTag(tagOf(...base, `[frame] ${v}`.trimEnd()));
    eq(`[frame] ${JSON.stringify(v)} -> still a usable tag`, r.kind, "tag");
    if (r.kind === "tag") {
      check(`[frame] ${JSON.stringify(v)} -> no frame flag`, r.tag.frame === undefined, JSON.stringify(r.tag));
      check(
        `[frame] ${JSON.stringify(v)} -> one warning naming the value`,
        r.warnings.length === 1 && r.warnings[0].includes(JSON.stringify(v)),
        JSON.stringify(r.warnings),
      );
    }
  }

  const odd = parseImageTag(tagOf(...base, "[frame] laptop"));
  if (odd.kind === "tag") {
    const msg = tagWarningMessage("Chapter — Egypt / Onboarding Journey", odd.tag.cld, odd.warnings[0]);
    check("warning notice names the chapter", msg.includes("Chapter — Egypt / Onboarding Journey"), msg);
    check("warning notice names the value", msg.includes('"laptop"'), msg);
    check("warning notice names the image", msg.includes('"Egypt/FATCA forms (v2)"'), msg);
  }

  // Duplicate [frame]: same handling as any repeated key — the tag is unusable.
  const dup = parseImageTag(tagOf(...base, "[frame] none", "[frame] none"));
  eq("duplicate [frame] -> invalid", dup.kind, "invalid");
  if (dup.kind === "invalid") {
    check("duplicate [frame] names the key", dup.problems.some((p) => p.includes("[frame] appears twice")), JSON.stringify(dup.problems));
    check("duplicate [frame] message keeps the cld", invalidTagMessage("X", dup).includes("Egypt/FATCA forms (v2)"));
  }

  // [frame] does not rescue a broken tag, and does not add noise to one.
  const noAlt = parseImageTag(tagOf(base[0], base[2], "[frame] laptop"));
  eq("missing [alt] with [frame] -> still invalid", noAlt.kind, "invalid");
  if (noAlt.kind === "invalid") {
    check("broken tag reports its real problem, not a frame warning",
      noAlt.problems.every((p) => !p.includes("laptop")), JSON.stringify(noAlt.problems));
  }

  // [frame] alone is not a tag opener: the first code span must be [cld].
  eq("a paragraph opening with [frame] is prose", parseImageTag(tagOf("[frame] none")).kind, "prose");

  // An unknown key is still refused, and the message lists [frame] as known.
  const junk = parseImageTag(tagOf(...base, "[device] laptop"));
  eq("unknown key still invalid", junk.kind, "invalid");
  if (junk.kind === "invalid") {
    check("unknown-key message lists [frame]", junk.problems.some((p) => p.includes("[frame]")), JSON.stringify(junk.problems));
  }
}

/* ------------------------------- image tag [place] beside (decision 070) ---- */

console.log("\nImage tag [place] (task 014261026, decision 070)");

{
  const code = (t: string): NotionRun => ({ plain_text: t, annotations: { code: true } });
  const gap: NotionRun = { plain_text: " ", annotations: { code: false } };
  const tagOf = (...spans: string[]): NotionRun[] =>
    spans.flatMap((sp, i) => (i === 0 ? [code(sp)] : [gap, code(sp)]));
  const base = ["[cld] Egypt/AOF cover (v1)", "[alt] The AOF cover", "[caption] The cover page"];

  const plain = parseImageTag(tagOf(...base));
  if (plain.kind === "tag") {
    check("three spans: no place flag at all", !("place" in plain.tag), JSON.stringify(plain.tag));
  }

  const beside = parseImageTag(tagOf(...base, "[place] beside"));
  eq("[place] beside -> place: beside", beside.kind === "tag" ? beside.tag.place : beside.kind, "beside");
  eq("[place] beside -> no warnings", beside.kind === "tag" ? beside.warnings : beside.kind, []);
  eq("[place] beside keeps cld/alt/caption verbatim, no frame", beside.kind === "tag" ? beside.tag : null, {
    cld: "Egypt/AOF cover (v1)", alt: "The AOF cover", caption: "The cover page", place: "beside",
  });

  for (const v of ["Beside", "BESIDE", "  beside  ", "bEsIdE"]) {
    const r = parseImageTag(tagOf(...base, `[place] ${v}`));
    eq(`case-insensitive and trimmed: ${JSON.stringify(v)}`, r.kind === "tag" ? r.tag.place : r.kind, "beside");
  }

  const early = parseImageTag(tagOf(base[0], "[place] beside", base[1], base[2]));
  eq("[place] between [cld] and [alt] is read", early.kind === "tag" ? early.tag.place : early.kind, "beside");

  // Both spans, either order: independent flags.
  for (const order of [["[frame] none", "[place] beside"], ["[place] beside", "[frame] none"]]) {
    const r = parseImageTag(tagOf(...base, ...order));
    eq(`both spans (${order.join(", ")}) -> both flags`, r.kind === "tag" ? [r.tag.frame, r.tag.place, r.warnings] : r.kind,
      ["none", "beside", []]);
  }
  // [place] beside alone does not touch the frame.
  if (beside.kind === "tag") check("[place] beside sets no frame", beside.tag.frame === undefined, JSON.stringify(beside.tag));

  // Unrecognised value: usable, flag absent, REPORTED.
  for (const v of ["left", "side", "inline", ""]) {
    const r = parseImageTag(tagOf(...base, `[place] ${v}`.trimEnd()));
    eq(`[place] ${JSON.stringify(v)} -> still a usable tag`, r.kind, "tag");
    if (r.kind === "tag") {
      check(`[place] ${JSON.stringify(v)} -> no place flag`, r.tag.place === undefined, JSON.stringify(r.tag));
      check(
        `[place] ${JSON.stringify(v)} -> one warning naming the value`,
        r.warnings.length === 1 && r.warnings[0].includes("[place]") && r.warnings[0].includes(JSON.stringify(v)),
        JSON.stringify(r.warnings),
      );
    }
  }

  // A bad [place] does not cost a good [frame], and vice versa.
  const mixed = parseImageTag(tagOf(...base, "[frame] none", "[place] left"));
  eq("[frame] none + [place] left -> frame kept, place absent, one warning",
    mixed.kind === "tag" ? [mixed.tag.frame, mixed.tag.place, mixed.warnings.length] : mixed.kind, ["none", undefined, 1]);
  const mixed2 = parseImageTag(tagOf(...base, "[frame] laptop", "[place] beside"));
  eq("[frame] laptop + [place] beside -> place kept, frame absent, one warning",
    mixed2.kind === "tag" ? [mixed2.tag.frame, mixed2.tag.place, mixed2.warnings.length] : mixed2.kind, [undefined, "beside", 1]);

  const odd = parseImageTag(tagOf(...base, "[place] left"));
  if (odd.kind === "tag") {
    const msg = tagWarningMessage("Chapter — Egypt / Onboarding Journey", odd.tag.cld, odd.warnings[0]);
    check("place warning notice names the chapter", msg.includes("Chapter — Egypt / Onboarding Journey"), msg);
    check("place warning notice names the value", msg.includes('"left"'), msg);
    check("place warning notice names the image", msg.includes('"Egypt/AOF cover (v1)"'), msg);
  }

  // Duplicate [place]: the tag is unusable.
  const dup = parseImageTag(tagOf(...base, "[place] beside", "[place] beside"));
  eq("duplicate [place] -> invalid", dup.kind, "invalid");
  if (dup.kind === "invalid") {
    check("duplicate [place] names the key", dup.problems.some((p) => p.includes("[place] appears twice")), JSON.stringify(dup.problems));
  }

  // [place] does not rescue a broken tag, and adds no noise to one.
  const noAlt = parseImageTag(tagOf(base[0], base[2], "[place] left"));
  eq("missing [alt] with [place] -> still invalid", noAlt.kind, "invalid");
  if (noAlt.kind === "invalid") {
    check("broken tag reports its real problem, not a place warning",
      noAlt.problems.every((p) => !p.includes("left")), JSON.stringify(noAlt.problems));
  }

  eq("a paragraph opening with [place] is prose", parseImageTag(tagOf("[place] beside")).kind, "prose");

  const junk = parseImageTag(tagOf(...base, "[side] beside"));
  eq("unknown key still invalid", junk.kind, "invalid");
  if (junk.kind === "invalid") {
    check("unknown-key message lists [place]", junk.problems.some((p) => p.includes("[place]")), JSON.stringify(junk.problems));
  }
}

revalidatePostChecks().then(() => {
  console.log(
    failures === 0 ? "\nAll sync-logic checks passed.\n" : `\n${failures} FAILED.\n`,
  );
  process.exit(failures === 0 ? 0 : 1);
});
