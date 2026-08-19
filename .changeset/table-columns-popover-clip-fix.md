---
"@eq-solutions/ui": patch
---

Fix the Table `columnToggle` "Columns" popover getting clipped by an ancestor's `overflow` when the table has too few rows to leave room for it below the button (e.g. a filtered view inside a scrolling app shell). The popover is now portalled to `document.body` and positioned from the trigger button's real screen position, instead of `position: absolute` inside the table's own DOM.
