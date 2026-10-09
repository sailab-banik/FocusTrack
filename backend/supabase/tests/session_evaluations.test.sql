begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

insert into public.projects (id, user_id, name) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Alice project'),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Bob project');

insert into public.sessions (id, user_id, project_id, category_id, started_at, ended_at, description, outcome)
select 'aaaaaaaa-0000-0000-0000-0000000000a5'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
       'aaaaaaaa-0000-0000-0000-000000000001'::uuid,
       (select id from public.categories where user_id = '11111111-1111-1111-1111-111111111111' and name = 'Build'),
       now() - interval '1 hour', now(), 'Work'::text, 'Output'::text
union all
select 'bbbbbbbb-0000-0000-0000-0000000000b5'::uuid, '22222222-2222-2222-2222-222222222222'::uuid,
       'bbbbbbbb-0000-0000-0000-000000000001'::uuid,
       (select id from public.categories where user_id = '22222222-2222-2222-2222-222222222222' and name = 'Build'),
       now() - interval '1 hour', now(), 'Work', 'Output';

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.session_evaluations
       (session_id, output, skill_growth, goal_alignment, leverage, strategic_value,
        overall_contribution, rationale, next_action, provider, model, prompt_version)
     values ('aaaaaaaa-0000-0000-0000-0000000000a5', 3, 2, 4, 2, 3, 3,
             'Rationale', 'Next action', 'openai', 'test-model', 'v1') $$,
  'a user can store an evaluation of their own session'
);

select throws_ok(
  $$ insert into public.session_evaluations
       (session_id, output, skill_growth, goal_alignment, leverage, strategic_value,
        overall_contribution, rationale, next_action, provider, model, prompt_version)
     values ('aaaaaaaa-0000-0000-0000-0000000000a5', 3, 2, 4, 2, 3, 3,
             'Again', 'Again', 'openai', 'test-model', 'v1') $$,
  '23505',
  null,
  'a session has at most one evaluation'
);

select throws_ok(
  $$ insert into public.session_evaluations
       (session_id, output, skill_growth, goal_alignment, leverage, strategic_value,
        overall_contribution, rationale, next_action, provider, model, prompt_version)
     values ('bbbbbbbb-0000-0000-0000-0000000000b5', 3, 2, 4, 2, 3, 3,
             'Rationale', 'Next action', 'openai', 'test-model', 'v1') $$,
  '23503',
  null,
  'a user cannot evaluate someone else''s session'
);

select throws_ok(
  $$ update public.session_evaluations set output = 6 $$,
  '23514',
  null,
  'scores are limited to 1-5'
);

reset role;

delete from public.sessions where id = 'aaaaaaaa-0000-0000-0000-0000000000a5';

select is(
  (select count(*)::int from public.session_evaluations),
  0,
  'deleting a session deletes its evaluation'
);

set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select throws_ok(
  $$ delete from public.session_evaluations $$,
  '42501',
  null,
  'clients cannot delete evaluations directly'
);

set local role anon;

select throws_ok(
  $$ select * from public.session_evaluations $$,
  '42501',
  null,
  'anonymous requests cannot read evaluations'
);

select * from finish();
rollback;
