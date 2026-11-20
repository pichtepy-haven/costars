/* =============================================================================
 * Live content from the CoStars Google Sheet
 * -----------------------------------------------------------------------------
 * The guide first shows the content built into src/data.js (or the last copy
 * it downloaded), then fetches the Google Sheet and swaps in whatever the
 * organisers have typed there. No redeploy needed.
 *
 * Safety rules:
 *  • Anything missing, malformed or unreachable falls back to src/data.js, so a
 *    typo in the sheet can never break the site.
 *  • Text is always shown as plain text (React escapes it), never as HTML.
 *  • Links and images must be https:// addresses or /images/… paths.
 *  • Khmer: every text column can have a twin ending in “_km”. Empty Khmer →
 *    the built-in Khmer if the English is unchanged, otherwise the English.
 *
 * Sheet tabs (row 1 = column names). Tabs and columns marked * are optional;
 * a missing tab keeps the built-in content.
 *  Event       key | value | value_km*
 *  Schedule    id | type | act | title | start | end | subtitle | description |
 *              note | host_name | host_role | intro | image | image_alt |
 *              title_km* | subtitle_km* | description_km* | note_km* | intro_km* |
 *              summary* | summary_km* | lineup_title* | lineup_title_km* |
 *              artists_title* | artists_title_km*
 *  Performers  act_id | name | role | piece | duration_min | bio | photo | photo_alt |
 *              name_km* | role_km* | piece_km* | setlist* | with* | with_km*
 *  Etiquette   text | title* | title_km* | text_km* | icon*
 *  Sponsors    name | logo | url
 *  Text*       key | en | km                      (labels & headings)
 *  Dances*     id | name | name_km | local_name | romanized | kind | kind_km |
 *              description | description_km | image | image_alt | credit
 *  Moments*    dance_id | title | title_km | text | text_km | image | image_alt
 *  Gestures*   phase | phase_km | phase_text | phase_text_km | name | name_km | image
 *  Artists*    act_id | featured | name | name_km | initials | role | role_km |
 *              nationality | nationality_km | years | years_label | years_label_km |
 *              sets | sets_km | quote | quote_km | photo | photo_alt | photo_credit |
 *              title | title_km
 *  Charity*    field | value | value_km
 *  Facts*      value | label | label_km | detail | detail_km | home
 *  Steps*      title | title_km | text | text_km | short | short_km
 *  Needs*      title | title_km | text | text_km
 * ========================================================================== */

import {
  agenda, artists, charity, dances, etiquette, event, gestures, help, socials, sponsors, welcome,
} from '../data.js'
import { setTextOverrides } from '../i18n.jsx'
import { CONTENT_SHEET_ID } from './config.js'

/** Tabs read every minute (times can change on the night) … */
export const CORE_TABS = ['Event', 'Schedule', 'Performers']
/** … and tabs read when the guide opens and then every 10 minutes. */
export const EXTRA_TABS = ['Etiquette', 'Sponsors', 'Text', 'Dances', 'Moments', 'Gestures', 'Artists', 'Charity', 'Facts', 'Steps', 'Needs']

/**
 * Columns a tab must have to be used. Google returns the first tab of the
 * Sheet when a tab name doesn't exist, so this also stops a missing optional
 * tab from being read as another one.
 */
const REQUIRED = {
  Event: ['key', 'value'],
  Schedule: ['id', 'title', 'start', 'end'],
  Performers: ['act_id', 'name'],
  Etiquette: ['text'],
  Sponsors: ['name'],
  Text: ['key', 'en'],
  Dances: ['id', 'name', 'description', 'romanized'],
  Moments: ['dance_id', 'title', 'text'],
  Gestures: ['phase', 'name', 'image'],
  Artists: ['act_id', 'name', 'featured'],
  Charity: ['field', 'value'],
  Facts: ['value', 'label', 'detail'],
  Steps: ['title', 'text', 'short'],
  Needs: ['title', 'text', 'title_km'],
}

const CACHE_KEY = 'costars-sheet-content-v2'
const MAX_TEXT = 2000

/* ---------------------------------------------------------------- helpers */

const clone = (value) => JSON.parse(JSON.stringify(value))

// Pristine copy of the built-in content, so every update starts from it.
const DEFAULTS = clone({ event, socials, welcome, agenda, dances, gestures, artists, charity, etiquette, sponsors, help })

const text = (value, max = MAX_TEXT) =>
  typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim().slice(0, max) : ''

/** https:// URL or a /images/… path; anything else is ignored. */
const safeUrl = (value) => {
  const v = text(value, 600)
  if (!v) return ''
  if (/^\/images\/[^\s"'<>]+$/.test(v)) return v
  try {
    const u = new URL(v)
    return u.protocol === 'https:' ? u.href : ''
  } catch {
    return ''
  }
}

/** Like safeUrl, but also accepts a page of this site (/donate) and mailto:. */
const safeLink = (value) => {
  const v = text(value, 600)
  if (/^\/[a-z0-9/_-]*$/i.test(v)) return v
  if (/^mailto:[^\s"'<>@]+@[^\s"'<>@]+$/i.test(v)) return v
  if (/^[^\s"'<>@:/]+@[^\s"'<>@]+\.[a-z]{2,}$/i.test(v)) return `mailto:${v}`
  return safeUrl(v)
}

/** Accepts 17:10, 17:10:00, 5:10 PM, 5.10pm → "17:10". */
export const normalizeTime = (value) => {
  const v = text(value, 20).toLowerCase().replace(/\s+/g, '')
  const m = /^(\d{1,2})[:.](\d{2})(?::\d{2})?(am|pm)?$/.exec(v)
  if (!m) return ''
  let h = Number(m[1])
  const min = Number(m[2])
  if (m[3]) {
    if (h < 1 || h > 12) return ''
    if (m[3] === 'pm' && h !== 12) h += 12
    if (m[3] === 'am' && h === 12) h = 0
  }
  if (h > 23 || min > 59) return ''
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

const minutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3))

const slug = (value) => text(value, 60).toLowerCase()

const yes = (value) => /^(y|yes|true|x|1|✓)$/i.test(text(value, 10))

/** Songs in a cell: one per line, or separated by “|”. */
const list = (value, max = 20) =>
  text(value)
    .split(/\n|\|/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max)

/**
 * Khmer for a field: the sheet's “_km” column, else the built-in Khmer when
 * the English text is the built-in one, else '' (the English is shown).
 */
const kmOf = (row, column, en, base, baseField) => {
  if (row && column in row) {
    const v = text(row[column])
    if (v) return v
  }
  if (base && en && text(base[baseField] || '') === en) return base[`${baseField}_km`] || ''
  return ''
}

/** Copy a text column + its Khmer twin onto obj (only when present in the row). */
const setPair = (obj, field, row, column, base, max = MAX_TEXT) => {
  if (!(column in row)) return
  const en = text(row[column], max)
  obj[field] = en
  obj[`${field}_km`] = kmOf(row, `${column}_km`, en, base, field)
}

/* ------------------------------------------------------------ CSV parsing */

/** RFC 4180 CSV → array of rows (handles quotes, commas and line breaks). */
export const parseCsv = (csv) => {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < csv.length; i += 1) {
    const c = csv[i]
    if (quoted) {
      if (c === '"' && csv[i + 1] === '"') {
        field += '"'
        i += 1
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && csv[i + 1] === '\n') i += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += c
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

const headerOf = (rows) => (rows[0] || []).map((h) => text(h).toLowerCase().replace(/\s+/g, '_'))

/** Rows → objects keyed by the (lower-cased) header row; blank rows dropped. */
export const toRecords = (rows) => {
  if (!rows.length) return []
  const header = headerOf(rows)
  return rows
    .slice(1)
    .filter((r) => r.some((cell) => text(cell)))
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])))
}

/* --------------------------------------------------------------- merging */

const TONES = ['gold', 'crimson', 'violet']
const TYPE_ICON = { act: 'music', ceremony: 'mic', break: 'coffee' }

/** Build the schedule from the Schedule + Performers tabs. */
const buildAgenda = (scheduleRows, performerRows) => {
  const byId = Object.fromEntries(DEFAULTS.agenda.map((item) => [item.id, item]))
  const seen = new Set()
  const items = []
  let actIndex = 0

  for (const row of scheduleRows) {
    const id = slug(row.id)
    const start = normalizeTime(row.start)
    const end = normalizeTime(row.end)
    const title = text(row.title, 140)
    if (!/^[a-z0-9-]+$/.test(id) || seen.has(id) || !title || !start || !end || minutes(end) <= minutes(start)) continue
    seen.add(id)
    const type = ['act', 'ceremony', 'break'].includes(slug(row.type)) ? slug(row.type) : byId[id]?.type || 'ceremony'
    const base = clone(byId[id] || { id, type, icon: TYPE_ICON[type] })
    const item = { ...base, id, type, title, start, end }
    item.title_km = kmOf(row, 'title_km', title, base, 'title')
    setPair(item, 'subtitle', row, 'subtitle', base, 160)
    setPair(item, 'description', row, 'description', base)
    setPair(item, 'note', row, 'note', base, 400)

    const image = safeUrl(row.image)
    if (image) {
      item.image = image
      item.imageAlt = text(row.image_alt, 200)
    } else if (!base.image) item.image = ''

    if ('host_name' in row || 'host_role' in row) {
      const name = text(row.host_name, 120)
      item.host = name || base.host ? { name, role: text(row.host_role, 80) || base.host?.role || 'Event Host' } : undefined
    }
    if (type === 'act') {
      item.act = text(row.act, 40) || base.act || `Act ${actIndex + 1}`
      item.tone = base.tone || TONES[actIndex % TONES.length]
      item.icon = base.icon || 'music'
      if ('intro' in row) {
        item.performersIntro = text(row.intro)
        item.performersIntro_km = kmOf(row, 'intro_km', item.performersIntro, base, 'performersIntro')
      }
      // Card line on the home page: the Sheet's, else the built-in one while
      // the subtitle is unchanged, else the subtitle.
      if (text(row.summary || '')) setPair(item, 'summary', row, 'summary', base, 200)
      else if (item.subtitle !== base.subtitle) item.summary = ''
      if (text(row.lineup_title || '')) setPair(item, 'lineupTitle', row, 'lineup_title', base, 120)
      if (text(row.artists_title || '')) setPair(item, 'artistsTitle', row, 'artists_title', base, 120)
      item.gallery = base.gallery || []
      item.programme = base.programme || []
      actIndex += 1
    }
    items.push(item)
  }

  if (performerRows) {
    const acts = items.filter((i) => i.type === 'act')
    const baseProgramme = Object.fromEntries(acts.map((a) => [a.id, a.programme || []]))
    acts.forEach((a) => {
      a.programme = []
    })
    const usedIds = new Set()
    for (const row of performerRows) {
      const target = acts.find((a) => a.id === slug(row.act_id))
      const name = text(row.name, 140)
      if (!target || !name) continue
      const base = baseProgramme[target.id].find((p) => p.name === name) || {}
      let pid = `${target.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
      while (usedIds.has(pid)) pid += '-x'
      usedIds.add(pid)
      const duration = Number.parseInt(text(row.duration_min, 6), 10)
      const photo = safeUrl(row.photo)
      const item = {
        id: pid,
        name,
        name_km: kmOf(row, 'name_km', name, base, 'name'),
        role: text(row.role, 140),
        piece: text(row.piece, 200),
        durationMin: duration > 0 && duration < 600 ? duration : null,
        bio: text(row.bio),
        setlist: 'setlist' in row ? list(row.setlist) : base.setlist || [],
        with: 'with' in row ? text(row.with, 120) : base.with || '',
        photos: photo ? [{ src: photo, alt: text(row.photo_alt, 200) || name }] : [],
      }
      item.role_km = kmOf(row, 'role_km', item.role, base, 'role')
      item.piece_km = kmOf(row, 'piece_km', item.piece, base, 'piece')
      item.with_km = kmOf(row, 'with_km', item.with, base, 'with')
      target.programme.push(item)
    }
  }
  return items
}

const buildDances = (danceRows, momentRows) => {
  let next = clone(DEFAULTS.dances)
  if (danceRows?.length) {
    const built = danceRows
      .map((row, i) => {
        const id = slug(row.id).replace(/[^a-z0-9-]/g, '') || `dance-${i + 1}`
        const base = DEFAULTS.dances.find((d) => d.id === id) || {}
        const d = { ...clone(base), id, actId: slug(row.act_id) || base.actId || 'act-1' }
        d.tone = base.tone || ['teal', 'gold'][i % 2]
        setPair(d, 'name', row, 'name', base, 120)
        if (!d.name) return null
        d.localName = text(row.local_name, 80)
        d.romanized = text(row.romanized, 80)
        setPair(d, 'kind', row, 'kind', base, 60)
        setPair(d, 'description', row, 'description', base, 800)
        const image = safeUrl(row.image)
        d.image = image || base.image || ''
        d.imageAlt = text(row.image_alt, 200) || (image ? d.name : base.imageAlt || '')
        if ('credit' in row) d.credit = text(row.credit, 200)
        d.moments = base.moments || []
        return d
      })
      .filter(Boolean)
    if (built.length) next = built
  }
  if (momentRows?.length) {
    const grouped = {}
    momentRows.forEach((row) => {
      const danceId = slug(row.dance_id)
      const dance = next.find((d) => d.id === danceId)
      if (!dance) return
      const base = (DEFAULTS.dances.find((d) => d.id === danceId)?.moments || [])[(grouped[danceId] || []).length] || {}
      const m = {}
      setPair(m, 'title', row, 'title', base, 80)
      setPair(m, 'text', row, 'text', base, 400)
      if (!m.title) return
      m.image = safeUrl(row.image)
      m.imageAlt = text(row.image_alt, 200) || m.title
      ;(grouped[danceId] = grouped[danceId] || []).push(m)
    })
    next.forEach((d) => {
      if (grouped[d.id]) d.moments = grouped[d.id].slice(0, 6)
    })
  }
  return next
}

const buildGestures = (rows) => {
  const base = DEFAULTS.gestures
  const phases = []
  const items = []
  rows.forEach((row) => {
    const phaseName = text(row.phase, 40)
    const name = text(row.name, 60)
    const image = safeUrl(row.image)
    if (!phaseName || !name || !image) return
    let phase = phases.find((p) => p.name === phaseName)
    if (!phase) {
      const basePhase = base.phases.find((p) => p.name === phaseName) || {}
      phase = {
        id: `phase-${phases.length + 1}`,
        tone: ['teal', 'gold', 'crimson', 'violet'][phases.length % 4],
        name: phaseName,
        name_km: kmOf(row, 'phase_km', phaseName, basePhase, 'name'),
        text: text(row.phase_text, 200) || basePhase.text || '',
      }
      phase.text_km = kmOf(row, 'phase_text_km', phase.text, basePhase, 'text')
      phases.push(phase)
    }
    const baseItem = base.items.find((g) => g.name === name) || {}
    items.push({ phase: phase.id, name, name_km: kmOf(row, 'name_km', name, baseItem, 'name'), image })
  })
  return items.length ? { ...clone(base), phases, items: items.slice(0, 16) } : clone(base)
}

const buildArtists = (rows) => {
  const out = rows
    .map((row) => {
      const name = text(row.name, 120)
      const actId = slug(row.act_id)
      if (!name || !/^[a-z0-9-]+$/.test(actId)) return null
      const base = DEFAULTS.artists.find((a) => a.name === name && a.actId === actId) || {}
      const a = { actId, featured: yes(row.featured), name }
      a.name_km = kmOf(row, 'name_km', name, base, 'name')
      a.initials = text(row.initials, 4).toUpperCase() || base.initials || ''
      setPair(a, 'role', row, 'role', base, 120)
      setPair(a, 'nationality', row, 'nationality', base, 60)
      a.years = text(row.years, 6)
      setPair(a, 'yearsLabel', row, 'years_label', base, 60)
      setPair(a, 'sets', row, 'sets', base, 120)
      setPair(a, 'quote', row, 'quote', base, 400)
      setPair(a, 'title', row, 'title', base, 120)
      a.photo = safeUrl(row.photo)
      a.photoAlt = text(row.photo_alt, 200) || name
      a.photoCredit = text(row.photo_credit, 120)
      return a
    })
    .filter(Boolean)
  return out.length ? out : clone(DEFAULTS.artists)
}

const buildCharity = (tabs) => {
  const next = clone(DEFAULTS.charity)
  const b = next.beneficiary
  const kv = Object.fromEntries((tabs.Charity || []).map((r) => [slug(r.field).replace(/\s+/g, '_'), r]))
  const set = (obj, field, key, max) => {
    const row = kv[key]
    if (!row || !text(row.value, max)) return
    const en = text(row.value, max)
    obj[`${field}_km`] = kmOf(row, 'value_km', en, obj, field)
    obj[field] = en
  }
  set(next, 'title', 'title', 80)
  set(next, 'tagline', 'tagline', 160)
  if (text(kv.share?.value || '', 10)) next.share = text(kv.share.value, 10)
  set(next, 'shareText', 'share_text', 400)
  set(next, 'sharePageText', 'share_page_text', 400)
  set(b, 'name', 'school_name', 120)
  set(b, 'area', 'school_area', 200)
  set(b, 'location', 'school_location', 300)
  set(b, 'sourceNote', 'source_note', 300)
  set(next.about, 'text', 'about_text', 1200)
  set(next.about, 'vision', 'vision', 800)
  set(next.about, 'mission', 'mission', 800)
  if (kv.donate_url && safeLink(kv.donate_url.value)) next.donateUrl = safeLink(kv.donate_url.value)
  ;[['heroImage', 'hero_image'], ['featureImage', 'feature_image']].forEach(([field, key]) => {
    const src = safeUrl(kv[key]?.value)
    if (src) next[field] = { src, alt: text(kv[`${key}_alt`]?.value, 200) || b.name }
  })

  if (tabs.Facts?.length) {
    const facts = tabs.Facts.map((row, i) => {
      const base = DEFAULTS.charity.beneficiary.facts[i] || {}
      const f = { value: text(row.value, 12), home: 'home' in row ? yes(row.home) : Boolean(base.home) }
      setPair(f, 'label', row, 'label', base, 60)
      setPair(f, 'detail', row, 'detail', base, 120)
      return f.value && f.label ? f : null
    }).filter(Boolean)
    if (facts.length) b.facts = facts.slice(0, 8)
  }
  if (tabs.Steps?.length) {
    const steps = tabs.Steps.map((row, i) => {
      const base = DEFAULTS.charity.steps[i] || {}
      const s = {}
      setPair(s, 'title', row, 'title', base, 80)
      setPair(s, 'text', row, 'text', base, 300)
      setPair(s, 'short', row, 'short', base, 160)
      return s.title ? s : null
    }).filter(Boolean)
    if (steps.length) next.steps = steps.slice(0, 6)
  }
  if (tabs.Needs?.length) {
    const needs = tabs.Needs.map((row, i) => {
      const base = DEFAULTS.charity.beneficiary.needs[i] || {}
      const n = {}
      setPair(n, 'title', row, 'title', base, 80)
      setPair(n, 'text', row, 'text', base, 500)
      return n.title ? n : null
    }).filter(Boolean)
    if (needs.length) b.needs = needs.slice(0, 12)
  }
  return next
}

const ETIQUETTE_ICONS = ['phone-off', 'aisle', 'door', 'camera', 'heart', 'info', 'clock', 'ticket']

/** Replace the contents of the exported data objects in place. */
const fill = (target, source) => {
  if (Array.isArray(target)) target.splice(0, target.length, ...source)
  else {
    Object.keys(target).forEach((k) => delete target[k])
    Object.assign(target, source)
  }
}

/**
 * Apply sheet content (tab name → array of records) on top of the built-in
 * defaults. Tabs that are missing or empty keep the built-in content.
 */
export const applySheetContent = (tabs) => {
  const next = clone(DEFAULTS)

  /* Event tab: key | value | value_km */
  const kv = Object.fromEntries((tabs.Event || []).map((r) => [slug(r.key).replace(/\s+/g, '_'), r]))
  const setText = (obj, field, key, max) => {
    const row = kv[key]
    if (!row) return
    const en = text(row.value, max)
    if (!en) return
    obj[`${field}_km`] = kmOf(row, 'value_km', en, obj, field)
    obj[field] = en
  }
  /** Optional: an empty cell hides the item. */
  const setOptional = (obj, field, key, max) => {
    const row = kv[key]
    if (!row) return
    obj[field] = text(row.value, max)
    obj[`${field}_km`] = text(row.value_km || '', max)
  }
  setText(next.event, 'name', 'event_name', 120)
  setText(next.event, 'edition', 'event_short_name', 80)
  setText(next.event, 'dateLabel', 'date_label', 60)
  if (/^\d{4}-\d{2}-\d{2}$/.test(text(kv.event_date?.value, 10))) next.event.date = text(kv.event_date.value, 10)
  setText(next.event, 'venue', 'venue', 120)
  setText(next.event, 'hall', 'hall', 80)
  setText(next.event, 'footerText', 'footer_text', 300)
  setText(next.event, 'tagline', 'tagline', 200)
  setText(next.event, 'quote', 'quote', 200)
  setText(next.event, 'organizer', 'organizer', 200)
  setText(next.welcome, 'title', 'welcome_title', 80)
  setText(next.welcome, 'message', 'welcome_message', 600)
  if (kv.welcome_image) next.welcome.image = safeUrl(kv.welcome_image.value)
  if (kv.welcome_image_alt) next.welcome.imageAlt = text(kv.welcome_image_alt.value, 200)
  setText(next.help, 'text', 'help_text', 400)
  setOptional(next.help, 'desk', 'help_desk', 120)
  setOptional(next.help, 'deskText', 'help_desk_text', 300)
  if (kv.help_phone) next.help.phone = text(kv.help_phone.value, 40).replace(/[^\d+()\s-]/g, '')
  if (kv.help_telegram) next.help.telegram = safeUrl(kv.help_telegram.value)
  ;[['facebook', 'facebook_url'], ['instagram', 'instagram_url'], ['tiktok', 'tiktok_url'], ['email', 'email']].forEach(([field, key]) => {
    if (kv[key]) next.socials[field] = safeLink(kv[key].value)
  })

  if (tabs.Schedule?.length) {
    const items = buildAgenda(tabs.Schedule, tabs.Performers || null)
    if (items.length) next.agenda = items
  }

  if (tabs.Etiquette?.length) {
    const items = tabs.Etiquette.map((row, i) => {
      const base = DEFAULTS.etiquette.items[i] || {}
      const it = { icon: ETIQUETTE_ICONS.includes(slug(row.icon || '')) ? slug(row.icon) : base.icon || 'info' }
      setPair(it, 'text', row, 'text', base, 300)
      if ('title' in row) setPair(it, 'title', row, 'title', base, 80)
      else {
        // Sheet without a title column: keep the built-in title only for the built-in text
        it.title = it.text === base.text ? base.title : ''
        it.title_km = it.text === base.text ? base.title_km : ''
      }
      return it.text ? it : null
    }).filter(Boolean)
    if (items.length) next.etiquette.items = items
  }

  if (tabs.Sponsors) {
    next.sponsors.list = tabs.Sponsors.map((r) => ({
      name: text(r.name, 120),
      logo: safeUrl(r.logo),
      url: safeUrl(r.url),
    })).filter((s) => s.name)
  }

  next.dances = buildDances(tabs.Dances, tabs.Moments)
  if (tabs.Gestures?.length) next.gestures = buildGestures(tabs.Gestures)
  if (tabs.Artists?.length) next.artists = buildArtists(tabs.Artists)
  next.charity = buildCharity(tabs)
  setTextOverrides(tabs.Text || [])

  fill(event, next.event)
  fill(socials, next.socials)
  fill(welcome, next.welcome)
  fill(agenda, next.agenda)
  fill(dances, next.dances)
  fill(gestures, next.gestures)
  fill(artists, next.artists)
  fill(charity, next.charity)
  fill(etiquette, next.etiquette)
  fill(sponsors, next.sponsors)
  fill(help, next.help)
}

/* ------------------------------------------------------------- fetching */

const tabUrl = (tab) =>
  `https://docs.google.com/spreadsheets/d/${CONTENT_SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}&cb=${Math.floor(Date.now() / 30000)}`

const fetchTab = async (tab, signal) => {
  const res = await fetch(tabUrl(tab), { signal, credentials: 'omit' })
  if (!res.ok) throw new Error(`${tab}: HTTP ${res.status}`)
  const body = await res.text()
  if (/^\s*</.test(body)) throw new Error(`${tab}: not CSV (is the sheet shared “Anyone with the link”?)`)
  const rows = parseCsv(body)
  const header = headerOf(rows)
  if (!(REQUIRED[tab] || []).every((c) => header.includes(c))) throw new Error(`${tab}: tab missing or columns renamed`)
  return toRecords(rows)
}

/** Download the given tabs. Resolves to null if none of them can be read. */
export const loadSheetContent = async ({ tabs = [...CORE_TABS, ...EXTRA_TABS], timeout = 8000 } = {}) => {
  if (!CONTENT_SHEET_ID) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const results = await Promise.allSettled(tabs.map((t) => fetchTab(t, controller.signal)))
    const out = {}
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') out[tabs[i]] = r.value
      else if (import.meta.env.DEV) console.warn('[content sheet]', r.reason?.message || r.reason)
    })
    return Object.keys(out).length ? out : null
  } finally {
    clearTimeout(timer)
  }
}

export const readCachedContent = () => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { savedAt, tabs, sheet } = JSON.parse(raw)
    if (sheet !== CONTENT_SHEET_ID || Date.now() - savedAt > 14 * 864e5) return null
    return tabs
  } catch {
    return null
  }
}

export const writeCachedContent = (tabs) => {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), sheet: CONTENT_SHEET_ID, tabs }))
  } catch {
    /* storage unavailable (private mode etc.): ignore */
  }
}
