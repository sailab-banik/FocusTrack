-- Pausing a running session. paused_at marks a pause in progress and
-- paused_seconds totals the finished ones, so worked time is
-- ended_at - started_at - paused_seconds. A paused session still counts as
-- the user's one running session.
alter table public.sessions
  add column paused_at timestamptz,
  add column paused_seconds integer not null default 0 check (paused_seconds >= 0),
  add constraint sessions_paused_only_while_running check (paused_at is null or ended_at is null),
  add constraint sessions_paused_at_after_start check (paused_at is null or paused_at >= started_at),
  add constraint sessions_pauses_fit_in_session check (
    ended_at is null or paused_seconds <= extract(epoch from (ended_at - started_at))
  );
