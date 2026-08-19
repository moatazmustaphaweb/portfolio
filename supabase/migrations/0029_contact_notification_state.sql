-- 0029 — Notification state on contact_messages (decision 051, amending 044).
--
-- 044 made storage the delivery mechanism: the row IS the message, and it is read
-- in the Supabase dashboard. That stays. What changes is that an email now
-- notifies Moataz a row arrived — storage plus notification, never notification
-- instead of storage.
--
-- ── WHY COLUMNS AND NOT A LOG LINE ──────────────────────────────────────────
--
-- The requirement is that a silent mail outage must not become a silent lost
-- recruiter. `console.error` cannot satisfy that:
--
--   * Vercel runtime logs are ephemeral and short-retention.
--   * Before deployment there is no log drain at all — a failure in local
--     development or in a preview is written to a terminal nobody kept.
--   * A log line is not joinable to the message it failed to announce, so
--     "which submissions did I never hear about?" is not answerable from it.
--
-- As columns, that question is one query:
--
--   select id, email, subject, created_at, notify_error
--     from contact_messages
--    where notified_at is null
--    order by created_at desc;
--
-- and the evidence sits in the same row as the message. `console.error` is kept
-- as well, for the deployed case — the two answer different questions.
--
-- ── THE THREE STATES, WHICH ARE DELIBERATELY DISTINGUISHABLE ────────────────
--
--   notified_at set,   notify_error null  → sent, and Moataz saw it
--   notified_at null,  notify_error set   → tried and failed; the text says how
--   notified_at null,  notify_error null  → never attempted
--
-- The third is not a bug state. It is what every row written before this
-- migration looks like, and what a row looks like if the process dies between
-- the insert and the send. Backfilling the old rows to "notified" would be a
-- lie about mail that was never sent, and backfilling them to "failed" would be
-- a lie about an attempt that never happened. They stay null, and the comment
-- below records why so the gap is not later read as data loss.
--
-- NO VISITOR DATA IS ADDED. Both columns describe our own sending, not the
-- person who wrote in. Nothing here changes what 0024 refuses to collect — no
-- IP, no user agent, no referrer, no session link.

alter table contact_messages
  add column if not exists notified_at  timestamptz,
  add column if not exists notify_error text;

comment on column contact_messages.notified_at is
  'When the operator notification for this row was accepted by the mail provider. '
  'NULL means no notification is known to have been sent — either it failed (see '
  'notify_error) or it was never attempted, which is true of every row created '
  'before migration 0029.';

comment on column contact_messages.notify_error is
  'Why the operator notification failed, when it did. NULL with a NULL '
  'notified_at means no attempt was recorded, not that the attempt succeeded.';

-- Finding the misses without remembering the query. Partial index because the
-- rows of interest are the rare ones — in the healthy case this index is empty,
-- which is the point.
create index if not exists contact_messages_unnotified_idx
  on contact_messages (created_at desc)
  where notified_at is null;

-- Retention is unchanged: 360 days via prune_analytics(), set in 0024. These
-- columns live on the same row and are deleted with it, so the notification
-- record cannot outlive the message it describes.
