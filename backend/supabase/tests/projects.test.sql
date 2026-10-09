begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

insert into public.projects (user_id, name) values
  ('22222222-2222-2222-2222-222222222222', 'Bob project');

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.projects (name) values ('FocusTrack') $$,
  'a user can create a project without sending user_id'
);

select is(
  (select user_id from public.projects where name = 'FocusTrack'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'user_id defaults to the authenticated user'
);

select is(
  (select count(*)::int from public.projects),
  1,
  'a user sees only their own projects'
);

select throws_ok(
  $$ insert into public.projects (user_id, name)
     values ('22222222-2222-2222-2222-222222222222', 'Sneaky') $$,
  '42501',
  null,
  'a user cannot create a project for someone else'
);

select throws_ok(
  $$ insert into public.projects (name) values ('focustrack') $$,
  '23505',
  null,
  'project names are unique per user, ignoring case'
);

select lives_ok(
  $$ update public.projects set archived_at = now() where name = 'FocusTrack' $$,
  'a user can archive their own project'
);

update public.projects set name = 'Hijacked', archived_at = now()
  where user_id = '22222222-2222-2222-2222-222222222222';

select throws_ok(
  $$ delete from public.projects where name = 'FocusTrack' $$,
  '42501',
  null,
  'clients cannot delete projects'
);

reset role;

select is(
  (select name from public.projects where user_id = '22222222-2222-2222-2222-222222222222'),
  'Bob project',
  'a user cannot rename or archive someone else''s project'
);

set local role anon;

select throws_ok(
  $$ select * from public.projects $$,
  '42501',
  null,
  'anonymous requests cannot read projects'
);

select * from finish();
rollback;
