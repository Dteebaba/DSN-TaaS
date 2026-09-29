# Architecture

## Today (test version)

```
Browser ──► Vercel (static files from frontend/)
   │
   └── data: sample data from frontend/data/seed.json, saved in the browser (localStorage)
```

- Test access buttons (config `DEMO_MODE`) let anyone enter any role.
- The Claude artifact demo is the same code bundled into one file by `tools/build-artifact.py`;
  inside Claude it stores data in the artifact's shared database instead of the browser.

## Production (next milestone)

```
Browser ──► Vercel (frontend/)
   │
   └──► Supabase
          ├── Auth           sign-in, password reset emails
          ├── Postgres       tables + Row Level Security (backend/supabase/migrations)
          ├── Storage        (later) certificate and CV uploads
          └── Edge Function  notify: emails on approvals, interviews, results
```

Only `frontend/assets/js/store.js` talks to data, so switching from test data to Supabase does not change any screen.

## Security model

| Rule | Where it's enforced |
|---|---|
| Directory shows masked names to everyone | `public_talent` view |
| Full profiles only for subscribed partners, reviewers, admins | RLS on `members` and CV tables |
| Email/phone only for the member and admins | Separate `member_contacts` table with RLS |
| Members can't change their own scores, roles' verified status or Premium | RLS + `guard_member_fields` trigger |
| Free partners can't request a named member | RLS on `talent_requests` |

In the test version these rules are applied by the page only, which is fine for sample data but not for real member data.
