---
"@eq-solutions/ui": minor
---

feat(spinner): add `inverted` prop for white spinners on filled surfaces

`<Spinner inverted>` renders the bars / dots / ring / trail in white instead of
the default sky/deep — for use inside a primary button or on any brand-coloured
surface where the default pieces lack contrast. The ring drops its track to
transparent so only the white arc shows. Additive and opt-in; default rendering
is unchanged.
