# Launch checklist: content still needed and facts to confirm

Everything below is edited in **`src/data.js`** unless noted. Search that file for
`TODO` (missing) and `CHECK` (needs confirming).

Sources: **P1–P6** = slides of *Official CoStars.pdf* · **UI1** = *CoStars Event Guide UI Kit.png* ·
**UI2** = *CoStars Charity Concert UI 2.png*

---

## A. Missing: supply before launch

Items marked *hidden* do not appear on the live site until filled in, so the guide works
without them.

| # | What | Where in `src/data.js` | Live site until supplied |
|---|------|------------------------|--------------------------|
| 1 | **Host / emcee name** | `agenda` → `welcome` → `host.name` | hidden |
| 2 | **Performer biographies** (all 10 programme entries) | `agenda` → `act-1/2/3` → `programme[].bio` | hidden |
| 3 | **Performer photos** | `programme[].photos` | numbered badge shown instead |
| 4 | **Act photos** (one per act) | `act-1/2/3` → `image`, `imageAlt` | stage artwork shown |
| 5 | **Act galleries** (optional) | `act-1/2/3` → `gallery` | hidden |
| 6 | **Act I durations** for Peacock Dance and JunPor Dance (blank in P4) | `act-1` → `programme[].durationMin` | hidden |
| 7 | **Act II pieces / repertoire** (“Score” column blank in P4) | `act-2` → `programme[].piece` | hidden |
| 8 | **Sponsors & partners** (names, logos, links) | `sponsors.list` | whole section hidden |
| 9 | **Official help contact** (phone and/or Telegram link) | `help.phone`, `help.telegram` | generic “ask a team member” text only |
| 10 | **Welcome banner photo** (optional) | `welcome.image` | stage artwork + silhouette |
| 11 | **Production URL** for the QR code | Vercel (see README §6) | — |

## B. Contradictions and unclear items: please confirm

| # | Issue | What the guide shows now |
|---|-------|--------------------------|
| 1 | **Act III over-runs its slot.** Act III is 7:25–8:15 PM (50 min, P2), but its two sets total 60 min (35 + 25, P4). | Slot times from P2 and set lengths from P4, both as given. Adjust either. |
| 2 | **Act II name.** P2 calls it “Classical Music Performance”; P4 and UI2 call it “Classical Music Showcase”. | “Classical Music Showcase” |
| 3 | **Act III header in P4** repeats “Classical Music Showcase”, which looks like a copy error. P2 and UI2 say “Tribute Music Performance”. | “Tribute Music Performance” |
| 4 | **“Tribute to Whitney Hudson and Mariah Carey”** (P4). Almost certainly *Whitney Houston*. | “Whitney **Houston**” (corrected; please confirm) |
| 5 | **“Donna, Dmitry, Dylan”** lists 3 names but 4 roles (Singer + Pianist + Guitarist + Drummer). Who plays what, and is there a fourth member? | Names and roles exactly as in P4 |
| 6 | **Row 11 in P4 is empty.** Is an 11th performer expected? | Not shown |
| 7 | **“JunPor Dance”** spelling (P4). | As written |
| 8 | **“Tribute to Sade and other song”** (P4). | “…and other song**s**” (grammar fix) |
| 9 | **Event hours.** P2 says “5:00 PM – 8:30 PM”, while the running order runs 4:30 PM (arrival) to 8:25 PM. | The running order only |
| 10 | **Design mock-up times differ from the proposal.** UI1 shows 4:00–7:20 PM; UI2 shows Khmer dance 5:55–6:10 PM (15 min). | Proposal times (P2). The mock-ups are treated as placeholder content. |
| 11 | **Pairs in Act II** (“Song Hui Chan & Oum Pisey — Pianist + Violin”, “Issei Sakano & Ai Iwasaki — Pianist + Vocalist”): the order suggests who plays what, but P4 doesn't say. | As written in P4 |

## C. Wording to approve

This copy is not a factual claim from the proposal. It came from the designs or was written
to fit the layout:

- Act descriptions for Acts I–III: taken from **UI2**.
- “Opening by Event Host” and the welcome description and note: taken from **UI1**.
- Arrival, break and closing descriptions: written from P1/P2/P3 facts.
- Act sub-lines (“Six sets for piano, violin & voice”, “Two live tribute sets: singers & band”)
  and the performer intros: summarised from P4.
- **Event etiquette rules** (`etiquette.items`): only the phone reminder is in UI1. Confirm
  the photo, aisle and re-entry rules match the venue's actual policy.
- **Need help text** (`help.text`): confirm the team will be identifiable on the night.

Design copy **not used** because it isn't supported by the proposal:

- UI2 performer bios. They mention e.g. “Royal Conservatory”, which appears nowhere in
  the materials.
- UI2 charity pillars (“Fund Community Projects & Social Welfare”). This contradicts
  “100% … school supplies” (P1). The guide uses the proposal's three post-event steps (P3).
- UI1 “Venue & Visitor Info” card and “Venue” shortcut. Excluded per the brief, and UI2
  also replaces Venue.

## D. Permissions

- **Photos of children** (L’aang Primary School, P5): confirm the school has consented
  to them being published on a public website.
- **Performer photos and names:** confirm each performer is happy to be listed and pictured.

## E. Go-live steps

1. Fill in section A and resolve section B in `src/data.js`.
2. Run `npm run dev` and check that no yellow “To supply” labels remain for anything you
   expected to fill in.
3. Push to GitHub. Vercel deploys automatically.
4. Lock the production domain, then generate and test the **static** QR code (README §6).
5. On the day: open the guide once on a venue phone and check the **Now** badge moves
   along the schedule.
