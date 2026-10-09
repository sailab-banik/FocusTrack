begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

select is(
  (select count(*)::int from public.categories where user_id = '11111111-1111-1111-1111-111111111111'),
  7,
  'new users get the seven default categories'
);

select is(
  (select kind from public.categories
   where user_id = '11111111-1111-1111-1111-111111111111' and name = 'Learn'),
  'preparation'::public.category_kind,
  'Learn is seeded as preparation'
);

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select is(
  (select count(*)::int from public.categories),
  7,
  'a user sees only their own categories'
);

select lives_ok(
  $$ insert into public.categories (name, kind) values ('Write', 'execution') $$,
  'a user can add a category without sending user_id'
);

select is(
  (select user_id from public.categories where name = 'Write'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'user_id defaults to the authenticated user'
);

select throws_ok(
  $$ insert into public.categories (user_id, name, kind)
     values ('22222222-2222-2222-2222-222222222222', 'Sneaky', 'execution') $$,
  '42501',
  null,
  'a user cannot create a category for someone else'
);

select throws_ok(
  $$ insert into public.categories (name, kind) values ('build', 'execution') $$,
  '23505',
  null,
  'category names are unique per user, ignoring case'
);

select throws_ok(
  $$ insert into public.categories (name, kind) values ('  Padded ', 'execution') $$,
  '23514',
  null,
  'category names must be trimmed'
);

update public.categories set name = 'Hijacked'
  where user_id = '22222222-2222-2222-2222-222222222222';
delete from public.categories
  where user_id = '22222222-2222-2222-2222-222222222222';

reset role;

select is(
  (select count(*)::int from public.categories where user_id = '22222222-2222-2222-2222-222222222222' and name <> 'Hijacked'),
  7,
  'a user cannot rename or delete someone else''s categories'
);

set local role anon;

select throws_ok(
  $$ select * from public.categories $$,
  '42501',
  null,
  'anonymous requests cannot read categories'
);

select throws_ok(
  $$ select public.seed_default_categories('11111111-1111-1111-1111-111111111111') $$,
  '42501',
  null,
  'clients cannot call the seeding function'
);

select * from finish();
rollback;
