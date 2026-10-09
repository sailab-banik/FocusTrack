alter table public.sessions
  add column description text check (char_length(description) <= 500),
  add column outcome text check (char_length(outcome) <= 500),
  add column energy smallint check (energy between 1 and 5),
  add column difficulty smallint check (difficulty between 1 and 5),
  add column notes text check (char_length(notes) <= 2000);

-- A stopped session must say what was worked on and what it produced.
-- NOT VALID: sessions stopped before this migration keep empty fields
-- instead of being deleted; every new or edited row is checked.
alter table public.sessions
  add constraint sessions_stopped_requires_log check (
    ended_at is null
    or (coalesce(btrim(description), '') <> '' and coalesce(btrim(outcome), '') <> '')
  ) not valid;
