---
"@eq-solutions/ui": minor
---

Add built-in `onDelete` and `onArchive` props to `Table`.

Passing either prop auto-enables row selection, the bulk action bar, Archive and Delete buttons, and a `ConfirmDialog` gate for deletion — with no additional wiring in the consuming app. Includes `deleteConfirm` / `archiveConfirm` for domain-specific confirm copy, `onActionError` for error surfacing, and mutual loading-state lockout between actions.
