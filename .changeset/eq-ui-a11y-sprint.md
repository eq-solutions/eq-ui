---
"@eq-solutions/ui": patch
---

Fix Tabs arrow-key navigation not moving actual keyboard focus (roving tabindex was updating ARIA state but stranding DOM focus on the previously-active tab). Add keyboard support to Table's column-visibility menu item, matching the pattern already used by its row-selection checkboxes. Add ESLint + `eslint-plugin-jsx-a11y` to CI. Add test coverage (behavior + accessibility) for DropdownMenu, Tabs, Toast, and AppShell.
