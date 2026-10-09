create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 80),
  -- Projects are archived rather than deleted so past sessions keep their project.
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index projects_user_id_name_key on public.projects (user_id, lower(name));

alter table public.projects enable row level security;

create policy "Users can read their own projects"
  on public.projects for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own projects"
  on public.projects for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own projects"
  on public.projects for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- No delete policy: projects are archived, never deleted by clients.

grant select, insert, update on public.projects to authenticated;
revoke delete on public.projects from authenticated;
revoke all on public.projects from anon;
