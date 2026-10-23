/**
 * Preview mode: the whole staff flow runs inside the browser with sample
 * tickets, so the design and flow can be tried before the page is connected
 * to the real ticket database. Nothing is sent anywhere or saved to the
 * database; check-ins are remembered on this phone only (Reset clears them).
 */
const KEY = 'costars-staff-demo-v1'
const UNDO_MS = 15 * 60000

export const DEMO_LOGIN = { staffId: 'DEMO', password: 'costars-demo' }
const DEMO_STAFF = { id: 'DEMO', name: 'Demo Staff' }

/** Sample tickets (the first one is the example from the ticket mockup). */
export const SAMPLE_TICKETS = [
  { code: 'CTK-25010-0001', holder: 'Sokha Dara', type: 'General Admission', order: '#CS202510250015', label: 'Valid' },
  { code: 'CTK-25010-0002', holder: 'Sample Guest 2', type: 'General Admission', order: '#SAMPLE-0002', label: 'Valid' },
  { code: 'CTK-25010-0003', holder: 'Sample Guest 3', type: 'General Admission', order: '#SAMPLE-0003', status: 'Refunded', label: 'Refunded' },
  {
    code: 'CTK-25010-0004',
    holder: 'Sample Guest 4',
    type: 'General Admission',
    order: '#SAMPLE-0004',
    preCheckedIn: { at: '17:42', by: 'Sample Staff (S02)' },
    label: 'Already used',
  },
]
export const SAMPLE_UNKNOWN = 'CTK-99999-9999'

const INVALID_STATUS = /cancel|refund|void|invalid|revok|blocked/i
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const now = () => Date.now()
const stamp = (ms) => {
  const d = new Date(ms)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

const load = () => {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '{}') || {}
  } catch {
    return {}
  }
}
const save = (state) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable: the demo forgets on reload */
  }
}
let memory = null
const getState = () => (memory = memory || load())

export function resetDemo() {
  memory = {}
  save(memory)
}

const view = (t) => {
  const s = getState()[t.code]
  const pre = t.preCheckedIn
  return {
    code: t.code,
    holder: t.holder,
    type: t.type,
    order: t.order,
    status: t.status || '',
    checkedInAt: s ? stamp(s.at) : pre ? pre.at : '',
    checkedInBy: s ? s.by : pre ? pre.by : '',
  }
}

const stats = () => {
  const valid = SAMPLE_TICKETS.filter((t) => !INVALID_STATUS.test(t.status || ''))
  return { total: valid.length, checkedIn: valid.filter((t) => view(t).checkedInAt).length }
}

/** Same rules as the real check-in: the code itself, or a code inside a link. */
const candidates = (raw) => {
  const s = String(raw || '').trim()
  const out = []
  const add = (v) => {
    v = String(v || '').trim().toUpperCase()
    if (v && !out.includes(v)) out.push(v)
  }
  add(s)
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s)
      u.searchParams.forEach((v) => add(v))
      u.pathname.split('/').reverse().forEach(add)
    } catch {
      /* not a link after all */
    }
  }
  ;(s.match(/[A-Za-z0-9][A-Za-z0-9_-]{3,}/g) || []).forEach(add)
  return out
}

const fail = (error, extra = {}) => ({ ok: false, error, ...extra })

/** Answers exactly like the real check-in service would. */
export async function demoApi(action, payload = {}) {
  await sleep(450 + Math.random() * 350)
  const authed = payload.token === 'demo-token'
  switch (action) {
    case 'login': {
      const id = String(payload.staffId || '').trim()
      if (!id || !payload.password) return fail('missing')
      if (id.toUpperCase() !== DEMO_LOGIN.staffId || payload.password !== DEMO_LOGIN.password) return fail('invalid')
      return { ok: true, token: 'demo-token', staff: DEMO_STAFF, expiresAt: now() + 18 * 3600e3, stats: stats() }
    }
    case 'stats':
      return authed ? { ok: true, staff: DEMO_STAFF, stats: stats() } : fail('unauthorized')
    case 'checkin': {
      if (!authed) return fail('unauthorized')
      const scanned = String(payload.code || '').trim()
      if (!scanned) return fail('missing')
      const list = candidates(scanned)
      const t = list.map((c) => SAMPLE_TICKETS.find((x) => x.code === c)).find(Boolean)
      let result = 'not_found'
      if (t) {
        const v = view(t)
        if (INVALID_STATUS.test(v.status)) result = 'not_valid'
        else if (v.checkedInAt) result = 'already_checked_in'
        else {
          const state = getState()
          state[t.code] = { at: now(), by: `${DEMO_STAFF.name} (${DEMO_STAFF.id})` }
          save(state)
          result = 'checked_in'
        }
      }
      return { ok: true, result, scanned: scanned.slice(0, 120), ticket: t ? view(t) : null, stats: stats() }
    }
    case 'undo': {
      if (!authed) return fail('unauthorized')
      const code = String(payload.code || '').trim().toUpperCase()
      const state = getState()
      const s = state[code]
      if (!s || now() - s.at > UNDO_MS) return fail('undo_not_allowed')
      delete state[code]
      save(state)
      const t = SAMPLE_TICKETS.find((x) => x.code === code)
      return { ok: true, result: 'undone', ticket: view(t), stats: stats() }
    }
    default:
      return fail('bad_request')
  }
}
