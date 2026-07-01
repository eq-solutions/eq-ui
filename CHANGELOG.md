# Changelog

## 1.10.0

### Minor Changes

- 26c7d69: Table: add `persistKey` (localStorage-backed column visibility) and `defaultHiddenColumns` props, so consumers can offer a personalised, reload-safe column set.

## 1.9.0

### Minor Changes

- c05e042: feat(spinner): add `inverted` prop for white spinners on filled surfaces

  `<Spinner inverted>` renders the bars / dots / ring / trail in white instead of
  the default sky/deep — for use inside a primary button or on any brand-coloured
  surface where the default pieces lack contrast. The ring drops its track to
  transparent so only the white arc shows. Additive and opt-in; default rendering
  is unchanged.

## 1.8.0

### Minor Changes

- fec683f: feat(spinner): add `Spinner` — animated loading indicator

  The default `bars` variant is the EQ signature: equalizer bars in
  `--eq-sky` / `--eq-deep` that echo the brand name. Three alternates cover the
  rest of the loading vocabulary — `ring` (quiet workhorse), `dots` (inline), and
  `trail` (premium comet ring) — across `sm` / `md` / `lg` sizes.

  Pure CSS, no JS animation. All colour and motion reference `--eq-*` tokens,
  `role="status"` carries the accessible label, and `prefers-reduced-motion` is
  honoured. Exported from the barrel and as the `./Spinner` subpath.

## 1.7.0

### Minor Changes

- d9398b5: Table: lighter header + selection bar now floats at the viewport bottom.

  The saturated sky header bar is replaced with a quiet light-grey header
  (muted uppercase label, subtle bottom border). The active sort column no
  longer fills deep blue — it gets an ink label and a sky sort caret instead.
  Body rows now emphasise the first (identifier) column at medium weight and
  render all cells with tabular numerals for clean column alignment.

  The bulk-action bar is now `position: fixed` (was absolute to the table
  card), so Archive/Delete and other bulk actions stay visible at the bottom
  of the viewport when rows are selected — previously, on a long list inside
  a scroll container, the bar rendered below the fold and appeared missing.
  No API changes.

## 1.6.1

### Patch Changes

- f367184: Replace three hardcoded `rgba()` colour literals in `DropdownMenu.css` with canonical `--eq-*` tokens (border, hover background, separator), clearing the token-guard CI gate.

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
