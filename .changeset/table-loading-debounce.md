---
"@eq-solutions/ui": patch
---

Fixed `Table`'s `loading` skeleton flashing on fast loads. `loading` used to gate the skeleton rows directly, so a fetch resolving in well under 200ms (fast connection, warm cache — the common case across eq-shell's admin list pages, which re-fetch fresh on every mount) mounted and unmounted the skeleton fast enough to read as a flash rather than a load. The skeleton is now gated behind a 200ms delay: a load that resolves before the delay fires never shows a skeleton at all, and a load that genuinely takes longer still shows one, with no added latency — the delay only holds back the skeleton, never how long `loading` itself takes to resolve.
