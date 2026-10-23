/**
 * The KHQR for paying for tickets, as a picture, for the ticket form (/buy).
 *
 *   GET /api/khqr              the picture (JPEG, as Telegram stores photos)
 *   GET /api/khqr?download=1   the same picture, saved as CoStars-KHQR.jpg
 *
 * It is the KHQR an admin gave the bot with /setkhqr ticket. The bot hands it over as a
 * data URL (Apps Script ?action=khqr); this turns it into a normal picture address, so the
 * form can show it, Vercel can cache it and customers can save it to their phone.
 */
import { API_URL } from '../public/ticketing/config.js'

const BOT_API = process.env.COSTARS_API_URL || API_URL
const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/

async function fetchWithTimeout(url, ms = 25000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { redirect: 'follow', signal: ctrl.signal })
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
  const url = new URL(req.url, 'http://localhost')
  let info
  try {
    const answer = await fetchWithTimeout(`${BOT_API}?action=khqr`)
    if (!answer.ok) throw new Error(`HTTP ${answer.status}`)
    info = JSON.parse(await answer.text())
  } catch (err) {
    console.error('KHQR lookup failed:', err && err.message)
    return sendJson(res, 502, { ok: false, error: 'bot_unreachable' })
  }

  const m = info && info.ok ? DATA_URL.exec(String(info.image || '')) : null
  if (!m) return sendJson(res, 404, { ok: false, error: (info && info.error) || 'no_khqr' })

  const bytes = Buffer.from(m[2], 'base64')
  const ext = m[1] === 'image/png' ? 'png' : m[1] === 'image/webp' ? 'webp' : 'jpg'
  res.statusCode = 200
  res.setHeader('Content-Type', m[1])
  res.setHeader('Content-Length', String(bytes.length))
  // Vercel keeps the picture for 5 minutes and serves the old one while it fetches a new
  // one, so a KHQR changed with /setkhqr shows on the form within a few minutes.
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400')
  if (url.searchParams.has('download')) res.setHeader('Content-Disposition', `attachment; filename="CoStars-KHQR.${ext}"`)
  res.end(bytes)
}
