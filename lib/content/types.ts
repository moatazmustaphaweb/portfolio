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

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** A resolved set of translated fields for one entity: field name → value. */
export type Fields = Record<string, string>;

export type MediaRow = Tables<"media">;

export type Media = MediaRow & {
  /** From translations: `alt`, `caption`. */
  fields: Fields;
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
  /** From translations: `title`, `thesis`, `role`, `reflection`. */
  fields: Fields;
  cover: Media | null;
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
};

export type Chapter = Tables<"chapters"> & {
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
  fields: Fields;
  decisions: Decision[];
};

/** One section of static page prose. From translations: `heading`, `body`. */
export type PageSection = Tables<"page_sections"> & {
  fields: Fields;
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
};

export type NavItem = Tables<"navigation"> & {
  /** From translations: `label`. */
  fields: Fields;
  children: NavItem[];
};

/** A full case file with everything needed to render its cover. */
export type CaseFileDetail = CaseFile & {
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
