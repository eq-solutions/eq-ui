# Changesets

This directory is managed by [Changesets](https://github.com/changesets/changesets).

## Adding a changeset

When your PR changes the public API or behaviour of `@eq-solutions/ui`, add a changeset:

```
npx changeset
```

Choose the bump type:
- **patch** — bug fix, internal refactor, no API change
- **minor** — new prop or component, fully backward-compatible
- **major** — breaking change to an existing prop or component

Commit the generated `.changeset/*.md` file alongside your code changes.

## Release flow

On merge to `main`, the Changesets bot opens a **"Version Packages"** PR.
Merging that PR bumps `package.json`, updates `CHANGELOG.md`, and publishes to GitHub Packages automatically.

Consuming apps are updated by Renovate Bot (opens a PR per app with the new `^x.y.z` reference).
