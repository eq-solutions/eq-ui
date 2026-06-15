# Releasing @eq-solutions/ui

Releases are automated with [Changesets](https://github.com/changesets/changesets).

## Normal flow

1. Land PRs that include a changeset (`npx changeset`). The `check` workflow
   gates every PR on `tsc` + `check:tokens` and on a changeset being present.
2. On push to `main`, `.github/workflows/release.yml` runs `changesets/action`:
   - If unreleased changesets exist, it opens/updates a **"chore: version
     packages"** PR on the `changeset-release/main` branch.
   - When that PR is merged, the same workflow publishes to GitHub Packages.

## Required secret: `RELEASE_PAT`

The `eq-solutions` org **disables** "Allow GitHub Actions to create and approve
pull requests" (org-level Actions setting). With that off, the default
`GITHUB_TOKEN` cannot open the Version Packages PR — the job fails with
`HTTP 409 / "GitHub Actions is not permitted to create or approve pull requests"`.

To bypass this per-repo without changing org posture, the release workflow uses a
Personal Access Token stored as the repo secret **`RELEASE_PAT`**. It is used for
the branch push and PR creation; npm publishing still uses the ephemeral,
repo-scoped `GITHUB_TOKEN`.

Create the secret (Settings → Secrets and variables → Actions → New repository
secret), using a **fine-grained PAT** scoped to this repo with:

| Permission     | Access         |
|----------------|----------------|
| Contents       | Read and write |
| Pull requests  | Read and write |

A GitHub App installation token (e.g. via `actions/create-github-app-token`) is a
more secure, non-expiring alternative if you'd rather not manage PAT rotation.

> If the org ever enables the org-level toggle, this PAT can be removed and the
> workflow reverted to `GITHUB_TOKEN`.
