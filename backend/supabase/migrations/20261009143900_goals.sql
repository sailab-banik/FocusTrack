create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (title = btrim(title) and char_length(title) between 1 and 120),
  description text check (char_length(description) <= 1000),
  -- Archived (achieved or dropped) rather than deleted, like projects.
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index goals_user_id_title_key on public.goals (user_id, lower(title));

alter table public.goals enable row level security;

create policy "Users can read their own goals"
  on public.goals for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own goals"
  on public.goals for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own goals"
  on public.goals for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.goals to authenticated;
revoke delete on public.goals from authenticated;
revoke all on public.goals from anon;

-- One optional goal per project. The composite key keeps the goal owned by
-- the project's user; a null goal_id skips the check.
alter table public.projects
  add column goal_id uuid,
  add foreign key (goal_id, user_id) references public.goals (id, user_id);

create index projects_goal_id_idx on public.projects (goal_id);
