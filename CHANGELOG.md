# Changelog

## 1.5.0

### Minor Changes

- 90d75a8: Add built-in `onDelete` and `onArchive` props to `Table`.

  Passing either prop auto-enables row selection, the bulk action bar, Archive and Delete buttons, and a `ConfirmDialog` gate for deletion — with no additional wiring in the consuming app. Includes `deleteConfirm` / `archiveConfirm` for domain-specific confirm copy, `onActionError` for error surfacing, and mutual loading-state lockout between actions.

All notable changes to `@eq-solutions/ui` are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/). Versioning: [SemVer](https://semver.org/).

## [1.1.0] - 2026-05-31

### Added

- Six new components completing the shared-kit contract from the Direction D handoff (`EQ Component Kit`):
  - `FormInput` — label + input + hint/error, accessible (`aria-describedby`, `role="alert"`), focus + error + disabled states.
  - `StatusBadge` — lifecycle pill with state dot (`open` · `in-progress` · `overdue` · `closed` · `await`).
  - `KindPill` — bordered work-order kind tag (`preventive` · `corrective` · `inspection`).
  - `Card` — flat bordered surface with optional header (`title` / `actions`) and padding tiers.
  - `Modal` + `ConfirmDialog` — floating dialog with portal, backdrop, Esc-close, focus-trap, and focus restoration. `ConfirmDialog` adds Cancel/Confirm + `destructive`.
  - `Tabs` — underline tab strip, controlled, with arrow-key roving focus and optional counts.
  - `Toast` — `ToastProvider` + `useToast()`; toned (`ok` · `warn` · `err` · `info`), auto-dismiss, `aria-live` region.
- `Button` gains an `icon` prop (leading Lucide icon).
- `Table` gains `loading` + `loadingRows` (skeleton placeholder rows while the first page loads).

### Changed

- Bumped `@eq-solutions/tokens` dependency to `#v1.2.0` (warm-sand ramp, new brand tokens, global a11y focus CSS).

## [1.0.1] - 2026-05-30

### Fixed

- `Button` ghost variant: restored the 1px border for cross-app parity (surfaced in [eq-shell#73](https://github.com/eq-solutions/eq-shell/pull/73) review).

## 1.0.0 - 2026-05-30

### Added

- Initial release: `Button` (variants primary/secondary/ghost/danger; sizes sm/md/lg; `loading`; `forwardRef`), `Skeleton` (+ `SkeletonRows` / `SkeletonCards`), `Table` (filterable columns, row selection).
- Token-only styling via `--eq-*` custom properties (zero hardcoded hex — CI-enforceable). Depends on `@eq-solutions/tokens`.
- Consumed by EQ Shell ([eq-shell#71](https://github.com/eq-solutions/eq-shell/pull/71)) and EQ Service ([eq-solves-service#205](https://github.com/Milmlow/eq-solves-service/pull/205)).

[1.1.0]: https://github.com/eq-solutions/eq-ui/releases/tag/v1.1.0
[1.0.1]: https://github.com/eq-solutions/eq-ui/releases/tag/v1.0.1
