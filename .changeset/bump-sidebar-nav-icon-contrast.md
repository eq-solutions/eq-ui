---
"@eq-solutions/ui": patch
---

Bumped inactive sidebar nav-item contrast (text 0.45→0.62 opacity, icon-chip background 0.06→0.10) — icons were reading as flat against the dark sidebar. Affects `AppShell`'s shared `.eq-hub-sidebar__nav-item`/`.eq-hub-sidebar__nav-icon` classes, so every app using `AppShell` (Shell, Service, Field) gets the improvement on next dependency bump. Active/hover states unchanged.
