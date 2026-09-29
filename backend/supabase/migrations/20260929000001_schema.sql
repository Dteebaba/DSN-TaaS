-- DSN Talent Platform: core schema
-- Every person signs in through Supabase Auth (auth.users). Their platform identity
-- (member / reviewer / recruiter / admin) lives in public.accounts.

create extension if not exists pgcrypto;

-- ---------- types ----------
create type account_kind   as enum ('member','reviewer','recruiter','admin');
create type role_level     as enum ('Junior','Mid-Level','Senior','Lead / Expert');
create type role_status    as enum ('claimed','pending','verified','rejected');
create type request_type   as enum ('role','rating');
create type request_status as enum ('submitted','interview','completed','rejected');
create type decision_status as enum ('pending','approved','rejected');
create type score_status   as enum ('default','pending','reviewed');
create type talent_request_status as enum ('new','shortlisting','shared','interviewing','placed','closed');

-- ---------- reference data ----------
create table role_catalog (
  name        text primary key,
  summary     text not null default '',
  sort_order  int  not null default 0,
  active      boolean not null default true
);

create table role_level_descriptions (
  role        text references role_catalog(name) on update cascade on delete cascade,
  level       role_level,
  description text not null,
  primary key (role, level)
);

create table dsn_programmes (
  name       text primary key,
  sort_order int not null default 0
);

create table settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- accounts ----------
create table accounts (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  kind       account_kind not null,
  ref_id     text,                    -- DSN ID, RV-xxx or RC-xxxx (null for admin)
  created_at timestamptz not null default now(),
  unique (kind, ref_id)
);

-- ---------- applications ----------
create table applications (
  dsn_id            text primary key,
  full_name         text not null,
  email             text not null,
  phone             text,
  gender            text,
  age_range         text,
  state             text,
  education         text,
  employment_status text not null,
  years_experience  text,
  current_title     text,
  current_org       text,
  sector            text,
  income_band       text,
  programmes        text[] not null default '{}',
  primary_role      text not null,
  other_roles       text[] not null default '{}',
  dsn_impact        text,
  goals             text,
  consent           boolean not null default false check (consent),
  status            decision_status not null default 'pending',
  decided_at        timestamptz,
  decided_by        uuid references auth.users(id),
  created_at        timestamptz not null default now()
);

-- ---------- members (talent) ----------
create table members (
  dsn_id            text primary key,
  user_id           uuid unique references auth.users(id) on delete set null,
  full_name         text not null,
  gender            text,
  location          text,
  headline          text not null default '',
  summary           text not null default '',
  skills            text[] not null default '{}',
  achievements      text[] not null default '{}',
  score_tech        smallint not null default 5 check (score_tech between 0 and 20),
  score_projects    smallint not null default 5 check (score_projects between 0 and 20),
  score_experience  smallint not null default 5 check (score_experience between 0 and 20),
  score_education   smallint not null default 5 check (score_education between 0 and 20),
  score_soft        smallint not null default 5 check (score_soft between 0 and 20),
  score_status      score_status not null default 'default',
  reviewed_at       timestamptz,
  premium           boolean not null default false,
  visible           boolean not null default true,
  open_to_work      boolean not null default true,
  employment_status text,
  current_title     text,
  current_org       text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table members is 'Talent profiles. Contact details are kept separately in member_contacts (admin + owner only).';

create table member_contacts (
  dsn_id text primary key references members(dsn_id) on delete cascade,
  email  text not null,
  phone  text
);

create table member_experience (
  id          uuid primary key default gen_random_uuid(),
  dsn_id      text not null references members(dsn_id) on delete cascade,
  sort_order  int not null default 0,
  role        text not null,
  company     text not null,
  start_month text,           -- YYYY-MM
  end_month   text,
  is_current  boolean not null default false,
  description text
);

create table member_projects (
  id          uuid primary key default gen_random_uuid(),
  dsn_id      text not null references members(dsn_id) on delete cascade,
  sort_order  int not null default 0,
  title       text not null,
  link        text,
  tools       text,
  description text,
  outcome     text
);

create table member_education (
  id         uuid primary key default gen_random_uuid(),
  dsn_id     text not null references members(dsn_id) on delete cascade,
  sort_order int not null default 0,
  school     text not null,
  degree     text,
  field      text,
  year       text
);

create table member_certifications (
  id         uuid primary key default gen_random_uuid(),
  dsn_id     text not null references members(dsn_id) on delete cascade,
  sort_order int not null default 0,
  name       text not null,
  issuer     text,
  year       text,
  link       text
);

create table member_roles (
  dsn_id      text not null references members(dsn_id) on delete cascade,
  role        text not null references role_catalog(name) on update cascade,
  level       role_level not null,
  status      role_status not null default 'claimed',
  note        text,
  verified_at timestamptz,
  verified_by text,            -- reviewer id, e.g. RV-003
  primary key (dsn_id, role)
);

create table impact_updates (
  id                uuid primary key default gen_random_uuid(),
  dsn_id            text not null references members(dsn_id) on delete cascade,
  recorded_at       timestamptz not null default now(),
  employment_status text not null,
  title             text,
  org               text,
  source            text not null default 'Member update'   -- 'Application' | 'Member update' | 'Admin'
);

-- ---------- reviewers ----------
create table reviewers (
  id         text primary key,          -- RV-001
  user_id    uuid unique references auth.users(id) on delete set null,
  full_name  text not null,
  email      text not null,
  expertise  text,
  can_role   boolean not null default true,
  can_rating boolean not null default false,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- recruiters / partners ----------
create table recruiters (
  id               text primary key,    -- RC-1001
  user_id          uuid unique references auth.users(id) on delete set null,
  company          text not null,
  contact_name     text not null,
  email            text not null,
  phone            text,
  industry         text,
  company_size     text,
  needs            text,
  status           decision_status not null default 'pending',
  subscribed       boolean not null default false,
  subscribed_until date,
  sub_requested    boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ---------- verification & rating requests ----------
create table review_requests (
  id              text primary key default ('RQ-' || upper(substr(gen_random_uuid()::text,1,8))),
  type            request_type not null,
  dsn_id          text not null references members(dsn_id) on delete cascade,
  status          request_status not null default 'submitted',
  reviewer_id     text references reviewers(id),
  interview_at    timestamptz,
  interview_link  text,
  interview_note  text,
  overall_note    text,
  -- rating results (type = 'rating')
  score_tech smallint, score_projects smallint, score_experience smallint, score_education smallint, score_soft smallint,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);

-- One row per role inside a role-verification request, plus the reviewer's decision.
create table review_request_roles (
  request_id    text not null references review_requests(id) on delete cascade,
  role          text not null references role_catalog(name) on update cascade,
  claimed_level role_level not null,
  verified      boolean,               -- null until decided
  final_role    text references role_catalog(name) on update cascade,
  final_level   role_level,
  note          text,
  added_by_reviewer boolean not null default false,
  primary key (request_id, role)
);

create table review_request_history (
  id         bigint generated always as identity primary key,
  request_id text not null references review_requests(id) on delete cascade,
  at         timestamptz not null default now(),
  actor      text not null,             -- 'member' | reviewer id | 'admin'
  text       text not null
);

-- ---------- partner talent requests ----------
create table talent_requests (
  id           text primary key default ('TR-' || upper(substr(gen_random_uuid()::text,1,8))),
  recruiter_id text not null references recruiters(id) on delete cascade,
  role_needed  text not null,
  level        role_level,
  headcount    int not null default 1 check (headcount > 0),
  engagement   text not null,
  work_mode    text,
  duration     text,
  budget       text,
  description  text not null,
  specific_members text[] not null default '{}',
  shortlist    text[] not null default '{}',
  status       talent_request_status not null default 'new',
  admin_note   text,
  created_at   timestamptz not null default now()
);

-- ---------- profile views (premium feature) ----------
create table profile_views (
  dsn_id       text not null references members(dsn_id) on delete cascade,
  recruiter_id text not null references recruiters(id) on delete cascade,
  view_count   int not null default 1,
  last_at      timestamptz not null default now(),
  primary key (dsn_id, recruiter_id)
);

-- ---------- helpers ----------
create or replace function mask_name(full_name text) returns text
language sql immutable as $$
  select string_agg(left(w,1) || repeat('*', greatest(3, length(w)-1)), ' ')
  from unnest(regexp_split_to_array(trim(full_name), '\s+')) as w
$$;

create or replace function member_total(m members) returns int
language sql immutable as $$
  select m.score_tech + m.score_projects + m.score_experience + m.score_education + m.score_soft
$$;

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger members_touch before update on members for each row execute function touch_updated_at();

create index on member_roles (role, status);
create index on review_requests (status, type);
create index on review_requests (dsn_id);
create index on talent_requests (recruiter_id);
