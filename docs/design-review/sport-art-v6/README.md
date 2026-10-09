# Remaining primary sports — 2026-10-07

Football, hockey, motorsport, combat sports, track and field, Olympic sports,
and Other Sports now each have a light watercolor banner, dark glossy banner,
and two matching transparent equipment icons. Secondary sports continue to
share the Other Sports family, following the existing routing rule.

Built-in imagegen produced the raster art. The approved tennis watercolor
banner and baseball dark banner provided style/layout references; new icons
provided matching left equipment references for each banner. No new provider,
runtime image generation, animation, or public deployment is introduced.

Sources are the 28 named PNGs in this folder. WebP exports live in
`public/assets/sport-banners/studio/*-v6.webp` and
`public/assets/sport-icons/studio/*-v6.webp`; icons also have 160px variants.
Regenerate exports using `node scripts/export-sport-art.mjs`.
The existing approved five sport families retain their versions.

## Review approach

Hidden faces and generic clothing preserve the established athlete style.
Banner center regions remain quiet for HTML copy. Left emblems and right
scenes are independently composed. Targeted corrections removed heel spikes
from track shoes, swimmer ankle cuffs, and stray boxing ring ropes.
These are reviewed illustrations, not a guarantee of anatomically perfect
generated detail; further owner feedback can target individual assets.

## Pose references

- [USA Football skill progressions](https://fdm.usafootball.com/how-it-works)
- [USA Hockey shooting guidance](https://www.usahockey.com/news_article/show/1161996)
- [World Athletics 100m technique](https://worldathletics.org/disciplines/jumps/100-metres)
- [England Boxing coaching handbook](https://www.englandboxing.org/wp-content/uploads/2022/03/EB_Boxing-Coaching-Handbook-Part-1_v8-002.pdf)

References guide original pose construction; no athlete likeness or existing
anime artwork is copied. Exact prompts are recorded in `PROMPTS.md`.

The existing broader release blockers in `docs/PRE_LAUNCH_GATE.md` remain:
fixture coverage, account/delivery/recovery verification, and launch review.
This art pass is available for local review only.

Validation: TypeScript and repository lint passed; 110 unit tests passed.
The 14 focused desktop/mobile checks cover all seven new families in both
themes, including matching icon URLs, decoded images, visible copy/CTA,
and horizontal reflow. The eight existing-family browser checks also passed.
Desktop copy is shifted clear of wider equipment; a soft paper-colored
overlay reduces pigment behind light-mode copy without editing the PNGs.
