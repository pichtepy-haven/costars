// The staff login is kept on this phone only until it expires or the person logs out.
const KEY = 'costars-staff-session-v1'
const LAST_ID = 'costars-staff-last-id'

export function loadSession() {
  try {
    const s = JSON.parse(window.localStorage.getItem(KEY) || 'null')
    if (s && typeof s.token === 'string' && s.expiresAt > Date.now() && s.staff) return s
    window.localStorage.removeItem(KEY)
  } catch {
    /* storage unavailable */
  }
  return null
}

export function saveSession(session) {
  try {
    // Totals are not stored: after a reload they are fetched fresh, never shown stale.
    const { token, staff, expiresAt } = session
    window.localStorage.setItem(KEY, JSON.stringify({ token, staff, expiresAt }))
    window.localStorage.setItem(LAST_ID, session.staff.id)
  } catch {
    /* storage unavailable (private mode): the login lasts until the tab closes */
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export function lastStaffId() {
  try {
    return window.localStorage.getItem(LAST_ID) || ''
  } catch {
    return ''
  }
}
