---
'@eq-solutions/ui': patch
---

fix(Toast): stop `ToastProvider` causing a hydration mismatch (React error #418) on server-rendered pages. The notifications region was portalled whenever `document` existed, so the server rendered nothing and the first client render drew the region. It now mounts after the first client render, so the two match. No API or styling change; toasts still appear and announce the same way.
