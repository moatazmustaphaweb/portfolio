import "server-only";

import { supabaseServer } from "@/lib/supabase/server";

import {
  DEFAULT_LOCALE,
  type EntityType,
  type FieldLocales,
  type Fields,
  type Locale,
} from "./types";

/**
 * Translation resolution — the single place a `translations` row is ever read.
 *
 * THE FALLBACK RULE (decision 013): when a row is missing for the requested
 * locale, fall back to English. Never hide a page, never show an empty section,
 * never render a "not translated" notice. Partial translation is the normal
 * state, not an error — so a missing row is never logged as a warning.
 *
 * A field that exists in neither locale resolves to `undefined`, and the caller
 * omits the element entirely rather than rendering an empty heading.
 */

/**
 * Fetch translations for many entities of one type in a single query.
 *
 * This exists to stop the N+1 that the obvious per-entity implementation
 * produces: a gallery of 4 case files with 4 fields each would otherwise be 16
 * round trips. Returns a map of entity_id → resolved fields.
 */
export async function resolveMany(
  entityType: EntityType,
  entityIds: readonly string[],
  locale: Locale,
): Promise<Map<string, Fields>> {
  const detailed = await resolveManyDetailed(entityType, entityIds, locale);
  return new Map([...detailed].map(([id, v]) => [id, v.fields]));
}

/**
 * The same resolution, keeping WHICH LOCALE each field actually came from.
 *
 * ⚠️ This is not bookkeeping for its own sake. A field that fell back is English
 * text about to be placed inside an Arabic document, and it has to be marked as
 * English or the browser lays it out as Arabic: trailing punctuation resolves to
 * the wrong visual side, so a sentence renders as ".This is where it ends" and
 * the paragraph aligns right. See decision 053.
 *
 * The fact was always here — the two passes below know precisely which fields
 * English supplied and which the requested locale overwrote — it was simply
 * discarded on the way out. Carrying it costs one extra map and no extra query.
 *
 * The alternative, sniffing the rendered string for Latin characters, is wrong
 * on the content this site actually has: Arabic prose here deliberately keeps
 * `Governance`, `OTP`, `KYC`, `RTL` and `LinkedIn` in Latin, and a heuristic
 * would mark those paragraphs English and flip them.
 */
export async function resolveManyDetailed(
  entityType: EntityType,
  entityIds: readonly string[],
  locale: Locale,
): Promise<Map<string, { fields: Fields; fieldLocales: FieldLocales }>> {
  const resolved = new Map<string, { fields: Fields; fieldLocales: FieldLocales }>();
  if (entityIds.length === 0) return resolved;

  // Fetch the requested locale and English together, then let English lose on
  // conflict below. One round trip instead of two sequential ones.
  const locales: Locale[] =
    locale === DEFAULT_LOCALE ? [DEFAULT_LOCALE] : [locale, DEFAULT_LOCALE];

  const { data, error } = await supabaseServer
    .from("translations")
    .select("entity_id, locale, field, value")
    .eq("entity_type", entityType)
    .in("entity_id", entityIds as string[])
    .in("locale", locales);

  if (error) {
    throw new Error(
      `Failed to resolve translations for ${entityType}: ${error.message}`,
    );
  }

  // Two passes so precedence is explicit rather than dependent on row order:
  // English first as the floor, then the requested locale overwrites it.
  for (const row of data ?? []) {
    if (row.locale !== DEFAULT_LOCALE) continue;
    const entry = resolved.get(row.entity_id) ?? { fields: {}, fieldLocales: {} };
    entry.fields[row.field] = row.value;
    entry.fieldLocales[row.field] = DEFAULT_LOCALE;
    resolved.set(row.entity_id, entry);
  }

  if (locale !== DEFAULT_LOCALE) {
    for (const row of data ?? []) {
      if (row.locale !== locale) continue;
      const entry = resolved.get(row.entity_id) ?? { fields: {}, fieldLocales: {} };
      entry.fields[row.field] = row.value;
      // Overwrites the English marker set above — which is the whole point:
      // what remains marked `en` after this pass IS the fallback set.
      entry.fieldLocales[row.field] = locale;
      resolved.set(row.entity_id, entry);
    }
  }

  // Every requested entity gets an entry, so callers can index without a
  // null check. An entity with no translations at all resolves to {}.
  for (const id of entityIds) {
    if (!resolved.has(id)) resolved.set(id, { fields: {}, fieldLocales: {} });
  }

  return resolved;
}

/** Resolve the fields of a single entity. Prefer `resolveMany` in a loop. */
export async function resolve(
  entityType: EntityType,
  entityId: string,
  locale: Locale,
): Promise<Fields> {
  const map = await resolveMany(entityType, [entityId], locale);
  return map.get(entityId) ?? {};
}

/**
 * Attach resolved fields to a list of rows in one query.
 *
 * The generic keeps the row type intact, so callers get
 * `CaseFileRow & { fields }` rather than a widened shape.
 */
export async function withFields<T extends { id: string }>(
  entityType: EntityType,
  rows: readonly T[],
  locale: Locale,
): Promise<(T & { fields: Fields; fieldLocales: FieldLocales })[]> {
  const map = await resolveManyDetailed(
    entityType,
    rows.map((r) => r.id),
    locale,
  );
  /*
   * `fieldLocales` is ADDITIVE. Every existing caller reads `fields` and is
   * untouched; the ones that render text into a page of a different language
   * read `fieldLocales` to mark it. Making it always present rather than
   * optional means a caller cannot forget to ask for it — the same reasoning
   * that puts `nda` on the media row instead of in a component prop.
   */
  return rows.map((row) => {
    const entry = map.get(row.id);
    return { ...row, fields: entry?.fields ?? {}, fieldLocales: entry?.fieldLocales ?? {} };
  });
}
