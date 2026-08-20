---
"@eq-solutions/ui": patch
---

Skeleton: replace the opacity pulse animation with a shimmer sweep (a light band moving across each placeholder), matching the loading pattern used by most modern apps. Purely visual — same shapes, same usage, no prop changes. Respects `prefers-reduced-motion` with a static tint instead of the sweep.
