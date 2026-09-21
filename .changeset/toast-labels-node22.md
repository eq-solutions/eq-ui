---
"@eq-solutions/ui": patch
---

Toast `tone: 'err'` now uses `role="alert"` so failures interrupt politely-queued announcements. MultiSelect and DateRangePicker wire their field `label` to the trigger via `htmlFor`/`id` (same pattern as FormInput). CI and Release workflows run on Node 22.
