-- Kind decides whether time in a category counts toward the execution ratio.
create type public.category_kind as enum ('execution', 'preparation');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 40),
  kind public.category_kind not null,
  created_at timestamptz not null default now()
);

create unique index categories_user_id_name_key on public.categories (user_id, lower(name));

alter table public.categories enable row level security;

create policy "Users can read their own categories"
  on public.categories for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own categories"
  on public.categories for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own categories"
  on public.categories for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own categories"
  on public.categories for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.categories to authenticated;
revoke all on public.categories from anon;

create function public.seed_default_categories(target_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.categories (user_id, name, kind) values
    (target_user_id, 'Build', 'execution'),
    (target_user_id, 'Create', 'execution'),
    (target_user_id, 'Work', 'execution'),
    (target_user_id, 'Practice', 'execution'),
    (target_user_id, 'Learn', 'preparation'),
    (target_user_id, 'Brainstorm', 'preparation'),
    (target_user_id, 'Review', 'preparation');
$$;

-- Only the signup trigger may seed; clients must not seed for arbitrary users.
revoke execute on function public.seed_default_categories(uuid) from public, anon, authenticated;

create function public.handle_new_user_categories()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.seed_default_categories(new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user_categories() from public, anon, authenticated;

create trigger on_auth_user_created_seed_categories
  after insert on auth.users
  for each row execute function public.handle_new_user_categories();

-- Users who signed up before this migration.
select public.seed_default_categories(id) from auth.users;
