/**
 * Writing entry handles and sibling links.
 *
 * Separate from `scripts/sync-notion.ts` because that file is already far past
 * the 500-line limit; the sync keeps orchestration, this keeps the two write
 * paths. The Supabase client and the translation writer are passed in rather
 * than imported, so this module stays free of credentials and stays testable.
 */

type Db = {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (col: string, val: string) => Promise<{ data: { id: string }[] | null }>;
    };
    delete: () => {
      eq: (
        col: string,
        val: string,
      ) => Promise<unknown> & {
        in: (col: string, vals: string[]) => Promise<unknown>;
      };
    };
    insert: (row: unknown) => {
      select: (cols: string) => {
        single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
  };
};

type UpsertTranslations = (
  entityType: string,
  entityId: string,
  locale: "en" | "ar",
  fields: Record<string, string>,
) => Promise<void>;

export type HandleWrite = {
  invitation: string;
  payoff: string;
  /** Null when the handle names no chapter, or names one that does not exist. */
  targetChapterId: string | null;
};

export type SiblingWrite = {
  siblingId: string;
  note: string | null;
};

/**
 * Delete every child row for a parent, translations FIRST.
 *
 * `translations` is polymorphic and has no foreign key to cascade, so deleting
 * the owning rows on their own leaves their translations behind. That is not
 * hypothetical — an earlier run turned 11 targets into 22 entity_ids, half
 * pointing at rows that no longer existed. Every replace path in this project
 * pays this cost in the same order.
 */
async function clearChildren(
  db: Db,
  table: string,
  entityType: string,
  parentColumn: string,
  parentId: string,
): Promise<void> {
  const { data: doomed } = await db.from(table).select("id").eq(parentColumn, parentId);

  if (doomed && doomed.length > 0) {
    // Scoped by entity_type as well as id — the id alone would be a wider
    // delete than intended, and every other replace path here is scoped.
    await db
      .from("translations")
      .delete()
      .eq("entity_type", entityType)
      .in(
        "entity_id",
        doomed.map((d) => d.id),
      );
  }

  await db.from(table).delete().eq(parentColumn, parentId);
}

/**
 * Replace a cover's entry handles.
 *
 * Wholesale replacement, like outcomes: a handle removed in Notion has to
 * disappear here, and a handle has no stable key to match on. Order in the
 * source is the only identity it has, which is also why Arabic pairs by
 * position and is skipped entirely when the counts disagree.
 */
export async function replaceEntryHandles(
  db: Db,
  upsertTranslations: UpsertTranslations,
  caseFileId: string,
  handles: readonly HandleWrite[],
  arabic: readonly { invitation: string; payoff: string }[] = [],
): Promise<{ written: number; error?: string }> {
  await clearChildren(db, "entry_handles", "entry_handle", "case_file_id", caseFileId);

  const pairArabic = arabic.length === handles.length;
  let written = 0;

  for (const [i, handle] of handles.entries()) {
    const { data, error } = await db
      .from("entry_handles")
      .insert({
        case_file_id: caseFileId,
        target_chapter_id: handle.targetChapterId,
        sort_order: i,
      })
      .select("id")
      .single();

    if (error || !data) return { written, error: error?.message ?? "insert returned no row" };

    await upsertTranslations("entry_handle", data.id, "en", {
      invitation: handle.invitation,
      payoff: handle.payoff,
    });

    if (pairArabic) {
      const ar = arabic[i];
      await upsertTranslations("entry_handle", data.id, "ar", {
        invitation: ar.invitation,
        payoff: ar.payoff,
      });
    }

    written++;
  }

  return { written };
}

/** Replace a cover's sibling links. Same replace-wholesale reasoning. */
export async function replaceSiblings(
  db: Db,
  upsertTranslations: UpsertTranslations,
  caseFileId: string,
  siblings: readonly SiblingWrite[],
): Promise<{ written: number; error?: string }> {
  await clearChildren(db, "case_file_siblings", "case_file_sibling", "case_file_id", caseFileId);

  let written = 0;

  for (const [i, sibling] of siblings.entries()) {
    const { data, error } = await db
      .from("case_file_siblings")
      .insert({
        case_file_id: caseFileId,
        sibling_id: sibling.siblingId,
        sort_order: i,
      })
      .select("id")
      .single();

    if (error || !data) return { written, error: error?.message ?? "insert returned no row" };

    if (sibling.note) {
      await upsertTranslations("case_file_sibling", data.id, "en", { note: sibling.note });
    }

    written++;
  }

  return { written };
}
