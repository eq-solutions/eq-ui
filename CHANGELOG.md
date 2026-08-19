# Changelog

## 1.16.1

### Patch Changes

- 49c80c3: Fix the Table `columnToggle` "Columns" popover getting clipped by an ancestor's `overflow` when the table has too few rows to leave room for it below the button (e.g. a filtered view inside a scrolling app shell). The popover is now portalled to `document.body` and positioned from the trigger button's real screen position, instead of `position: absolute` inside the table's own DOM.

## 1.16.0

### Minor Changes

- 32c6adc: Table: add opt-in `multiSlicer` prop. When true, quick-filter slicer chips toggle on/off independently instead of behaving as a single-select radio, and rows must match every currently-active chip (AND). The chip with no `filter` function (an "All" chip) clears the selection. Defaults to `false` — existing single-select consumers using `activeSlicer`/`onSlicerChange` are unaffected.

## 1.15.0

### Minor Changes

- 19602f6: Add `MultiSelect` — trigger + popover checklist for picking a set of discrete values (a Status/Kind column filter, a form field assigning multiple licences to a worker, and so on). Chips for 1-2 selections, collapses to a count for 3+, search box appears automatically past `searchThreshold` (default 8) options, density-aware. Standalone component — doesn't share code with Table's own filter popover.

## 1.14.0

### Minor Changes

- 1df5b55: Add `DateRangePicker` — trigger + popover calendar for picking a start/end date range, with quick-select presets (Today, Last 7 days, Last 30 days, This month, Last month), `min`/`max` bounds, and `density` support. No new runtime dependency: built on native `Date` and `Intl.DateTimeFormat`, no date library added.

  A single-date/time-of-day picker is out of scope for this change.

- 1df5b55: Add `density?: 'comfortable' | 'compact'` to FormInput, Pagination, StatusBadge, KindPill, and DropdownMenu, matching Table's existing `data-density` attribute convention. Defaults to `'comfortable'` everywhere — no visual change unless a consumer opts in.

  Button and Card were deliberately left out: they already expose equivalent density control via `size` and `padding` respectively, and a parallel `density` prop would just create two knobs for the same thing.

- 1df5b55: EmptyState: add `variant` prop (`filtered` | `error` | `no-access`) with default icons and, for `error`, a red icon tone. Defaults to `'default'`, which renders exactly as before — no icon unless one is passed. An explicit `icon` prop always overrides the variant's default.

## 1.13.0

### Minor Changes

- 6841bae: Table: add column reordering and composite-column filter/export support.

  - The Columns popover now has move-up/move-down buttons per row, letting
    users reorder columns (persisted to localStorage under `persistKey`,
    alongside existing show/hide state). Chose buttons over drag-and-drop for
    full keyboard/touch support and reliable testing.
  - New optional `TableColumn` props `filterValue` and `exportValue` let a
    composite column (e.g. a merged "Contact" cell built from phone + email)
    participate correctly in global search, the per-column text filter, and
    CSV export — previously these fell back to a nonexistent `row[key]` and
    silently produced no match / a blank export cell.

## 1.12.0

### Minor Changes

- b8a0304: Add Tooltip, EmptyState, and Pagination components. Each follows existing
  eq-ui conventions (--eq-\* tokens only, forwardRef/rest-prop spreading where
  applicable, axe-tested) and closes gaps found while building a full
  component kitchen-sink reference against the EQ design system.

### Patch Changes

- 95e821b: Fix Tabs arrow-key navigation not moving actual keyboard focus (roving tabindex was updating ARIA state but stranding DOM focus on the previously-active tab). Add keyboard support to Table's column-visibility menu item, matching the pattern already used by its row-selection checkboxes. Add ESLint + `eslint-plugin-jsx-a11y` to CI. Add test coverage (behavior + accessibility) for DropdownMenu, Tabs, Toast, and AppShell.
- 29c10b4: Add a `demo/` kitchen-sink page (`npm run dev`, Vite) previewing every component's variants for quick visual review during development — dev-only, not part of the published package. Fixed a real bug found while building it: `src/index.css` (the barrel stylesheet) was missing `DropdownMenu.css`, so any app importing styles via the barrel rather than per-component would get an unstyled dropdown menu.

## 1.11.1

### Patch Changes

- e9add49: `Table`'s `multiselect` header filter now cascades: picking a value in one multiselect column narrows what the other multiselect columns' checklists offer, matching Excel AutoFilter (filtering one column narrows the next column's dropdown). Previously every multiselect column always listed the full universe of values regardless of other active filters. A column's own selection never shrinks its own dropdown.

## 1.11.0

### Minor Changes

- 650dc11: Add `filterable: 'multiselect'` to `Table` columns — an Excel-style AutoFilter. Instead of the single-value `<select>` in the filter row, the column header gets a filter icon that opens a popover with a search box, Select All / Reset, and a checkbox list of unique values (or explicit `filterOptions`), so a column can be filtered to any combination of values at once. Existing `'text'` and `'select'` columns are unchanged.

## 1.10.1

### Patch Changes

- 448998f: Fix `Modal` stealing focus on every parent re-render when `onClose` has an unstable identity. The focus/body-lock effect was keyed on `[open, onClose]`, so any consumer passing an inline `onClose={() => setOpen(false)}` (the common case) re-ran the effect on every parent render, re-focusing the first field and yanking the caret out of whatever input the user was typing in. The effect now depends on `[open]` only, and Esc-to-close reads the latest `onClose` via a ref — so no consumer has to memoise `onClose`. Esc-to-close, focus restoration on unmount, and the Tab focus trap are unchanged (now covered by regression tests).

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
