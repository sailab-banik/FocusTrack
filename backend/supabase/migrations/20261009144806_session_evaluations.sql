alter table public.sessions add constraint sessions_id_user_id_key unique (id, user_id);

-- AI-assisted estimates of a session's contribution, 1-5 per dimension.
-- Provider, model, and prompt version are stored so scores stay comparable
-- when prompts or models change.
create table public.session_evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id uuid not null,
  output smallint not null check (output between 1 and 5),
  skill_growth smallint not null check (skill_growth between 1 and 5),
  goal_alignment smallint not null check (goal_alignment between 1 and 5),
  leverage smallint not null check (leverage between 1 and 5),
  strategic_value smallint not null check (strategic_value between 1 and 5),
  overall_contribution smallint not null check (overall_contribution between 1 and 5),
  rationale text not null check (char_length(rationale) between 1 and 2000),
  next_action text not null check (char_length(next_action) between 1 and 500),
  provider text not null,
  model text not null,
  prompt_version text not null,
  created_at timestamptz not null default now(),
  -- One current evaluation per session; re-evaluating replaces it.
  unique (session_id),
  foreign key (session_id, user_id) references public.sessions (id, user_id) on delete cascade
);

alter table public.session_evaluations enable row level security;

create policy "Users can read their own evaluations"
  on public.session_evaluations for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own evaluations"
  on public.session_evaluations for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own evaluations"
  on public.session_evaluations for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.session_evaluations to authenticated;
revoke delete on public.session_evaluations from authenticated;
revoke all on public.session_evaluations from anon;
