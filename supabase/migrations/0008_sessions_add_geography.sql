-- Decision 029: approximate geography, without ever storing an IP.
--
-- On Vercel, x-vercel-ip-country and x-vercel-ip-city arrive as request headers
-- already resolved at the edge. The raw address never enters our code, so there
-- is nothing to "discard carefully" — it is never held in the first place. That
-- is a stronger posture than resolving it ourselves and deleting afterwards.
--
-- Deliberately NOT added: region, latitude, longitude, postal code, timezone.
-- City is already the most identifying field in this table; anything finer
-- would turn approximate geography into a location trail.
--
-- Applied as `sessions_add_geography`.

alter table sessions add column country text;  -- ISO 3166-1 alpha-2, e.g. 'AE'
alter table sessions add column city text;     -- e.g. 'Dubai'

comment on column sessions.country is
  'ISO 3166-1 alpha-2, resolved at the edge from x-vercel-ip-country. The IP itself is never read or stored.';
comment on column sessions.city is
  'City name, resolved at the edge from x-vercel-ip-city. The IP itself is never read or stored.';

create index on sessions (country, started_at desc);
