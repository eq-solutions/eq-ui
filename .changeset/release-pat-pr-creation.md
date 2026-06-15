---
---

ci: release workflow uses `RELEASE_PAT` to open the Version Packages PR. The org disables "Actions can create PRs", so the default `GITHUB_TOKEN` returns HTTP 409. No package change.
