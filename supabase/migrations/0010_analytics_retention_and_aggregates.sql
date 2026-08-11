-- Decision 031: 180-day retention on raw analytics, monthly aggregates kept
-- indefinitely.
--
-- 180 rather than 90 because Layer 2 exists to validate archetype inference
-- against real behaviour, and the thresholds need roughly 200 sessions per
-- signal. At portfolio traffic that can take months to accumulate, so a 90-day
-- window risks deleting the early data before the sample is large enough to
-- conclude anything — it would bound the data at the cost of the purpose.
--
-- Aggregates cannot be re-identified: counts grouped by month, country,
-- referrer type and device, with no session id and no city. City is
-- deliberately NOT carried into the aggregate — city plus month plus a small
-- count is the combination that could narrow to a person.
--
-- Applied as `analytics_retention_and_aggregates`.

create extension if not exists pg_cron;

create table analytics_monthly (
  month         date not null,
  country       text not null default 'unknown',
  referrer_type text not null default 'unknown',
  device        text not null default 'unknown',
  sessions      int  not null,
  events        int  not null,
  updated_at    timestamptz not null default now(),
  primary key (month, country, referrer_type, device)
);

comment on table analytics_monthly is
  'Indefinite-retention rollups. No session id, no city — cannot be re-identified. Raw sessions/events are pruned at 180 days (decision 031).';

alter table analytics_monthly enable row level security;
-- No policy: server-side reads only, consistent with sessions/events.

create or replace function aggregate_analytics()
returns void
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
begin
  insert into analytics_monthly (month, country, referrer_type, device, sessions, events, updated_at)
  select
    date_trunc('month', s.started_at)::date,
    coalesce(s.country, 'unknown'),
    coalesce(s.referrer_type, 'unknown'),
    coalesce(s.device, 'unknown'),
    count(distinct s.id),
    count(e.id),
    now()
  from sessions s
  left join events e on e.session_id = s.id
  group by 1, 2, 3, 4
  on conflict (month, country, referrer_type, device) do update
    set sessions = excluded.sessions,
        events   = excluded.events,
        updated_at = now();
end;
$$;

-- Aggregate BEFORE pruning. The order is load-bearing: pruning first would
-- discard the rows the aggregate is computed from. events cascade with their
-- session, so deleting the session is sufficient.
create or replace function prune_analytics()
returns void
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
begin
  perform aggregate_analytics();
  delete from sessions where started_at < now() - interval '180 days';
end;
$$;

revoke execute on function aggregate_analytics() from public, anon, authenticated;
revoke execute on function prune_analytics()     from public, anon, authenticated;

-- Daily rather than monthly so the window is a true rolling 180 days and the
-- aggregate never lags reality by weeks.
select cron.schedule(
  'prune-analytics',
  '15 3 * * *',
  $$select public.prune_analytics();$$
);
