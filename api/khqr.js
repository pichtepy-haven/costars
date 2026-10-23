/**
 * The bot's payment KHQR as a picture, for the payment step of the ticket form.
 *
 *   GET /api/khqr?v=<fingerprint>              the ticket KHQR (image/jpeg or image/png)
 *   GET /api/khqr?v=<fingerprint>&download=1   the same, as a file to save
 *   GET /api/khqr?kind=donation                the donation KHQR (the ticket one if none is set)
 *
 * The bot (Apps Script ?action=khqr) downloads the photo from Telegram, so the
 * bot token never reaches the website. v is the fingerprint the ticket form
 * gets from the bot: it changes when an admin sends a new KHQR, so Vercel's
 * cache can keep each version for a day.
 */
import { API_URL } from '../public/ticketing/config.js'

const BOT_API = process.env.COSTARS_API_URL || API_URL

async function fetchJson(url, ms = 15000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, { redirect: 'follow', signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export default async function handler(req, res) {
  const q = new URL(req.url, 'http://localhost').searchParams
  const kind = q.get('kind') === 'donation' ? 'donation' : 'ticket'
  let got
  try {
    got = await fetchJson(`${BOT_API}?action=khqr&kind=${kind}`)
  } catch (err) {
    console.error('KHQR lookup failed:', err && err.message)
    return sendJson(res, 502, { ok: false, error: 'bot_unreachable' })
  }
  if (!got || !got.ok || !got.data) return sendJson(res, 404, { ok: false, error: (got && got.error) || 'no_khqr' })

  const img = Buffer.from(String(got.data), 'base64')
  const mime = got.mime === 'image/png' ? 'image/png' : 'image/jpeg'
  res.statusCode = 200
  res.setHeader('Content-Type', mime)
  res.setHeader('Content-Length', String(img.length))
  // A versioned address keeps for a day at Vercel's edge; without v, only for a few minutes.
  res.setHeader('Cache-Control', q.get('v') ? 'public, max-age=3600, s-maxage=86400' : 'public, max-age=60, s-maxage=300')
  // Telegram's "Save" (WebApp.downloadFile) needs a file it may fetch from its own pages.
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (q.has('download')) res.setHeader('Content-Disposition', `attachment; filename="CoStars-KHQR.${mime === 'image/png' ? 'png' : 'jpg'}"`)
  res.end(img)
}
