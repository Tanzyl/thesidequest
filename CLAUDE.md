# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project State

**UI prototype only, no backend.** Four static pages (`index.html`, `crew.html`, `faqs.html`, `join.html`) sharing `styles.css` and `site.js`. Vanilla JS, no build step, no dependencies beyond Google Fonts. Git remote: github.com/Tanzyl/thesidequest (push over SSH; the `gh` CLI here is signed in to a different account). `.gitignore` keeps the client PDF/docx, mood images, dead media, and archive originals out of the repo. Not a git repo yet. Everything else in the folder is pre-development source material for The Sidequest website (thesidequest.fun), a fully gated, invite-club-style site for a Lahore nightlife/events brand.

Source documents (read these before touching copy or rules):
- `The-Sidequest-Website-Master-Spec.docx` (v3, final) is the single source of truth for pages, copy, data model, and admin. It's a zip: `unzip -p "The-Sidequest-Website-Master-Spec.docx" word/document.xml` and strip tags.
- `THE SIDEQUEST Brand Identity & Vision Deck.pdf` (40 MB) is the brand/visual reference.
- The `.jfif`/`.png` files in the root are visual mood references (ticket-card UI, FAQ pattern, red/black concert energy), not assets to copy literally.
- `archive/` holds the client's six archive photos. The originals (spaces in names, five are JPEGs mislabelled `.png`) are source only; the page uses the resized `archive/a1.jpg`..`a6.jpg` (1400px, Pillow). Re-run the resize if the originals change.
- The Canva build at https://thesidequest.my.canva.site/ is the client's reference for the hero, Why Us, and About Us sections (ported 2026-09-05) and the source of the display font. `hero-loop.mp4`, `gallery-scrub.webm` (18 MB) and `crowd.png` are no longer referenced by any page; safe to delete.

## Running & Deploying

- **Run locally**: open `index.html` in a browser. No server needed.
- **Skip the signup gate**: append `?preview` to the URL. Add `&at=<section-id>` to auto-scroll to a section (e.g. `?preview&at=team`) — used for headless screenshots. The gate also has a visible "preview without account" link (`#skiplink`) that plays the full ACCESS GRANTED animation — remove before the real auth build.
- **Deploy**: the GitHub repo is connected to Vercel project `thesidequest` (team tanzyls-projects, framework preset Other, no build step). Every push to `main` deploys to production at `https://thesidequest.vercel.app`; other branches get preview URLs. `vercel deploy --prod` from this folder still works as a manual fallback (run it from PowerShell, the Git Bash shim hides the CLI output). Vercel builds from the repo, so anything `.gitignore` excludes never ships either.
- **`.vercelignore` is a denylist mirroring `.gitignore`** (Vercel does not honor re-including files inside a `*`-excluded directory, so the old allowlist 404'd `archive/`). It blocks the spec, PDF, mood images, dead media, archive originals, CLAUDE.md and tool state. Anything else in the folder ships, so keep private files matching those patterns.

## Site Architecture

`styles.css` holds every rule for all pages; `site.js` is one IIFE with plain `$`/`$$` querySelector helpers, no framework.

- **index.html sections by id**, in order: `hero`, `sidequests`, `whyus`, `about`, `gallery`, `pitch` (Your Sidequest), `contact`.
- **Sub-pages** `crew.html` (`#team`), `faqs.html` (`#faq`), `join.html` (`#join`) carry `<body class="sub">`, the same header/drawer/footer as index with anchors rewritten to `index.html#...`, and no loader or gate. They were generated once by a script and are now hand-maintained: a nav or footer change must be made in all four files.
- **Sub-pages are not gated.** The client-side gate lives only on index; a direct hit on `crew.html` shows content. Acceptable for the prototype, must be fixed by the real auth build.
- **Nav**: Home, New Sidequests, About Us, Crew, FAQs, Contact Us. Drawer adds Join The Team and Your Sidequest (deliberately kept out of primary nav per spec).
- **One button style site-wide**: `.btn,.sendbtn,.hero-cta,.pass .go` share the solid red block with white Poppins 500 text taken from the Canva "Your Sidequest" submit. New buttons get `class="btn"`.
- **Gate is client-side only** (index): `#gate` overlays the page on load, `body` overflow is locked, the signup form validates "all fields filled" and `age >= 16` in JS, then `openGate()` plays the ACCESS GRANTED stamp. Login link is a toast stub. The only storage key is `sessionStorage['sq-y']`: `landing()` restores the pre-reload scroll position (or the URL hash target) once the gate lifts, because the gate's `overflow:hidden` defeats the browser's own restoration.
- **Never put `overflow-x:hidden` on `body`.** `html,body{overflow-x:clip}` handles horizontal overflow; `hidden` on body would make it a scroll container and silently break the sticky Archive (that bug shipped once).
- **Performance rules** (2026-09-05 optimisation pass): background films other than the hero have no `autoplay` and `preload="none"`; `site.js` plays only the one in view via IntersectionObserver, so nothing off-screen downloads. On touch devices `#grain` is hidden, the 13 MB topo film is `display:none`, and every second photo-wall card is dropped. `sq-display.woff` is preloaded in the head of all four pages; Anton is no longer loaded (Impact is the fallback). Inputs are 16px so iOS does not zoom. Keep new media behind the same lazy pattern.
- **Reduced motion**: the `RM` flag (`prefers-reduced-motion`) short-circuits the loader, gate animation, all `video[autoplay]` background films, custom cursor, and hover effects. Keep new motion behind it.
- **Hero / Why Us / About / Your Sidequest** carry Canva backgrounds: each has a looping `<video class="bgvid">` with copy in a `.sec-in` wrapper on top, and a `::before` scrim (z-index 1, `.sec-in` is 2) so copy stays readable over the film. Keep the scrim when swapping a video. Hero is one line, "READY FOR A SIDEQUEST", plus an EXPLORE button linking to `#sidequests`; `.stick.open` (set by `openGate()` or `?preview`) plays the line reveal. Why Us is the one light section (`#ECECEC`); its manifesto and the About copy keep the original pre-Canva typography (large Poppins 400 with red italic `<em>` phrases; grey italic Poppins 300 respectively). Eyebrows are Space Mono red. The Your Sidequest form is deliberately louder than the Join form (white bold labels, 18px white inputs). No scroll-driven hero interaction remains.
- **The Archive (gallery)** is a CSS-only 3D photo wall that replaced the old scrubbed video: `.wall` has `perspective`, `.wall-scene` translates by `--gp` (0..1 scroll progress set by `galScrub()`), and two identical `.wall-set`s stacked at `--wallh` make the end frame match the start. Each `.card` is an `<img>` positioned by inline `--x/--y/--w/--z/--rx/--ry`; depth (`--z`) gives the parallax. To change the composition, edit the card list in `index.html` (both sets must stay identical).
- **All forms are demos**: `form.formwrap` submits show the form's `data-toast` and reset. The live ticket stub click is a demo "claimed" toast. No network calls anywhere.
- **Media**: `hero-road.mp4`, `whyus-scribble.mp4`, `about-couch.mp4`, `pitch-topo.mp4` (section backgrounds, from the Canva build; the topo file is 13.5 MB and 60 s because ffmpeg is not installed here, trim it when possible), `archive/a1..a6.jpg` (photo wall, ~750 KB total). `primeVideos()` nudges every autoplay video for iOS.

## Planned Stack (per spec — dev may push back)

- Next.js (React) on Vercel; Supabase for Postgres, auth, and image storage
- Payments: Pakistan-compatible gateway (Safepay / JazzCash / Easypaisa) — **still an open decision**
- Auth: Supabase Auth or JWT + bcrypt, with age/gender on the user schema and a hard 16+ signup check

## Non-Negotiable Product Rules

- **Full gate**: zero content visible without a session — redirect to signup/login on any unauthenticated visit
- Signup requires: full name, phone, email, password, age (16+ enforced), gender
- Events page is called **"New Sidequests"**, not "Events"
- Locked copy in the spec must be used verbatim: About Us ("Who We Are"), Why Us manifesto, all 10 FAQ entries, team names/titles, Join The Team form questions
- Team addition beyond the spec's locked five (client-approved 2026-08): **Tanzyl — "friendly neighbourhood web-slinger" — Website / Development** (the site's developer)
- "Join The Team" and "Your Sidequest" pages are deliberately excluded from primary nav (drawer + contextual CTAs only)

## Design System (locked)

- Colors: black `#0D0D0D`, signal red `#CA0013`, white `#FFFFFF`, grey `#B5B5B5`
- Fonts: Poppins (body); headings use `SQ Display`, the self-hosted `sq-display.woff` pulled from the Canva build (Canva strips the name table, so the real family name is unknown; Impact / Arial Narrow are the fallbacks). It ships one weight only, so `body{font-synthesis-weight:none}` stops browsers fake-bolding `h1`–`h4`. Never remove that line. The spec's "Who We Are heading stays plain sans" exception was overridden by the client's Canva design (About Us uses the display font). Also loaded: Space Mono (ticket metadata) and Yellowtail (script accents).
- Core recurring component: the **ticket card** (boarding-pass shape, dashed perforation, edge notches, status badge: Confirmed / Coming Soon / Sold Out) — used for events AND team bios
- Team section uses LEGO-style minifigure renders, never real photos
- FAQ pattern: numbered expandable rows (/01, /02…) with red numerals

## Build Order (from spec §10)

1. Auth + design system + page shells
2. Home hero — exploding-head scroll interaction (highest-risk piece; the current Canva-style video hero is the accepted placeholder until the 3D asset exists)
3. New Sidequests: ticket cards, locked "coming soon" state, checkout + payments
4. About Us/FAQs (incl. team ticket cards)
5. Join The Team, Your Sidequest, Contact Us
6. Profile + referral system
7. Admin panel
8. Polish

## Open Items (blockers — check before building the affected area)

3D hero asset, display-font license (the Canva woff is licensed to Canva; confirm redistribution rights or buy the face before launch), payment gateway choice, YouTube and WhatsApp links (Instagram @thesidequestof, thesidequestt@gmail.com and the Discord invite are live in the Contact section and drawer on every page; YouTube and WhatsApp are still toast stubs), member benefits list, team bio paragraphs, email-verification required-vs-optional, admin access list. Full data model (Users, Events, Orders/Tickets, Attendance, Referrals, Team applications, Sidequest ideas, Contact messages) and admin panel requirements are in spec §7.
