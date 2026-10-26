/**
 * Image tags in the Notion body — reading them, and refusing the broken ones.
 *
 * A tag is ONE paragraph block carrying three inline code spans and nothing
 * else:
 *
 *   `[cld] <public id>`  `[alt] <alt text>`  `[caption] <caption>`
 *
 * and optionally a fourth (decision 069, task `013261026`):
 *
 *   `[frame] none`
 *
 * which marks a finished mockup that must render unframed. The device frame is
 * otherwise automatic by aspect ratio, and nothing else can tell a composed
 * mockup from a raw screen, so it is authored per image. `none` is the only
 * value: anything else is REPORTED (a warning on the tag) and treated as
 * absent — the figure keeps its automatic frame and the tag is still written.
 * A repeated `[frame]` is a broken tag, the same as any other repeated key.
 *
 * and optionally (decision 070, task `014261026`):
 *
 *   `[place] beside`
 *
 * which pairs the figure with the prose since the previous figure, side by
 * side on md+, in any chapter layout. Same handling as `[frame]`: `beside` is
 * the only value, anything else is REPORTED and ignored (the figure keeps its
 * normal place, the tag is still written), and a repeated `[place]` is a
 * broken tag. Independent of `[frame]`: either, both or neither.
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
  /**
   * `"none"` when the tag carries `[frame] none`: render this figure unframed.
   * Absent otherwise. Never any other value — an unrecognised `[frame]` value
   * is a warning on the parse result, not a flag.
   */
  frame?: "none";
  /**
   * `"beside"` when the tag carries `[place] beside`: the figure sits beside
   * the prose that leads into it (decision 070). Absent otherwise. Never any
   * other value — an unrecognised `[place]` value is a warning, not a flag.
   */
  place?: "beside";
};

export type TagParse =
  /** Ordinary prose. Not a tag, not a problem. */
  | { kind: "prose" }
  /**
   * A complete, usable tag. `warnings` are things the sync must REPORT but
   * that do not make the tag unusable — an unrecognised `[frame]` or
   * `[place]` value, which is ignored rather than guessed at.
   */
  | { kind: "tag"; tag: ImageTag; warnings: string[] }
  /** Recognisably a tag, and unusable. Never written, always reported. */
  | { kind: "invalid"; cld: string | null; problems: string[] };

const PART = /^\[(cld|alt|caption|frame|place)\]\s*(.*)$/su;

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
        `code span ${JSON.stringify(span)} is not one of [cld] / [alt] / [caption] / [frame] / [place]`,
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

  /*
   * `[frame]` — optional. Read only once the tag is otherwise usable, so a
   * broken tag reports its real problems rather than a frame warning on top.
   * Case-insensitive and trimmed (`None`, ` NONE `); the value was already
   * trimmed above.
   */
  const warnings: string[] = [];
  const tag: ImageTag = { cld: cld!, alt: alt!, caption: caption! };
  const frame = parts.get("frame");
  if (frame !== undefined) {
    if (frame.toLowerCase() === "none") {
      tag.frame = "none";
    } else {
      warnings.push(
        `[frame] ${JSON.stringify(frame)} is not a recognised value — the only ` +
          `value is "none". Ignored: the figure keeps its automatic device frame.`,
      );
    }
  }

  /*
   * `[place]` — optional (decision 070), read exactly like `[frame]`.
   * Independent of it: `[place] beside` changes where the figure sits, never
   * its frame.
   */
  const place = parts.get("place");
  if (place !== undefined) {
    if (place.toLowerCase() === "beside") {
      tag.place = "beside";
    } else {
      warnings.push(
        `[place] ${JSON.stringify(place)} is not a recognised value — the only ` +
          `value is "beside". Ignored: the figure keeps its normal place in the chapter layout.`,
      );
    }
  }

  return { kind: "tag", tag, warnings };
}

/**
 * The notice a usable tag's warning produces. Named so the tests assert it.
 * The tag IS written; this says what about it was ignored.
 */
export function tagWarningMessage(chapterTitle: string, cld: string, warning: string): string {
  return `${chapterTitle}: image tag ${JSON.stringify(cld)} — ${warning} Fix the tag in Notion.`;
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
