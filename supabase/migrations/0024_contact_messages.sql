-- 0024 — Contact form delivery: a Supabase table (decision 044, option A).
--
-- Chosen over an email service because it adds no third-party processor, so
-- /how-this-site-works needs no new disclosure, and the data stays inside
-- infrastructure already governed by the retention policy.
--
-- ── What is NOT here ────────────────────────────────────────────────────────
--
-- No IP address, and no hash of one. Decision 029 commits to the IP being
-- "never read by our code and never stored", and that commitment is published
-- on /how-this-site-works in both languages (لا أخزّن عناوين IP). A per-IP rate
-- limit is the obvious spam control and it is not available here — so the
-- route uses a honeypot, a submission-timing check, and an in-memory global
-- limit instead. See app/api/contact/route.ts.
--
-- No user agent, no referrer, no session link. A message is correspondence,
-- not telemetry, and joining it to the analytics tables would turn an
-- anonymous session record into an identified one.

create table contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  -- One of the form's subject keys, or null if the select was left alone.
  subject    text,
  message    text not null,
  created_at timestamptz not null default now()
);

create index contact_messages_created_idx on contact_messages (created_at desc);

-- RLS on, and DELIBERATELY no policy. This is the pattern the operational
-- tables already use (revisions, sessions, events): RLS enabled with zero
-- policies denies everything to the anon key, which is the intent. Writes
-- happen server-side through the service role; reads happen in the Supabase
-- dashboard. Nothing about a contact message should be publicly readable.
alter table contact_messages enable row level security;

-- Retention: 360 days, matching decision 035. Folded into the existing daily
-- prune rather than given its own cron entry, so there is one place that
-- answers "what does this site delete, and when".
create or replace function prune_analytics()
returns void
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
begin
  perform aggregate_analytics();
  delete from sessions where started_at < now() - interval '180 days';
  delete from contact_messages where created_at < now() - interval '360 days';
end;
$$;

revoke execute on function prune_analytics() from public, anon, authenticated;
