/**
 * Talking to the CoStars bot (Google Apps Script web app).
 * GET for public data, POST with a text/plain body for everything signed by
 * Telegram (a "simple" request, so the browser needs no CORS preflight).
 */
import { apiUrl } from './config.js'

export class ApiError extends Error {
  constructor(kind, message) {
    super(message || kind)
    this.kind = kind // 'network' | 'timeout' | 'server'
  }
}

async function call(url, init, timeoutMs) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null
  try {
    const res = await fetch(url, { ...init, redirect: 'follow', signal: ctrl ? ctrl.signal : undefined })
    if (!res.ok) throw new ApiError('server', `HTTP ${res.status}`)
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      throw new ApiError('server', 'Unexpected answer from the bot')
    }
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err && err.name === 'AbortError') throw new ApiError('timeout')
    throw new ApiError('network', err && err.message)
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** Public data: ?action=info or ?action=ticket&c=<code>. Retries once on a network hiccup. */
export async function apiGet(params, { timeoutMs = 20000 } = {}) {
  const url = new URL(apiUrl())
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  try {
    return await call(url.toString(), { method: 'GET' }, timeoutMs)
  } catch (err) {
    if (err.kind === 'server') throw err
    return call(url.toString(), { method: 'GET' }, timeoutMs)
  }
}

/** Signed requests from pages opened inside Telegram. Never retried automatically. */
export function apiPost(body, { timeoutMs = 30000 } = {}) {
  return call(apiUrl(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }, timeoutMs)
}
