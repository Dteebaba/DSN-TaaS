# Backend: DSN Talent Platform

The backend is **Supabase** (Postgres database, sign-in, file storage and serverless functions).
It is written and tested, but **not connected to the website yet**. The website currently runs in
test mode with sample data in the browser. Connecting it is the next milestone (see the root README).

## What's here

```
backend/
├── supabase/
│   ├── config.toml                                 Supabase CLI settings for local development
│   ├── migrations/
│   │   ├── 20260929000001_schema.sql               Tables, types, helper functions
│   │   └── 20260929000002_access_rules.sql         Row Level Security: who can see and change what
│   ├── seed.sql                                    Sample data (generated, testing only)
│   └── functions/notify/index.ts                   Email notifications (scaffold)
├── tests/                                          Database checks (migrations, seed, access rules)
├── tools/make_seed.py                              Rebuilds seed.sql from frontend/data/seed.json
└── .env.example                                    Environment variables to set
```

## Data model

| Table | Holds |
|---|---|
| `accounts` | Links each Supabase login to a platform identity: member, reviewer, recruiter or admin |
| `applications` | Membership applications, including impact questions (employment status, programmes) |
| `members` | Talent profiles and the five scores (each 0–20, default 5) |
| `member_contacts` | Email and phone, kept apart so only the member and admins can read them |
| `member_experience`, `member_projects`, `member_education`, `member_certifications` | The standard CV sections |
| `member_roles` | Each role a member holds, with level and status: claimed, pending, verified, rejected |
| `impact_updates` | Employment status history, starting from the application |
| `reviewers`, `recruiters` | Peer reviewers (with role/rating permissions) and partner companies (with subscription) |
| `review_requests` | Role verification and rating review requests, interview details and scores |
| `review_request_roles` | Each role inside a verification request and the reviewer's final role and level |
| `review_request_history` | Audit trail for every request |
| `talent_requests` | Partner requests for talent, DSN shortlist and status |
| `profile_views` | Which subscribed partner opened which profile (shown to Premium members) |
| `role_catalog`, `role_level_descriptions` | The role manual reviewers verify against |
| `settings`, `dsn_programmes` | Verification email, document lists, programmes |

`public_talent` is an anonymised view of the directory (masked name, roles, rating) that anyone can read.

## Access rules (tested)

| Who | Directory | Full profiles | Contact details | Change scores/roles |
|---|---|---|---|---|
| Visitor / free partner | Yes (masked) | No | No | No |
| Subscribed partner | Yes | Yes | No | No |
| Member | Yes | Own | Own | No (trigger blocks it) |
| Reviewer | Yes | Yes | No | Yes |
| Admin | Yes | Yes | Yes | Yes |

These rules were checked against Postgres 16 with the sample data: a visitor reads 0 member rows but
6 directory rows, a subscribed partner reads 6 profiles and 0 contact rows, a free partner reads 0,
a member cannot raise their own score or turn on Premium, and a free partner cannot request a named member.

## Set up

1. Create a project at supabase.com (region: West EU / London is closest to Lagos).
2. Install the Supabase CLI, then from `backend/`:
   ```bash
   supabase link --project-ref YOUR-PROJECT-REF
   supabase db push                 # runs the migrations
   psql "$DATABASE_URL" -f supabase/seed.sql   # optional: sample data for testing
   ```
3. Create logins in **Authentication → Users**, then link each one:
   ```sql
   insert into accounts (user_id, kind, ref_id) values ('<auth user id>', 'admin', null);
   update members set user_id = '<auth user id>' where dsn_id = 'DSN-2024-0187';
   insert into accounts (user_id, kind, ref_id) values ('<auth user id>', 'member', 'DSN-2024-0187');
   ```
4. Put the project URL and anon key in the frontend config (see `frontend/README.md`).

## Tests

`tests/run.sh` builds a throwaway database, runs every migration, loads the sample data and checks the
access rules above. It needs any Postgres 16 server (Supabase's `auth` objects are stubbed in
`tests/supabase_stubs.sql`). GitHub Actions runs it on every push.

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres backend/tests/run.sh
```
