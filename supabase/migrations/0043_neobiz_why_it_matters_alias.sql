-- 0043 — The Neobiz Arabic cover heading, reworded in Notion, re-aliased here.
--
-- ── WHAT BROKE ──────────────────────────────────────────────────────────────
--
-- The sync FAILED the whole Neobiz Arabic cover:
--
--   ✗ Case File Cover — Neobiz Mobile (Egypt) (ar):
--     heading "ولماذا يهم رغم أنه لم يتم تطبيقه حتى الآن" matches no cover slot.
--
-- A failure is not a skip. Nothing was written for that row, so the Neobiz
-- Arabic cover has been FROZEN — unreachable from Notion entirely, not merely
-- missing one section. `case_files.thesis` (ar) for `neobiz-mobile` is the
-- visible symptom.
--
-- ── ⚠️ THIS IS NOT A MISSING ALIAS. IT IS A STALE ONE ───────────────────────
--
-- 0032 already carries a Neobiz Arabic `why-it-matters`:
--
--   ('ولماذا يهم رغم أنه لم يُبنَ', 'why-it-matters', 'Neobiz (ar)')
--
-- "…even though it was not built" was rewritten to "…even though it has not
-- been implemented yet". Same slot, same meaning, new words.
--
-- That distinction matters for how this class is prevented. The other three
-- gaps — the `النسخة العربية` prefix, the `ثلاثة مداخل` aliases, the `←`
-- arrow — were spellings nobody had mapped yet. This one WAS mapped, and
-- ordinary copy-editing in Notion broke it. Aliases decay whenever prose is
-- edited, which no amount of seeding at build time prevents.
--
-- The old row is KEPT. It costs one row, it is still a true statement about a
-- heading this cover once carried, and removing it would break any replay of
-- the database against an older Notion snapshot.
--
-- ── NORMALISATION ───────────────────────────────────────────────────────────
--
-- `heading_norm` stores the output of `normaliseHeading` (lib/sync/cover-slots.ts):
-- lowercased, quotes stripped, every run of non-letter/number/mark collapsed to
-- a single space, trimmed. Arabic has no case and this heading has no
-- punctuation, so the stored form is the heading with its internal spacing
-- normalised — which is what it already has.

insert into cover_slot_aliases (heading_norm, slot, observed_on) values
  ('ولماذا يهم رغم أنه لم يتم تطبيقه حتى الآن', 'why-it-matters', 'Neobiz (ar), reworded 2026-08')
on conflict (heading_norm) do update
  set slot        = excluded.slot,
      observed_on = excluded.observed_on;
