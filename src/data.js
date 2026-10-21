/* =============================================================================
 * CoStars Event Guide: CONTENT FILE
 * -----------------------------------------------------------------------------
 * All event text, schedule times, performers, photos and sponsors live in this
 * one file. You never need to touch the components to update content.
 *
 * HOW TO EDIT (no coding experience needed)
 *  • Change the words between the quotes '…'. Keep the quotes and the commas.
 *  • If a sentence contains an apostrophe, use the curly one (’) as below,
 *    or the text will break.
 *  • Leave a field as '' (empty) or [] (empty list) if you don't have it yet.
 *    Empty optional content is HIDDEN on the live site automatically. In local
 *    development (npm run dev) a dashed "To supply" label shows instead, so
 *    you can see what's missing.
 *  • Photos: put the image file in  public/images/…  and write its path
 *    starting with  /images/…  (for example '/images/acts/khmer-dance.webp').
 *  • Reorder the schedule by moving whole { … } blocks up or down in `agenda`.
 *
 * SOURCES (so every fact can be traced)
 *  [P1]…[P6] = slides 1–6 of “Official CoStars.pdf” (the proposal)
 *  [UI1]     = “CoStars Event Guide UI Kit.png”   (design reference)
 *  [UI2]     = “CoStars Charity Concert UI 2.png” (design reference)
 *  TODO      = not in the materials yet; must be supplied/confirmed before launch
 *  CHECK     = in the materials, but contradictory or unclear; see CONTENT-CHECKLIST.md
 * ========================================================================== */

/* ----------------------------------------------------------------------------
 * 1. EVENT BASICS
 * ------------------------------------------------------------------------- */
export const event = {
  name: 'CoStars Charity Mini Concert', // [P1][UI1]
  brand: 'CoStars',
  edition: 'Charity Mini Concert', // short form used above the welcome title
  guideLabel: 'Event Guide', // [UI1][UI2]
  date: '2026-12-05', // [P2] “Event Day: 05 December 2026”. Used for the live “Now” badge
  dateLabel: '5 December 2026', // [P2]
  utcOffset: '+07:00', // Cambodia time (Asia/Phnom_Penh). Used for the live “Now” badge
  organizer: 'A student-led project by students of the National University of Management (NUM)', // [P1]
  tagline: 'Music brings us together. Generosity keeps the future brighter.', // [UI1][UI2]
  quote: 'Art unites us. Compassion empowers tomorrow.', // [UI2]
}

/* ----------------------------------------------------------------------------
 * 2. WELCOME (top of the home screen)
 * ------------------------------------------------------------------------- */
export const welcome = {
  title: 'Welcome to CoStars', // [UI1][UI2]
  message:
    'We’re glad you’re here! Together we create an evening of art, culture and compassion. Thank you for being part of this special event.', // [UI2]
  // Optional real photo for the welcome banner. If empty, the branded stage
  // artwork (curtain + musicians silhouette from the proposal [P1]) is shown.
  image: '', // TODO (optional): e.g. '/images/welcome.webp' (landscape, ≥ 1200 px wide)
  imageAlt: '',
}

/* ----------------------------------------------------------------------------
 * 3. SCHEDULE / AGENDA  ([P2] Event Overview + [P4] performer table)
 *
 *  id          stable identifier used in links (don't change it once the QR is printed)
 *  type        'act' | 'ceremony' | 'break' (controls the dot colour + icon)
 *  start/end   24-hour clock, Cambodia time
 *  icon        one of: door, mic, crown, piano, mic-vocal, coffee, heart-handshake
 *  tone        artwork colour for acts: 'gold' | 'crimson' | 'violet'
 *  image       optional real photo (replaces the stage artwork)
 *  gallery     optional list of extra photos: { src, alt }
 *  programme   performers in running order (same columns as the proposal [P4]):
 *              name, role (“Profession”), piece (“Score”; '' = still to supply,
 *              null = not applicable), durationMin (null = still to supply),
 *              bio (TODO for everyone), photos (list of { src, alt })
 * ------------------------------------------------------------------------- */
export const agenda = [
  {
    id: 'arrival',
    type: 'ceremony',
    icon: 'door',
    title: 'Guest Arrival & Seating', // [P2]
    start: '16:30', // [P2] 4:30–5:00 PM, 30'
    end: '17:00',
    subtitle: 'Doors open',
    description:
      'Show your e-ticket at check-in, collect your wristband and take your seat before the show begins.', // based on [P3] “During event” flow
    note: 'Scan the QR code on your wristband any time to come back to this guide.', // [P3]
  },
  {
    id: 'welcome',
    type: 'ceremony',
    icon: 'mic',
    title: 'Opening & Welcome Remarks', // [P2]
    start: '17:00', // [P2] 5:00–5:10 PM, 10'
    end: '17:10',
    subtitle: 'Opening by Event Host', // [UI1]
    description:
      'A short welcome from our host, followed by an introduction to the CoStars Charity Mini Concert.', // [UI1]
    note: 'Please turn off your mobile phones during the performance.', // [UI1]
    host: { name: '', role: 'Event Host' }, // TODO: host / emcee name (not in the materials)
  },
  {
    id: 'act-1',
    type: 'act',
    act: 'Act I', // [P2]
    title: 'Khmer Traditional Dance', // [P2][P4][UI2]
    filterLabel: 'Dance',
    icon: 'crown',
    tone: 'gold',
    start: '17:10', // [P2] 5:10–5:55 PM, 45'
    end: '17:55',
    subtitle: 'Princess Buppha Devi Dance School', // [P4]
    description:
      'Experience the grace and heritage of Cambodia through a captivating performance of traditional Khmer dance, showcasing centuries of culture, artistry and timeless beauty.', // [UI2]: approve wording
    performersIntro:
      'Act I features two dances performed by the Princess Buppha Devi Dance School: the Peacock Dance and the JunPor Dance.', // from [P4]
    image: '', // TODO: performance photo
    imageAlt: '',
    gallery: [], // TODO (optional): extra photos
    programme: [
      // [P4] rows 1–2. Durations are blank in the proposal (TODO)
      // piece: null = not applicable (the dance itself is the piece)
      { id: 'peacock-dance', name: 'Peacock Dance', role: 'Princess Buppha Devi Dance School', piece: null, durationMin: null, bio: '', photos: [] },
      { id: 'junpor-dance', name: 'JunPor Dance', role: 'Princess Buppha Devi Dance School', piece: null, durationMin: null, bio: '', photos: [] }, // CHECK spelling (“JunPor”)
    ],
  },
  {
    id: 'break-1',
    type: 'break',
    icon: 'coffee',
    title: 'Break / Refreshments', // [P2]
    start: '17:55', // [P2] 5:55–6:10 PM, 15'
    end: '18:10',
    subtitle: 'Intermission',
    description: 'Take a short pause, stretch and enjoy a refreshment. Please be back in your seat for Act II.',
    note: '',
  },
  {
    id: 'act-2',
    type: 'act',
    act: 'Act II', // [P2]
    title: 'Classical Music Showcase', // [P4][UI2] (the [P2] table calls it “Classical Music Performance”)
    filterLabel: 'Classical',
    icon: 'piano',
    tone: 'crimson',
    start: '18:10', // [P2] 6:10–7:10 PM, 60'
    end: '19:10',
    subtitle: 'Six sets for piano, violin & voice', // from [P4]
    description:
      'Enjoy an elegant evening of timeless classical masterpieces, performed by talented musicians who bring emotion, harmony and inspiration through the power of music.', // [UI2]: approve wording
    performersIntro:
      'Act II brings together pianists, a violinist and a vocalist across six sets.', // from [P4]
    image: '', // TODO: performance photo
    imageAlt: '',
    gallery: [],
    programme: [
      // [P4] rows 3–8. “Score” (piece titles) is blank in the proposal (TODO)
      { id: 'song-hui-chan', name: 'Song Hui Chan', role: 'Pianist', piece: '', durationMin: 8, bio: '', photos: [] },
      { id: 'mayumi-hamamoto', name: 'Mayumi Hamamoto', role: 'Pianist', piece: '', durationMin: 5, bio: '', photos: [] },
      { id: 'misato-kozuma-nakaishi', name: 'Misato Kozuma Nakaishi', role: 'Pianist', piece: '', durationMin: 8, bio: '', photos: [] },
      { id: 'meas-sovan', name: 'Meas Sovan', role: 'Pianist', piece: '', durationMin: 8, bio: '', photos: [] },
      { id: 'song-hui-chan-oum-pisey', name: 'Song Hui Chan & Oum Pisey', role: 'Pianist + Violin', piece: '', durationMin: 5, bio: '', photos: [] },
      { id: 'issei-sakano-ai-iwasaki', name: 'Issei Sakano & Ai Iwasaki', role: 'Pianist + Vocalist', piece: '', durationMin: 10, bio: '', photos: [] },
    ],
  },
  {
    id: 'break-2',
    type: 'break',
    icon: 'coffee',
    title: 'Break / Refreshments', // [P2]
    start: '19:10', // [P2] 7:10–7:25 PM, 15'
    end: '19:25',
    subtitle: 'Intermission',
    description: 'Take a short pause, stretch and enjoy a refreshment. Please be back in your seat for Act III.',
    note: '',
  },
  {
    id: 'act-3',
    type: 'act',
    act: 'Act III', // [P2]
    title: 'Tribute Music Performance', // [P2][UI2] (the [P4] table header repeats “Classical Music Showcase”: CHECK)
    filterLabel: 'Tribute',
    icon: 'mic-vocal',
    tone: 'violet',
    start: '19:25', // [P2] 7:25–8:15 PM, 50'
    end: '20:15',
    subtitle: 'Two live tribute sets: singers & band', // from [P4]
    description:
      'Relive the greatest hits of iconic artists in a heartfelt tribute performance, featuring a live band and vocalists who bring the music to life.', // [UI2]: approve wording
    performersIntro:
      'Two tribute sets close the music of the evening: Mirasol Aguila and her band, followed by Donna, Dmitry and Dylan.', // from [P4]
    image: '', // TODO: performance photo
    imageAlt: '',
    gallery: [],
    programme: [
      // [P4] rows 9–10. CHECK: 35 + 25 = 60 min of sets in a 50-min slot
      {
        id: 'mirasol-aguila',
        name: 'Mirasol Aguila and her band',
        role: 'Singer + Band',
        piece: 'Tribute to Whitney Houston and Mariah Carey', // CHECK: the proposal reads “Whitney Hudson”
        durationMin: 35,
        bio: '',
        photos: [],
      },
      {
        id: 'donna-dmitry-dylan',
        name: 'Donna, Dmitry, Dylan',
        role: 'Singer + Pianist + Guitarist + Drummer', // CHECK: three names, four roles
        piece: 'Tribute to Sade and other songs', // [P4] “Tribute to Sade and other song”
        durationMin: 25,
        bio: '',
        photos: [],
      },
    ],
  },
  {
    id: 'closing',
    type: 'ceremony',
    icon: 'heart-handshake',
    title: 'Closing Remarks & Thank You', // [P2]
    start: '20:15', // [P2] 8:15–8:25 PM, 10'
    end: '20:25',
    subtitle: 'Thank you for joining us',
    description:
      'We close the evening with thanks to every performer and guest. 100% of the profits go to school supplies and a better learning environment for the children of L’aang Primary School.', // from [P1]
    note: '',
  },
]

/* ----------------------------------------------------------------------------
 * 4. CHARITY ([P1] About Us, [P3] Event Flow, [P5][P6] Beneficiary)
 * ------------------------------------------------------------------------- */
export const charity = {
  title: 'Charity Impact', // [UI1][UI2]
  tagline: 'Together, we make a difference.', // [UI2]
  rowSubtitle: 'School supplies for rural children: small gifts, big dreams.', // [UI1]
  heroImage: { src: '/images/charity/school-gate-640.webp', alt: 'Students and teachers of L’aang Primary School standing beneath the school gate' }, // [P5]

  // The three steps of where the money goes: [P3] “Post-event”
  steps: [
    { icon: 'hand-heart', title: '100% to charity', text: 'All profits from the event go into donation' },
    { icon: 'backpack', title: 'Buy school kits', text: 'Funds buy bags, pencils, books and more' },
    { icon: 'school', title: 'Hand them out', text: 'Supplies are donated to L’aang Primary School in Siem Reap' },
  ],

  feature: {
    title: 'Education Changes Lives', // [UI2]
    text: '100% of the profits will be used to provide school supplies and support a better learning environment for children at L’aang Primary School in Siem Reap.', // [P1]
    image: { src: '/images/charity/school-students-640.webp', alt: 'Students of L’aang Primary School lined up in front of their wooden school building' }, // [P5]
    cta: 'Learn More', // [UI2]
  },

  beneficiary: {
    name: 'L’aang Primary School', // [P5]
    location: 'Khvaav Village, Khvaav Commune, Chi Kreng District, Siem Reap Province', // [P5]
    facts: [
      { label: 'Students', value: '54', detail: '25 female' }, // [P5]
      { label: 'Teachers', value: '6', detail: '2 female' }, // [P5]
      { label: 'Buildings', value: '2', detail: '1 wooden, 1 concrete under construction' }, // [P5]
    ],
    water: 'One concrete well (non-potable water / unusable water)', // [P5]
    needsTitle: 'What the school needs', // [P6] “In Needs”
    needs: [
      // [P6], verbatim
      'Solar Power System to support water pumping and provide lighting.',
      'One old wooden school building has not been finished. The roof has severe leaks, causing rainwater to enter the classrooms and leaving students wet during rainy weather.',
      'The school does not have enough desks and chairs to support students during lessons.',
      'No proper fence around its grounds.',
      'The school has no library or reading corner where students can access books and develop their reading skills.',
      'The school does not have proper toilets that meet basic standards for students.',
      'Many students lack basic learning materials, school uniforms, backpacks, and raincoats needed for their daily education.',
    ],
    sourceNote: 'Based on the official document provided by the beneficiary school.', // [P6]
    // CHECK: confirm the school has agreed to these photos of children being published online.
    photos: [
      { src: '/images/charity/school-gate-640.webp', thumb: '/images/charity/school-gate-320.webp', alt: 'Students and teachers gathered at the school gate' },
      { src: '/images/charity/school-students-640.webp', thumb: '/images/charity/school-students-320.webp', alt: 'Students lined up in front of the wooden school building' },
      { src: '/images/charity/classroom-desks-600.webp', thumb: '/images/charity/classroom-desks-320.webp', alt: 'Students writing at worn wooden desks in a classroom' },
      { src: '/images/charity/classroom-backpacks-600.webp', thumb: '/images/charity/classroom-backpacks-320.webp', alt: 'Two young students with their backpacks in the classroom' },
    ],
  },

  about: {
    title: 'About CoStars',
    text: 'CoStars is a student-led project organized by students from the National University of Management (NUM). We aim to bring people together through music and culture while supporting a meaningful cause.', // [P1]
    vision: 'To bring people together through music and culture, while creating opportunities to support children in need and help them have better access to education.', // [P1]
    mission: 'To bring people together through Khmer traditional dance, classical music, and live acoustic performances. Our goal is to share the love of music, support local talent, and provide essential school supplies to children at L’aang Primary School in Siem Reap.', // [P1]
  },
}

/* ----------------------------------------------------------------------------
 * 5. EVENT ETIQUETTE: TODO: organizers to confirm these house rules
 *    (only the phone reminder appears in the design [UI1]).
 * ------------------------------------------------------------------------- */
export const etiquette = {
  title: 'Event Etiquette', // [UI1]
  subtitle: 'Help us create a respectful and enjoyable experience for everyone.', // [UI1]
  items: [
    'Please turn off or silence your mobile phone during the performances.', // [UI1]
    'Keep aisles and walkways clear at all times.',
    'If you need to step out, please wait for a pause between pieces.',
    'Photos are welcome, but please keep your screen low and never block another guest’s view.',
  ],
}

/* ----------------------------------------------------------------------------
 * 6. SPONSORS & PARTNERS: TODO: none listed in the materials yet.
 *    The “Our Sponsors” section stays hidden until at least one is added.
 *    Example: { name: 'Company Name', logo: '/images/sponsors/company.svg', url: 'https://…' }
 * ------------------------------------------------------------------------- */
export const sponsors = {
  title: 'Our Sponsors', // [UI1]
  subtitle: 'With thanks to our generous partners.', // [UI1]
  list: [],
}

/* ----------------------------------------------------------------------------
 * 7. NEED HELP? TODO: add an official contact. Empty fields are hidden.
 * ------------------------------------------------------------------------- */
export const help = {
  title: 'Need Help?', // [UI1]
  subtitle: 'Contact our event team for assistance.', // [UI1]
  text: 'Our CoStars team is at the venue throughout the evening. Please ask any team member if you need help.',
  phone: '', // TODO: e.g. '+855 12 345 678'
  telegram: '', // TODO: e.g. 'https://t.me/your_bot_or_group' (the proposal mentions a Telegram bot [P3])
}

/* ----------------------------------------------------------------------------
 * 8. FOOTER VALUES [UI2]
 * ------------------------------------------------------------------------- */
export const values = [
  { icon: 'music', label: 'Music' },
  { icon: 'culture', label: 'Culture' },
  { icon: 'community', label: 'Community' },
  { icon: 'charity', label: 'Charity' },
]
