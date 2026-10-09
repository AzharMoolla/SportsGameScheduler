# Silbo sport artwork — first refresh pass

7 October 2026. Default local pages now use refreshed light and dark artwork for baseball, soccer, golf and tennis, alongside the approved basketball pair. Each refreshed sport has matching transparent emblem variants used by the shared `SportAssetIcon` component in the sports picker, directory, home cards and other consumers. Original assets remain preserved. `?art=legacy` selects the original banner for comparison; basketball's `?art=studio` still shows the earlier Blender study.

Sport identity: soccer uses black/white/silver, golf emerald/mint, tennis chartreuse, baseball red-orange/amber. Light mode preserves detailed ink/watercolor on ivory paper; figures are anonymous and viewed from behind. Dark mode uses polished dimensional equipment with cinematic edge lighting. These are generated raster illustrations, not new Blender scenes or physical simulations. The editable Blender reconstruction remains separate work.

Full PNG sources and desktop/mobile banner screenshots are in this folder. `node scripts/export-sport-art.mjs` exports versioned WebP banners and transparent 320px/160px emblems. Smaller emblems use responsive image selection to avoid downloading large icon files for navigation. No third-party models or remote image hotlinks were introduced.

Posing references were consulted for motion principles, not copied character designs:

- [PGA balanced finish](https://www.pga.com/story/become-a-better-ball-striker-the-golf-ball-isnt-the-finish-line): lead-side balance and held follow-through.
- [Tennis Australia technical guidance](https://www.tennis.com.au/wp-content/uploads/2014/11/Technical-and-Tactical-fundamentals-guidelines_low-res.pdf): grip, stance and stroke sequencing. The resulting illustration is a two-handed stroke study, not a certified technique diagram.
- [MLB swing-path explanation](https://www.mlb.com/glossary/statcast/swing-path-tilt): coherent swing plane.
- [FIFA finishing exercises](https://www.fifatrainingcentre.com/en/practice/talent-coach-programme/create-and-finish/11finishing-exercise-feinting-and-finishing.php): player movement and relationship to the goal.

The user will review remaining visual/anatomical issues. Browser tests check asset loading, theme switching, visible live text/CTA, responsive reflow and actual navigation paths; they do not certify anatomy or physical accuracy. Public launch blockers in `docs/PRE_LAUNCH_GATE.md` remain applicable. No deployment was performed.

Validation: TypeScript, lint, 110 unit tests and Vite production bundling passed. Focused browser checks passed for all four new pages on desktop and mobile; mobile icon checks use the Sports directory because the desktop dropdown is intentionally hidden there. Transparent icon exports have alpha channels with clear pixels. Bundling is not a pass of the existing strict live-data or full release gate.

Remaining artwork: American football, hockey, motorsport, combat sports, track & field, Olympic sports and the shared Other Sports/community family. Their original artwork remains active; do not represent the whole set as refreshed.
