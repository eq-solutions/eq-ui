---
"@eq-solutions/ui": minor
---

feat(spinner): add `Spinner` — animated loading indicator

The default `bars` variant is the EQ signature: equalizer bars in
`--eq-sky` / `--eq-deep` that echo the brand name. Three alternates cover the
rest of the loading vocabulary — `ring` (quiet workhorse), `dots` (inline), and
`trail` (premium comet ring) — across `sm` / `md` / `lg` sizes.

Pure CSS, no JS animation. All colour and motion reference `--eq-*` tokens,
`role="status"` carries the accessible label, and `prefers-reduced-motion` is
honoured. Exported from the barrel and as the `./Spinner` subpath.
