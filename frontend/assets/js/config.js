/* DSN Talent Platform: runtime configuration. Change these values per environment. */
"use strict";
const CONFIG = Object.freeze({
  /* "demo": data lives in each visitor's browser (localStorage), loaded from data/seed.json.
     "supabase": planned production backend (see backend/README.md). Not wired up yet. */
  BACKEND: (window.DSN_CONFIG && window.DSN_CONFIG.BACKEND) || "demo",

  /* Test access. When true, the log-in page shows one-click buttons to enter as
     Admin, Partner, Talent or Reviewer, and the admin area is open to anyone.
     MUST be false before go-live. */
  DEMO_MODE: window.DSN_CONFIG && "DEMO_MODE" in window.DSN_CONFIG ? !!window.DSN_CONFIG.DEMO_MODE : true,

  /* Shared password for every test account in data/seed.json. */
  DEMO_PASSWORD: "demo1234",

  /* Test accounts shown on the log-in page. IDs must exist in data/seed.json. */
  DEMO_ACCOUNTS: [
    { kind: "admin",     id: "admin",         label: "DSN Admin",               note: "Approves members and partners, manages reviewers, settings and impact" },
    { kind: "recruiter", id: "RC-1001",       label: "Partner · subscribed",    note: "Kora Analytics Ltd. Sees names and full CVs, can request specific talent" },
    { kind: "recruiter", id: "RC-1002",       label: "Partner · free plan",     note: "Lagos Fintech Hub. Sees DSN IDs, roles and ratings only" },
    { kind: "member",    id: "DSN-2024-0187", label: "Talent · reviewed",       note: "Tunde Bakare. Rated, one verified role, one interview booked" },
    { kind: "member",    id: "DSN-2025-0290", label: "Talent · new profile",    note: "Ibrahim Musa. Starting scores, claimed role not yet verified" },
    { kind: "reviewer",  id: "RV-003",        label: "Peer reviewer",           note: "Amina Bello. Verifies roles and rates profiles" }
  ],

  SEED_URL: "data/seed.json",

  /* Filled in when Supabase is connected (public values only; never the service_role key). */
  SUPABASE_URL: (window.DSN_CONFIG && window.DSN_CONFIG.SUPABASE_URL) || "",
  SUPABASE_ANON_KEY: (window.DSN_CONFIG && window.DSN_CONFIG.SUPABASE_ANON_KEY) || ""
});
