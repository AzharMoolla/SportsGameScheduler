# Fan-first refresh — 2026-10-07

The later [design and workflow audit](WORKFLOW-AUDIT.md) supersedes this first-pass evidence for soccer, sport colours, artwork, images, saved events, community schedules and calendars. It records 110 passing unit tests, focused browser checks and deployed feed verification, with remaining launch limitations.

## Implemented

The home page leads with “Your sports. Your time.” Browse and personal schedule links precede a labelled cross-sport search and six sport shortcuts. Upcoming personal events combine league/competitor follows with the existing national-team fallback. Existing saved follows are preserved.

The sports hub uses plain fan-facing copy and shows fixture availability only when its schedule contains events. Sport names wrap instead of truncating. Navigation links use anchors rather than nested buttons. Shared controls have 44px minimum height, visible focus, and short interactions that respect reduced motion.

The homepage ticker has explicit pause/resume, stops on hover/focus, runs independently of screen refresh rate, and excludes its visual duplicate links from keyboard/screen-reader navigation. Reduced motion shows a static, horizontally scrollable list. Other screens omit the ticker so scheduling gets more space.

Retained Silbo's existing display/body/mono fonts, sports artwork, dark broadcast mode and warm paper mode. Reduced backdrop and decorative signal intensity, improved headline hierarchy, and removed button glow. No dependency, font service, analytics, ad pixel or runtime AI provider was added. The Supabase connector and browser tooling handled restoration and visual review; optional playbook tools were selected by need rather than installed indiscriminately.

## Evidence

- Lint and TypeScript passed; all 103 unit tests passed.
- Ten new browser checks passed across desktop and mobile Chromium: search navigation/active option, semantic links, ticker pause, reduced motion, 320px reflow and skip focus.
- Core route smoke checks passed. Home/schedule automated checks found no serious/critical violations on desktop and mobile; that check excludes color contrast. The primary CTA separately passed its program-mode 4.5:1 hover contrast assertion. System-theme behavior passed.
- Visually reviewed desktop home, 390px home, narrow discovery and desktop discovery. Screenshots: `home-desktop.jpg`, `home-mobile.jpg`, `explore-desktop.jpg`.
- Production compilation and SEO generation passed with live verification skipped. The unmodified strict live-data gate fails baseball (21 upcoming vs its 100 threshold) and Olympic sports (zero detailed fixtures). Tennis, athletics, cricket and volleyball report no upcoming fixtures. These are explicit coverage limitations, not a successful launch gate.

The public domain remains on its restoration page. Account login/sync, calendar subscription endpoints, alert delivery, recovery and final legal/retention review still need end-to-end verification before public relaunch. Payments/premium benefits remain future scope.
