begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

insert into public.goals (id, user_id, title) values
  ('bbbbbbbb-0000-0000-0000-00000000000b', '22222222-2222-2222-2222-222222222222', 'Bob goal');

insert into public.projects (id, user_id, name) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'FocusTrack');

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.goals (id, title, description)
     values ('aaaaaaaa-0000-0000-0000-00000000000a', 'Become a stronger engineer', 'Ship real systems') $$,
  'a user can create a goal without sending user_id'
);

select is(
  (select count(*)::int from public.goals),
  1,
  'a user sees only their own goals'
);

select throws_ok(
  $$ insert into public.goals (title) values ('become a STRONGER engineer') $$,
  '23505',
  null,
  'goal titles are unique per user, ignoring case'
);

select lives_ok(
  $$ update public.projects set goal_id = 'aaaaaaaa-0000-0000-0000-00000000000a'
     where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  'a user can link their project to their goal'
);

select throws_ok(
  $$ update public.projects set goal_id = 'bbbbbbbb-0000-0000-0000-00000000000b'
     where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  '23503',
  null,
  'a project cannot link to another user''s goal'
);

select lives_ok(
  $$ update public.projects set goal_id = null
     where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  'a project can be unlinked from its goal'
);

select throws_ok(
  $$ delete from public.goals where id = 'aaaaaaaa-0000-0000-0000-00000000000a' $$,
  '42501',
  null,
  'clients cannot delete goals'
);

update public.goals set title = 'Hijacked'
  where user_id = '22222222-2222-2222-2222-222222222222';

reset role;

select is(
  (select title from public.goals where user_id = '22222222-2222-2222-2222-222222222222'),
  'Bob goal',
  'a user cannot change someone else''s goal'
);

set local role anon;

select throws_ok(
  $$ select * from public.goals $$,
  '42501',
  null,
  'anonymous requests cannot read goals'
);

select * from finish();
rollback;
