/**
 * Parsing rules for the static pages — About, Philosophy, Systems, Contact.
 *
 * Pure and dependency-free, like `classify.ts` and `handles.ts`, so
 * `npm run test:sync` can prove them against the real headings with no
 * credentials and no network.
 */

/** Route → the `page_sections.page` key. */
export function routeToPageKey(route: string): string | null {
  const cleaned = route.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const m = /^\/\[locale\]\/(.+)$/.exec(cleaned);
  if (!m) return null;
  const key = m[1].replace(/\/+$/, "").trim();
  return key || null;
}

/**
 * Heading → a stable section slug.
 *
 * Latin-only slugs would collapse every Arabic heading to the empty string and
 * then to a unique-constraint collision, so non-Latin scripts are kept as they
 * are. In practice the sync derives slugs from the ENGLISH page and pairs
 * Arabic by position, but a slug function that silently returns "" for Arabic
 * is a trap left lying for whoever changes that.
 */
export function headingToSlug(heading: string): string {
  const slug = heading
    .toLowerCase()
    .trim()
    .replace(/['’"“”]/gu, "")
    /*
     * `\p{M}` matters: Arabic harakat are combining MARKS, not letters, so a
     * `[^\p{L}\p{N}]` class strips them and leaves a hyphen in the hole —
     * عن مُعتز becomes "عن-م-عتز", which is a different word with a stray
     * separator through it. Marks belong to the letter they sit on.
     */
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

export type ParsedSection = {
  slug: string;
  heading: string;
  /**
   * Prose: paragraphs joined with a blank line.
   * Table: cells separated by TAB, rows by NEWLINE, first row the header.
   */
  body: string;
  kind: "prose" | "table";
};

/**
 * Split a page body into ordered sections.
 *
 * `readBody` hands back a Map of canonical heading → lines, which loses both
 * the original heading text and the order — fine for a cover, where headings
 * are field names, and useless here, where the heading is prose to render. So
 * this takes the raw (heading, lines) pairs in document order instead.
 *
 * The FIRST heading is dropped when it merely repeats the page name ("About"
 * above the About page, "Philosophy" above Philosophy). Its paragraphs are
 * kept as the page intro — an unheaded lede — because they are the opening
 * lines and printing "About" as a section heading under the page title
 * "About" reads as a mistake.
 */
export function parsePageSections(
  blocks: readonly {
    heading: string;
    lines: readonly string[];
    /** Table grids found under this heading, in order. */
    tables?: readonly (readonly string[])[][];
  }[],
  pageName: string,
): { intro: string; sections: ParsedSection[] } {
  let intro = "";
  const sections: ParsedSection[] = [];
  const seen = new Set<string>();

  /** Reserve a slug, suffixing rather than colliding on (page, slug). */
  function claim(base: string): string {
    let slug = base;
    if (seen.has(slug)) {
      let n = 2;
      while (seen.has(`${slug}-${n}`)) n++;
      slug = `${slug}-${n}`;
    }
    seen.add(slug);
    return slug;
  }

  for (const [i, block] of blocks.entries()) {
    const heading = block.heading.trim();
    const body = block.lines.map((l) => l.trim()).filter(Boolean).join("\n\n");
    const tables = block.tables ?? [];

    // The title-echo opener becomes the lede rather than a section.
    if (i === 0 && echoesPageName(heading, pageName) && tables.length === 0) {
      intro = body;
      continue;
    }

    if (!heading && !body && tables.length === 0) continue;
    if (!heading && tables.length === 0) {
      // Prose before any heading is also lede material.
      intro = intro ? `${intro}\n\n${body}` : body;
      continue;
    }

    if (heading || body) {
      sections.push({
        slug: claim(headingToSlug(heading || "section")),
        heading,
        body,
        kind: "prose",
      });
    }

    /*
     * Tables become their own sections, keeping the position they had on the
     * page. A table is not an attachment to the paragraph above it — on the
     * comparison pages it IS the argument, and it needs its own row so it can
     * be rendered as a grid rather than as text.
     */
    for (const grid of tables) {
      const rows = grid
        .map((row) => row.map((cell) => cell.replace(/[\t\n]+/g, " ").trim()).join("\t"))
        .filter((row) => row.replace(/\t/g, "").trim());
      if (rows.length === 0) continue;

      sections.push({
        slug: claim(`${headingToSlug(heading || "section")}-table`),
        heading: "",
        body: rows.join("\n"),
        kind: "table",
      });
    }
  }

  return { intro, sections };
}

/**
 * Does this heading just repeat the page's own name?
 *
 * Notion titles the Philosophy page "Philosophy (Foundations)" and opens it
 * with an H2 "Philosophy", so a plain equality test would miss it.
 */
function echoesPageName(heading: string, pageName: string): boolean {
  if (!heading) return false;
  const norm = (s: string) =>
    s.toLowerCase().replace(/\([^)]*\)/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return norm(heading) === norm(pageName);
}
