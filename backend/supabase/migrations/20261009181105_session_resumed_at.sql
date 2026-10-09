-- When the current uninterrupted stretch of work began, for a session that has
-- been paused and resumed. Null means the stretch began at started_at. The app
-- uses it to suggest a break after a long stretch.
alter table public.sessions
  add column resumed_at timestamptz;
