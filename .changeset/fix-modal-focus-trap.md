---
"@eq-solutions/ui": patch
---

Fix `Modal` stealing focus on every parent re-render when `onClose` has an unstable identity. The focus/body-lock effect was keyed on `[open, onClose]`, so any consumer passing an inline `onClose={() => setOpen(false)}` (the common case) re-ran the effect on every parent render, re-focusing the first field and yanking the caret out of whatever input the user was typing in. The effect now depends on `[open]` only, and Esc-to-close reads the latest `onClose` via a ref — so no consumer has to memoise `onClose`. Esc-to-close, focus restoration on unmount, and the Tab focus trap are unchanged (now covered by regression tests).
