# CoStars Charity Mini Concert: Event Guide

The digital event guide for the **CoStars Charity Mini Concert** on **5 December 2026**.
Guests scan the QR code on their wristband after check-in and land here. One shared
link for everyone, with no log-in. On their phones they can follow the running order,
meet the performers and see where their ticket money goes.

Built with **React 18 + Vite 6 + Tailwind CSS 3** (the original starter kit stack). No
backend or database: the text is read live from a Google Sheet (section 4), with
`src/data.js` as the built-in fallback.

- Live site: **https://costars-guide.vercel.app**
- Code: GitHub `pichtepy-haven/costars` → every commit to `main` redeploys on Vercel.

> **Before launch:** open [`CONTENT-CHECKLIST.md`](CONTENT-CHECKLIST.md). It lists every
> missing item, every fact that needs confirming and where to change it.

---

## 1. Run it on your computer

Requires **Node.js 18 or newer** (https://nodejs.org).

```bash
cd costars-ui-starter
npm install        # first time only
npm run dev        # opens a local preview at http://localhost:5173
```

In this development preview, missing content shows as dashed yellow **“To supply: …”**
labels so you can see what still needs adding. These labels never appear on the live site.

Other commands:

```bash
npm run build      # production build → dist/
npm run preview    # serve the production build at http://localhost:4173
```

Testing the live “Now” badge: add `?now=` to the address, in Cambodia time, e.g.
`http://localhost:5173/?now=2026-12-05T18:20`. The Act II row is then marked **Now**,
opened automatically, and the next item is marked **Up next**. On the real day this
happens automatically from the phone's clock.

---

## 2. What's in the guide

| Screen | What it shows | Design reference |
| --- | --- | --- |
| **Home** `#/` | Welcome banner · quick links · **Performance Schedule** (accordion, one item open at a time) · **Agenda Highlights** · **Charity Impact** · Etiquette / Sponsors / Need help / About CoStars · quote footer | UI Kit (accordion, list rows) + UI 2 (home, highlights, charity band, footer) |
| **Act page** `#/act/act-1`, `act-2`, `act-3` | Act artwork or photo, time and duration, description, **About the Performers** (line-up from the proposal), gallery, previous/next act | UI 2 detail screens |
| **Charity page** `#/charity` | L’aang Primary School facts, where the ticket money goes, the school's needs, photos, Vision & Mission | UI 2 “Charity Impact” screen + proposal slides 1, 3, 5, 6 |

Not included in the guide on purpose: venue directions, ticket sales and other pre-event
information (see the brief). The guide is meant for use on the night. Ticket sales live on
their own pages (section 6b).

---

## 3. Project structure

```
costars-ui-starter/
├─ index.html              page shell, fonts, social-preview tags
├─ vite.config.js          Vite + React: guide (/) + staff page (/staff), site URL for previews
├─ tailwind.config.js      colour + font tokens
├─ vercel.json             caching, clean URLs, /t/<code> ticket pages, image function
├─ api/ticket-image.js     ticket picture (PNG) for the Telegram bot (section 6b)
├─ api/khqr.js             payment KHQR picture shown on the ticket form (section 6b)
├─ public/                 files served as-is
│  ├─ favicon.svg, apple-touch-icon.png, og-image.jpg
│  ├─ buy.html, ticket.html, admin.html, ticketing/   ticket pages (section 6b)
│  └─ images/              ← put photos here (see public/images/README.md)
├─ staff.html + staff/     staff check-in page /staff (section 6c)
└─ src/
   ├─ data.js              ← ALL EVENT CONTENT (edit this)
   ├─ App.jsx              page switching, menu, scroll handling
   ├─ styles.css           all styling (tokens at the top)
   ├─ lib/                 helpers: router (#/ links), time & “Now”, icons, settings
   ├─ views/               HomeView, ActView, CharityView, NotFoundView
   └─ components/          Hero, Schedule, AgendaItem, AgendaHighlights, StageCover,
                           CharityImpact, MoreInfo, SiteHeader, SiteFooter, Lightbox, …
```

---

## 4. Updating content (no coding experience needed)

### Easiest: the Google Sheet (live, no redeploy)

Text on the live site comes from the Google Sheet **“CoStars Event Guide - Live Content”**
(https://docs.google.com/spreadsheets/d/1I2r3_1y2eZtx3FM-kw-_2IcoXnlMXibo6SOTXR8VYXU/edit).
Edit a cell and the guide shows it within about a minute (visitors may need to refresh).
The sheet's first tab, **How to edit**, explains every column.

| Tab | What it controls |
| --- | --- |
| Event | Event name, date, welcome title and message, footer lines, help phone / Telegram |
| Schedule | The running order: titles, times, descriptions, notes, host name, act intros, photos |
| Performers | Line-up per act: names, roles, pieces, minutes, biographies, photos |
| Etiquette | The Event Etiquette list |
| Sponsors | Sponsor names, logos and links (section appears once a row is filled) |

How it stays safe:
- Only people you invite as **Editor** can change it. The link is “Anyone with the link can
  view” so the website can read it, and everything in it is public on the site anyway.
- Text is always shown as plain text, links must be `https://`, and broken rows (e.g. a
  time like `25:99`) are ignored, so a typo can't break the site.
- If Google is unreachable, phones show the last copy they downloaded, or else the
  content in `src/data.js`.
- Undo mistakes with File → Version history in Google Sheets.

The code for this lives in `src/lib/sheetContent.js`; the sheet ID is in `src/lib/config.js`.
Charity facts, colours, fonts and icons are not in the sheet (they stay in the code).

### In the code: `src/data.js`

The built-in content (and everything the sheet doesn't cover) is in **`src/data.js`**.
Open it in any text editor, or edit it on github.com (pencil icon).

- **Change text:** edit the words between the quotes `'…'`. Keep the quotes and the commas.
  If your text contains an apostrophe, use the curly one: `’`.
- **Change a time:** edit `start` / `end` (24-hour clock, e.g. `'19:25'`). The time
  labels, durations and the “Now” badge all update from these.
- **Reorder the schedule:** move a whole `{ … },` block up or down inside `agenda`.
- **Add a performer biography:** fill in `bio: ''` for that performer.
- **Add a performer's piece:** fill in `piece: ''` (shown with a ♪ icon).
- **Missing information:** leave it as `''` or `[]`. It is hidden on the live site.
- **Rename the host:** `host: { name: '', role: 'Event Host' }` in the welcome item.
- **Add sponsors:** add entries to `sponsors.list`, e.g.
  `{ name: 'Company', logo: '/images/sponsors/company.svg', url: 'https://…' }`.
  The “Our Sponsors” section appears automatically once there is at least one.
- **Add a help contact:** fill in `help.phone` and/or `help.telegram`.

Each item in `src/data.js` has a source tag: `[P1]`–`[P6]` for the proposal slides,
`[UI1]`/`[UI2]` for the designs, plus `TODO`/`CHECK` markers. Search for **TODO** and **CHECK**
to find everything still open.

> ⚠️ The `id` values (`'act-1'`, `'charity'`, …) appear in links. Don't change them after the
> QR code is printed.

### Replacing images and logos

1. Save the photo in `public/images/…`, e.g. `public/images/acts/khmer-dance.webp`.
   Use lowercase names without spaces, and keep files under ~300 KB (https://squoosh.app helps).
2. Point to it in `src/data.js` with a path starting `/images/`:
   - act photo: `image: '/images/acts/khmer-dance.webp', imageAlt: 'Dancers of the Princess Buppha Devi Dance School'`
   - act gallery: `gallery: [{ src: '/images/acts/khmer-dance-2.webp', alt: '…' }]`
   - performer photos: `photos: [{ src: '/images/performers/song-hui-chan.webp', alt: 'Song Hui Chan at the piano' }]`
   - welcome banner: `welcome.image`
3. Until a photo is added, the guide shows the branded **stage artwork** (curtain, spotlight,
   act icon and the musicians silhouette from the proposal). That way no stock image is
   presented as the real performers.

The logo is drawn in code (`src/components/BrandMark.jsx`, Poppins Bold + star). Brand
colours and fonts are at the top of `src/styles.css` and in `tailwind.config.js`.

---

## 5. Deploy to Vercel (GitHub → Vercel)

### a) Put the project on GitHub

Make the **`costars-ui-starter`** folder (the one with `package.json`) the repository root.

```bash
cd costars-ui-starter
git init
git add .
git commit -m "CoStars event guide"
git branch -M main
git remote add origin https://github.com/<your-account>/costars-event-guide.git
git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `dist/` and `.env` files.
(Or use GitHub Desktop: *Add existing repository* → choose the folder → *Publish*.)

### b) Import into Vercel

1. Go to https://vercel.com/new and sign in with GitHub.
2. **Import** the `costars-event-guide` repository.
3. Settings (Vercel normally detects these automatically):
   - Framework preset: **Vite**
   - Root directory: **`./`** (or `costars-ui-starter` if you pushed the parent folder instead)
   - Build command: **`npm run build`**
   - Output directory: **`dist`**
   - Install command: **`npm install`**
4. Click **Deploy**. After about a minute you get a URL like `https://costars-event-guide.vercel.app`.

No routing configuration is needed: the guide uses `#/` links, so refreshing or opening
`…/#/act/act-2` directly always works.

### c) Custom domain (optional)

Vercel → your project → **Settings → Domains** → add e.g. `guide.costars.org`, then follow
the DNS instructions shown there.

### d) Updating after launch

Edit `src/data.js` (or add photos), then commit and push. Vercel redeploys automatically
within a minute or two. You can also edit `src/data.js` directly on github.com
(pencil icon → *Commit changes*).

To check missing content on a deployed **preview** (not production), add the environment
variable `VITE_SHOW_PLACEHOLDERS` = `true` for the *Preview* environment in Vercel.

---

## 6. The wristband QR code

- Use the **production** address (`https://<project>.vercel.app` or your custom domain).
  **Never** use a deployment-specific preview URL (those contain random characters and
  change with each deploy).
- Decide on the final domain **before printing**. Content can change any time
  afterwards without reprinting.
- Generate a **static** QR code that encodes the URL directly. Chrome's built-in
  *Share → Create QR code* does this. Avoid “dynamic” QR codes from freemium sites:
  they redirect through the provider and can stop working when a trial ends. Test-scan
  the printed wristband with both iPhone and Android before printing in bulk.
- Social previews (`og-image.jpg`) pick up the production domain automatically on
  Vercel. On other hosts, build with `SITE_URL=https://your-domain npm run build`.

---

## 6b. Tickets: form, ticket pages and the door check point

These pages work together with the CoStars Telegram bot (Google Apps Script). They are
plain HTML + JavaScript in `public/`, so Vite copies them as they are, and they do not
change the event guide.

| Address | What it is | Opened from |
| --- | --- | --- |
| `/buy` | Ticket form (Standard with how many tickets, or Group; name, phone). Sending it creates the order; the page then shows the order number, the amount and the KHQR to pay, and the bot sends the KHQR in the chat too | Bot: welcome button, 🎟 Buy tickets key, 🎟 Tickets button next to the message box |
| `/t/<code>` | The guest's ticket page with the designed ticket, live status, Save image, Add to calendar | The QR on every ticket, and 🎫 Open my ticket under each ticket photo |
| `/admin` | Door check point: Telegram QR scanner, live checked-in count, latest check-ins, search and check in by hand, sales for admins | Staff send `/admin` (or `/scan`) to the bot in a private chat |
| `/api/ticket-image?c=<code>` | The designed ticket as a PNG (the bot sends this picture). `?demo=1` shows a sample | The bot, and Save image |
| `/api/khqr` | The ticket KHQR as a picture (`?download=1` saves it as CoStars-KHQR.jpg) | The ticket form after ordering, and Save QR |

How it fits together:

```
Customer ─ Telegram bot ─▶ /buy (form) ─▶ bot creates order ─▶ KHQR on the page and in chat ─▶ receipt photo
Admin group: ✅ Approve + transaction ID ─▶ bot asks /api/ticket-image for each ticket ─▶ framed ticket in chat
Ticket QR = https://costars-guide.vercel.app/t/<code>
  • guest scans it ─▶ ticket page
  • door staff scan it in /admin ─▶ checked in (a second scan says "Already used")
  • staff with only a phone camera ─▶ ticket page ─▶ "Check in with Telegram" ─▶ bot checks in
```

Files:

- `public/ticketing/config.js`: **`API_URL`** = the bot's web app address (Apps Script →
  Deploy → Manage deployments, ends with `/exec`) and the bot's username.
- `public/ticketing/ticket-svg.js`: the ticket artwork (shared by the ticket page and the PNG).
- `public/ticketing/buy.js`, `ticket-page.js`, `admin.js`: the three pages. `app.css`, `admin.css`: their styles.
- `api/ticket-image.js` + `api/_fonts/`: draws the PNG with resvg (`@resvg/resvg-js`).
- `api/khqr.js`: the ticket KHQR as a picture for the form (from the bot's `?action=khqr`, the photo set with `/setkhqr ticket`). Cached by Vercel for 5 minutes.

Security: nothing secret is in the website. Orders and check-ins only work from pages
opened inside Telegram (Telegram signs every request and the bot checks the Staff tab).
Ticket codes carry the bot's signature, so ticket pages cannot be guessed.

Connecting the bot: in the bot's Google Sheet run **CoStars Bot → 4. Connect the website**
and paste `https://costars-guide.vercel.app`. Type `OFF` there to go back to buying in the
chat with plain QR codes.

Testing on your computer: `npm run dev`, then open
`http://localhost:5173/buy.html?api=<a test bot /exec address>` (the `api` override only
works on localhost).

---

## 6c. Staff check-in page: `/staff` (preview)

**https://costars-guide.vercel.app/staff**: the *Event Staff Login* screen from the
*Ticket and Staff Check-In* mockup, for door staff using an ordinary phone browser (no
Telegram needed). It isn't linked from the guide and is kept out of search results. React,
like the guide: `staff.html` + `staff/`. It does not change the guide or the ticket pages.

Flow at the door:

1. **Log in** with Staff ID + password. The login stays on that phone for 18 hours or until *Log out*.
2. **Scan** the ticket QR with the phone camera, or type the code if the QR won't scan. A QR
   holding a link (like `…/t/<code>`) works too: the code is taken from the link.
3. **See the result over the camera view:**
   - ✅ *Checked in*: holder, ticket type, code. Scanning resumes by itself after about 2.5 s.
   - ⚠️ *Already checked in*: the time and the staff member who checked it in.
   - ❌ *Ticket not found*, or *Ticket not valid* (cancelled / refunded).
   - *Not sent*, if there's no connection, with a *Try again* button.
4. **Undo** your own check-in for up to 15 minutes, from the result or *Recent scans on this phone*.
5. A live counter shows *Checked in X of Y* across all doors.

**Status: preview mode.** Not connected to the ticket database yet. It runs with four sample
tickets inside the browser (Staff ID `DEMO`, password `costars-demo`) and sends or saves
nothing. To connect it, set `CHECKIN_API_URL` in `staff/config.js` (or the Vercel variable
`VITE_CHECKIN_API_URL`). The page expects these actions, all as POST with a text/plain JSON body:

| Action | Sends | Gets back |
| --- | --- | --- |
| `login` | `staffId`, `password` | `token`, `staff {id, name}`, `expiresAt`, `stats {total, checkedIn}` |
| `checkin` | `token`, `code` (the scanned text) | `result` (`checked_in` / `already_checked_in` / `not_found` / `not_valid`), `ticket {code, holder, type, order, status, checkedInAt, checkedInBy}`, `stats` |
| `undo` | `token`, `code` | `result: "undone"`, `stats` |
| `stats` | `token` | `staff`, `stats` |

Errors come back as `{ ok: false, error }` with `missing`, `invalid`, `locked` (+ `minutes`),
`unauthorized`, `busy` or `undo_not_allowed`.

Camera: the phone's built-in QR reader where there is one (Android Chrome). Otherwise, e.g. on
iPhone, the `jsqr` package (Apache-2.0), which is downloaded only on those phones.

---

## 7. Quality notes

- **Mobile-first:** checked at 320, 375, 390, 768 and 1280 px wide with no horizontal scrolling.
- **Accessibility:** semantic headings, buttons with `aria-expanded`, keyboard support,
  visible focus rings, skip link, alt text, AA colour contrast, `prefers-reduced-motion` honoured.
- **Performance:** no heavy libraries. Stage artwork is CSS (no image download), photos
  are WebP and lazy-loaded below the fold, built JS/CSS is cached long-term (`vercel.json`).
- **Motion:** accordion height/fade, staged hero entrance, gentle section reveals, hover
  lifts. All are switched off when the device asks for reduced motion.

## Design tokens

| Token | Value | Use |
| --- | --- | --- |
| White | `#ffffff` | — |
| Cream | `#fcf9f2` / `#f5f4ef` | App surface / page background |
| Paper | `#fffefa` | Cards |
| Charcoal | `#342d2d` | Text, primary buttons, open accordion header |
| Dark red | `#810102` | Brand accent, action buttons, icons |
| Amber | `#d69a3c` | Break / intermission dots |
| Logo & headings | Poppins ExtraBold 800 | CoStars logo, page and banner titles, big numbers |
| Section titles | Poppins SemiBold 600 | Section headings, card and list item titles |
| Body text | Cabin Regular 400 | Descriptions, times, notes, details |
| Buttons & labels | Cabin Medium 500 | Buttons, chips, quick links, tags, small caps labels |

The four weights are set once at the top of `src/styles.css` (`--fw-heading`, `--fw-title`,
`--fw-body`, `--fw-label`), and only these weights are loaded from Google Fonts (`index.html`).
