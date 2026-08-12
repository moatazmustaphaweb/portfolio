-- Amendment 034 — raw analytics retention moves from 180 to 360 days.
-- Supersedes the window in decision 031. Aggregates unchanged: kept
-- indefinitely, no session id and no city, so they cannot be re-identified.
--
-- Applied as `retention_360_days`.

create or replace function prune_analytics()
returns void
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
begin
  -- Aggregate BEFORE pruning. The order remains load-bearing.
  perform aggregate_analytics();
  delete from sessions where started_at < now() - interval '360 days';
end;
$$;

revoke execute on function prune_analytics() from public, anon, authenticated;
