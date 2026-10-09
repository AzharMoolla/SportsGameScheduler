# Equipment correction pass

7 October 2026. Local baseball, golf and tennis banners and matching icons now use v2 assets in both themes. Soccer remains v1; basketball retains its approved pair. Original versions are preserved.

Corrections target longer slender bat handles and gradual barrel tapers; simpler paired baseball seam arcs; clean iron faces with parallel score lines; orderly racket strings, grip wraps and a single court net. These are generated illustrations reviewed visually, not CAD models or certified equipment diagrams. Tiny painterly irregularities may remain at full resolution. Anonymous athlete poses and approved light/dark palettes were preserved.

The transparent emblems use the same left-side equipment styling as their banners. `node scripts/export-sport-art.mjs` exports the selected revisions and responsive 320px/160px WebP icons. Existing browser checks cover asset loading, theme switching, live headings/buttons and desktop/mobile reflow.

Reference: [Wilson 16x19 stringing diagram](https://www.wilson.com/sites/default/files/UltraPro%2816x19%29_2022.pdf) and [Louisville Slugger bat shape explanation](https://www.slugger.com/en-us/explore/what-is-a-torpedo-bat). User screenshots supplied the specific defects to correct.

Motion remains a proposed separate pass. [Higgsfield image-to-video](https://higgsfield.ai/image-to-video-ai) accepts illustrations; a suitable first experiment would use the approved dark basketball still, restrained lighting and depth movement, stable HTML text/buttons, and a static fallback for reduced motion. No Higgsfield account, paid generation or runtime provider was added.

No deployment was performed. Existing release blockers in `docs/PRE_LAUNCH_GATE.md` remain applicable.
