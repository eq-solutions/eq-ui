---
"@eq-solutions/ui": minor
---

Table: add column reordering and composite-column filter/export support.

- The Columns popover now has move-up/move-down buttons per row, letting
  users reorder columns (persisted to localStorage under `persistKey`,
  alongside existing show/hide state). Chose buttons over drag-and-drop for
  full keyboard/touch support and reliable testing.
- New optional `TableColumn` props `filterValue` and `exportValue` let a
  composite column (e.g. a merged "Contact" cell built from phone + email)
  participate correctly in global search, the per-column text filter, and
  CSV export — previously these fell back to a nonexistent `row[key]` and
  silently produced no match / a blank export cell.
