---
'@eq-solutions/ui': patch
---

Fix release workflow queuing: gate App-token step on job env HAS_APP_CREDS instead of step-level `if: secrets.*` (which prevented the Release workflow from starting after #62).
