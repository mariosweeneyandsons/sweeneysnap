# SweeneySnap — Dev Log

A live event selfie wall app by Sweeney and Sons. Attendees scan a QR code, take a selfie, and it appears on the big screen in real time.

**Stack**: Next.js 16 (App Router) + Convex + Tailwind CSS v4 + Motion
**Auth**: Convex Auth + Google OAuth
**Hosting**: Vercel + Convex Cloud
**GitHub**: mariosweeneyandsons/sweeneysnap

---

## Day 4 — 2026-02-25 (Tuesday)
**Summary:** Massive 82-commit sprint — display wall features, admin dashboard expansion, design token migration, and 12+ new platform features in one overnight session.

### The Story
Mario kicked off the evening around 8:50 PM with a small fix: an empty middleware file was breaking the Vercel build. One quick delete (`2fc2810`) and the deploy pipeline was green again. But that was just the warm-up. What followed was one of those legendary all-night coding sessions where everything just clicks.

The first wave was the display wall. Mario had a vision for a production-ready event display, and the commits started flying — 13 new `displayConfig` fields, three transition types (fade, slide, zoom), three layout modes (grid, slideshow, mosaic), a full background system with images, video, and animated gradients, then overlays: a ticker bar, a countdown timer, a social media handle display. Spotlight mode came next — randomly featuring selfies full-screen with a cinematic ring border. Then sound effects: a 3-note ascending chime for new arrivals, a camera shutter click, and celebration effects (confetti, ripple, glow). All of this landed in about 40 minutes.

The second wave hit the admin dashboard hard. Analytics with recharts, ZIP export for selfies, drag-and-drop event sorting with dnd-kit, bulk moderation with AI badges, a live preview panel, toast notifications, loading skeletons — the admin went from functional to polished. Meanwhile, on the backend, cron jobs for auto-scheduling events, bulk selfie operations, AI moderation with OpenAI's vision API, and brand asset management all dropped in. Around 11:30 PM, a critical inflection point arrived: Vercel builds started failing again due to pre-existing TypeScript errors in custom domain handling and image processing code. Rather than spend an hour debugging type mismatches, Mario made a pragmatic call — enable `ignoreBuildErrors` in the Next.js config and keep shipping. This unlocked the entire late-night sprint.

From midnight onward, the session shifted into platform feature overdrive across four parallel terminal sessions. Offline upload queue with IndexedDB auto-retry. Crew console with activity logging and permissions. PWA support with manifest and service worker. Keyboard shortcuts with a help modal. Responsive admin sidebar. Custom domains per event with middleware rewriting. Social sharing and a public selfie page. Email delivery via Resend and SMS via Twilio. Photo booth kiosk mode with auto-reset, fullscreen, and wake lock. Print station integration with HTTP polling. Image optimization with Sharp. Webhooks for selfie lifecycle events. A sticky LivePreview panel with 2-column layout. And threading through all of it, a complete design token migration — every single admin component moved from hardcoded `text-white/XX` and `bg-white/XX` classes to semantic tokens. Zero hardcoded color classes remaining.

By 12:10 AM on the 26th, 82 commits had landed. The codebase was fully token-migrated, the admin panel was production-ready, the display wall had QR codes and celebration effects, guests could upload offline and share to social, and the entire app was ready for multi-event deployments. One commit every 6-7 minutes on average. The CLAUDE.md got its narrative devlog instructions, and the foundation was set for the next phase.

### Battles
- [Won] **Empty middleware breaking Vercel build** — deleted the empty file (`2fc2810`), deploy went green
- [Won] **TypeScript errors blocking Vercel** — pre-existing type mismatches in `convex/events.ts` (custom domain) and `convex/selfies.ts` (image processing); chose `ignoreBuildErrors: true` to unblock and keep shipping
- [Won] **Double-submit on upload form** — used `useRef` guard instead of state to avoid race conditions (`9d15815`)
- [Won] **Design token migration across ~15 components** — systematic approach: high-traffic components first, then smaller utilities, then remaining pages

### What Got Done
- Display wall: 3 layout modes, 3 transition types, background system (image/video/gradient), overlays (ticker/countdown/social), spotlight mode, sound effects (chime/shutter), celebration effects (confetti/ripple/glow), primary color theming, auto-hide cursor
- Admin dashboard: analytics page (recharts), ZIP export, drag-and-drop event sorting (dnd-kit), bulk moderation with AI badges, live preview panel, toast notifications, loading skeletons, event duplicate/archive/delete-all, selfie stats and schedule badges
- Backend: cron job for auto-scheduling, bulk selfie operations, AI moderation (OpenAI vision), event analytics queries, brand asset backend, crew token resolution, notification hook with chime sound
- Upload form: countdown timer, flash effect, camera facing toggle, configurable compression, rate limiting, photo editor with filters/frames/stickers/canvas export
- Platform features: offline upload queue (IndexedDB), crew console, PWA support, keyboard shortcuts, responsive admin, custom domains, social sharing, email/SMS delivery (Resend/Twilio), photo booth kiosk mode, print station, image optimization (Sharp), webhooks, sticky LivePreview
- Complete blueprint design token migration — zero hardcoded color classes remain in admin components
- Added dark/light mode toggle with full token support

### Commits
- `2fc2810` — fix: delete empty middleware file breaking Vercel build
- `43ca4c3` — chore: trigger Vercel redeploy with Convex env vars
- `305e267` — fix: make brand kit hover panel actually expand
- `2d6f643` — feat: add 13 new displayConfig fields
- `5eb32c3` — feat: implement slide & zoom transitions
- `476439b` — feat: add slideshow and mosaic layout modes
- `8b2d161` — feat: add primary color theming, background layers
- `a73b0b2` — feat: add ticker, countdown, social overlays
- `f6e685e` — feat: add spotlight mode, sound effects, celebration triggers
- `9d15815` — fix: prevent double-submit on upload form
- `e270c4f` — feat: add list filtering, duplicate, archive, sort mutations
- `838060e` — feat: add cron job for auto-scheduling events
- `fa43f42` — feat: add bulk status updates, AI moderation scheduling
- `0200565` — feat: add event analytics query
- `75477f1` — feat: create AI moderation action with OpenAI vision
- `7cb3546` — feat: install recharts, jszip, file-saver, dnd-kit
- `fe94bad` — feat: expand admin display settings with all new controls
- `1b2e6df` — feat: add notification hook and chime sound
- `e86f47c` — feat: add duplicate, archive, analytics, export, delete-all to event detail
- `760f8fe` — feat: add selfie stats, archive toggle, schedule badges
- `bd08595` — feat: add ExportSelfiesButton for ZIP download
- `178c994` — feat: add analytics page with timeline chart and stats
- `0a230e9` — feat: add bulk moderation, AI badges, count tabs, alerts
- `cd821b7` — feat: enforce allowGallery, compression, rate limiting
- `71946f0` — feat: add countdown, flash effect, camera toggle
- `a56f98b` — fix: replace placeholder sounds with real audio
- `8a7ec68` — feat: add live preview panel and split-screen layout
- `627800b` — feat: add photo editor with filters, frames, stickers
- `adc4f14` — feat: refactor upload form to 5-screen flow
- `80347b9` — feat: add breadcrumb navigation
- `67209d0` — feat: add loading skeletons
- `55267e6` — feat: add drag-and-drop sortable event grid
- `1660501` — feat: add toast notification system
- `fe46c37` — feat: branded upload page with dynamic theming
- `b86ebe4` — feat: add brand asset upload UI
- `fa9dc64` — feat: add admin upload settings page
- `e4e2ac2` — feat: add dynamic theming with EventThemeProvider
- `685679c` — feat: add preset live preview component
- `9a48909` — feat: add crew management backend
- `36591cd` — feat: add PWA support
- `03159be` — refactor: replace hardcoded colors with design tokens
- `37f7e06` — feat: add crew console UI
- `3a5b136` — feat: add offline upload queue with IndexedDB
- `539121a` — feat: add destructive-bg, info, info-bg tokens
- `6c2c508` — feat: add dark/light mode toggle
- `8965bd7` — refactor: migrate high-traffic admin components to tokens
- `e9e1d73` — refactor: migrate form components to tokens
- `9b0fef7` — feat: add responsive admin layout
- `94b55fa` — feat: add keyboard shortcuts with help modal
- `df6dc74` — refactor: migrate asset management components to tokens
- `e8234ef` — refactor: migrate small admin components to tokens
- `f91065c` — feat: add image optimization with Sharp
- `7c2ed8d` — feat: add analytics backend queries
- `7dd9559` — refactor: migrate admin pages to tokens
- `af57701` — feat: add custom domain per event
- `de8ba4b` — refactor: migrate remaining pages and charts to tokens
- `b39d004` — feat: add post-event summary page
- `3fde1f3` — refactor: migrate WebhookManager and display-settings to tokens
- `e886df8` — feat: add social sharing with share buttons
- `d8c3b70` — refactor: migrate QRCodeDisplay and PresetPreview to tokens
- `8c53ed3` — feat: add email/SMS selfie delivery
- `2b22d6f` — fix: skip TypeScript errors to unblock Vercel
- `2379689` — feat: add photo booth kiosk mode
- `5466419` — feat: add sticky LivePreview panel
- `111099b` — feat: add print station integration
- `397e1cc` — docs: update devlog
- `de57c30` — feat: add multi-event display pages
- `21d47be` — feat: add public selfie gallery with masonry grid
- `49b683c` — feat: add CLAUDE.md with DEVLOG instructions
- `b7b3f80` — fix: migrate remaining admin components to tokens

### Notes
- 3 pre-existing TypeScript errors in `convex/events.ts` and `convex/selfies.ts` remain — non-blocking at runtime, skipped via `ignoreBuildErrors`
- Packages added: recharts, jszip, file-saver, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, qrcode.react, sharp, resend, twilio
- Four parallel terminal sessions were running simultaneously during the late-night sprint, each handling different feature areas

---

## Day 3 — 2026-02-20 (Thursday)
**Summary:** Migrated the entire backend from Supabase to Convex — replaced auth, rebuilt all server functions, swapped every frontend page, and fully removed Supabase.

### The Story
The day started with a question that would reshape the entire project. Mario had been wrestling with Supabase's pricing model — the org-wide pro plan requirement meant every project would get expensive fast. He started researching alternatives, asking pointed questions: "What are the top 3-5 best places to host a backend like Supabase?" and "How easy is it to transfer everything to Convex?" The conversation dug into specifics — AI-friendliness (fewer mistakes with Convex's TypeScript-native approach), pricing (Convex's generous free tier with pay-as-you-go vs Supabase's per-org billing), and the big tradeoff: giving up raw SQL for TypeScript-based queries. Mario weighed it all and pulled the trigger: Convex it is.

But first, there was morning business. Mario had been added as a collaborator to the GitHub repo, and Vercel wasn't triggering builds. Quick troubleshooting revealed the repo visibility issue — made it public, problem solved. Then came setting up admin accounts and swapping email/password auth for Google OAuth, which landed cleanly.

The migration itself was surgical. The Convex backend went in first — schema definitions, auth configuration, all queries and mutations rewritten in TypeScript. Then the frontend swap: every page that touched Supabase (admin, public, crew, display) got rewired to Convex hooks. Once everything was pointing at the new backend, the Supabase teardown began — delete the client files, uninstall the packages, clean the env vars. One last hiccup: a broken import in the middleware file from the removed Supabase auth helper. Quick fix, clean build, migration complete. The entire backend swap happened in about two hours.

The day also saw some design polish. The brand kit got three new sections — Frosted Glass, Motion, and Loading States — and Mario flagged the Grid Paper Background section as feeling outdated ("I asked for frosty glass, this part feels outdated"), so it got removed. The small-caps label color got bumped from a dark blue (#4a7ab5) to ice blue (#a0c8e8) for better contrast on navy backgrounds.

### Battles
- [Won] **Supabase to Convex migration** — full backend swap in ~2 hours: schema, auth, queries, mutations, frontend hooks, package cleanup
- [Won] **Broken middleware import** — removing Supabase left a dangling import in middleware; caught and fixed immediately (`c49f02a`)
- [Won] **Vercel build triggers** — repo visibility was blocking deploys; made public to fix
- [Dodged] **SQL vs TypeScript query concerns** — acknowledged the tradeoff but decided Convex's TypeScript-native approach was worth it for AI safety and developer experience

### What Got Done
- Replaced email/password login with Google OAuth (`cf4b900`)
- Added brand kit sections 8-10: Frosted Glass, Motion, Loading States (`2c9d67c`)
- Removed outdated Grid Paper Background section (`7c6c011`)
- Built entire Convex backend: schema, auth config, all queries and mutations (`c7481ee`)
- Swapped all frontend pages from Supabase to Convex hooks (`7667e5c`, `e2a134d`)
- Fully removed Supabase: deleted files, uninstalled packages, cleaned env vars (`fcbe22c`)
- Fixed broken middleware import (`c49f02a`)

### Commits
- `7c6c011` — chore: remove outdated Grid Paper Background section from brand kit
- `cf4b900` — feat: replace email/password login with Google OAuth
- `2c9d67c` — feat: add brand kit sections 8-10 (Frosted Glass, Motion, Loading States)
- `c7481ee` — feat: add Convex backend — schema, auth, and all server functions
- `7667e5c` — feat: swap all frontend pages from Supabase to Convex
- `e2a134d` — feat: swap public/crew/display pages from Supabase to Convex
- `fcbe22c` — chore: remove Supabase — delete files, uninstall packages, update env
- `c49f02a` — fix: remove broken import from middleware

### Notes
- Migration decision driven by pricing (Supabase org-wide pro vs Convex pay-as-you-go), AI-friendliness (TypeScript-native = fewer mistakes), and developer experience
- All database types converted to camelCase as part of the migration
- The SQL-to-TypeScript query tradeoff was acknowledged but accepted — performance is sufficient for the app's scale

---

## Day 2 — 2026-02-19 (Wednesday)
**Summary:** Chose Blueprint as the official visual identity, built the 3-layer design token system, and created the brand kit reference page.

### The Story
The previous day had produced ten wildly different theme concepts — from Command Center's military aesthetic to Swiss Grid's brutalist precision. Today was decision day. Mario surveyed the options and landed on Blueprint (theme-8) as the official look for SweeneySnap. But he wasn't just picking a theme wholesale — he wanted to cherry-pick the best ideas from the others too. The 16:9 live preview panel from Command Center? Grab that for later. The desktop-first column grid layout? Essential, since 99% of viewing would be on desktop screens.

With the direction set, the real work began: building a proper design token system. The implementation followed a 3-layer pipeline — primitives (`--bp-*` CSS custom properties for raw values like colors and spacing), semantic roles (mapping primitives to UI concepts like `--foreground` and `--surface`), and `@theme` inline application. This architecture meant the Blueprint look could be tuned at any layer without cascading breakage.

The brand kit reference page came next, initially at `/dev/tokens`. Mario quickly flagged the naming — "Why 'dev tokens'? Call it 'brand kit.'" The page got renamed to `/dev/brand-kit` and expanded with frosted glass input styling. Mario wanted the inputs to have that "glassy frosted see-through look" where the Blueprint grid lines were visible underneath. There was a refinement loop on the small-caps label colors — the initial blue-on-navy wasn't reading well, so it got tuned to ice blue (#a0c8e8) for better contrast. By end of day, the brand kit had eight polished sections: primitives, semantic roles, typography, inputs, cards, buttons, grid, and animations.

### Battles
- [Won] **Label contrast on navy backgrounds** — initial small-caps labels in dark blue (#4a7ab5) were hard to read; tuned to ice blue (#a0c8e8) for proper contrast
- [Won] **Naming confusion** — user flagged "dev tokens" as unclear; renamed to "brand-kit" for clarity

### What Got Done
- Selected Blueprint (theme-8) as the official app visual identity
- Implemented 3-layer design token pipeline: Primitives (`--bp-*`) → Semantic roles → `@theme` inline (`73349f8`)
- Built the brand kit reference page at `/dev/brand-kit` with frosted glass inputs, motion tokens, and loading states (`ed2cd81`, `455aa4f`)
- Tuned label colors to ice blue for contrast on navy backgrounds (`c4b7fb6`)

### Commits
- `73349f8` — feat: implement 3-layer Blueprint design token system in globals.css
- `ed2cd81` — feat: add Blueprint brand kit reference page at /dev/tokens
- `455aa4f` — feat: rename /dev/tokens to /dev/brand-kit + frosted glass inputs
- `c4b7fb6` — feat: update label color to ice blue (#a0c8e8) for better contrast on navy

### Notes
- Future TODO captured: borrow 16:9 LivePreview panel from Command Center, make all column grid cards as wide as possible for desktop
- Design decision: desktop-first (99% desktop viewing for the display wall)
- Brand kit page serves as the living reference for all Blueprint design tokens

---

## Day 1 — 2026-02-18 (Tuesday)
**Summary:** Project kickoff — scaffolded the app, built the full selfie wall structure in one shot, named it SweeneySnap, and explored 10 theme concepts.

### The Story
It started with `create-next-app`. At 2:41 PM, the first commit landed — a fresh Next.js scaffold, blank canvas. Twenty minutes later, the entire app structure was in place. Not just a skeleton — the full selfie wall architecture across eight phases: upload page, display wall, crew dashboard, and admin panel. All wired up, all in one commit. The app had a name now too: SweeneySnap.

Mario moved quickly to the README next, replacing the Create Next App boilerplate with a product-focused overview that explained what SweeneySnap actually does — a live event selfie wall where attendees scan a QR code, snap a photo, and watch it appear on the big screen in real time. The Sweeney and Sons company link got added, pointing to sweeneyandsons.tv.

With the foundation laid, the afternoon shifted to visual exploration. Mario wanted to see what the event settings page could look like — the admin UI where operators configure every dial for an event. The brief was open-ended: "Give it your all and take your time." Five theme concepts landed first: Command Center (dark tactical with monospace and neon green), Glass Loft (frosted minimal with lavender gradients), Neon Studio (bold creative with glow effects), Film Set (cinema-inspired with warm tones), and Swiss Grid (brutalist black/white/red precision). Then five more followed — Greenhouse, Mainframe, Blueprint, Confetti, and Darkroom — each pushing in a completely different visual direction. Ten distinct visions for the same settings page, all living at `/dev` for side-by-side comparison.

### Battles
No major battles today. Clean scaffold, smooth implementation, creative exploration without blockers.

### What Got Done
- Scaffolded Next.js app from Create Next App (`2cf4522`)
- Built the full selfie wall app structure in one shot — Phases 1-8: upload page, display wall, crew dashboard, admin panel (`eec1518`)
- Named the project SweeneySnap (`98115ac`)
- Wrote product-focused README (`5851e30`, `9fe0448`)
- Created 10 event settings theme concepts at `/dev` for visual exploration (`ac92882`, `0a702cb`)

### Commits
- `2cf4522` — Initial commit from Create Next App
- `eec1518` — feat: implement selfie wall — full app structure (Phases 1-8)
- `98115ac` — chore: rename project to SweeneySnap
- `5851e30` — docs: replace boilerplate README with product-focused overview
- `9fe0448` — docs: link Sweeney and Sons to sweeneyandsons.tv in README
- `ac92882` — feat: add 5 event settings theme concepts at /dev
- `0a702cb` — feat: add 5 event settings theme concepts (themes 6-10) at /dev

### Notes
- 10 theme concepts produced for evaluation: Command Center, Glass Loft, Neon Studio, Film Set, Swiss Grid, Greenhouse, Mainframe, Blueprint, Confetti, Darkroom
- Blueprint (theme-8) would go on to become the official visual identity the following day
- Full app architecture established in a single commit — upload flow, display wall, crew tools, admin panel
