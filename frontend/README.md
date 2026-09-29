# Frontend: DSN Talent Platform

A static website: HTML, CSS and plain JavaScript. There is no build step, so Vercel serves this folder as it is.

## Run it on your computer

```bash
cd frontend
npm install        # only needed for tests
npm run dev        # open http://localhost:5173
```

You can also open `index.html` through any static server (for example `python -m http.server`).

## Test access

`DEMO_MODE` in `assets/js/config.js` is `true` for now. The log-in page then shows one-click buttons to enter as:

| Button | Account | What you can try |
|---|---|---|
| DSN Admin | `admin` | Approve applications and partners, manage reviewers, role manual, settings, impact |
| Partner · subscribed | `RC-1001` | See names and full CVs, download CVs, request specific talent |
| Partner · free plan | `RC-1002` | See the anonymised directory only |
| Talent · reviewed | `DSN-2024-0187` | Dashboard, rating, roles, interview booking, CV |
| Talent · new profile | `DSN-2025-0290` | Starting scores, add roles, request verification |
| Peer reviewer | `RV-003` | Verify roles against the manual, rate profiles, request interviews |

Manual log-in works too with these IDs and the password `demo1234`.
Test data is saved in each person's browser, so testers don't affect each other. To start over, clear the site data in your browser.

**Before go-live set `DEMO_MODE` to `false`.** You can also override it without editing the file by adding this before the scripts in `index.html`:

```html
<script>window.DSN_CONFIG = { DEMO_MODE: false };</script>
```

## Layout

```
frontend/
├── index.html                 Page shell; loads CSS and scripts in order
├── assets/
│   ├── css/app.css            All styles (DSN colours are the tokens at the top)
│   ├── img/logo.png           Official DSN logo
│   └── js/
│       ├── config.js          Environment settings: test mode, backend, test accounts
│       ├── constants.js       Rating categories and rubric, role levels, starter role manual
│       ├── utils.js           Small helpers
│       ├── store.js           Data layer and session/permission checks
│       ├── router.js          Navigation, header, footer, render loop
│       ├── components.js      Shared UI (role blocks, score panel, talent card, modal, fields)
│       ├── views/public.js    Welcome, directory, profile, CV, apply, log in, partner sign-up
│       ├── views/member.js    Talent dashboard, verification requests, CV editor
│       ├── views/reviewer.js  Review queue, workspaces, role manual, rubric
│       ├── views/recruiter.js Partner requests, subscription
│       ├── views/admin.js     Admin area
│       └── main.js            Click/submit handling and start-up
├── data/seed.json             Sample data for test mode
├── tests/e2e/                 Playwright end-to-end tests
└── tools/                     Dev server and syntax check
```

Scripts are classic (non-module) scripts that share one global scope, loaded in the order listed in `.js-order`.

## Tests

```bash
npm run check      # every script parses
npm test           # 12 end-to-end tests on desktop and phone sizes
```

The tests cover: the welcome page, masked names in the public directory, every test-access account, manual log-in,
multi-role verification through to the reviewer's decision, a rating review, free vs subscribed partner access,
and admin approval followed by first-time password creation.

## Connecting Supabase (next milestone)

`store.js` is the only file that reads or writes data. Connecting Supabase means adding a Supabase version of
`initStore`, `put` and `remove`, and replacing the demo password check with Supabase Auth. Screens do not change.
