-- Component covers: a case file's cover may be inline SVG artwork in the repo
-- rather than a Cloudinary asset.
--
-- WHY THE COLUMN CANNOT JUST BE NULL
-- The four covers are conceptual artwork bound to our design tokens. An SVG
-- inside an <img> is an isolated document: it cannot read the page's CSS, so
-- no --color-* resolves and it cannot follow the theme. Token binding and
-- Cloudinary delivery are mutually exclusive, and token binding won — so these
-- covers have no `media` row to point at.
--
-- Leaving `cover_media_id` NULL and inferring "it must be a component" is the
-- version of this that rots: nothing states the intent, and a case file that
-- has simply not been given a cover yet is indistinguishable from one whose
-- cover is code. `cover_kind` says which, explicitly.
--
-- The decision is data; the implementation stays code. `cover_component` is a
-- registry key resolved in designs/registry.tsx — the same split already used
-- for media, where the public_id is data and the transform preset is code. An
-- unresolvable key throws at render, the way assert_cover_not_redacted's
-- application-side twin throws: a silently-dropped cover looks like a missing
-- image and gets ignored, a thrown error gets fixed.
--
-- ─────────────────────────────────────────────────────────────────────────
-- THE REDACTION TRIGGERS ARE NOT BYPASSED HERE. THEY ARE INAPPLICABLE.
--
-- Migration 0007 installed three guards for decision 028: a redacted asset may
-- never be a case-file cover or the OG image, because both travel into link
-- previews that cannot be recalled.
--
-- A component cover leaves `cover_media_id` NULL, so
-- `assert_cover_not_redacted` passes trivially — and it passes *correctly*.
-- The risk that decision 028 exists for is a raster of a real screen escaping
-- the site. This artwork is a schematic drawn entirely from design tokens; it
-- contains no client pixels and has no NDA surface to leak. There is nothing
-- for the trigger to catch.
--
-- This note exists because the next person to read `cover_media_id IS NULL` on
-- a published case file will reasonably wonder whether the guard was dodged.
-- It was not. The guards on `settings.og_image` and on `media.redacted` are
-- untouched and still load-bearing — the OG image remains a real raster, since
-- link previews cannot render SVG at all.
--
-- One consequence worth stating: the covers of NDA case files are no longer
-- desaturated, because the grayscale half of amendment 036 is a Cloudinary
-- transform and this path never reaches Cloudinary. The NDA signal on a card
-- is carried by the `redacted_notice` badge, which is the half that always
-- worked and is unaffected. See decision 050.
-- ─────────────────────────────────────────────────────────────────────────

alter table case_files
  add column cover_kind text not null default 'media',
  add column cover_component text;

alter table case_files
  add constraint case_files_cover_kind_valid
    check (cover_kind in ('media', 'component'));

-- The two cover sources are mutually exclusive. A row cannot carry both, and
-- a component row cannot carry a media id that something later reads by
-- mistake.
alter table case_files
  add constraint case_files_cover_source_exclusive
    check (
      (cover_kind = 'media'
        and cover_component is null)
      or
      (cover_kind = 'component'
        and cover_component is not null
        and cover_media_id is null)
    );

comment on column case_files.cover_kind is
  'Where the cover comes from: a media row, or inline SVG artwork in designs/.';
comment on column case_files.cover_component is
  'Registry key for designs/registry.tsx. Null unless cover_kind = ''component''.';

-- Egypt Acquisition is the first, and the test case for the pattern.
update case_files
   set cover_kind = 'component',
       cover_component = 'egypt-acquisition'
 where slug = 'egypt-acquisition';
