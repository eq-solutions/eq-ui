---
"@eq-solutions/ui": patch
---

Add a `demo/` kitchen-sink page (`npm run dev`, Vite) previewing every component's variants for quick visual review during development — dev-only, not part of the published package. Fixed a real bug found while building it: `src/index.css` (the barrel stylesheet) was missing `DropdownMenu.css`, so any app importing styles via the barrel rather than per-component would get an unstyled dropdown menu.
