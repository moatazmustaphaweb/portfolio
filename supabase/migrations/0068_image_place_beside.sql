-- 0068 — `chapter_paragraphs.place`: a figure that sits beside its paragraph
--         (task 014261026, decision 070)
--
-- Decided by Moataz: one image can sit beside the prose that leads into it, in
-- ANY chapter layout, without switching the whole chapter to Editorial (which
-- would also move every wide web screen out of its laptop frame). Authored PER
-- IMAGE, as an optional span in the Notion image tag:
--
--   `[cld] …`  `[alt] …`  `[caption] …`  `[place] beside`
--
-- WHY ON `chapter_paragraphs` AND NOT ON `media`: the same reason as `frame`
-- (0067). A `chapter_paragraphs` image row IS the placement — one per figure,
-- per locale, per position — while a `media` row is shared by public ID across
-- locales and chapters.
--
-- Nullable `text` + CHECK, the shape of `frame` (0067). NULL = the figure keeps
-- its normal place in the chapter layout (the default and the state of every
-- existing row); 'beside' = it pairs with the prose since the previous figure.
-- There is no other value: the sync reports any other `[place]` value and
-- writes NULL. Independent of `frame`: a row may carry either, both or neither.
--
-- NO BACKFILL. 'beside' arrives through the sync, from Notion, and nowhere else.
--
-- Idempotent: re-running it is a no-op.
--
-- ORDER: either order is safe. Before this is applied, a live sync writes
-- everything else, skips the flag, and reports each `[place] beside` it could
-- not store; `lib/content/chapters.ts` reads a missing column as NULL. After it
-- is applied, the next live sync stores the flags.

alter table chapter_paragraphs
  add column if not exists place text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'chapter_paragraphs_place_valid'
       and conrelid = 'public.chapter_paragraphs'::regclass
  ) then
    alter table chapter_paragraphs
      add constraint chapter_paragraphs_place_valid
        check (place is null or place = 'beside');
  end if;
end $$;

comment on column chapter_paragraphs.place is
  'Per-placement position override for an image paragraph: NULL = normal place in the chapter layout; beside = the figure sits beside the prose since the previous figure (decision 070). From the Notion image tag span [place] beside.';
