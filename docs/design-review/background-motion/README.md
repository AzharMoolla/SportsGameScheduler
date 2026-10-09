# Broadcast backdrop — 2026-10-08

Removed the content-positioned FieldAtlas component, its route animation and styling. New sporting geometry, registration brackets, colour-square decals and staggered signal sweeps live inside the existing fixed broadcast tube. Content scrolls independently; the existing home scene's depth behaviour is preserved. Lighting runs at rest using CSS, pauses in hidden tabs, and becomes static under reduced motion.

The 1460px content boundary determines the edge strip width. Wide screens reveal court and track outlines in the gutters; compact screens keep small perimeter decals and light accents, with the sports outlines hidden. Light and dark use identical geometry/timing with separately calibrated ink colours. The centre fades out to protect content. No dependencies, providers or generated raster artwork added.

Verified both surfaces on desktop and mobile: fixed background stays in place during scrolling, lighting advances without scrolling, decoration cannot intercept input, no horizontal overflow, removed atlas absent, reduced-motion highlights disabled. Screenshots beside this file show the scrolled composition. Lint, TypeScript and 123 unit tests passed. This local design change does not constitute public publication; existing launch blockers in PRE_LAUNCH_GATE.md remain.
