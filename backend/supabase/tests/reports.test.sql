begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

insert into public.reports (user_id, period, period_start) values
  ('22222222-2222-2222-2222-222222222222', 'day', '2026-10-13');

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.reports (period, period_start) values ('day', '2026-10-13') $$,
  'a user can claim a report for their own period'
);

select is(
  (select count(*)::int from public.reports),
  1,
  'a user sees only their own reports'
);

select throws_ok(
  $$ insert into public.reports (period, period_start) values ('day', '2026-10-13') $$,
  '23505',
  null,
  'a period can be claimed only once'
);

select throws_ok(
  $$ insert into public.reports (user_id, period, period_start)
     values ('22222222-2222-2222-2222-222222222222', 'week', '2026-10-05') $$,
  '42501',
  null,
  'a user cannot claim a report for someone else'
);

select throws_ok(
  $$ insert into public.reports (period, period_start) values ('week', '2026-10-13') $$,
  '23514',
  null,
  'a week must start on a Monday'
);

select throws_ok(
  $$ insert into public.reports (period, period_start) values ('month', '2026-10-13') $$,
  '23514',
  null,
  'a month must start on its first day'
);

select throws_ok(
  $$ insert into public.reports (period, period_start) values ('year', '2026-01-01') $$,
  '23514',
  null,
  'only days, weeks, and months are reported on'
);

select lives_ok(
  $$ update public.reports set claimed_at = '2000-01-01' $$,
  'a user can touch their own unwritten claim'
);

select ok(
  (select claimed_at > now() - interval '1 minute' from public.reports),
  'a claim cannot be backdated'
);

select throws_ok(
  $$ update public.reports set headline = 'Half written' $$,
  '23514',
  null,
  'a report is written whole or not at all'
);

select lives_ok(
  $$ update public.reports set
       headline = 'Headline',
       observations = '[{"title": "T", "evidence": "E"}]',
       next_action = 'Next',
       provider = 'openai',
       model = 'test-model',
       prompt_version = 'v1',
       written_at = now() $$,
  'a user can fill in their own claim'
);

update public.reports set headline = 'Edited';

select is(
  (select headline from public.reports),
  'Headline',
  'a written report cannot be edited'
);

select throws_ok(
  $$ delete from public.reports $$,
  '42501',
  null,
  'clients cannot delete reports'
);

set local role anon;

select throws_ok(
  $$ select * from public.reports $$,
  '42501',
  null,
  'anonymous requests cannot read reports'
);

select * from finish();
rollback;
