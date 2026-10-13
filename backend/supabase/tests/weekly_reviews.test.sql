begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

insert into public.weekly_reviews
  (user_id, week_start, headline, observations, next_action, provider, model, prompt_version)
values
  ('22222222-2222-2222-2222-222222222222', '2026-10-12', 'Bob''s week', '[]', 'Next', 'openai', 'test-model', 'v1');

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.weekly_reviews
       (week_start, headline, observations, next_action, provider, model, prompt_version)
     values ('2026-10-12', 'Headline', '[{"title": "T", "evidence": "E"}]', 'Next', 'openai', 'test-model', 'v1') $$,
  'a user can store a review of their own week'
);

select is(
  (select count(*)::int from public.weekly_reviews),
  1,
  'a user sees only their own reviews'
);

select throws_ok(
  $$ insert into public.weekly_reviews
       (user_id, week_start, headline, observations, next_action, provider, model, prompt_version)
     values ('22222222-2222-2222-2222-222222222222', '2026-10-12', 'H', '[]', 'N', 'openai', 'm', 'v1') $$,
  '42501',
  null,
  'a user cannot store a review for someone else'
);

select throws_ok(
  $$ insert into public.weekly_reviews
       (week_start, headline, observations, next_action, provider, model, prompt_version)
     values ('2026-10-13', 'H', '[]', 'N', 'openai', 'm', 'v1') $$,
  '23514',
  null,
  'week_start must be a Monday'
);

select throws_ok(
  $$ insert into public.weekly_reviews
       (week_start, headline, observations, next_action, provider, model, prompt_version)
     values ('2026-10-12', 'H', '{"title": "T"}', 'N', 'openai', 'm', 'v1') $$,
  '23514',
  null,
  'observations must be an array'
);

select throws_ok(
  $$ update public.weekly_reviews set headline = 'Edited' $$,
  '42501',
  null,
  'clients cannot edit reviews'
);

select throws_ok(
  $$ delete from public.weekly_reviews $$,
  '42501',
  null,
  'clients cannot delete reviews'
);

set local role anon;

select throws_ok(
  $$ select * from public.weekly_reviews $$,
  '42501',
  null,
  'anonymous requests cannot read reviews'
);

select * from finish();
rollback;
