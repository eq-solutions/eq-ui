---
"@eq-solutions/ui": minor
---

Table: add opt-in `multiSlicer` prop. When true, quick-filter slicer chips toggle on/off independently instead of behaving as a single-select radio, and rows must match every currently-active chip (AND). The chip with no `filter` function (an "All" chip) clears the selection. Defaults to `false` — existing single-select consumers using `activeSlicer`/`onSlicerChange` are unaffected.
