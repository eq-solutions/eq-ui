---
"@eq-solutions/ui": minor
---

Table: lighter header + selection bar now floats at the viewport bottom.

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
