# Working on the DSN Talent Platform

## Branches
- `main` is what's live. Protect it on GitHub (Settings → Branches): require a pull request and passing CI.
- `develop` collects finished work before a release.
- Do new work on a branch from `develop`: `feature/<short-name>`, `fix/<short-name>` or `chore/<short-name>`.

## Commits
Use short, plain messages that say what changed, starting with a type:
`feat: multi-role verification`, `fix: toast overlaps button on mobile`, `docs: update role manual`, `chore: bump playwright`.

## Pull requests
1. Open the PR into `develop` and fill in the template.
2. CI must pass (frontend tests and database checks).
3. One reviewer approves before merge.
4. Vercel posts a preview link on every PR. Test the change there.

## Releases
1. Merge `develop` into `main` with a PR titled `release: vX.Y.Z`.
2. Add the changes to `CHANGELOG.md` and tag the commit (`git tag v0.3.0 && git push --tags`).

## Environments
| Environment | Branch | Data | Test access panel |
|---|---|---|---|
| Local | any | Sample data in your browser | On |
| Preview (Vercel) | PR branches | Sample data in the browser | On |
| Staging | `develop` | Supabase staging project | On |
| Production | `main` | Supabase production project | **Off** (`DEMO_MODE: false`) |

## Before go-live checklist
- [ ] Set `DEMO_MODE` to `false` (frontend/assets/js/config.js, or `window.DSN_CONFIG` in index.html)
- [ ] Connect Supabase and remove sample data
- [ ] Replace the starter role manual with DSN's official manual
- [ ] Set the real verification email address in Admin → Settings
- [ ] Turn on email notifications (backend/supabase/functions/notify)
- [ ] Privacy notice and consent wording approved by DSN
