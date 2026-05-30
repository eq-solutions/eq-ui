# Changelog

All notable changes to `@eq-solutions/ui` are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/). Versioning: [SemVer](https://semver.org/).

## [1.0.1] - 2026-05-30

### Fixed
- `Button` ghost variant: restored the 1px border for cross-app parity (surfaced in [eq-shell#73](https://github.com/eq-solutions/eq-shell/pull/73) review).

## 1.0.0 - 2026-05-30

### Added
- Initial release: `Button` (variants primary/secondary/ghost/danger; sizes sm/md/lg; `loading`; `forwardRef`), `Skeleton` (+ `SkeletonRows` / `SkeletonCards`), `Table` (filterable columns, row selection).
- Token-only styling via `--eq-*` custom properties (zero hardcoded hex — CI-enforceable). Depends on `@eq-solutions/tokens`.
- Consumed by EQ Shell ([eq-shell#71](https://github.com/eq-solutions/eq-shell/pull/71)) and EQ Service ([eq-solves-service#205](https://github.com/Milmlow/eq-solves-service/pull/205)).

[1.0.1]: https://github.com/eq-solutions/eq-ui/releases/tag/v1.0.1
