-- Composite keys let sessions reference (id, user_id) so a session can only
-- point at the same user's project and category. A plain FK on id would
-- bypass RLS and accept another user's ids.
alter table public.projects add constraint projects_id_user_id_key unique (id, user_id);
alter table public.categories add constraint categories_id_user_id_key unique (id, user_id);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid not null,
  category_id uuid not null,
  started_at timestamptz not null default now(),
  -- Null while the timer is running.
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (project_id, user_id) references public.projects (id, user_id),
  -- Restrict: a category with sessions cannot be removed.
  foreign key (category_id, user_id) references public.categories (id, user_id),
  check (ended_at is null or ended_at >= started_at)
);

-- At most one running session per user, across devices.
create unique index sessions_one_running_per_user on public.sessions (user_id) where ended_at is null;

create index sessions_user_id_started_at_idx on public.sessions (user_id, started_at desc);

alter table public.sessions enable row level security;

create policy "Users can read their own sessions"
  on public.sessions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own sessions"
  on public.sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own sessions"
  on public.sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own sessions"
  on public.sessions for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.sessions to authenticated;
revoke all on public.sessions from anon;
