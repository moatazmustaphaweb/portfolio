-- 0055 — `career_role` joins the `entity_type` enum.
--
-- ── WHY THIS IS ITS OWN FILE ────────────────────────────────────────────────
--
-- Task `043240826`. `translations.entity_type` is an ENUM, so a row cannot
-- reference `career_roles` until the label exists. 0053 created the table;
-- this admits it to the translation system.
--
-- Separate from 0053 on purpose, and not for tidiness: **Postgres will not let a
-- new enum value be used in the same transaction that adds it** (before 12, not
-- at all; after, only outside the adding transaction). A single migration doing
-- `alter type … add value` and then inserting a translation using it fails at
-- runtime, not at review. Splitting the file makes that impossible rather than
-- merely avoided.
--
-- `if not exists` so a re-run is a no-op — `alter type … add value` is otherwise
-- an error the second time, which would break a rebuild from scratch.

alter type entity_type add value if not exists 'career_role';
