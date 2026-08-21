import type { Enums, Tables } from "@/lib/supabase/database.types";

/**
 * Domain types for the content layer.
 *
 * Database row shapes come from the generated `database.types.ts` — this file
 * never redefines a column, it only composes rows into the shapes pages
 * actually consume (a row plus its resolved translations).
 *
 * Nullable database fields stay nullable here. Do not assert them away: the
 * English-fallback rule (decision 013) means a resolved field can legitimately
 * be absent, and the caller is expected to omit the element rather than render
 * an empty heading.
 */

export type Locale = Enums<"locale_code">;
export type ContentStatus = Enums<"content_status">;
export type OutcomeStatus = Enums<"outcome_status">;
export type TargetStatus = Enums<"target_status">;
export type Grammar = Enums<"grammar_type">;
export type EntityType = Enums<"entity_type">;
export type NavLocation = Enums<"nav_location">;

export const LOCALES = ["en", "ar"] as const;
export const DEFAULT_LOCALE: Locale = "en";

/**
 * The writing direction of a LANGUAGE — not of a page.
 *
 * The distinction is decision 053 and it is the whole point of this helper
 * existing separately from the locale segment. `app/layout.tsx` derives the
 * document's direction from the URL's locale; this derives a run of text's
 * direction from the language that text is actually written in. They agree
 * everywhere except where decision 013's fallback put English inside an Arabic
 * page, which is precisely the case that renders wrong without it.
 */
export function dirForLocale(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** A resolved set of translated fields for one entity: field name → value. */
export type Fields = Record<string, string>;

/**
 * Which locale each resolved field actually came from.
 *
 * A field whose value here is `en` on an Arabic page is decision 013's fallback:
 * correct content, wrong language for the surrounding document. It must be
 * marked `dir="ltr" lang="en"` when rendered, or the browser lays English out as
 * Arabic and puts the full stop at the start of the line (decision 053).
 */
export type FieldLocales = Record<string, Locale>;

export type MediaRow = Tables<"media">;

export type Media = MediaRow & {
  /** From translations: `alt`, `caption`. */
  fields: Fields;
  /** Which locale supplied each of those fields — see `FieldLocales`. */
  fieldLocales: FieldLocales;
  /**
   * Whether this image belongs to a case file under NDA — stamped by the
   * content layer from `case_files.nda`, never by the caller.
   *
   * Deliberately not a component prop: a treatment that depends on someone
   * remembering to pass a flag is a treatment that will eventually be missed
   * on one page. The NDA belongs to the client relationship, so it travels
   * with the data (amendment 036).
   */
  nda: boolean;
};

export type CaseFile = Tables<"case_files"> & {
  /** Which locale supplied each field — decision 053. */
  fieldLocales: FieldLocales;
  /**
   * From translations: `title`, plus the legacy `thesis` · `role` ·
   * `reflection` fields the cover slot model (0031) replaces. Those three are
   * still written and are removed in a separate cleanup migration once the
   * site is verified rendering from `cover_sections`.
   */
  fields: Fields;
  /**
   * The opening slot's first paragraph — `thesis` where a cover has one,
   * `what-it-is` where it does not. For metadata, the gallery and llms.txt.
   */
  summary?: string;
  cover: Media | null;
  /**
   * A card-shaped variant of the cover, when one exists.
   *
   * The gallery card slot is 1.6:1 and crops with `c_fill`; a cover drawn
   * square loses its top and bottom to that crop, and `g_auto` picks the
   * centre by content analysis, so the result is neither correct nor stable
   * across re-uploads. Where a hand-made crop exists it is used instead.
   *
   * Resolved by convention: the media row whose `cloudinary_public_id` is the
   * cover's plus `-card`. Null when there is no such row, and the card then
   * falls back to `cover` — so a case file with one asset behaves exactly as
   * it did before. See `resolveCoverCard`.
   */
  coverCard: Media | null;
  /**
   * The first outcome, for the gallery card.
   *
   * Evaluators scan for impact before anything else, so a card showing only a
   * title wastes the few seconds it gets. Null when the case file has no
   * outcomes yet — the card then omits the line rather than substituting the
   * thesis, which is a paragraph and would not read as an outcome.
   */
  headline: { value: string; status: OutcomeStatus; label?: string } | null;
};

export type ChapterKind = Enums<"chapter_kind">;

export type Decision = Tables<"decisions"> & {
  /** From translations: `name`, `body`. */
  fields: Fields;
  /** Which locale supplied each field — decision 053. */
  fieldLocales: FieldLocales;
};

export type Chapter = Tables<"chapters"> & {
  /** Which locale supplied each field — decision 053. */
  fieldLocales: FieldLocales;
  /**
   * From translations: `title`, `objective`, `context`, `decision`,
   * `evidence_note`, `result`, `milestone`.
   */
  fields: Fields;
  hero: Media | null;
};

/**
 * A chapter with its decisions, for the Linear View.
 *
 * No `hero`: the linear read is a text read, and fetching a hero per chapter
 * would add a query per chapter to a page whose whole point is one request.
 */
export type ChapterWithDecisions = Tables<"chapters"> & {
  /** Which locale supplied each field — decision 053. */
  fieldLocales: FieldLocales;
  fields: Fields;
  decisions: Decision[];
};

/** One section of static page prose. From translations: `heading`, `body`. */
export type PageSection = Tables<"page_sections"> & {
  fields: Fields;
  /**
   * Which locale supplied each field — see `FieldLocales`.
   *
   * `withFields` has always attached this at runtime; the type simply did not
   * declare it, so `ProseSections` could not see it and the static and
   * document pages never got decision 053. That is why the accessibility page
   * was still rendering `.claims and open claims are separated below` with the
   * full stop at the start of the line, months after 053 shipped.
   */
  fieldLocales: FieldLocales;
};

export type Feature = Tables<"features"> & {
  /** From translations: `label`, `description`. */
  fields: Fields;
};

export type Outcome = Tables<"outcomes"> & {
  /** From translations: `label`, `note`. */
  fields: Fields;
};

export type Target = Tables<"targets"> & {
  /** From translations: `target`, `note`. */
  fields: Fields;
  /** Which locale supplied each field — decision 053. */
  fieldLocales: FieldLocales;
};

export type NavItem = Tables<"navigation"> & {
  /** From translations: `label`. */
  fields: Fields;
  children: NavItem[];
};

/** A full case file with everything needed to render its cover. */
/** One paragraph of a cover section, with the language it is written in. */
export type CoverParagraph = {
  text: string;
  /** Decision 053: `en` here on an Arabic page is the fallback, and must be
   * marked `dir="ltr" lang="en"` when rendered. */
  lang: Locale;
};

/**
 * One slot on a cover.
 *
 * The `slot` is structure — which of the known kinds of section this is. The
 * `heading` is content: the words that cover chose, as written, in this locale.
 * A cover renders the heading it has; nothing invents a default.
 */
export type CoverSection = {
  id: string;
  slot: string;
  /** The heading as written, or undefined when this locale has no translation. */
  heading?: string;
  /** Which locale supplied `heading` — decision 053. */
  headingLang?: Locale;
  /**
   * One entry per paragraph, in order. Never a joined string.
   *
   * Each carries its own language rather than sitting beside a parallel array
   * of languages: two arrays indexed together are two things free to disagree,
   * and a paragraph rendered under the wrong `lang` is exactly the bug 053
   * exists to prevent. One object makes the disagreement unrepresentable.
   */
  paragraphs: CoverParagraph[];
  /**
   * The image beside this section — `cover_sections.media_id` (0041).
   *
   * An image is a property of a SECTION, not of a case file. Any section may
   * have one and most will not: null keeps the section at full width, which is
   * how every section rendered before this existed.
   */
  media: Media | null;
};

/**
 * One paragraph of a chapter section: prose, or a figure.
 *
 * Resolved from the stored body, which is either text or the marker
 * `[image:<uuid>]` written by the sync. The media row is attached here rather
 * than left as an id, so the renderer never queries and rule 2 holds.
 *
 * `media: null` on an image part means the row was referenced and could not be
 * loaded — a deleted row, or a locale with no alt. The renderer skips it; it is
 * never a thrown error, because one missing screenshot must not take down a
 * case file.
 */
export type ChapterBlock =
  | {
      kind: "prose";
      text: string;
      /**
       * The locale this text is actually written in — not the page's locale.
       * They differ whenever decision 013's fallback served English into an
       * Arabic page, and the renderer marks the element accordingly.
       */
      lang: Locale;
    }
  | { kind: "image"; media: Media | null }
  | {
      kind: "table";
      /**
       * TAB-separated cells, NEWLINE-separated rows, first row the header —
       * byte-for-byte the shape `page_sections` has always produced, because it
       * is handed to the very same `SectionTable` component. Reassembled from
       * `chapter_table_cells` rather than stored as a blob, so each cell still
       * translates independently.
       */
      body: string;
      /** The language the cells are actually in (decision 053). */
      lang: Locale;
    };

export type ChapterSection = {
  id: string;
  slot: string;
  /** The heading as written, or undefined when this locale has no translation. */
  heading?: string;
  /** The language the heading is actually in. A heading falls back too. */
  headingLang?: Locale;
  /** Prose and figures, in the order they were written. */
  blocks: ChapterBlock[];
};

export type CaseFileDetail = CaseFile & {
  /**
   * The cover's slots, in the order the database says — not a fixed order and
   * not the same order for every case file.
   */
  sections: CoverSection[];
  /** Numbered narrative only — `kind = 'chapter'`, in `sort_order`. */
  chapters: Chapter[];
  /**
   * Standalone case-file pages — comparisons and the accessibility page.
   * Deliberately separate: they are reachable and linkable, but they are not
   * part of the sequence and must not appear in the linear view (amendment 033).
   */
  pages: Chapter[];
  outcomes: Outcome[];
  targets: Target[];
  /**
   * "Three ways in" — the three offers at the top of a cover, each proposing a
   * different reason to read the same case file (migration 0017).
   */
  handles: EntryHandle[];
  /**
   * Other case files covering the same requirement in a different market
   * (decision 004). Directed: each cover states its own, in its own words.
   */
  siblings: SiblingLink[];
};

export type EntryHandle = {
  id: string;
  /** The offer. `translations.invitation`. */
  invitation?: string;
  /** What is behind it. `translations.payoff`. */
  payoff?: string;
  /**
   * The chapter this handle opens, when it names one unambiguously.
   *
   * Null is a normal, expected answer, not a missing value: UAE's three
   * handles name no chapter at all, and Egypt's "Results table → What broke"
   * names a page that is not a chapter. A handle without a target renders as
   * text — the living map immediately below lists every chapter, so the reader
   * still has somewhere to go.
   */
  target: { slug: string; title?: string } | null;
};

export type SiblingLink = {
  id: string;
  slug: string;
  title?: string;
  /** Why they are siblings, as written on the pointing cover. */
  note?: string;
};

/** A chapter in the context of its parent, for the chapter route. */
export type ChapterDetail = Chapter & {
  caseFile: CaseFile;
  /**
   * Where this chapter sits in the sequence, 1-based, for the design's
   * "Chapter 1 of 4" progress indicator.
   *
   * `getChapter` already computed this to find prev/next and threw it away.
   * Exposing it adds no query and no content — it is the one piece of derived
   * state the composition needs and could not reconstruct.
   *
   * `total` counts `kind = 'chapter'` only, so a comparison page does not
   * inflate the denominator of a sequence it is not part of.
   */
  position: { current: number; total: number };
  /**
   * The chapter's slots, in the order the database says (migration 0035).
   *
   * Runs ALONGSIDE the flat `fields` for now. `fields` still carries objective,
   * context, evidence_note and result for everything that reads them today;
   * `sections` carries those plus the passages no field had a key for — and
   * every figure on the page.
   */
  sections: ChapterSection[];
  features: Feature[];
  /** Ordered. A chapter has as many decisions as it has (amendment 032). */
  decisions: Decision[];
  /**
   * The neighbouring chapters in `sort_order`, for onward navigation.
   *
   * "No dead ends" is a non-negotiable: every chapter has to offer a next step
   * and a way back. Resolved here rather than in the page so a chapter can
   * never render without them.
   */
  prev: { slug: string; title?: string } | null;
  next: { slug: string; title?: string } | null;
};
