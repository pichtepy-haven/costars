/* =============================================================================
 * English / Khmer
 * -----------------------------------------------------------------------------
 * • The guest picks EN or ខ្មែរ in the header; the choice is remembered on the
 *   phone (localStorage) and applied to every page of the guide.
 * • Content fields have a Khmer twin with the same name + "_km" (title_km,
 *   description_km …). If the Khmer field is empty, the English one is shown.
 * • Labels and headings of the design live in UI_TEXT below. Each one can be
 *   changed from the Google Sheet tab “Text” (key | en | km), no redeploy.
 * ========================================================================== */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'costars-lang'

export const UI_TEXT = {
  // header, menu, footer
  event_guide: ['Event Guide', 'មគ្គុទ្ទេសក៍កម្មវិធី'],
  menu: ['Menu', 'ម៉ឺនុយ'],
  close_menu: ['Close menu', 'បិទម៉ឺនុយ'],
  switch_language: ['Switch language', 'ប្តូរភាសា'],
  nav_home: ['Home', 'ទំព័រដើម'],
  nav_schedule: ['Schedule', 'កាលវិភាគ'],
  nav_charity: ['Charity', 'សប្បុរសធម៌'],
  nav_help: ['Need help?', 'ត្រូវការជំនួយ?'],
  back_agenda: ['Agenda', 'កម្មវិធី'],
  back_guide: ['Guide', 'មគ្គុទ្ទេសក៍'],
  here: ['Here', 'ទីនេះ'],
  menu_home: ['Event guide', 'មគ្គុទ្ទេសក៍កម្មវិធី'],
  menu_home_sub: ['Welcome, schedule & charity', 'ការស្វាគមន៍ កាលវិភាគ និងសប្បុរសធម៌'],
  menu_charity: ['Charity impact', 'ផលនៃសប្បុរសធម៌'],
  menu_help_sub: ['Etiquette, help desk & about us', 'សុជីវធម៌ តុជំនួយ និងអំពីយើង'],
  act_of: ['{act} of III', '{act} នៃ 3'],
  email: ['Email', 'អ៊ីមែល'],
  skip: ['Skip to content', 'រំលងទៅមាតិកា'],

  // hero / countdown / live
  welcome_to: ['Welcome to', 'សូមស្វាគមន៍មកកាន់'],
  doors_open_in: ['Doors open in', 'ទ្វារបើកក្នុងរយៈពេល'],
  days: ['days', 'ថ្ងៃ'],
  hours: ['hours', 'ម៉ោង'],
  mins: ['min', 'នាទី'],
  secs: ['sec', 'វិនាទី'],
  show_starts: ['Show starts', 'ចាប់ផ្តើម'],
  see_running_order: ['See the running order', 'មើលលំដាប់កម្មវិធី'],
  live: ['LIVE', 'ផ្ទាល់'],
  now_on_stage: ['Now on stage', 'កំពុងសម្តែង'],
  playing: ['Playing', 'កំពុងលេង'],
  set_of: ['Set {n} of {total}', 'ឈុតទី {n} នៃ {total}'],
  min_in: ['{n} min in', 'កន្លងទៅ {n} នាទី'],
  min_left: ['{n} min left', 'នៅសល់ {n} នាទី'],
  see_who: ['See who’s performing', 'មើលអ្នកកំពុងសម្តែង'],
  up_next: ['Up next', 'បន្ទាប់'],
  silence_phones: ['Please silence your mobile phones during the performance.', 'សូមបិទសំឡេងទូរស័ព្ទដៃរបស់អ្នក ក្នុងអំឡុងពេលសម្តែង។'],
  thank_you_title: ['Thank you for joining us', 'សូមអរគុណដែលបានចូលរួម'],
  thank_you_text: ['Every ticket tonight helps the children of L’aang Primary School.', 'សំបុត្រនីមួយៗនៅយប់នេះ ជួយដល់កុមារនៅសាលាបឋមសិក្សាល្អាង។'],
  marquee: ['Music|Culture|Community|Charity', 'តន្ត្រី|វប្បធម៌|សហគមន៍|សប្បុរសធម៌'],

  // schedule
  schedule_eyebrow: ['Performance schedule', 'កាលវិភាគសម្តែង'],
  schedule_title: ['The night, moment by moment', 'រាត្រីនេះ ពីមួយពេលទៅមួយពេល'],
  schedule_hint: ['Tap a moment for details. On the night, the one on stage lights up.', 'ចុចលើពេលនីមួយៗ ដើម្បីមើលព័ត៌មានលម្អិត។ នៅយប់កម្មវិធី ផ្នែកដែលកំពុងសម្តែងនឹងភ្លឺឡើង។'],
  now_badge: ['Now', 'ឥឡូវ'],

  // acts on home
  acts_eyebrow: ['Agenda highlights', 'ចំណុចសំខាន់ៗនៃកម្មវិធី'],
  acts_title: ['Three acts, one stage', 'បីវគ្គ លើឆាកតែមួយ'],
  acts_intro: ['Khmer traditional dance, classical music and live acoustic tribute performances, from {start} to {end}.', 'របាំប្រពៃណីខ្មែរ តន្ត្រីក្លាស៊ិក និងការសម្តែងតន្ត្រីអាកូស្ទិកផ្ទាល់ ចាប់ពីម៉ោង {start} ដល់ {end}។'],
  meet_performers: ['Meet the performers', 'ស្គាល់អ្នកសម្តែង'],
  swipe: ['Swipe →', 'អូស →'],

  // charity on home / charity page
  charity_eyebrow: ['Charity impact', 'ផលនៃសប្បុរសធម៌'],
  charity_title: ['Together, we make a difference.', 'រួមគ្នា យើងបង្កើតការផ្លាស់ប្តូរ។'],
  learn_school: ['Learn more about the school', 'ស្វែងយល់បន្ថែមអំពីសាលា'],
  steps_eyebrow: ['Where your ticket goes', 'សំបុត្ររបស់អ្នកទៅណា'],
  steps_title: ['From the concert hall to the classroom', 'ពីសាលប្រគុំតន្ត្រី ទៅកាន់ថ្នាក់រៀន'],
  gallery_eyebrow: ['Life at the school', 'ជីវិតនៅសាលា'],
  gallery_title: ['Small gifts, big dreams', 'អំណោយតូច ក្តីសុបិនធំ'],
  needs_eyebrow: ['What the school needs', 'តម្រូវការរបស់សាលា'],
  needs_title: ['Seven needs, one school', 'តម្រូវការប្រាំពីរ សាលាតែមួយ'],
  donate_title: ['Every gift reaches a classroom', 'រាល់អំណោយទៅដល់ថ្នាក់រៀន'],
  donate_text: ['Can’t make the concert? A donation still buys books, backpacks and raincoats for L’aang Primary School.', 'មិនអាចមកចូលរួមការប្រគុំតន្ត្រីបាន? ការបរិច្ចាគរបស់អ្នក នៅតែអាចទិញសៀវភៅ កាបូបស្ពាយ និងអាវភ្លៀង ជូនសាលាបឋមសិក្សាល្អាង។'],
  donate_button: ['Make a donation', 'បរិច្ចាគ'],

  // more for your evening
  more_eyebrow: ['More for your evening', 'បន្ថែមសម្រាប់រាត្រីរបស់អ្នក'],
  more_title: ['Everything for a thoughtful, memorable night', 'អ្វីៗទាំងអស់ សម្រាប់រាត្រីដ៏មានន័យ និងគួរឱ្យចងចាំ'],
  etiquette_title: ['Event Etiquette', 'សុជីវធម៌ក្នុងកម្មវិធី'],
  etiquette_sub: ['Help us create a respectful, enjoyable experience', 'ជួយយើងបង្កើតបរិយាកាសប្រកបដោយការគោរព និងរីករាយ'],
  help_title: ['Need Help?', 'ត្រូវការជំនួយ?'],
  help_sub: ['Contact our event team for assistance', 'ទាក់ទងក្រុមការងារ ដើម្បីទទួលបានជំនួយ'],
  help_call: ['Call the event team', 'ទូរស័ព្ទទៅក្រុមការងារ'],
  about_title: ['About CoStars', 'អំពី CoStars'],
  about_sub: ['Youth-led, from NUM’s Faculty of Digital Economy', 'ដឹកនាំដោយយុវជន ពីមហាវិទ្យាល័យសេដ្ឋកិច្ចឌីជីថល NUM'],
  vision: ['Vision', 'ចក្ខុវិស័យ'],
  mission: ['Mission', 'បេសកកម្ម'],

  // act pages
  lineup_eyebrow: ['The line-up', 'បញ្ជីអ្នកសម្តែង'],
  set_n: ['Set {n}', 'ឈុតទី {n}'],
  setlist: ['Setlist', 'បញ្ជីបទ'],
  meet_artist: ['Meet the artist', 'ស្គាល់សិល្បករ'],
  meet_artists: ['Meet the artists', 'ស្គាល់សិល្បករ'],
  years_playing: ['years playing', 'ឆ្នាំនៃការលេង'],
  dances_eyebrow: ['The two dances', 'របាំទាំងពីរ'],
  dances_title: ['One folk, one royal', 'មួយប្រជាប្រិយ មួយរាជវាំង'],
  dance_n: ['Dance {n}', 'របាំទី {n}'],
  moments_title: ['The dance in three moments', 'របាំក្នុងបីឈុតឆាក'],
  gestures_eyebrow: ['Read the hands', 'អានកាយវិការដៃ'],
  gestures_title: ['The life of a plant, told by hand', 'ជីវិតរុក្ខជាតិ តាមរយៈកាយវិការដៃ'],
  gestures_text: ['Eight gestures follow a plant from planting to falling fruit. The fallen fruit drops its seed, and the cycle begins again.', 'កាយវិការប្រាំបី តាមដានរុក្ខជាតិមួយ ចាប់ពីការដាំរហូតដល់ផ្លែជ្រុះ។ ផ្លែដែលជ្រុះទម្លាក់គ្រាប់ ហើយវដ្តចាប់ផ្តើមសាជាថ្មី។'],
  more_artists: ['More {act} artists', 'សិល្បករផ្សេងទៀតនៃ{act}'],
  not_found_title: ['Page not found', 'រកមិនឃើញទំព័រ'],
  not_found_text: ['This page doesn’t exist. Head back to the guide.', 'ទំព័រនេះមិនមានទេ។ សូមត្រឡប់ទៅមគ្គុទ្ទេសក៍វិញ។'],

  // added for act pages, live page and menu
  live_now: ['Live now', 'កំពុងសម្តែង'],
  live_now_sub: ['What’s on stage tonight', 'អ្វីដែលកំពុងសម្តែងយប់នេះ'],
  live_soon_title: ['Live updates start on the night', 'ព័ត៌មានផ្ទាល់ចាប់ផ្តើមនៅយប់កម្មវិធី'],
  live_soon_text: ['When doors open at {time} on {day}, this page shows what’s on stage and what’s next.', 'នៅពេលទ្វារបើកម៉ោង {time} {day} ទំព័រនេះនឹងបង្ហាញអ្វីដែលកំពុងសម្តែង និងអ្វីដែលបន្ទាប់។'],
  status_done: ['Done', 'បានបញ្ចប់'],
  status_now: ['On now', 'កំពុងសម្តែង'],
  status_later: ['Later', 'បន្ទាប់'],
  tab_now: ['Now', 'ឥឡូវ'],
  tab_artists: ['Artists', 'សិល្បករ'],
  tab_help: ['Help', 'ជំនួយ'],
  sets_n: ['Sets {n}', 'ឈុតទី {n}'],
  n_sets: ['{n} sets', '{n} ឈុត'],
  n_dances: ['{n} dances', 'របាំ {n}'],
  set_lengths: ['Set lengths', 'រយៈពេលនៃឈុតនីមួយៗ'],
  min_music: ['{n} min of music', 'តន្ត្រី {n} នាទី'],
  pause: ['Pause', 'ផ្អាក'],
  play: ['Play', 'ចាក់'],
  running_order: ['Running order', 'លំដាប់កម្មវិធី'],
  sponsors_eyebrow: ['Our sponsors', 'អ្នកឧបត្ថម្ភរបស់យើង'],
  sponsors_title: ['With thanks to our generous partners', 'សូមអរគុណដៃគូដ៏សប្បុរសរបស់យើង'],
}

// Act labels and a few fixed words that follow the active language.
const ACT_KM = { 'Act I': 'វគ្គទី 1', 'Act II': 'វគ្គទី 2', 'Act III': 'វគ្គទី 3' }

let overrides = {} // filled from the Sheet “Text” tab
export const setTextOverrides = (rows) => {
  overrides = {}
  ;(rows || []).forEach((r) => {
    const key = String(r.key || '').trim().toLowerCase()
    if (!key || !(key in UI_TEXT)) return
    const en = String(r.en || '').trim().slice(0, 400)
    const km = String(r.km || '').trim().slice(0, 400)
    if (en || km) overrides[key] = [en, km]
  })
}

const LangContext = createContext({ lang: 'en', setLang: () => {} })

const readStored = () => {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (v === 'en' || v === 'km') return v
  } catch {
    /* ignore */
  }
  const q = new URLSearchParams(window.location.search).get('lang')
  return q === 'km' ? 'km' : 'en'
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(readStored)
  useEffect(() => {
    document.documentElement.lang = lang === 'km' ? 'km' : 'en'
    document.documentElement.classList.toggle('lang-km', lang === 'km')
  }, [lang])
  const value = useMemo(
    () => ({
      lang,
      setLang: (v) => {
        setLangState(v)
        try {
          window.localStorage.setItem(STORAGE_KEY, v)
        } catch {
          /* ignore */
        }
      },
    }),
    [lang],
  )
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)

const fillVars = (s, vars) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s)

/** Hook: t(key, vars) for labels, loc(obj, field) for content, act(label) for act names. */
export const useT = () => {
  const { lang } = useLang()
  const km = lang === 'km'
  const t = (key, vars) => {
    const base = UI_TEXT[key]
    if (!base) return key
    const o = overrides[key]
    const en = (o && o[0]) || base[0]
    const kmText = (o && o[1]) || base[1] || en
    return fillVars(km ? kmText : en, vars)
  }
  const loc = (obj, field) => {
    if (!obj) return ''
    if (km) {
      const v = obj[`${field}_km`]
      if (typeof v === 'string' && v.trim()) return v
    }
    return obj[field] ?? ''
  }
  const act = (label) => (km ? ACT_KM[label] || label : label)
  return { t, loc, act, lang, km }
}
