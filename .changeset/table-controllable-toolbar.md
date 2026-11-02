---
'@eq-solutions/ui': minor
---

Table: toolbar can now be driven from outside, all additive. `searchText` extends built-in search to fields that aren't columns; `query` / `onQueryChange` control the search text; `hiddenColumns` / `onHiddenColumnsChange` control column visibility (overrides `defaultHiddenColumns` and `persistKey` visibility); `TableSlicer.group` turns same-group slicers into one single-choice dropdown, combined by AND; `toolbar` / `toolbarEnd` slots; `emptyMessage` accepts a ReactNode.

Visible change for existing tables: when a toolbar is shown and a search/filter is active, Table now renders an "N of M shown" count and a "Clear filters" button. Pass `showClearFilters={false}` to opt out.
