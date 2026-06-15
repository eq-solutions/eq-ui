---
"@eq-solutions/ui": patch
---

DropdownMenu: replace hardcoded rgba colours with EQ tokens.

The menu border, item hover, and separator used raw `rgba(0,0,0,…)`
values that failed the token-guard check. They now use `--eq-gray-200`,
`--eq-ice`, and `--eq-gray-100` respectively, matching the Table popover.
No visual intent change.
