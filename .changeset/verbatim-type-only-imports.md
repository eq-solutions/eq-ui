---
"@eq-solutions/ui": patch
---

Fixed `Button` and `FormInput` importing `ButtonHTMLAttributes`/`InputHTMLAttributes` as value imports from `react` instead of type-only imports. Both are interfaces with no runtime existence, so this was harmless under this repo's own tsconfig, but any consumer with `verbatimModuleSyntax` enabled (e.g. eq-shell) fails to build the moment it actually imports `Button` — confirmed live via eq-shell run 35144304365, `TS1484`. Audited the rest of the component library for the same pattern (every named import from `react` across `src/`, cross-checked against a `verbatimModuleSyntax` compile) — these were the only two occurrences.
