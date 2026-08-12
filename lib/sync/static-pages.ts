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
  /** Paragraphs joined with a blank line; rendered with `whitespace-pre-line`. */
  body: string;
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
  blocks: readonly { heading: string; lines: readonly string[] }[],
  pageName: string,
): { intro: string; sections: ParsedSection[] } {
  let intro = "";
  const sections: ParsedSection[] = [];
  const seen = new Set<string>();

  for (const [i, block] of blocks.entries()) {
    const heading = block.heading.trim();
    const body = block.lines.map((l) => l.trim()).filter(Boolean).join("\n\n");

    // The title-echo opener becomes the lede rather than a section.
    if (i === 0 && echoesPageName(heading, pageName)) {
      intro = body;
      continue;
    }

    if (!heading && !body) continue;
    if (!heading) {
      // Prose before any heading is also lede material.
      intro = intro ? `${intro}\n\n${body}` : body;
      continue;
    }

    let slug = headingToSlug(heading);
    // Two headings with the same words would violate (page, slug). Suffix
    // rather than drop — losing a section silently is the worse failure.
    if (seen.has(slug)) {
      let n = 2;
      while (seen.has(`${slug}-${n}`)) n++;
      slug = `${slug}-${n}`;
    }
    seen.add(slug);

    sections.push({ slug, heading, body });
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
