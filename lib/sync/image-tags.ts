/**
 * Image tags in the Notion body — reading them, and refusing the broken ones.
 *
 * A tag is ONE paragraph block carrying three inline code spans and nothing
 * else:
 *
 *   `[cld] <public id>`  `[alt] <alt text>`  `[caption] <caption>`
 *
 * ⚠️ READ FROM `annotations.code`, NEVER BY MATCHING BACKTICKS.
 *
 * Notion's `plain_text` strips the backticks — a code span containing
 * `[cld] foo` arrives as exactly `[cld] foo`. The inventory file
 * `Image mapping/cloudinary-tags-inventory.md` documents a regex built around
 * literal backticks, and that regex matches nothing on real input, because it
 * is looking for punctuation that only exists in Markdown's rendering of the
 * page. Reading the annotation reads what Notion actually stores.
 *
 * Public IDs contain spaces, dots, parentheses and apostrophes. They are taken
 * verbatim — never slugified, never URL-encoded here. Three were tested live
 * against Cloudinary, including one carrying an apostrophe and parentheses, and
 * all returned 200. Encoding is `CloudinaryImage`'s problem, not this file's.
 *
 * Pure and dependency-free, so `npm run test:sync` can exercise it with no
 * credentials and no network.
 */

/** The shape of a Notion rich-text run, narrowed to what this file reads. */
export type NotionRun = {
  plain_text: string;
  annotations?: { code?: boolean } | null;
};

export type ImageTag = {
  /** The Cloudinary public ID, verbatim. */
  cld: string;
  alt: string;
  caption: string;
};

export type TagParse =
  /** Ordinary prose. Not a tag, not a problem. */
  | { kind: "prose" }
  /** A complete, usable tag. */
  | { kind: "tag"; tag: ImageTag }
  /** Recognisably a tag, and unusable. Never written, always reported. */
  | { kind: "invalid"; cld: string | null; problems: string[] };

const PART = /^\[(cld|alt|caption)\]\s*(.*)$/su;

/**
 * Parse one paragraph's runs.
 *
 * The order of the guards matters. Anything whose first code span does not open
 * with `[cld]` is prose and returns immediately — a chapter is free to use
 * inline code for its own reasons, and this must not claim those.
 */
export function parseImageTag(runs: readonly NotionRun[]): TagParse {
  const code = runs
    .filter((r) => r.annotations?.code)
    .map((r) => r.plain_text.trim())
    .filter(Boolean);

  if (code.length === 0 || !code[0].startsWith("[cld]")) return { kind: "prose" };

  const parts = new Map<string, string>();
  const problems: string[] = [];

  for (const span of code) {
    const m = PART.exec(span);
    if (!m) {
      problems.push(
        `code span ${JSON.stringify(span)} is not one of [cld] / [alt] / [caption]`,
      );
      continue;
    }
    const [, key, value] = m;
    // A repeated key is a copy-paste that would otherwise silently keep one.
    if (parts.has(key)) {
      problems.push(`[${key}] appears twice`);
      continue;
    }
    parts.set(key, value.trim());
  }

  const cld = parts.get("cld") ?? null;

  /*
   * Prose sitting in the same paragraph as a tag.
   *
   * The contract says a tag paragraph holds the three spans "and nothing else",
   * and the renderer depends on it: the paragraph becomes a <figure>, so any
   * prose sharing the block would be silently dropped on the page. Whitespace
   * between the spans is expected and ignored.
   */
  const stray = runs
    .filter((r) => !r.annotations?.code)
    .map((r) => r.plain_text)
    .join("")
    .trim();
  if (stray) {
    problems.push(
      `the paragraph also contains prose (${JSON.stringify(
        stray.slice(0, 60),
      )}). A tag must be alone in its paragraph — the block becomes a <figure> ` +
        `and the prose would be dropped.`,
    );
  }

  if (!cld) problems.push("[cld] is missing or empty");

  /*
   * ⚠️ THE LOUD HALF OF A SILENT PAIR.
   *
   * `CloudinaryImage` returns null when a media row has no `alt` translation —
   * deliberately, so an unlabelled image cannot ship. On the page that is an
   * invisible gap: nothing renders and nothing complains.
   *
   * So the sync refuses to be the quiet half. A missing alt fails the chapter
   * by name rather than producing a row that will render as nothing. The gap
   * moves from the page, where no one sees it, into the sync report, where it
   * is one line and gets fixed.
   */
  const alt = parts.get("alt");
  if (alt === undefined || alt === "") {
    problems.push(
      "[alt] is missing or empty — CloudinaryImage omits an image with no alt, " +
        "so this would render as nothing at all, silently",
    );
  }

  const caption = parts.get("caption");
  if (caption === undefined || caption === "") problems.push("[caption] is missing or empty");

  if (problems.length > 0) return { kind: "invalid", cld, problems };

  return { kind: "tag", tag: { cld: cld!, alt: alt!, caption: caption! } };
}

/** The message an unusable tag produces. Named so the tests assert it. */
export function invalidTagMessage(
  chapterTitle: string,
  r: Extract<TagParse, { kind: "invalid" }>,
): string {
  return (
    `${chapterTitle}: image tag ${
      r.cld ? JSON.stringify(r.cld) : "(no [cld])"
    } is unusable and was NOT written:\n` +
    r.problems.map((p) => `      - ${p}`).join("\n") +
    `\n      fix: correct the tag in Notion. Nothing about this chapter's media ` +
    `was written — partial media is worse than none, because a missing image ` +
    `looks identical to one that was never authored.`
  );
}
