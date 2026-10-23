import { CHECKIN_API_URL, DEMO_MODE } from './config.js'
import { demoApi } from './demo.js'

export class ApiError extends Error {
  constructor(code, extra = {}) {
    super(code)
    this.code = code
    Object.assign(this, extra)
  }
}

/**
 * Calls the check-in web app. Sent as text/plain so the browser makes a
 * "simple" request (no CORS pre-flight, which Apps Script can't answer).
 */
export async function callApi(action, payload = {}, { timeout = 25000 } = {}) {
  if (DEMO_MODE) {
    const data = await demoApi(action, payload)
    if (!data.ok) throw new ApiError(data.error, data)
    return data
  }
  if (!CHECKIN_API_URL) throw new ApiError('not_configured')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  let res
  try {
    res = await fetch(CHECKIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
    })
  } catch (err) {
    throw new ApiError(err && err.name === 'AbortError' ? 'timeout' : 'network')
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) throw new ApiError('http', { status: res.status })
  let data
  try {
    data = await res.json()
  } catch {
    throw new ApiError('bad_response')
  }
  if (!data || data.ok !== true) throw new ApiError((data && data.error) || 'unknown', data || {})
  return data
}

/** Plain-language message for an ApiError. */
export function describeError(err) {
  switch (err && err.code) {
    case 'missing':
      return 'Enter your Staff ID and password.'
    case 'invalid':
      return 'Staff ID or password is incorrect.'
    case 'locked':
      return `Too many wrong attempts. Try again in ${err.minutes || 10} minute${err.minutes === 1 ? '' : 's'}, or ask the coordinator.`
    case 'unauthorized':
      return 'Your login has ended. Please log in again.'
    case 'busy':
      return 'The check-in system is busy. Try again.'
    case 'undo_not_allowed':
      return 'Only your own check-ins from the last 15 minutes can be undone.'
    case 'network':
      return 'No connection to the check-in system. Check Wi-Fi or mobile data and try again.'
    case 'timeout':
      return 'The check-in system took too long to answer. Try again.'
    case 'not_configured':
      return 'Check-in isn’t connected yet. Ask the coordinator.'
    case 'server':
      return 'The check-in system hit a problem. Try again, or tell the coordinator if it keeps happening.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
