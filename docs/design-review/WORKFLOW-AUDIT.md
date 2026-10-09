# Design and workflow review — 2026-10-07

This is a local review build. The public frontend remains on the restoration page. Database changes and the calendar-feed endpoint are deployed to the new Supabase project.

## Design

- Retired the dedicated World Cup planner and banner, including its fixed match/host-city/team/trophy counts. Soccer now has an evergreen channel with counts from current data. Historical archived selections remain accessible in personal exports.
- Soccer uses charcoal and white, golf green, tennis yellow green. Homepage poster labels now identify Olympic/combat sports correctly.
- Added colour to the globe behind the homepage preview. Preserved the moving CRT artwork and added original SVG pitch/court/track/contour lines, with reduced-motion support and bounded mobile layouts.
- Fixed DAZN badge text contrast. Fixed generic database watch rows overriding league-specific routes; event/league-specific records take priority. Watch routes are direct provider links, with availability and blackout caveats, not guaranteed event rights.
- Kept existing fonts and poster art. No new font service, paid image provider, ad pixel or runtime AI dependency.

Review images: [home board](home-board-refresh.png), [soccer](soccer-refresh.png), [golf](golf-refresh.png), [tennis](tennis-refresh.png).

## Scheduling and calendars

| Flow | Result and evidence | Limits |
| --- | --- | --- |
| Save one fixture | Persists an event follow, appears in My Schedule, exports via the main guided flow. Desktop/mobile checked. | Signed-in account creation/login/sync still needs a real account check. |
| Follow a league/player | Public fixtures union across leagues, competitors and saved event IDs. | Athletes without linked fixtures cannot produce schedules; tennis currently has no upcoming fixtures. |
| Community schedules | Owner-created events join Home, My Schedule and Exports. | Owner view; public share links expose only explicitly shared leagues. |
| Guided download | All saved/visible sports exported, reminder choices generate actual VALARM entries. Keyboard focus wraps within modal; Escape and opener restoration implemented. | A downloaded file is a snapshot. |
| ICS | Shared browser/server renderer, stable UID, version, source end time or sport duration, tentative/TBD/cancelled handling and UTF-8 folding. Unit and downloaded-file checks passed. | Existing archive renderer retained for historical matches. |
| URL subscription | Real deployed feed tested with league/player union, owner community events, empty selection, edits, cancellation and immediate disable revocation. Private/foreign-owner rows excluded. | Requires sign-in; raw URL shown once. Up to 500 events and 30 days of history. Poll frequency belongs to the calendar app. |
| Apple Calendar | Subscription instructions and webcal URL provided; compatible ICS feed served. | Native Apple Calendar/iCloud was not tested on this Windows host. See [Apple subscription guidance](https://support.apple.com/en-kw/102301). |
| Feed management | Disable/delete/rotate/update picks check database results and show failures. Signed-out preview cannot expose a fake live URL. | Selection changes require “Update picks”; tokens are bearer capabilities, not public links. |
| Email/push | Homepage and guide no longer promise enabled delivery. | Delivery and notification cron remain off; calendar-app reminders work independently. |

Live feed verification used disposable synthetic users and fixtures, all removed afterwards. The test edited start times and status, verified unchanged UID and incremented SEQUENCE, checked cancelled alarms disappear, and then verified a disabled URL returns 404.

## Community leagues

League timezone controls create/CSV/edit times independently of browser timezone, including DST rejection. Edits preserve event IDs and increment version; duration and status can be changed. CSV supports quoted multiline notes, rejects malformed quotes, and skips duplicate imports. Roster supports teams or players; leagues and roster entries have image uploads. Public sharing respects its enable flag and notes setting, and the remote resolver now includes league images.

Uploads require the uploader's permission confirmation; PNG/JPEG/WebP only, 5 MB input limit, 16-megapixel decode limit, maximum 256-pixel thumbnail and 100 KB encoded limit. Originals and EXIF are not uploaded. Local league storage has a 3 MB budget. Account writes report failures instead of claiming success. This is adequate for small community schedules, not a tournament administration suite: standings, brackets, participant assignments per fixture, multi-admin roles and bulk media storage are not implemented.

## Images and marks

SportsDB has logo, thumbnail and cutout fields, so it is a useful discovery source already covered by the existing API key. The subscription does not clear every image. Its [terms](https://www.thesportsdb.com/docs_terms_of_use.php) distinguish original artwork, third-party photos and trademarks; each published asset needs documented source, creator and licence. Imported remote candidates are withheld by the renderer until reviewed; existing local assets still require a launch inventory.

Added two reviewed Commons portraits, Djokovic and Usyk, with creator, licence, source and changes in the footer. Both thumbnail URLs returned HTTP 200/image/jpeg. Wider athlete/league/team coverage remains incomplete. Commons is useful for photos with explicit reusable licences; official team/league media kits or permission are preferable for marks. Copying a logo from a website does not itself supply permission. For CFL, use its [official licensing process](https://cfl.prod.s.cfl.ca/cfl-licensing), or obtain written permission before clipping and publishing assets. No new paid image account was created.

## Background work and cost

Loaded 949 provider player rows in eight API calls; final database has 372 tennis competitors and 565 golf competitors (provider rows can share competitor identity). Total competitors: 2,600, including 1,304 people and 1,296 teams. Public upcoming events at audit: 1,269. Database size: about 20 MB; cron jobs: zero.

Player hydration is service-role protected, paced at least 2.1 seconds apart, capped at ten calls per invocation, and successful roster groups stay fresh for 30 days. Failed groups stay eligible for retry and record failure. SportsDB event refresh has bounded calls and oldest-target-first selection. Manual restore bootstrap is retired (HTTP 410); no reusable public ingestion capability remains.

[Supabase Free](https://supabase.com/pricing) currently includes a 500 MB database, 1 GB file storage, 5 GB egress and 5 GB cached egress. Project inactivity can cause pausing; automatic backups are not included. Current size fits comfortably, but traffic/egress and calendar polling still need monitoring. Preserved schema/config snapshots are not a tested backup of future user data. A restore drill and measured daily refresh budget are required before enabling cron. No claim of zero ongoing costs or restored continuous ingestion is made.

## Validation and launch status

- TypeScript and lint pass; 110 unit tests across 21 files pass.
- 18 focused desktop/mobile checks pass: save/export, modal focus, community timezone/edit/image, preview protection, DAZN contrast, search, ticker, reduced motion, skip focus and 320px reflow.
- 34 core/sport route and automated accessibility smoke checks passed; the two expanded-card checks passed after updating the retired “Match details” expectation to the current “Quick details” heading. Automated accessibility excludes contrast, so this is not a complete WCAG audit.
- Production compilation/SEO generation succeeds with live verification skipped. That bypass proves compilation only.
- Unmodified strict data gate fails baseball (21 vs 100 required) and detailed Olympic fixtures (0 vs 1). Tennis, athletics, cricket and volleyball have no upcoming fixtures.

Before public release: resolve source coverage, verify real account login/sync/recovery and public sharing on a second device, test an actual Apple/Google/Outlook subscription client, establish backup recovery and a refresh budget, complete image/mark rights and legal/retention checks. Payments and premium accounts remain future scope.
