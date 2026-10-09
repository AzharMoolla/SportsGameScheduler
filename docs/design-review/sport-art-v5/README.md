# Light tennis grid orientation

Only the light tennis banner changes in this revision. Both existing 16-by-19
straight string grids now follow their own traced racket head's major axis
(about -28 degrees on the left and -26 degrees on the right in image coordinates).
The strings use warm charcoal edges and a restrained parchment highlight to
match the watercolor. Frame contours, artwork, icons, and the approved dark
banner are preserved. Strings are still clipped to each inner frame.

Rebuild with Blender: `blender --background --python scripts/blender-tennis-strings.py -- --program-only`.
The source backdrop remains in `../sport-art-v4/tennis-program-unstrung.png`.
The saved Blender scene contains the editable string geometry.
