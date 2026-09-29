# DSN Talent Platform (DSN TaaS)

Data Science Nigeria's talent platform. It connects DSN community members (talent), peer reviewers and hiring
partners, with DSN in the middle. Partners never contact members directly; they send talent requests to DSN.

**Status:** test version. The website works end to end with sample data and one-click test access.
The Supabase backend (database, access rules, sample data) is built and tested but not yet connected to the website.

## Repository layout

```
DSN-TaaS/
├── frontend/     The website (static HTML/CSS/JS). See frontend/README.md
├── backend/      Supabase: database schema, access rules, sample data, email function. See backend/README.md
├── docs/         Screen catalogue (PDF), architecture notes, earlier PRD
├── tools/        build-artifact.py: bundles the site into one file for the Claude demo link
├── .github/      CI workflow and pull request template
├── vercel.json   Tells Vercel to serve frontend/
├── CONTRIBUTING.md   Branches, commits, pull requests, releases, go-live checklist
└── CHANGELOG.md
```

## Quick start

```bash
cd frontend && npm install && npm run dev     # http://localhost:5173
```

On the log-in page, use **Test access** to enter as Admin, Partner, Talent or Reviewer.

## Deploy (Vercel)

Import the repo in Vercel with Framework Preset **Other** and no build command. `vercel.json` serves `frontend/`.
Every push to `main` redeploys, and every pull request gets a preview link.

## How the platform works

- **Members** apply with their DSN ID and answer impact questions (employment status, programmes). DSN approves
  the application and creates the profile. The member logs in with the DSN ID, creates a password and fills in one standard CV.
- **DSN Rating:** five categories scored out of 20 (100 total): Technical Expertise, Projects & Quality of Work,
  Work Experience, Education & Certifications, Professional & Soft Skills. Every profile starts at 5 per category.
- **Roles** are separate from the rating. A member claims roles and can request verification for several at once.
  A peer reviewer checks each against the role manual and sets the final role and level (Junior, Mid-Level, Senior, Lead / Expert),
  can change or add roles, or ask for an interview.
- **Partners** see the anonymised directory (DSN ID, masked name, roles, rating). Subscribers see names and full CVs,
  download CVs and request specific members. Contact details are never shown.
- **Admin** approves members and partners, manages reviewers, subscriptions, the role manual and settings, and tracks impact.

See `docs/DSN_Talent_Platform_Screens.pdf` for every screen and what it is for.
