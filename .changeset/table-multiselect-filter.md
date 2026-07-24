---
"@eq-solutions/ui": minor
---

Add `filterable: 'multiselect'` to `Table` columns — an Excel-style AutoFilter. Instead of the single-value `<select>` in the filter row, the column header gets a filter icon that opens a popover with a search box, Select All / Reset, and a checkbox list of unique values (or explicit `filterOptions`), so a column can be filtered to any combination of values at once. Existing `'text'` and `'select'` columns are unchanged.
