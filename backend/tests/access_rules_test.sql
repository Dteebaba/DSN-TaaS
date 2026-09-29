-- Checks the access rules with the sample data. Run by tests/run.sh. Raises an error on any failure.
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
insert into auth.users values ('11111111-1111-1111-1111-111111111111'),('22222222-2222-2222-2222-222222222222'),('33333333-3333-3333-3333-333333333333');
insert into accounts values ('11111111-1111-1111-1111-111111111111','recruiter','RC-1001'),
                            ('22222222-2222-2222-2222-222222222222','recruiter','RC-1002'),
                            ('33333333-3333-3333-3333-333333333333','member','DSN-2024-0187');
update recruiters set user_id='11111111-1111-1111-1111-111111111111' where id='RC-1001';
update recruiters set user_id='22222222-2222-2222-2222-222222222222' where id='RC-1002';
update members    set user_id='33333333-3333-3333-3333-333333333333' where dsn_id='DSN-2024-0187';

create or replace function pg_temp.expect(label text, got bigint, want bigint) returns void language plpgsql as $$
begin if got <> want then raise exception 'FAIL %: got %, want %', label, got, want; end if; raise notice 'ok  %', label; end $$;

-- visitor
set role anon; select set_config('request.jwt.claim.sub','',false);
select pg_temp.expect('visitor sees no full profiles', (select count(*) from members), 0);
select pg_temp.expect('visitor sees anonymised directory', (select count(*) from public_talent), 6);
select pg_temp.expect('visitor sees no contacts', (select count(*) from member_contacts), 0);
reset role;
-- subscribed partner
set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',false);
select pg_temp.expect('subscribed partner sees full profiles', (select count(*) from members), 6);
select pg_temp.expect('subscribed partner sees no contacts', (select count(*) from member_contacts), 0);
reset role;
-- free partner
set role authenticated; select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222',false);
select pg_temp.expect('free partner sees no full profiles', (select count(*) from members), 0);
reset role;
-- member
set role authenticated; select set_config('request.jwt.claim.sub','33333333-3333-3333-3333-333333333333',false);
select pg_temp.expect('member sees own contacts only', (select count(*) from member_contacts), 1);
update members set score_tech = 20, premium = true where dsn_id = 'DSN-2024-0187';
reset role;
select pg_temp.expect('member cannot change own score', (select score_tech from members where dsn_id='DSN-2024-0187'), 11);
select pg_temp.expect('member cannot turn on premium', (select premium::int from members where dsn_id='DSN-2024-0187'), 0);
