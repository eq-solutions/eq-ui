# Adopting @eq-solutions/ui

Consumer contract for apps in the EQ suite. Following this keeps one design
system — not a second, hand-ported copy.

## Depend on the packages

Install from [GitHub Packages](https://npm.pkg.github.com) — both packages:

```sh
npm install @eq-solutions/ui @eq-solutions/tokens
```

Point the `@eq-solutions` scope at that registry (see README Install). Do **not**
vendor component source or CSS into the app.

`@eq-solutions/tokens` is a peerDependency of `@eq-solutions/ui`. You must add
it yourself; it will not install transitively.

## No hand-ported component CSS

Consuming apps must use the published components and
`@import "@eq-solutions/ui/styles"` (or the per-component CSS that ships with
each module). Copying a component's CSS (or markup) into an app is a **second
design system** and is banned.

### Known exceptions (delete-by)

| Exception | Where | Delete when | Owner |
|-----------|-------|-------------|-------|
| Spinner hand-port | `eq-field/styles/spinner.css` | eq-field can import `@eq-solutions/ui` Spinner (or drop the local spinner styles once Field consumes the package) | |

Owners are filled in by humans; the kill condition is what matters for scoring.

When changing a component that has a known hand-port, call it out in the
changeset so the exception gets updated or deleted in the same release train.

## Keep versions current

- Expect **Renovate** (or equivalent) to open bumps for `@eq-solutions/ui` and
  `@eq-solutions/tokens`. Merge routine bumps promptly; do not pin forever to
  avoid drift.
- In this repo: **merge the "chore: version packages" PR the same day** it
  opens. Code on `main` that has not published does not count as released —
  see [RELEASING.md](./RELEASING.md).

## Visual source of truth

Until a dedicated docs site exists, the kitchen-sink demo is the visual catalog:

```sh
npm run dev
```

See README → "Kitchen-sink demo".
