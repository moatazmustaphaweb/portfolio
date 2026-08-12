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
};

/** A chapter in the context of its parent, for the chapter route. */
export type ChapterDetail = Chapter & {
  caseFile: CaseFile;
  features: Feature[];
  /** Ordered. A chapter has as many decisions as it has (amendment 032). */
  decisions: Decision[];
};
