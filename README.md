# DSN Talent Platform (DSN TaaS)

A simple talent platform for Data Science Nigeria. It connects three groups, with DSN in the middle:

- **Members** apply with their DSN ID. DSN approves the application and creates the profile. The member logs in with the DSN ID, creates a password, fills in one standard CV and asks for reviews.
- **Peer reviewers** verify claimed roles (approve, reject, or assign a different role or level) and rate profiles out of 100. They can ask for an interview first.
- **Recruiters / partners** search the directory. Only subscribed recruiters see names and full CVs. Nobody sees member emails or phone numbers; all talent requests go through DSN.

## The DSN Rating

Five categories, 20 points each, 100 in total. Every new profile starts at **5 per category (25/100)** until a reviewer grades it.

| Category | What it covers |
|---|---|
| Technical Expertise | Practical skill in the role, checked by questions or interview |
| Projects & Quality of Work | Number, relevance and quality of projects |
| Work Experience | Where the member has worked and in what role |
| Education & Certifications | Schools, degrees, certifications, DSN programmes |
| Professional & Soft Skills | Communication, reliability, client readiness |

Rubric bands (0–5, 6–10, 11–15, 16–20) for each category are in `src/app.html` (`CATS`).

Roles are separate from the rating. A role is **Claimed** until a reviewer verifies it at a level: Junior, Mid-Level, Senior or Lead / Expert.

## Who sees what

| | Public / free recruiter | Subscribed recruiter | Member (self) | Reviewer / Admin |
|---|---|---|---|---|
| DSN ID, roles, rating and breakdown | Yes | Yes | Yes | Yes |
| Name | Masked (e.g. `T**** B*****`) | Yes | Yes | Yes |
| Full CV and PDF download | No | Yes | Yes | Yes |
| Email / phone | No | No | Own | Admin only |
| Companies that viewed a profile | – | – | Premium members only | Admin |

## Project layout

```
index.html            Built single-file app (published as the live artifact)
src/app.html          App source (HTML + CSS + JS, no framework)
src/logo.png          DSN logo
scripts/seed.py       Generates sample data -> scripts/seed.json
scripts/build.py      Inlines the logo and sample data into index.html
docs/                 Earlier PRD (v2), kept for reference
```

Build: `python3 scripts/seed.py && python3 scripts/build.py`

## Data model (collections)

`members`, `applications`, `reviewers`, `recruiters`, `requests` (role verifications and rating reviews), `talentRequests` (partner requests), `views` (which recruiter opened which profile), `settings/main` (verification email, required documents, roles list, programmes).

Each member keeps an `impact` history (employment status at application, then every update) so DSN can measure programme impact over time. Admin → Impact compares status at application with status now and exports a CSV.

## Sample accounts (sample data only)

Password for every sample account: `demo1234`

- Members: `DSN-2024-0187` (Tunde), `DSN-2023-0412` (Adaeze, Premium)
- Reviewers: `RV-001` (roles), `RV-002` (ratings), `RV-003` (both)
- Recruiters: `RC-1001` (subscribed), `RC-1002` (free)

Remove the sample records before launch.

## Current hosting and what production needs

The live version runs as a Claude artifact with a shared database. It is good for testing flows with the DSN team, but it is **not production-ready**:

- Passwords are hashed in the browser and records are stored in a database any signed-in viewer of the artifact can technically read. Production needs a real backend (e.g. Supabase, Firebase or a Node/Postgres API) with server-side access control so contact details and password hashes are never sent to the browser.
- No email is sent yet. Password reset checks the registered email instead of emailing a link; verification is done by members emailing documents to the address in Settings.
- Subscription payments are handled offline by the DSN team (Admin → Recruiters → Activate subscription).
