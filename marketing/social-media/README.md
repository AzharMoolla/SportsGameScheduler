# Silbo Sports social publishing library

This is the working source of truth for creating, approving, and publishing Silbo Sports social content.

## Browser accounts

The in-app browser is prepared with tabs for Instagram, TikTok, YouTube, X, Facebook, Threads, LinkedIn, Bluesky, and Reddit. Complete authentication yourself. Never place passwords, verification codes, or recovery codes in this folder.

## Folder map

- `brand/`: current-site screenshots, exact design tokens, reusable masters, and canonical exports.
- `instagram/`: Reels, carousels, and feed captions.
- `tiktok/`: short-form scripts and cover artwork.
- `youtube/`: Shorts, tutorial titles/descriptions, and thumbnails.
- `x/`: launch posts, live utility templates, and product threads.
- `facebook/`: Page posts for supporter groups, families, and pools.
- `threads/`: conversational founder/product posts.
- `linkedin/`: company, product, and partnership posts.
- `bluesky/`: concise early-adopter/community posts.
- `reddit/`: transparent founder participation and launch-feedback drafts.

Each platform folder contains its profile copy, three launch posts, links, asset assignments, and publishing notes.

## Status language

- `READY`: approved copy and asset; may be published after an explicit user instruction.
- `DRAFT`: needs review, live timing, or a product fact checked.
- `LIVE`: published; add the live URL and timestamp.
- `QUEUED`: scheduled; add platform-local date/time and timezone.

## Publishing workflow

1. User says which post to publish or queue.
2. Codex opens the matching platform folder and verifies the asset, text, link, and any time-sensitive claim.
3. Codex prepares the post in the authenticated browser session.
4. Codex asks for confirmation immediately before the final publish/schedule action.
5. After success, update the post entry with `LIVE` or `QUEUED`, timestamp, and URL.

## Current launch order

1. Instagram, TikTok, YouTube Shorts, and X.
2. Facebook, Threads, and LinkedIn.
3. Bluesky and Reddit once the primary profiles are complete.

The masters are deliberately centralized so the upcoming homepage redesign can be applied once and re-exported across every platform.
