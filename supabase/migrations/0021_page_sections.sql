-- 0021 — `page_sections`: ordered prose for the static pages.
--
-- AMENDS the sync contract, Step 1, which routes static page content to
-- `translations` with `entity_type = 'ui_string'` scoped by route.
--
-- That mapping cannot carry these pages. About, Philosophy, Systems and
-- Contact are not a handful of labels — they are five to seven ordered
-- sections each, every one a heading plus several paragraphs, and the order is
-- load-bearing: About runs Now → Before → The Artist's Book → What that year
-- taught me, which is a chronology. `ui_strings` has no `sort_order`, so the
-- contract's mapping would have needed order encoded into key names
-- (`page.about.03-artists-book`), which puts sequencing inside a string and
-- makes reordering a rename of every key after the insertion point.
--
-- This is the same shape every other content type here already uses: a row
-- carrying structure and order, with the words in `translations`. Heading and
-- body are separate fields because the heading IS content — "What that year
-- actually taught me" is written, not a label — and both need Arabic.
--
-- `page` is text rather than an enum. The set grows (Studio, Read, the Door)
-- and an enum would need a migration per page for no integrity benefit; the
-- sync only ever writes values it derives from a route it already parsed.

create table page_sections (
  id         uuid primary key default gen_random_uuid(),
  -- Route-derived: 'about' · 'about/philosophy' · 'systems' · 'contact'
  page       text not null,
  -- Heading-derived, unique within the page. Stable across re-syncs so a
  -- section keeps its identity when its neighbours move.
  slug       text not null,
  sort_order int not null default 0,
  constraint page_sections_unique unique (page, slug)
);

create index page_sections_page_idx on page_sections (page, sort_order);

alter table page_sections enable row level security;

-- Static page copy is public by definition — it renders for every visitor.
create policy "public reads page sections" on page_sections
  for select using (true);
