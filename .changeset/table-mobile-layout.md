---
'@eq-solutions/ui': minor
---

Table: real mobile handling below 768px. New `mobileLayout` prop — `'scroll'` (default: cells stop word-wrapping, the table scrolls sideways inside its card, first data column + checkbox stay pinned) or `'cards'` (opt-in: each row stacks into a label/value card). New `hideOnMobile` column option. Desktop rendering is unchanged. Also: selection checkboxes now have accessible names ("Select all rows" / "Select row"), and skeleton rows render the checkbox placeholder when selection is enabled via `onDelete`/`onArchive`.
