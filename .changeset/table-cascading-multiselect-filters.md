---
"@eq-solutions/ui": patch
---

`Table`'s `multiselect` header filter now cascades: picking a value in one multiselect column narrows what the other multiselect columns' checklists offer, matching Excel AutoFilter (filtering one column narrows the next column's dropdown). Previously every multiselect column always listed the full universe of values regardless of other active filters. A column's own selection never shrinks its own dropdown.
