---
"@eq-solutions/ui": patch
---

Fixed barrel/component CSS drift, found by audit: `src/index.css` was missing `DateRangePicker.css` and `MultiSelect.css` (added in #36/#38, never wired into the barrel — same bug class as the DropdownMenu incident in eq-shell PR #1027), and `AppShell.css` was in the barrel but not self-imported by `AppShell.tsx` like every other component. Consumers using `@eq-solutions/ui/styles` as their sole eq-ui stylesheet now get correctly-styled DateRangePicker/MultiSelect; `AppShell` (and `AppSidebar`/`AppRail`) now carry their own styles the same way every other component does, so importing them directly no longer depends on also pulling the barrel. Added `scripts/check-barrel.mjs` (wired into `npm run check`) to catch this class of drift automatically going forward.
