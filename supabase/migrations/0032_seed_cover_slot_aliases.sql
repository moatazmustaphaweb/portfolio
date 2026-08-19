-- 0032 — Seed the slot aliases with EXACTLY what the four covers say today.
--
-- Every row below was read block by block from the live Notion pages, English
-- and Arabic, not transcribed from memory or inferred from the database. The
-- `observed_on` column records which cover each spelling came from so a future
-- reader can tell a real convention from a guess.
--
-- ── WHAT THIS SEED SHOWS ABOUT THE MODEL ────────────────────────────────────
--
-- `why-it-matters` already carries FOUR spellings across two covers and two
-- languages — "Why this one still matters" and "Why it matters anyway" are the
-- same slot saying different things about different projects. Under the old
-- vocabulary neither existed, so both passages were discarded.
--
-- `thesis` carries `الفكرة الأساسية` ("the core idea") on Neobiz where the other
-- covers use `الأطروحة`. That single unmapped word is why Neobiz's thesis was
-- the only field missing Arabic across all four case files.
--
-- ⚠️ `what it is` maps to `what-it-is` and NEVER to `thesis`. Neobiz carries
-- both slots; aliasing them would silently overwrite its thesis with its
-- component description.

insert into cover_slot_aliases (heading_norm, slot, observed_on) values
  -- thesis — the argument
  ('thesis',                          'thesis',         'Egypt · UAE · Neobiz (en)'),
  ('الأطروحة',                         'thesis',         'Egypt · UAE (ar)'),
  ('الفكرة الأساسية',                   'thesis',         'Neobiz (ar)'),

  -- what-it-is — the description of components. A SEPARATE slot.
  ('what it is',                      'what-it-is',     'Neobiz · Cervello (en)'),
  ('ما هو',                            'what-it-is',     'Neobiz · Cervello (ar)'),

  -- role — the first-person role statement
  ('my role',                         'role',           'Egypt · UAE · Cervello (en)'),
  ('role',                            'role',           'accepted spelling; not observed'),
  ('دوري',                             'role',           'Egypt · UAE · Cervello (ar)'),

  -- map — the chapter list
  ('the map',                         'map',            'Egypt (en)'),
  ('whats in it',                     'map',            'UAE (en) — apostrophe normalised away'),
  ('الخريطة',                          'map',            'Egypt · UAE (ar)'),

  -- status — the honest statement of what shipped
  ('status honestly',                 'status',         'Neobiz · Cervello (en) — comma normalised away'),
  ('الحالة بصراحة',                    'status',         'Neobiz · Cervello (ar) — comma normalised away'),

  -- why-it-matters — why the work counts
  ('why this one still matters',      'why-it-matters', 'Cervello (en)'),
  ('why it matters anyway',           'why-it-matters', 'Neobiz (en)'),
  ('ولماذا يهم رغم ذلك',                'why-it-matters', 'Cervello (ar)'),
  ('ولماذا يهم رغم أنه لم يُبنَ',          'why-it-matters', 'Neobiz (ar)'),

  -- outcomes — STRUCTURAL. Listed so the section is accounted for rather than
  -- reported as unrecognised; the rows themselves are read by the existing
  -- outcomes/targets parser with its status-marker rules intact.
  ('outcomes',                        'outcomes',       'Egypt (en)'),
  -- "Results" is UAE's word for the same slot Egypt calls "Outcomes". Both map
  -- to `outcomes`; the heading each cover chose is preserved as content.
  ('results',                         'outcomes',       'UAE (en)'),
  ('النتائج',                          'outcomes',       'Egypt · UAE (ar)'),

  -- entry-handles — STRUCTURAL. Parsed by the handles matcher, which already
  -- prefix-matches; these exist for accounting.
  ('three ways in',                   'entry-handles',  'all four (en)'),
  ('ثلاثة مداخل',                       'entry-handles',  'Egypt · UAE · Cervello (ar)'),
  ('ثلاثة مداخل لقراءة هذا الملف',        'entry-handles',  'Neobiz (ar)')
on conflict (heading_norm) do update
  set slot = excluded.slot, observed_on = excluded.observed_on;
