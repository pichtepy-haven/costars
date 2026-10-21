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
 *
 * Sheet tabs (row 1 = column names, exactly as below):
 *  Event       key | value
 *  Schedule    id | type | act | title | start | end | subtitle | description |
 *              note | host_name | host_role | intro | image | image_alt
 *  Performers  act_id | name | role | piece | duration_min | bio | photo | photo_alt
 *  Etiquette   text
 *  Sponsors    name | logo | url
 * ========================================================================== */

import { agenda, etiquette, event, help, sponsors, welcome } from '../data.js'
import { CONTENT_SHEET_ID } from './config.js'

const TABS = ['Event', 'Schedule', 'Performers', 'Etiquette', 'Sponsors']
const CACHE_KEY = 'costars-sheet-content-v1'
const MAX_TEXT = 2000

/* ---------------------------------------------------------------- helpers */

const clone = (value) => JSON.parse(JSON.stringify(value))

// Pristine copy of the built-in content, so every update starts from it.
const DEFAULTS = clone({ event, welcome, agenda, etiquette, sponsors, help })

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

/** Rows → objects keyed by the (lower-cased) header row; blank rows dropped. */
export const toRecords = (rows) => {
  if (!rows.length) return []
  const header = rows[0].map((h) => text(h).toLowerCase().replace(/\s+/g, '_'))
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
    const item = {
      ...base,
      id,
      type,
      title,
      start,
      end,
      subtitle: text(row.subtitle, 160),
      description: text(row.description),
      note: text(row.note, 400),
      image: safeUrl(row.image),
      imageAlt: text(row.image_alt, 200),
    }
    if ('host_name' in row || 'host_role' in row) {
      const name = text(row.host_name, 120)
      item.host = name || base.host ? { name, role: text(row.host_role, 80) || base.host?.role || 'Event Host' } : undefined
    }
    if (type === 'act') {
      item.act = text(row.act, 40) || base.act || `Act ${actIndex + 1}`
      item.tone = base.tone || TONES[actIndex % TONES.length]
      item.icon = base.icon || 'music'
      item.filterLabel = base.filterLabel || item.act
      item.performersIntro = 'intro' in row ? text(row.intro) : base.performersIntro || ''
      item.gallery = base.gallery || []
      item.programme = base.programme || []
      actIndex += 1
    }
    items.push(item)
  }

  if (performerRows) {
    const acts = items.filter((i) => i.type === 'act')
    acts.forEach((a) => {
      a.programme = []
    })
    const usedIds = new Set()
    for (const row of performerRows) {
      const target = acts.find((a) => a.id === slug(row.act_id))
      const name = text(row.name, 140)
      if (!target || !name) continue
      let pid = `${target.id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
      while (usedIds.has(pid)) pid += '-x'
      usedIds.add(pid)
      const duration = Number.parseInt(text(row.duration_min, 6), 10)
      const photo = safeUrl(row.photo)
      target.programme.push({
        id: pid,
        name,
        role: text(row.role, 140),
        piece: text(row.piece, 200),
        durationMin: duration > 0 && duration < 600 ? duration : null,
        bio: text(row.bio),
        photos: photo ? [{ src: photo, alt: text(row.photo_alt, 200) || name }] : [],
      })
    }
  }
  return items
}

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

  const kv = Object.fromEntries((tabs.Event || []).map((r) => [slug(r.key).replace(/\s+/g, '_'), r.value ?? '']))
  const setText = (obj, key, sheetKey, max) => {
    if (sheetKey in kv && text(kv[sheetKey], max)) obj[key] = text(kv[sheetKey], max)
  }
  setText(next.event, 'name', 'event_name', 120)
  setText(next.event, 'edition', 'event_short_name', 80)
  setText(next.event, 'dateLabel', 'date_label', 60)
  if (/^\d{4}-\d{2}-\d{2}$/.test(text(kv.event_date, 10))) next.event.date = text(kv.event_date, 10)
  setText(next.event, 'tagline', 'tagline', 200)
  setText(next.event, 'quote', 'quote', 200)
  setText(next.event, 'organizer', 'organizer', 200)
  setText(next.welcome, 'title', 'welcome_title', 80)
  setText(next.welcome, 'message', 'welcome_message', 600)
  if ('welcome_image' in kv) next.welcome.image = safeUrl(kv.welcome_image)
  if ('welcome_image_alt' in kv) next.welcome.imageAlt = text(kv.welcome_image_alt, 200)
  setText(next.help, 'text', 'help_text', 400)
  if ('help_phone' in kv) next.help.phone = text(kv.help_phone, 40).replace(/[^\d+()\s-]/g, '')
  if ('help_telegram' in kv) next.help.telegram = safeUrl(kv.help_telegram)

  if (tabs.Schedule?.length) {
    const items = buildAgenda(tabs.Schedule, tabs.Performers || null)
    if (items.length) next.agenda = items
  }

  if (tabs.Etiquette) {
    const lines = tabs.Etiquette.map((r) => text(r.text, 300)).filter(Boolean)
    if (lines.length) next.etiquette.items = lines
  }

  if (tabs.Sponsors) {
    next.sponsors.list = tabs.Sponsors.map((r) => ({
      name: text(r.name, 120),
      logo: safeUrl(r.logo),
      url: safeUrl(r.url),
    })).filter((s) => s.name)
  }

  fill(event, next.event)
  fill(welcome, next.welcome)
  fill(agenda, next.agenda)
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
  return toRecords(parseCsv(body))
}

/** Download every tab. Resolves to null if the sheet can't be read. */
export const loadSheetContent = async ({ timeout = 8000 } = {}) => {
  if (!CONTENT_SHEET_ID) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const results = await Promise.allSettled(TABS.map((t) => fetchTab(t, controller.signal)))
    const tabs = {}
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') tabs[TABS[i]] = r.value
      else if (import.meta.env.DEV) console.warn('[content sheet]', r.reason?.message || r.reason)
    })
    return Object.keys(tabs).length ? tabs : null
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
