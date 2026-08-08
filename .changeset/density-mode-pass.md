---
"@eq-solutions/ui": minor
---

Add `density?: 'comfortable' | 'compact'` to FormInput, Pagination, StatusBadge, KindPill, and DropdownMenu, matching Table's existing `data-density` attribute convention. Defaults to `'comfortable'` everywhere — no visual change unless a consumer opts in.

Button and Card were deliberately left out: they already expose equivalent density control via `size` and `padding` respectively, and a parallel `density` prop would just create two knobs for the same thing.
