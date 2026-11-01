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

## Release auth

The release workflow uses the built-in `GITHUB_TOKEN` only (checkout, opening
the Version Packages PR, and publishing to GitHub Packages). There is no
personal token and no GitHub App key for this repo.

This needs the org setting **Allow GitHub Actions to create and approve pull
requests** to be on. If it is turned off, the workflow fails with
`HTTP 409 / "GitHub Actions is not permitted to create or approve pull requests"`
and opens a "Release workflow failing on main" issue. Turn the setting back on;
do not reintroduce a personal token.

Opening the PR with `GITHUB_TOKEN` means the checks in `ci.yml` do not run on the
Version Packages PR. That is fine here: it only bumps versions and changelogs.
