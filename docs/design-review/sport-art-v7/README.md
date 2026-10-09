# Sport artwork v7

Local review pass: corrected hockey grips and replaced reused library symbols on the Other Sports page with 17 purpose-drawn SVG equipment icons.

## Hockey

Tool: built-in image_gen, precise edits of the v6 source images. Four PNG sources in this directory: hockey-{broadcast,program}-{banner,icon}.png. Broadcast is dark mode; Program is light mode. Icons preserve transparent alpha. WebP exports live under public/assets/sport-banners/studio and public/assets/sport-icons/studio, revision v7. The edits remove the bat-like knob and use a flat, taped rectangular hockey grip.

Exact prompts:

### broadcast icon

Use case: precise-object-edit. Correct ONLY the TOP GRIP END of the large hockey stick at the upper left of this icon. It currently has a rounded mushroom-shaped BASEBALL BAT KNOB: remove that completely. A hockey stick has a long rectangular composite shaft with a flat squared-off butt end. Continue the rectangular shaft's cross section straight through the grip. Wrap the top 12-15cm in flat black hockey tape with subtle thin overlapping tape bands and a small flat rectangular end cap, almost flush with the shaft. NO circular disk, NO mushroom, NO spherical knob, NO flared baseball bat handle, NO round cylindrical bat grip. Maintain the existing shaft angle and full length. Keep the blade, puck, colors, glossy cyan rim lighting and polished finish, composition and all other details exactly unchanged. Keep the actual transparent alpha background.

### broadcast banner

Use case: precise-object-edit. Correct ONLY the TOP GRIP END of the large hockey stick at the upper left of this banner. It currently has a rounded mushroom-shaped BASEBALL BAT KNOB: remove that completely. A hockey stick has a long rectangular composite shaft with a flat squared-off butt end. Continue the rectangular shaft's cross section straight through the grip. Wrap the top 12-15cm in flat black hockey tape with subtle thin overlapping tape bands and a small flat rectangular end cap, almost flush with the shaft. NO circular disk, NO mushroom, NO spherical knob, NO flared baseball bat handle, NO round cylindrical bat grip. Maintain the existing shaft angle and full length. Keep the blade, puck, colors, glossy cyan rim lighting and polished finish, composition and all other details exactly unchanged. Preserve center negative space and entire right-hand scene with no changes. Keep 3:1 banner dimensions.

### program icon

Use case: precise-object-edit. Correct ONLY the TOP GRIP END of the large hockey stick at the upper left of this icon. It currently has a rounded mushroom-shaped BASEBALL BAT KNOB: remove that completely. A hockey stick has a long rectangular composite shaft with a flat squared-off butt end. Continue the rectangular shaft's cross section straight through the grip. Wrap the top 12-15cm in flat black hockey tape with subtle thin overlapping tape bands and a small flat rectangular end cap, almost flush with the shaft. NO circular disk, NO mushroom, NO spherical knob, NO flared baseball bat handle, NO round cylindrical bat grip. Maintain the existing shaft angle and full length. Keep the blade, puck, colors, watercolor washes, ink lines, paper texture, composition and all other details exactly unchanged. Keep the actual transparent alpha background.

### program banner

Use case: precise-object-edit. Correct ONLY the TOP GRIP END of the large hockey stick at the upper left of this banner. It currently has a rounded mushroom-shaped BASEBALL BAT KNOB: remove that completely. A hockey stick has a long rectangular composite shaft with a flat squared-off butt end. Continue the rectangular shaft's cross section straight through the grip. Wrap the top 12-15cm in flat black hockey tape with subtle thin overlapping tape bands and a small flat rectangular end cap, almost flush with the shaft. NO circular disk, NO mushroom, NO spherical knob, NO flared baseball bat handle, NO round cylindrical bat grip. Maintain the existing shaft angle and full length. Keep the blade, puck, colors, watercolor washes, ink lines, paper texture, composition and all other details exactly unchanged. Preserve center negative space and entire right-hand scene with no changes. Keep 3:1 banner dimensions.

## Other Sports symbols

Native SVG implementation: src/components/SecondarySportIcon.tsx, used in src/pages/OtherSports.tsx. Symbols cover cricket, rugby, volleyball, handball, cycling, snooker, darts, esports, badminton, table tennis, squash, lacrosse, pickleball, netball, field hockey, water polo, and softball. Esports appears in both sections with the same controller symbol.

Racket strings use regular clipped geometry that rotates with the frame. Colors follow the existing theme accents, with solid equipment shapes and contrasting seams. These symbols apply to individual Other Sports cards; the category artwork remains shared.

## Validation

TypeScript and ESLint passed. Vitest passed: 21 files, 110 tests. Focused Playwright checks passed: four desktop/mobile tests covering hockey and the Other Sports page in both themes. Checks include distinct sport symbols, accessible labels, filtering, and horizontal overflow. Both desktop screenshots were visually reviewed. Full screenshots for both themes and viewport sizes are saved in this directory.

