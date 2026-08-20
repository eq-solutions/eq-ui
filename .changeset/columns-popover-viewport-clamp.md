---
"@eq-solutions/ui": patch
---

Table's "Show columns" popover no longer runs past the bottom of the viewport. It's portalled to escape ancestor clipping, but had no cap on its own height — with a short page or a long column list it could render partly off-screen with no way to reach the rest. Now caps to the space actually available below the trigger and scrolls internally instead.
