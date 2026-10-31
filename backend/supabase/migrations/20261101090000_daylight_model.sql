-- Daylight (docs/DESIGN.md): a project carries its own optional "why", and a
-- stopped session needs one line, the outcome column, saying what got done.
-- Additive on purpose: public.goals, projects.goal_id, and the old session
-- columns stay in place and keep their data, but the app no longer uses them.

alter table public.projects
  add column why text check (why = btrim(why) and char_length(why) between 1 and 120);

-- Several projects can share a goal; each one gets its title as its why.
update public.projects p
set why = btrim(g.title)
from public.goals g
where p.goal_id = g.id and g.archived_at is null;

alter table public.sessions drop constraint sessions_stopped_requires_log;

-- NOT VALID: sessions stopped before logging was required keep empty fields
-- instead of being deleted; every new or edited row is checked.
alter table public.sessions
  add constraint sessions_stopped_requires_comment check (
    ended_at is null or coalesce(btrim(outcome), '') <> ''
  ) not valid;
