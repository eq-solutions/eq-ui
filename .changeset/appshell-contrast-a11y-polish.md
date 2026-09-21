---
"@eq-solutions/ui": patch
---

AppShell: bump inactive sidebar nav contrast (label 0.45→0.62, icon-chip 0.06→0.10) so icons/labels actually read on the dark sidebar; same bump for collapse/logout/density chrome. Fix muted nav counts (`--eq-slate` was never a token — they stayed sky). Add `:focus-visible` to sidebar nav items and a Modal-style focus trap + focus restore on the mobile drawer.

FormInput: stop spreading props after `aria-describedby`/`aria-invalid` so consumers cannot clobber error/hint wiring.

Button: keep the loading label in the a11y tree (`opacity: 0` instead of `visibility: hidden`) so the button retains its accessible name while the spinner shows.
