-- An AI-written review of one week of tracked work, written on request.
-- Earlier reviews are kept so a week can be re-reviewed without losing the
-- previous read; the page shows the newest one for the week.
create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Monday of the reviewed week, in the user's timezone.
  week_start date not null check (extract(isodow from week_start) = 1),
  headline text not null check (char_length(headline) between 1 and 300),
  -- [{ "title": text, "evidence": text }], validated by the app.
  observations jsonb not null check (jsonb_typeof(observations) = 'array'),
  next_action text not null check (char_length(next_action) between 1 and 500),
  provider text not null,
  model text not null,
  prompt_version text not null,
  created_at timestamptz not null default now()
);

create index weekly_reviews_user_id_week_start_idx
  on public.weekly_reviews (user_id, week_start desc, created_at desc);

alter table public.weekly_reviews enable row level security;

create policy "Users can read their own reviews"
  on public.weekly_reviews for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own reviews"
  on public.weekly_reviews for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Reviews are a record: written once, never edited or deleted by clients.
grant select, insert on public.weekly_reviews to authenticated;
revoke update, delete on public.weekly_reviews from authenticated;
revoke all on public.weekly_reviews from anon;
