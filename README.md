# Mando Adel — Portfolio

A Next.js portfolio for graphic designer Mando Adel (Wink Adv, Tanta, EG).
The motion system is a clean-room re-implementation of the techniques found on
`inherited.band` — no code from the original bundle is used.

## Run

```bash
npm install
cp .env.example .env      # then edit the values
npm run db:up             # Postgres 16 in Docker
npm run db:push           # create the WorkLink table
npm run dev               # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

Node 18.18+ (tested on Node 24). Requires a PostgreSQL database and the
variables in `.env` (see `.env.example`).

> `docker-compose.yml` publishes Postgres on host port `5432`. If a local
> PostgreSQL service already uses that port, stop it first or change both the
> published port and `DATABASE_URL`.

## Admin dashboard

Open **`/admin`** and sign in with `ADMIN_PASSWORD` from `.env`.

Each of the three featured designs is stored in the `WorkLink` table and can be
edited without touching code:

| Field | Notes |
| --- | --- |
| Title | Also drives the two-line display lockup (`"ACME Studio"` → ACME / STUDIO; `"ACME"` → one line). Use `|` to force a break. |
| Subtitle | Small descriptor under the title |
| Link | Behance gallery URL or Google Drive file URL |

When the link changes, the server resolves a cover image:

- **Drive** — `drive.google.com/file/d/<id>/...` and `?id=<id>` links become
  `drive.google.com/thumbnail?id=<id>&sz=w1600`. The file must be shared with
  “Anyone with the link”.
- **Behance** — the server reads `og:image`; if Behance blocks the request
  (403), it falls back to Jina Reader and uses the first project module image.
- **Anything else** — used directly only when the URL points at an image.
- **Failure** — the existing local cover in `public/img/` is kept.

Rows are seeded automatically from `content/site.ts` the first time the site
or dashboard is loaded. The static rows in `content/site.ts` are the fallbacks.

## Editing content

Page copy (hero, about, archive, contact) lives in **`content/site.ts`**.
The three featured designs are edited from `/admin`; the same file supplies
their fallback titles, links, and covers.

| Field | What it controls |
| --- | --- |
| `name`, `firstName`, `lastName` | Nav, hero split title, contact overlay, loader |
| `email` | Contact overlay + copy-to-clipboard — **still a placeholder** |
| `socials` | Behance / Instagram / Visuals links, footer + contact |
| `about` | Lead paragraph, bio, role table |
| `works` | Fallback title, subtitle, link, image and layout for the three case studies |
| `archive` | “More work” rows and plates |

Images live in `public/img/`. Keep the same filenames to swap without touching code:

- `portrait.jpg` — 1:1 portrait, currently 276×276
- `nsco.webp` — 1400×1047
- `moda.webp`, `dream.webp` — 808×632

> **Before launch**
> 1. Replace `portrait.jpg` with the original 1280×1280 file — the current copy was
>    the largest version on Behance and will soften on large screens.
> 2. Replace `hello@mandoadel.com` with his real address.

## Structure

```
app/
  layout.tsx        fonts, metadata, favicon
  page.tsx          loads works from Postgres, renders <Site />
  globals.css       all layout, tokens and motion CSS
  admin/            login + dashboard, protected by a signed cookie
  api/admin/        login, logout and work update route handlers
components/
  Site.tsx          orchestrator: Lenis, scroll blur/parallax, reveals,
                    intro, mobile pager, contact state, Shift+G grid
  Preloader.tsx     count-up curtain
  Nav.tsx           desktop nav
  MobileNav.tsx     mobile bar, prev/next, contact button
  Hero.tsx          split-letter hero
  About.tsx         two-row profile grid
  WorkSection.tsx   full-bleed case study (bg blur + parallax card)
  MoreWork.tsx      archive list
  Footer.tsx        desktop footer
  Contact.tsx       red overlay, copy-to-clipboard
  NoiseText.tsx     renders per-letter spans for the melt filters
  admin/            login form, work form, logout
lib/
  noise.ts          melting-type engine
  intro.ts          hero entrance timeline
  prisma.ts         Prisma client singleton
  auth.ts           signed admin cookie + password check
  works.ts          DB reads, seeding, fallback merge
  thumbnail.ts      Behance / Drive cover resolver
prisma/
  schema.prisma     WorkLink model
content/
  site.ts           page copy and fallback work data
docker-compose.yml  Postgres 16 for local development
```

## Motion system

- **Smooth scroll** — Lenis 1.3 pinned to `documentElement`, stopped while the
  contact overlay is open.
- **Melting type** — each letter gets its own SVG filter chain
  (`blur → feTurbulence → feDisplacementMap`) driven by one shared rAF loop at
  ~24 fps. Filters are only attached while the letter is on screen, and letters
  "settle" from a melted state the first time they intersect. The original site
  ran one rAF loop per letter (~99 loops); this runs one.
- **Hero motion blur** — scroll velocity feeds an SVG directional blur on the
  hero portrait, with parallax on the image and the title block.
- **Reveals** — `IntersectionObserver` adds `.is-in`; everything is one-way so
  scrolling back up doesn't re-animate.
- **Preloader** — count-up over a cream curtain; the page becomes interactive
  as the curtain lifts.
- **Mobile** — under 1024 px the page becomes a fixed 9-step deck (intro, about,
  3 works × 2 steps, archive). Swipe up/down, wheel, or the `( )` arrows move
  between steps; the archive step scrolls internally.

### Keyboard / extras

- `Shift` + `G` — 6-column layout grid overlay (alignment aid)
- `Esc` — close the contact overlay
- Click the email in the contact overlay to copy it

Reduced-motion users get no melt, no parallax, no blur and no preloader
animation.

## Fonts

Self-hosted **Schibsted Grotesk** variable (`public/fonts/schibsted-grotesk-latin.woff2`), a close free stand-in
for Founders Grotesk used by the reference site.

## Deploy

Any Node host that supports Next.js 15 (Fly, Render, a VPS). Provision
PostgreSQL, set `DATABASE_URL`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`,
then run `prisma db push` (or `prisma migrate deploy`) and
`npm run build && npm run start`. The homepage is rendered on demand so admin
edits appear immediately.
