# Releasing @eq-solutions/ui

Releases are automated with [Changesets](https://github.com/changesets/changesets).

## Normal flow

1. Land PRs that include a changeset (`npx changeset`). The `check` workflow
   gates every PR on `tsc` + `check:tokens` and on a changeset being present.
   If the PR touches a component with a known hand-port in a build-less
   consumer (currently: Spinner, hand-ported in `eq-field/styles/spinner.css`),
   call that out in the changeset so the hand-port gets updated too — no CI
   check enforces this, it relies on the PR author flagging it. See
   [ADOPTION.md](./ADOPTION.md) for the full consumer contract.
2. On push to `main`, `.github/workflows/release.yml` runs `changesets/action`:
   - If unreleased changesets exist, it opens/updates a **"chore: version
     packages"** PR on the `changeset-release/main` branch.
   - When that PR is merged, the same workflow publishes to GitHub Packages.
3. **Merge the Version Packages PR the same day it opens** — work on `main`
   that is unpublished does not count as shipped. See [ADOPTION.md](./ADOPTION.md).

## Release auth (prefer GitHub App)

The `eq-solutions` org **disables** "Allow GitHub Actions to create and approve
pull requests" (org-level Actions setting). With that off, the default
`GITHUB_TOKEN` cannot open the Version Packages PR — the job fails with
`HTTP 409 / "GitHub Actions is not permitted to create or approve pull requests"`.

The release workflow therefore uses a non-Actions identity for checkout and
for `changesets/action`'s `GITHUB_TOKEN`. npm publishing still uses the
ephemeral, repo-scoped `GITHUB_TOKEN` via `NODE_AUTH_TOKEN`.

### Preferred: GitHub App (non-expiring)

1. Create a GitHub App (org or user) with these repository permissions:
   | Permission     | Access         |
   |----------------|----------------|
   | Contents       | Read and write |
   | Pull requests  | Read and write |
2. Install the App on **this repository** (`eq-solutions/eq-ui`).
3. Add repository secrets (Settings → Secrets and variables → Actions):
   - **`APP_ID`** — the App's numeric ID
   - **`APP_PRIVATE_KEY`** — the App's private key (`.pem` contents)
4. Leave **`RELEASE_PAT`** in place until one successful release run has used
   the App token (confirm in the workflow log that the "Create GitHub App
   token" step ran and the Version Packages PR was opened/updated).
5. Once proven, remove the `RELEASE_PAT` secret.

The workflow calls `actions/create-github-app-token@v1` when both `APP_ID` and
`APP_PRIVATE_KEY` are set, and uses that token for checkout + changesets.
If either secret is missing, it falls back to `RELEASE_PAT` so current prod
does not break during migration.

Do **not** commit App private keys or PAT values into the repo.

### Fallback: `RELEASE_PAT`

Until the App is configured, the workflow uses a Personal Access Token stored
as **`RELEASE_PAT`** (fine-grained, this repo only):

| Permission     | Access         |
|----------------|----------------|
| Contents       | Read and write |
| Pull requests  | Read and write |

PATs expire — prefer migrating to the App above so release auth stops depending
on rotating human credentials.

> If the org ever enables the org-level "Actions can create PRs" toggle, both
> the App and the PAT can be removed and the workflow reverted to
> `GITHUB_TOKEN`.
