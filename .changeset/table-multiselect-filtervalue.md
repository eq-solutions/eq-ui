---
"@eq-solutions/ui": patch
---

Table: `filterable: 'multiselect'` columns now fall back to `filterValue(row)` for both option-derivation and row-matching, same as `'text'`/`'select'` already do. Previously multiselect only ever read `row[key]` directly, so a composite column with no single backing field (e.g. a Contact column built from phone + email) could never work as a multiselect filter — option-derivation produced an empty list and no row ever matched. Additive only: columns without `filterValue` are unaffected.
