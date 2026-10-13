-- Per-session evaluations and on-request weekly reviews give way to reports
-- written automatically, once per closed day, week, and month.
drop table public.session_evaluations;
alter table public.sessions drop constraint sessions_id_user_id_key;
drop table public.weekly_reviews;

-- An AI-written report on one closed day, week, or month of tracked work.
-- The row is inserted empty as a claim before the provider is called, so a
-- period is never written twice at once, and filled in when the report
-- arrives. The content columns are all null (claimed) or all set (written).
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  period text not null check (period in ('day', 'week', 'month')),
  -- First day of the period in the user's timezone.
  period_start date not null,
  -- When the latest attempt to write the report began.
  claimed_at timestamptz not null default now(),
  headline text check (char_length(headline) between 1 and 300),
  -- [{ "title": text, "evidence": text }], validated by the app.
  observations jsonb check (jsonb_typeof(observations) = 'array'),
  next_action text check (char_length(next_action) between 1 and 500),
  provider text,
  model text,
  prompt_version text,
  written_at timestamptz,
  unique (user_id, period, period_start),
  check (period <> 'week' or extract(isodow from period_start) = 1),
  check (period <> 'month' or extract(day from period_start) = 1),
  check (
    num_nulls(headline, observations, next_action, provider, model, prompt_version, written_at)
      in (0, 7)
  )
);

-- A failed attempt is retried once its claim is old enough. Stamping the
-- claim here stops a client from backdating it to force extra provider calls.
create function public.stamp_report_claim() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.claimed_at := now();
  return new;
end;
$$;

create trigger reports_stamp_claim
  before insert or update on public.reports
  for each row execute function public.stamp_report_claim();

alter table public.reports enable row level security;

create policy "Users can read their own reports"
  on public.reports for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can claim their own reports"
  on public.reports for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- A written report is a record: only an unwritten claim can be updated.
create policy "Users can fill in their own claimed reports"
  on public.reports for update to authenticated
  using ((select auth.uid()) = user_id and written_at is null)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.reports to authenticated;
revoke delete on public.reports from authenticated;
revoke all on public.reports from anon;
