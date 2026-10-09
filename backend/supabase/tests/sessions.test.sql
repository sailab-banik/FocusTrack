begin;
create extension if not exists pgtap with schema extensions;
select plan(13);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

insert into public.projects (id, user_id, name) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Alice project'),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Bob project');

create temporary table ids on commit drop as
select
  (select id from public.categories where user_id = '11111111-1111-1111-1111-111111111111' and name = 'Build') as alice_build,
  (select id from public.categories where user_id = '22222222-2222-2222-2222-222222222222' and name = 'Build') as bob_build;
grant select on ids to authenticated;

insert into public.sessions (user_id, project_id, category_id, started_at, ended_at, description, outcome)
select '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000001', bob_build,
       now() - interval '1 hour', now(), 'Bob work', 'Bob output'
from ids;

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.sessions (project_id, category_id)
     select 'aaaaaaaa-0000-0000-0000-000000000001', alice_build from ids $$,
  'a user can start a session on their own project and category'
);

select is(
  (select count(*)::int from public.sessions),
  1,
  'a user sees only their own sessions'
);

select throws_ok(
  $$ insert into public.sessions (project_id, category_id)
     select 'aaaaaaaa-0000-0000-0000-000000000001', alice_build from ids $$,
  '23505',
  null,
  'a user cannot run two sessions at once'
);

select throws_ok(
  $$ update public.sessions set ended_at = now() where ended_at is null $$,
  '23514',
  null,
  'a session cannot be stopped without a description and outcome'
);

select throws_ok(
  $$ update public.sessions set ended_at = now(), description = '  ', outcome = 'Shipped'
     where ended_at is null $$,
  '23514',
  null,
  'a blank description does not count'
);

select throws_ok(
  $$ update public.sessions set energy = 6 where ended_at is null $$,
  '23514',
  null,
  'energy is limited to 1-5'
);

select lives_ok(
  $$ update public.sessions
     set ended_at = now(), description = 'Timer UI', outcome = 'Shipped start/stop', energy = 4
     where ended_at is null $$,
  'a user can stop their running session with a log'
);

select throws_ok(
  $$ insert into public.sessions (project_id, category_id)
     select 'bbbbbbbb-0000-0000-0000-000000000001', alice_build from ids $$,
  '23503',
  null,
  'a session cannot use another user''s project'
);

select throws_ok(
  $$ insert into public.sessions (project_id, category_id)
     select 'aaaaaaaa-0000-0000-0000-000000000001', bob_build from ids $$,
  '23503',
  null,
  'a session cannot use another user''s category'
);

select throws_ok(
  $$ insert into public.sessions (project_id, category_id, started_at, ended_at, description, outcome)
     select 'aaaaaaaa-0000-0000-0000-000000000001', alice_build, now(), now() - interval '1 minute', 'Work', 'Output'
     from ids $$,
  '23514',
  null,
  'a session cannot end before it starts'
);

select throws_ok(
  $$ delete from public.categories where id = (select alice_build from ids) $$,
  '23503',
  null,
  'a category with sessions cannot be removed'
);

update public.sessions set ended_at = null where user_id = '22222222-2222-2222-2222-222222222222';
delete from public.sessions where user_id = '22222222-2222-2222-2222-222222222222';

reset role;

select is(
  (select count(*)::int from public.sessions
   where user_id = '22222222-2222-2222-2222-222222222222' and ended_at is not null),
  1,
  'a user cannot change or delete someone else''s sessions'
);

set local role anon;

select throws_ok(
  $$ select * from public.sessions $$,
  '42501',
  null,
  'anonymous requests cannot read sessions'
);

select * from finish();
rollback;
