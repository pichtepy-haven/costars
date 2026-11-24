/* =============================================================================
 * CoStars Event Guide: BUILT-IN CONTENT
 * -----------------------------------------------------------------------------
 * Everything the guide shows, in English and Khmer. The live text comes from
 * the Google Sheet “CoStars Event Guide - Live Content” (see
 * src/lib/sheetContent.js); this file is the fallback the guide shows until
 * the Sheet loads, or if it can't be reached.
 *
 *  • Khmer text sits next to the English one in a field ending in “_km”.
 *    An empty Khmer field shows the English text instead.
 *  • Empty optional fields are hidden on the site (quotes, years, setlists,
 *    piece titles, help desk, phone…). Fill them in the Sheet to show them.
 *  • Photos live in public/images/… and are written as '/images/…'.
 * ========================================================================== */

/* ----------------------------------------------------------------------------
 * 1. EVENT
 * ------------------------------------------------------------------------- */
export const event = {
  name: 'CoStars Musical Charity Concert',
  name_km: 'ការប្រគុំតន្ត្រីសប្បុរសធម៌ CoStars',
  brand: 'CoStars',
  edition: 'Musical Charity Concert',
  edition_km: 'ការប្រគុំតន្ត្រីសប្បុរសធម៌',
  guideLabel: 'Event Guide',
  date: '2026-12-05', // the live “Now” states and the countdown use this
  dateLabel: '5 December 2026',
  utcOffset: '+07:00', // Cambodia time
  venue: 'Sabay Cinema, AEON Mall Mean Chey',
  venue_km: 'រោងភាពយន្ត Sabay ផ្សារទំនើបអ៊ីអន មានជ័យ',
  hall: 'ScreenX Hall',
  hall_km: 'សាល ScreenX',
  footerText: 'A youth-led student organization from the Faculty of Digital Economy, National University of Management (NUM).',
  footerText_km: 'អង្គការនិស្សិតដឹកនាំដោយយុវជន មកពីមហាវិទ្យាល័យសេដ្ឋកិច្ចឌីជីថល នៃសាកលវិទ្យាល័យជាតិគ្រប់គ្រង (NUM)។',
  // Older fields, still read from the Sheet (not shown in this design)
  organizer: 'A student-led project by students of the National University of Management (NUM)',
  tagline: 'Music brings us together. Generosity keeps the future brighter.',
  quote: 'Art unites us. Compassion empowers tomorrow.',
}

/** Footer links. Empty ones are hidden. */
export const socials = {
  facebook: 'https://www.facebook.com/profile.php?id=61594568200304',
  instagram: '',
  tiktok: '',
  email: '',
}

/* ----------------------------------------------------------------------------
 * 2. WELCOME
 * ------------------------------------------------------------------------- */
export const welcome = {
  title: 'Welcome to CoStars',
  title_km: 'សូមស្វាគមន៍មកកាន់ CoStars',
  message:
    'We’re glad you’re here! Together we create an evening of art, culture and compassion. Thank you for being part of this special event.',
  message_km: 'យើងរីករាយដែលអ្នកបានមកដល់! រួមគ្នា យើងបង្កើតរាត្រីមួយនៃសិល្បៈ វប្បធម៌ និងក្តីមេត្តា។ សូមអរគុណដែលបានចូលរួមក្នុងកម្មវិធីពិសេសនេះ។',
  image: '',
  imageAlt: '',
}

/* ----------------------------------------------------------------------------
 * 3. RUNNING ORDER
 *  id         stable identifier used in links (act-1, act-2, act-3 …)
 *  type       'act' | 'ceremony' | 'break'
 *  start/end  24-hour clock, Cambodia time
 *  tone       acts only: 'gold' | 'crimson' | 'champagne'
 *  summary    one line on the act card of the home page
 *  programme  sets in running order: name, role, piece (title of the music,
 *             hidden while empty), durationMin, setlist (songs), with
 * ------------------------------------------------------------------------- */
export const agenda = [
  {
    id: 'arrival',
    type: 'ceremony',
    icon: 'door',
    title: 'Guest Arrival & Seating',
    title_km: 'ភ្ញៀវមកដល់ និងអង្គុយ',
    start: '16:30',
    end: '17:00',
    subtitle: 'Doors open',
    subtitle_km: 'ទ្វារបើក',
    description:
      'Doors open at 4:30 PM at ScreenX Hall, Sabay Cinema, AEON Mall Mean Chey. Have your ticket QR code ready to scan at the entrance, then find your seat.',
    description_km: 'ទ្វារបើកនៅម៉ោង 4:30 ល្ងាច នៅសាល ScreenX រោងភាពយន្ត Sabay ផ្សារទំនើបអ៊ីអន មានជ័យ។ សូមរៀបចំកូដ QR នៃសំបុត្ររបស់អ្នក ដើម្បីស្កេននៅច្រកចូល រួចស្វែងរកកៅអីរបស់អ្នក។',
    note: 'Your ticket is in your Telegram chat with @CoStarsConcertBot.',
    note_km: 'សំបុត្ររបស់អ្នកមាននៅក្នុងការជជែក Telegram ជាមួយ @CoStarsConcertBot។',
    noteIcon: 'ticket',
  },
  {
    id: 'welcome',
    type: 'ceremony',
    icon: 'mic',
    title: 'Opening & Welcome Remarks',
    title_km: 'ពិធីបើក និងសុន្ទរកថាស្វាគមន៍',
    start: '17:00',
    end: '17:10',
    subtitle: 'Opening by Event Host',
    subtitle_km: 'បើកដោយពិធីករ',
    description: 'A short welcome from our host, followed by an introduction to the CoStars Musical Charity Concert.',
    description_km: 'ការស្វាគមន៍ខ្លីពីពិធីករ បន្តដោយការណែនាំអំពីការប្រគុំតន្ត្រីសប្បុរសធម៌ CoStars។',
    note: 'Please silence your mobile phones during the performance.',
    note_km: 'សូមបិទសំឡេងទូរស័ព្ទដៃរបស់អ្នក ក្នុងអំឡុងពេលសម្តែង។',
    noteIcon: 'info',
    host: { name: '', role: 'Event Host' },
  },
  {
    id: 'act-1',
    type: 'act',
    act: 'Act I',
    title: 'Khmer Traditional Dance',
    title_km: 'របាំប្រពៃណីខ្មែរ',
    icon: 'crown',
    tone: 'gold',
    start: '17:10',
    end: '17:55',
    subtitle: 'Princess Buppha Devi Dance School',
    subtitle_km: 'សាលារបាំ សម្តេចរាជបុត្រី នរោត្តម បុប្ផាទេវី',
    summary: 'Peacock Dance and JunPor Dance by the Princess Buppha Devi Dance School',
    summary_km: 'របាំក្ងោកប៉ៃលិន និងរបាំជូនពរ ដោយសាលារបាំ សម្តេចរាជបុត្រី នរោត្តម បុប្ផាទេវី',
    description:
      'Experience the grace and heritage of Cambodia through a captivating performance of traditional Khmer dance, showcasing centuries of culture, artistry and timeless beauty.',
    description_km: 'សូមទស្សនាភាពទន់ភ្លន់ និងបេតិកភណ្ឌរបស់កម្ពុជា តាមរយៈការសម្តែងរបាំប្រពៃណីខ្មែរដ៏ទាក់ទាញ ដែលបង្ហាញពីវប្បធម៌ សិល្បៈ និងសម្រស់អមតៈរាប់សតវត្សរ៍។',
    performersIntro:
      'Act I features two dances performed by the Princess Buppha Devi Dance School: the Peacock Dance and the JunPor Dance.',
    performersIntro_km: 'វគ្គទី 1 មានរបាំពីរ សម្តែងដោយសាលារបាំ សម្តេចរាជបុត្រី នរោត្តម បុប្ផាទេវី៖ របាំក្ងោកប៉ៃលិន និងរបាំជូនពរ។',
    lineupTitle: 'One folk, one royal',
    lineupTitle_km: 'មួយប្រជាប្រិយ មួយរាជវាំង',
    image: '/images/acts/peacock-dance.jpg',
    imageAlt: 'A dancer in a green and gold peacock costume spreads painted wings on a stage, with musicians behind her',
    imagePosition: '47% 30%',
    gallery: [],
    programme: [
      { id: 'peacock-dance', name: 'Peacock Dance', name_km: 'របាំក្ងោកប៉ៃលិន', role: 'Princess Buppha Devi Dance School', role_km: 'សាលារបាំ សម្តេចរាជបុត្រី នរោត្តម បុប្ផាទេវី', piece: '', durationMin: null, setlist: [], with: '', photos: [] },
      { id: 'junpor-dance', name: 'JunPor Dance', name_km: 'របាំជូនពរ', role: 'Princess Buppha Devi Dance School', role_km: 'សាលារបាំ សម្តេចរាជបុត្រី នរោត្តម បុប្ផាទេវី', piece: '', durationMin: null, setlist: [], with: '', photos: [] },
    ],
  },
  {
    id: 'break-1',
    type: 'break',
    icon: 'coffee',
    title: 'Break / Refreshments',
    title_km: 'សម្រាក / អាហារសម្រន់',
    start: '17:55',
    end: '18:10',
    subtitle: 'Intermission',
    subtitle_km: 'ពេលសម្រាក',
    description: '',
    note: '',
  },
  {
    id: 'act-2',
    type: 'act',
    act: 'Act II',
    title: 'Classical Music Showcase',
    title_km: 'ការសម្តែងតន្ត្រីក្លាស៊ិក',
    icon: 'piano',
    tone: 'crimson',
    start: '18:10',
    end: '19:10',
    subtitle: 'Six sets for piano, violin & voice',
    subtitle_km: 'ប្រាំមួយឈុត សម្រាប់ព្យ៉ាណូ វីយូឡុង និងសំឡេងច្រៀង',
    summary: 'Six sets for piano, violin & voice',
    summary_km: 'ប្រាំមួយឈុត សម្រាប់ព្យ៉ាណូ វីយូឡុង និងសំឡេងច្រៀង',
    description:
      'Enjoy an elegant evening of timeless classical masterpieces, performed by talented musicians who bring emotion, harmony and inspiration through the power of music.',
    description_km: 'សូមរីករាយជាមួយរាត្រីដ៏ប្រណីតនៃស្នាដៃតន្ត្រីក្លាស៊ិកអមតៈ សម្តែងដោយតន្ត្រីករដែលមានទេពកោសល្យ ដែលនាំមកនូវអារម្មណ៍ ភាពសុខដុម និងការបំផុសគំនិត តាមរយៈថាមពលនៃតន្ត្រី។',
    performersIntro: 'Act II brings together pianists, a violinist and a vocalist across six sets.',
    performersIntro_km: 'វគ្គទី 2 នាំមកនូវអ្នកលេងព្យ៉ាណូ អ្នកលេងវីយូឡុង និងអ្នកចម្រៀង ក្នុងការសម្តែងប្រាំមួយឈុត។',
    lineupTitle: 'Six sets, one hour',
    lineupTitle_km: 'ប្រាំមួយឈុត ក្នុងមួយម៉ោង',
    artistsTitle: 'Seven musicians',
    artistsTitle_km: 'តន្ត្រីករប្រាំពីរនាក់',
    lineupStyle: 'sets',
    image: '',
    imageAlt: '',
    gallery: [],
    programme: [
      { id: 'song-hui-chan', name: 'Song Hui Chan', role: 'Pianist', role_km: 'អ្នកលេងព្យ៉ាណូ', piece: '', durationMin: 8, setlist: [], with: '', photos: [] },
      { id: 'mayumi-hamamoto', name: 'Mayumi Hamamoto', role: 'Pianist', role_km: 'អ្នកលេងព្យ៉ាណូ', piece: '', durationMin: 5, setlist: [], with: '', photos: [] },
      { id: 'misato-kozuma-nakaishi', name: 'Misato Kozuma Nakaishi', role: 'Pianist', role_km: 'អ្នកលេងព្យ៉ាណូ', piece: '', durationMin: 8, setlist: [], with: '', photos: [] },
      { id: 'meas-sovan', name: 'Meas Sovan', role: 'Pianist', role_km: 'អ្នកលេងព្យ៉ាណូ', piece: '', durationMin: 8, setlist: [], with: '', photos: [] },
      { id: 'song-hui-chan-oum-pisey', name: 'Song Hui Chan & Oum Pisey', name_km: 'Song Hui Chan និង Oum Pisey', role: 'Pianist + Violin', role_km: 'ព្យ៉ាណូ + វីយូឡុង', piece: '', durationMin: 5, setlist: [], with: '', photos: [] },
      { id: 'issei-sakano-ai-iwasaki', name: 'Issei Sakano & Ai Iwasaki', name_km: 'Issei Sakano និង Ai Iwasaki', role: 'Pianist + Vocalist', role_km: 'ព្យ៉ាណូ + អ្នកចម្រៀង', piece: '', durationMin: 10, setlist: [], with: '', photos: [] },
    ],
  },
  {
    id: 'break-2',
    type: 'break',
    icon: 'coffee',
    title: 'Break / Refreshments',
    title_km: 'សម្រាក / អាហារសម្រន់',
    start: '19:10',
    end: '19:25',
    subtitle: 'Intermission',
    subtitle_km: 'ពេលសម្រាក',
    description: '',
    note: '',
  },
  {
    id: 'act-3',
    type: 'act',
    act: 'Act III',
    title: 'Tribute Music Performance',
    title_km: 'តន្ត្រីគោរពតារាល្បីៗ',
    icon: 'mic-vocal',
    tone: 'champagne',
    start: '19:25',
    end: '20:15',
    subtitle: 'Two live tribute sets: singers & band',
    subtitle_km: 'ការសម្តែងផ្ទាល់ពីរឈុត៖ អ្នកចម្រៀង និងក្រុមតន្ត្រី',
    summary: 'Two live tribute sets: singers & band',
    summary_km: 'ការសម្តែងផ្ទាល់ពីរឈុត៖ អ្នកចម្រៀង និងក្រុមតន្ត្រី',
    description:
      'Relive the greatest hits of iconic artists in a heartfelt tribute performance, featuring a live band and vocalists who bring the music to life.',
    description_km: 'រំលឹកបទល្បីៗបំផុតរបស់តារាល្បីៗ ក្នុងការសម្តែងគោរពដ៏ស្មោះស្ម័គ្រ ដោយមានក្រុមតន្ត្រីផ្ទាល់ និងអ្នកចម្រៀងដែលធ្វើឱ្យតន្ត្រីមានជីវិត។',
    performersIntro:
      'Mirasol Aguila and her band open, followed by Donna, Dmitry and Dylan. Jed Bello drums in both sets.',
    performersIntro_km: 'Mirasol Aguila និងក្រុមតន្ត្រីរបស់នាងបើកឆាក បន្តដោយ Donna, Dmitry និង Dylan។ Jed Bello វាយស្គរក្នុងឈុតទាំងពីរ។',
    lineupTitle: 'Two tribute sets',
    lineupTitle_km: 'ការសម្តែងគោរពពីរឈុត',
    artistsTitle: 'The voices & the band',
    artistsTitle_km: 'សំឡេងច្រៀង និងក្រុមតន្ត្រី',
    lineupStyle: 'tribute',
    image: '',
    imageAlt: '',
    gallery: [],
    programme: [
      {
        id: 'mirasol-aguila',
        name: 'Mirasol Aguila and her band',
        role: 'Singer + Band',
        role_km: 'អ្នកចម្រៀង + ក្រុមតន្ត្រី',
        piece: 'Tribute to Whitney Houston and Mariah Carey',
        piece_km: 'គោរពជូន Whitney Houston និង Mariah Carey',
        durationMin: 35,
        setlist: [],
        with: 'Drums: Jed Bello',
        with_km: 'ស្គរ៖ Jed Bello',
        photos: [],
      },
      {
        id: 'donna-dmitry-dylan',
        name: 'Donna, Dmitry, Dylan',
        role: 'Singer + Pianist + Guitarist + Drummer',
        role_km: 'អ្នកចម្រៀង + ព្យ៉ាណូ + ហ្គីតា + ស្គរ',
        piece: 'Tribute to Sade and other songs',
        piece_km: 'គោរពជូន Sade និងបទចម្រៀងផ្សេងទៀត',
        durationMin: 25,
        setlist: [],
        with: 'Drums: Jed Bello',
        with_km: 'ស្គរ៖ Jed Bello',
        photos: [],
      },
    ],
  },
  {
    id: 'closing',
    type: 'ceremony',
    icon: 'heart-handshake',
    title: 'Closing Remarks & Thank You',
    title_km: 'សុន្ទរកថាបិទ និងការថ្លែងអំណរគុណ',
    start: '20:15',
    end: '20:25',
    subtitle: 'Thank you for joining us',
    subtitle_km: 'សូមអរគុណដែលបានចូលរួម',
    description:
      'Closing remarks from the CoStars team and a thank-you to every performer and guest. Every ticket tonight helps the children of L’aang Primary School.',
    description_km: 'សុន្ទរកថាបិទពីក្រុម CoStars និងការថ្លែងអំណរគុណដល់អ្នកសម្តែង និងភ្ញៀវគ្រប់រូប។ សំបុត្រនីមួយៗនៅយប់នេះ ជួយដល់កុមារនៅសាលាបឋមសិក្សាល្អាង។',
    note: 'The evening ends around 8:25 PM. Please take all your belongings with you.',
    note_km: 'កម្មវិធីបញ្ចប់ប្រហែលម៉ោង 8:25 យប់។ សូមយករបស់របររបស់អ្នកទាំងអស់ទៅជាមួយ។',
    noteIcon: 'clock',
  },
]

/* ----------------------------------------------------------------------------
 * 4. ACT I: THE DANCES
 * ------------------------------------------------------------------------- */
export const dances = [
  {
    id: 'peacock',
    actId: 'act-1',
    tone: 'teal',
    name: 'Peacock Dance',
    name_km: 'របាំក្ងោកប៉ៃលិន',
    localName: 'របាំក្ងោកប៉ៃលិន',
    romanized: 'Robam Kngaok Pailin',
    kind: 'Folk',
    kind_km: 'ប្រជាប្រិយ',
    description:
      'A lively folk dance from Pailin in western Cambodia, kept alive by the Kola community. Dancers mimic a peacock and peahen courting, and the peacock stands for happiness.',
    description_km: 'របាំប្រជាប្រិយដ៏រស់រវើកមកពីខេត្តប៉ៃលិន នៅភាគខាងលិចប្រទេសកម្ពុជា ដែលត្រូវបានថែរក្សាដោយសហគមន៍កុឡា។ អ្នករបាំត្រាប់តាមក្ងោកឈ្មោល និងក្ងោកញីកំពុងចែចង់គ្នា ហើយក្ងោកជានិមិត្តរូបនៃសុភមង្គល។',
    image: '/images/acts/peacock-card.jpg',
    imageAlt: 'Pailin Peacock Dance: the peacock dancer spreads wide wings between a villager with a parasol and a drummer',
    imagePosition: '50% 40%',
    credit: 'Pailin Peacock Dance, Phnom Penh, by Marcin Konsek (CC BY-SA 4.0)',
    moments: [
      { title: 'The display', title_km: 'ការលាតស្លាប', text: 'The peacock opens its wings to show off its colours and beauty.', text_km: 'ក្ងោកលាតស្លាប ដើម្បីបង្ហាញពណ៌ និងសម្រស់របស់វា។', image: '/images/acts/moments/peacock-display.jpg', imageAlt: 'The peacock dancer spreads painted wings on stage' },
      { title: 'The villagers', title_km: 'អ្នកភូមិ', text: 'The dance portrays the people of Pailin delighting in a pair of peafowl.', text_km: 'របាំនេះបង្ហាញពីអ្នកស្រុកប៉ៃលិន ដែលរីករាយទស្សនាក្ងោកមួយគូ។', image: '/images/acts/moments/peacock-village.jpg', imageAlt: 'A villager with a yellow parasol stands beside the peacock dancer' },
      { title: 'Happiness', title_km: 'សុភមង្គល', text: 'Musicians keep time as the peacock dances. The peacock is a symbol of happiness.', text_km: 'តន្ត្រីកររក្សាចង្វាក់ ពេលក្ងោករាំ។ ក្ងោកជានិមិត្តរូបនៃសុភមង្គល។', image: '/images/acts/moments/peacock-music.jpg', imageAlt: 'A drummer plays a long drum beside the peacock dancer' },
    ],
  },
  {
    id: 'junpor',
    actId: 'act-1',
    tone: 'gold',
    name: 'JunPor Dance',
    name_km: 'របាំជូនពរ',
    localName: 'របាំជូនពរ',
    romanized: 'The Blessing Dance',
    kind: 'Royal classical',
    kind_km: 'បុរាណរាជវាំង',
    description:
      'A classical dance created by Queen Sisowath Kossamak, performed to welcome guests and wish them happiness and prosperity. Dancers carry golden goblets filled with flower blossoms.',
    description_km: 'របាំបុរាណដែលបង្កើតឡើងដោយសម្តេចព្រះមហាក្សត្រី ស៊ីសុវត្ថិ កុសុមៈ សម្តែងដើម្បីស្វាគមន៍ភ្ញៀវ និងជូនពរឱ្យមានសុភមង្គល និងវិបុលភាព។ អ្នករបាំកាន់ពានមាសពោរពេញដោយផ្កា។',
    image: '/images/acts/blessing-card.jpg',
    imageAlt: 'A Khmer classical dancer in a golden costume and crown kneels, holding a golden goblet of flowers',
    imagePosition: '50% 30%',
    credit: 'Blessing Dance by MarSelNH (CC BY-SA 4.0)',
    moments: [
      { title: 'Celestial dancers', title_km: 'ទេពអប្សរ', text: 'Dressed as devata, heavenly beings, the dancers enter in golden crowns.', text_km: 'ស្លៀកពាក់ជាទេវតា អ្នករបាំចេញមកដោយពាក់មកុដមាស។', image: '/images/acts/moments/blessing-enter.jpg', imageAlt: 'A dancer in a golden crown and costume walks onto the stage' },
      { title: 'The golden goblet', title_km: 'ពានមាស', text: 'Each dancer carries flower blossoms in a golden goblet.', text_km: 'អ្នករបាំម្នាក់ៗកាន់ផ្កានៅក្នុងពានមាស។', image: '/images/acts/moments/blessing-goblet.jpg', imageAlt: 'Close-up of a dancer holding up a golden goblet filled with blossoms' },
      { title: 'The blessing', title_km: 'ការជូនពរ', text: 'Kneeling, the dancer offers the blossoms: wishes of good health, happiness, prosperity and success.', text_km: 'ដោយលុតជង្គង់ អ្នករបាំថ្វាយផ្កា៖ ជូនពរឱ្យមានសុខភាពល្អ សុភមង្គល វិបុលភាព និងភាពជោគជ័យ។', image: '/images/acts/moments/blessing-offer.jpg', imageAlt: 'A kneeling dancer holds out a goblet of flowers with head bowed' },
    ],
  },
]

/* Hand gestures of Khmer classical dance (Act I page) */
export const gestures = {
  credit: 'Gesture illustrations by Phann Sok Heng, Cambodia.',
  phases: [
    { id: 'birth', tone: 'teal', name: 'Birth', name_km: 'កំណើត', text: 'A seed is planted and starts to grow.', text_km: 'គ្រាប់ពូជត្រូវបានដាំ ហើយចាប់ផ្តើមដុះ។' },
    { id: 'evolution', tone: 'gold', name: 'Evolution', name_km: 'វិវឌ្ឍន៍', text: 'Young leaves open, then grow strong.', text_km: 'ស្លឹកខ្ចីលាតចេញ រួចលូតលាស់រឹងមាំ។' },
    { id: 'growth', tone: 'crimson', name: 'Growth', name_km: 'ការលូតលាស់', text: 'The plant flowers and bears fruit.', text_km: 'រុក្ខជាតិចេញផ្កា និងបង្កើតផ្លែ។' },
    { id: 'vanishing', tone: 'champagne', name: 'Vanishing', name_km: 'ការរលត់', text: 'The fruit ripens and falls, and its seed begins again.', text_km: 'ផ្លែទុំហើយជ្រុះ ហើយគ្រាប់របស់វាចាប់ផ្តើមសាជាថ្មី។' },
  ],
  items: [
    { phase: 'birth', name: 'Planting', name_km: 'ការដាំ', image: '/images/gestures/planting.jpg' },
    { phase: 'birth', name: 'Growing', name_km: 'ការដុះ', image: '/images/gestures/growing.jpg' },
    { phase: 'evolution', name: 'Young leaves', name_km: 'ស្លឹកខ្ចី', image: '/images/gestures/young-leaf.jpg' },
    { phase: 'evolution', name: 'Leaves', name_km: 'ស្លឹក', image: '/images/gestures/leaf.jpg' },
    { phase: 'growth', name: 'Flowering', name_km: 'ការចេញផ្កា', image: '/images/gestures/flowering.jpg' },
    { phase: 'growth', name: 'Fruit', name_km: 'ផ្លែ', image: '/images/gestures/fruit.jpg' },
    { phase: 'vanishing', name: 'Ripe fruit', name_km: 'ផ្លែទុំ', image: '/images/gestures/ripe-fruit.jpg' },
    { phase: 'vanishing', name: 'Falling fruit', name_km: 'ផ្លែជ្រុះ', image: '/images/gestures/falling-fruit.jpg' },
  ],
}

/* ----------------------------------------------------------------------------
 * 5. ARTISTS (“Meet the artist” on each act page)
 *  featured  true = the large card; the others are the smaller cards
 *  sets      chip under the name (empty = worked out from the line-up)
 *  years, quote: hidden while empty
 * ------------------------------------------------------------------------- */
export const artists = [
  {
    actId: 'act-1',
    featured: true,
    name: 'Princess Buppha Devi Dance School',
    name_km: 'សាលារបាំ សម្តេចរាជបុត្រី នរោត្តម បុប្ផាទេវី',
    initials: 'PBD',
    role: 'Khmer classical & folk dance',
    role_km: 'របាំបុរាណ និងប្រជាប្រិយខ្មែរ',
    nationality: '',
    years: '',
    quote: '',
    photo: '',
    photoAlt: '',
    photoCredit: '',
    sets: 'Peacock Dance | JunPor Dance',
    sets_km: 'របាំក្ងោកប៉ៃលិន | របាំជូនពរ',
  },
  { actId: 'act-2', name: 'Song Hui Chan', role: 'Pianist', role_km: 'អ្នកលេងព្យ៉ាណូ', sets: '', years: '', quote: '' },
  { actId: 'act-2', name: 'Mayumi Hamamoto', role: 'Pianist', role_km: 'អ្នកលេងព្យ៉ាណូ', sets: '', years: '', quote: '' },
  { actId: 'act-2', name: 'Misato Kozuma Nakaishi', role: 'Pianist', role_km: 'អ្នកលេងព្យ៉ាណូ', sets: '', years: '', quote: '' },
  { actId: 'act-2', name: 'Meas Sovan', role: 'Pianist', role_km: 'អ្នកលេងព្យ៉ាណូ', sets: '', years: '', quote: '' },
  { actId: 'act-2', name: 'Oum Pisey', role: 'Violin', role_km: 'វីយូឡុង', sets: '', years: '', quote: '' },
  { actId: 'act-2', name: 'Issei Sakano', role: 'Pianist', role_km: 'អ្នកលេងព្យ៉ាណូ', sets: '', years: '', quote: '' },
  { actId: 'act-2', name: 'Ai Iwasaki', role: 'Vocalist', role_km: 'អ្នកចម្រៀង', sets: '', years: '', quote: '' },
  {
    actId: 'act-3',
    featured: true,
    eyebrow: 'Meet the artist',
    title: 'The heartbeat of both sets',
    title_km: 'ចង្វាក់បេះដូងនៃឈុតទាំងពីរ',
    name: 'Jed Bello',
    role: 'Drummer & Percussionist',
    role_km: 'អ្នកវាយស្គរ និងឧបករណ៍ចង្វាក់',
    nationality: 'Filipino',
    nationality_km: 'ជនជាតិហ្វីលីពីន',
    years: '25',
    yearsLabel: 'years playing music',
    yearsLabel_km: 'ឆ្នាំនៃការលេងតន្ត្រី',
    quote:
      'My inspiration comes from creating musical connections with other artists, expressing meaning beyond words, and exploring the relationship of music and social justice.',
    quote_km: 'ការបំផុសគំនិតរបស់ខ្ញុំ កើតចេញពីការបង្កើតទំនាក់ទំនងតន្ត្រីជាមួយសិល្បករដទៃ ការបញ្ចេញអត្ថន័យលើសពីពាក្យសម្តី និងការស្វែងយល់ពីទំនាក់ទំនងរវាងតន្ត្រី និងយុត្តិធម៌សង្គម។',
    photo: '/images/artists/jed-bello.webp',
    photoAlt: 'Jed Bello playing a drum kit on stage, in black and white',
    photoCredit: 'Photo © Steve Porte',
    sets: 'Plays in both tribute sets',
    sets_km: 'លេងក្នុងឈុតគោរពទាំងពីរ',
  },
  { actId: 'act-3', name: 'Mirasol Aguila', role: 'Singer', role_km: 'អ្នកចម្រៀង', sets: 'Set 01 · Whitney & Mariah', sets_km: 'ឈុតទី 01 · Whitney & Mariah', years: '', quote: '' },
  { actId: 'act-3', name: 'Donna', role: 'Singer', role_km: 'អ្នកចម្រៀង', sets: 'Set 02 · Tribute to Sade', sets_km: 'ឈុតទី 02 · គោរពជូន Sade', years: '', quote: '' },
  { actId: 'act-3', name: 'Dmitry', role: 'Band', role_km: 'ក្រុមតន្ត្រី', sets: 'Set 02 · Tribute to Sade', sets_km: 'ឈុតទី 02 · គោរពជូន Sade', years: '', quote: '' },
  { actId: 'act-3', name: 'Dylan', role: 'Band', role_km: 'ក្រុមតន្ត្រី', sets: 'Set 02 · Tribute to Sade', sets_km: 'ឈុតទី 02 · គោរពជូន Sade', years: '', quote: '' },
]

/* ----------------------------------------------------------------------------
 * 6. CHARITY
 * ------------------------------------------------------------------------- */
export const charity = {
  title: 'Charity Impact',
  title_km: 'ផលនៃសប្បុរសធម៌',
  tagline: 'Together, we make a difference.',
  tagline_km: 'រួមគ្នា យើងបង្កើតការផ្លាស់ប្តូរ។',
  heroImage: { src: '/images/charity/school-gate-640.webp', alt: 'Students and teachers of L’aang Primary School standing beneath the school gate' },
  featureImage: { src: '/images/charity/school-students-640.webp', alt: 'Students of L’aang Primary School lined up in front of their wooden school building' },
  share: '100%',
  shareText:
    'of the final profits support the 54 students of L’aang Primary School in Siem Reap, with essential school supplies and a better place to learn.',
  shareText_km: 'នៃប្រាក់ចំណេញចុងក្រោយ គាំទ្រសិស្ស 54 នាក់នៃសាលាបឋមសិក្សាល្អាង ខេត្តសៀមរាប ដោយផ្តល់សម្ភារសិក្សាចាំបាច់ និងកន្លែងសិក្សាប្រសើរជាងមុន។',
  sharePageText: 'of the final profits from the concert support the children of L’aang Primary School.',
  sharePageText_km: 'នៃប្រាក់ចំណេញចុងក្រោយពីការប្រគុំតន្ត្រី គាំទ្រកុមារនៃសាលាបឋមសិក្សាល្អាង។',

  // Where the money goes. `short` is the line on the home page.
  steps: [
    { title: 'Buy school kits', title_km: 'ទិញសម្ភារសិក្សា', text: 'Books, pencils, backpacks, uniforms and raincoats', text_km: 'សៀវភៅ ខ្មៅដៃ កាបូបស្ពាយ ឯកសណ្ឋាន និងអាវភ្លៀង', short: 'Books, pencils, backpacks, uniforms, raincoats', short_km: 'សៀវភៅ ខ្មៅដៃ កាបូបស្ពាយ ឯកសណ្ឋាន អាវភ្លៀង' },
    { title: 'Hand them out', title_km: 'ចែកជូន', text: 'Supplies are donated to L’aang Primary School in Siem Reap', text_km: 'សម្ភារត្រូវបានបរិច្ចាគជូនសាលាបឋមសិក្សាល្អាង ខេត្តសៀមរាប', short: 'Donated to L’aang Primary School', short_km: 'បរិច្ចាគជូនសាលាបឋមសិក្សាល្អាង' },
    { title: 'If funds allow', title_km: 'ប្រសិនបើថវិកាអនុញ្ញាត', text: 'Desks and chairs, and a repair for the old building’s leaking roof', text_km: 'តុ កៅអី និងការជួសជុលដំបូលលេចទឹករបស់អគារចាស់', short: 'Desks, chairs and a roof repair', short_km: 'តុ កៅអី និងការជួសជុលដំបូល' },
  ],

  beneficiary: {
    name: 'L’aang Primary School',
    name_km: 'សាលាបឋមសិក្សាល្អាង',
    area: 'Chi Kreng District, Siem Reap Province',
    area_km: 'ស្រុកជីក្រែង ខេត្តសៀមរាប',
    location: 'Khvaav Village, Khvaav Commune, Chi Kreng District, Siem Reap Province',
    location_km: 'ភូមិខ្វាវ ឃុំខ្វាវ ស្រុកជីក្រែង ខេត្តសៀមរាប',
    // home: true = also on the home page
    facts: [
      { value: '54', label: 'Students', label_km: 'សិស្ស', detail: '25 female', detail_km: 'ស្រី 25 នាក់', home: true },
      { value: '6', label: 'Teachers', label_km: 'គ្រូបង្រៀន', detail: '2 female', detail_km: 'ស្រី 2 នាក់', home: true },
      { value: '2', label: 'Buildings', label_km: 'អគារ', detail: '1 wooden, 1 concrete under construction', detail_km: 'ឈើ 1 និងបេតុង 1 កំពុងសាងសង់', home: false },
      { value: '1', label: 'Concrete well', label_km: 'អណ្តូងបេតុង', detail: 'Non-potable, unusable water', detail_km: 'ទឹកមិនអាចផឹក និងប្រើប្រាស់បាន', home: false },
    ],
    needs: [
      { title: 'Solar power', title_km: 'ថាមពលពន្លឺព្រះអាទិត្យ', text: 'Solar Power System to support water pumping and provide lighting.', text_km: 'ប្រព័ន្ធថាមពលពន្លឺព្រះអាទិត្យ ដើម្បីជួយបូមទឹក និងផ្តល់ពន្លឺ។' },
      { title: 'A finished, dry building', title_km: 'អគារដែលសាងសង់រួច និងមិនលេចទឹក', text: 'One old wooden school building has not been finished. The roof has severe leaks, causing rainwater to enter the classrooms and leaving students wet during rainy weather.', text_km: 'អគារសិក្សាឈើចាស់មួយ មិនទាន់សាងសង់រួចរាល់។ ដំបូលលេចទឹកខ្លាំង ធ្វើឱ្យទឹកភ្លៀងចូលក្នុងថ្នាក់រៀន ហើយសិស្សទទឹកពេលមានភ្លៀង។' },
      { title: 'Desks and chairs', title_km: 'តុ និងកៅអី', text: 'The school does not have enough desks and chairs to support students during lessons.', text_km: 'សាលាមិនមានតុ និងកៅអីគ្រប់គ្រាន់ សម្រាប់សិស្សក្នុងពេលសិក្សា។' },
      { title: 'A fence', title_km: 'របង', text: 'No proper fence around its grounds.', text_km: 'មិនមានរបងត្រឹមត្រូវ ព័ទ្ធជុំវិញបរិវេណសាលា។' },
      { title: 'A reading corner', title_km: 'កន្លែងអានសៀវភៅ', text: 'The school has no library or reading corner where students can access books and develop their reading skills.', text_km: 'សាលាគ្មានបណ្ណាល័យ ឬកន្លែងអានសៀវភៅ ដែលសិស្សអាចអានសៀវភៅ និងអភិវឌ្ឍជំនាញអានរបស់ពួកគេ។' },
      { title: 'Proper toilets', title_km: 'បង្គន់អនាម័យ', text: 'The school does not have proper toilets that meet basic standards for students.', text_km: 'សាលាមិនមានបង្គន់ ដែលបំពេញតាមស្តង់ដារមូលដ្ឋានសម្រាប់សិស្ស។' },
      { title: 'Learning materials', title_km: 'សម្ភារសិក្សា', text: 'Many students lack basic learning materials, school uniforms, backpacks, and raincoats needed for their daily education.', text_km: 'សិស្សជាច្រើនខ្វះសម្ភារសិក្សាមូលដ្ឋាន ឯកសណ្ឋានសាលា កាបូបស្ពាយ និងអាវភ្លៀង សម្រាប់ការសិក្សាប្រចាំថ្ងៃ។' },
    ],
    sourceNote: 'Based on the official document provided by the beneficiary school.',
    sourceNote_km: 'ផ្អែកលើឯកសារផ្លូវការ ដែលផ្តល់ដោយសាលាទទួលផល។',
    photos: [
      { src: '/images/charity/school-students-640.webp', alt: 'Students lined up in front of the wooden school building' },
      { src: '/images/charity/classroom-desks-600.webp', alt: 'Students writing at worn wooden desks in a classroom' },
      { src: '/images/charity/classroom-backpacks-600.webp', alt: 'Two young students with their backpacks in the classroom' },
    ],
  },

  donateUrl: '/donate',

  about: {
    text: 'CoStars is a youth-led student organization from the Faculty of Digital Economy at the National University of Management. Our purpose is to create cultural and creative events that inspire positive change among students across Cambodia.',
    text_km: 'CoStars គឺជាអង្គការនិស្សិតដឹកនាំដោយយុវជន មកពីមហាវិទ្យាល័យសេដ្ឋកិច្ចឌីជីថល នៃសាកលវិទ្យាល័យជាតិគ្រប់គ្រង។ គោលបំណងរបស់យើង គឺបង្កើតកម្មវិធីវប្បធម៌ និងច្នៃប្រឌិត ដែលជំរុញការផ្លាស់ប្តូរវិជ្ជមានក្នុងចំណោមនិស្សិតទូទាំងប្រទេសកម្ពុជា។',
    vision: 'To bring people together through music and culture, while creating opportunities to support children in need and help them have better access to education.',
    vision_km: 'នាំមនុស្សមកជួបជុំគ្នាតាមរយៈតន្ត្រី និងវប្បធម៌ ព្រមទាំងបង្កើតឱកាសគាំទ្រកុមារដែលខ្វះខាត ឱ្យទទួលបានការអប់រំកាន់តែប្រសើរ។',
    mission: 'To bring people together through Khmer traditional dance, classical music, and live acoustic performances. Our goal is to share the love of music, support local talent, and provide essential school supplies to children at L’aang Primary School in Siem Reap.',
    mission_km: 'នាំមនុស្សមកជួបជុំគ្នាតាមរយៈរបាំប្រពៃណីខ្មែរ តន្ត្រីក្លាស៊ិក និងការសម្តែងតន្ត្រីអាកូស្ទិកផ្ទាល់។ គោលដៅរបស់យើង គឺចែករំលែកក្តីស្រឡាញ់ចំពោះតន្ត្រី គាំទ្រទេពកោសល្យក្នុងស្រុក និងផ្តល់សម្ភារសិក្សាចាំបាច់ដល់កុមារនៅសាលាបឋមសិក្សាល្អាង ខេត្តសៀមរាប។',
  },
}

/* ----------------------------------------------------------------------------
 * 7. EVENT ETIQUETTE
 *  icon: phone-off | aisle | door | camera | heart | info
 * ------------------------------------------------------------------------- */
export const etiquette = {
  title: 'Event Etiquette',
  items: [
    { icon: 'phone-off', title: 'Silence your phone', title_km: 'បិទសំឡេងទូរស័ព្ទ', text: 'Please turn off or silence your mobile phone during the performances.', text_km: 'សូមបិទ ឬបិទសំឡេងទូរស័ព្ទដៃរបស់អ្នក ក្នុងអំឡុងពេលសម្តែង។' },
    { icon: 'aisle', title: 'Keep aisles clear', title_km: 'ទុកផ្លូវដើរឱ្យទំនេរ', text: 'Keep aisles and walkways clear at all times.', text_km: 'សូមទុកច្រកផ្លូវ និងផ្លូវដើរឱ្យទំនេរជានិច្ច។' },
    { icon: 'door', title: 'Step out between pieces', title_km: 'ចេញក្រៅនៅចន្លោះបទ', text: 'If you need to step out, please wait for a pause between pieces.', text_km: 'ប្រសិនបើអ្នកត្រូវការចេញក្រៅ សូមរង់ចាំពេលផ្អាកនៅចន្លោះបទ។' },
    { icon: 'camera', title: 'Photos, kindly', title_km: 'ថតរូបដោយគួរសម', text: 'Photos are welcome, but please keep your screen low and never block another guest’s view.', text_km: 'អ្នកអាចថតរូបបាន ប៉ុន្តែសូមដាក់អេក្រង់ឱ្យទាប ហើយកុំបាំងការមើលរបស់ភ្ញៀវផ្សេង។' },
    { icon: 'heart', title: 'Show your applause', title_km: 'ទះដៃលើកទឹកចិត្ត', text: 'Applause is welcome at the end of each dance, piece or song.', text_km: 'សូមទះដៃនៅចុងបញ្ចប់នៃរបាំ បទភ្លេង ឬបទចម្រៀងនីមួយៗ។' },
  ],
}

/* ----------------------------------------------------------------------------
 * 8. SPONSORS (hidden while the list is empty)
 * ------------------------------------------------------------------------- */
export const sponsors = {
  title: 'Our Sponsors',
  subtitle: 'With thanks to our generous partners.',
  list: [],
}

/* ----------------------------------------------------------------------------
 * 9. NEED HELP? Empty fields are hidden.
 * ------------------------------------------------------------------------- */
export const help = {
  text: 'Our CoStars team is at the venue throughout the evening. Please ask any team member if you need help.',
  text_km: 'ក្រុម CoStars របស់យើងនៅទីតាំងកម្មវិធីពេញមួយល្ងាច។ សូមសួរសមាជិកក្រុមណាម្នាក់ ប្រសិនបើអ្នកត្រូវការជំនួយ។',
  desk: '', // e.g. 'Help desk at the ScreenX Hall entrance'
  desk_km: '',
  deskText: '', // e.g. opening hours, lost & found
  deskText_km: '',
  phone: '', // e.g. '+855 12 345 678'
  telegram: '',
}
