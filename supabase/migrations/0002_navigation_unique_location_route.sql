-- Navigation has no natural key, which makes an idempotent seed impossible:
-- re-running would duplicate every menu item. Within one location a repeated
-- route is meaningless, so (location, route) is the natural key. The same route
-- may still appear in both header and footer.
--
-- Applied as `navigation_unique_location_route`.

alter table navigation
  add constraint navigation_location_route_key unique (location, route);
