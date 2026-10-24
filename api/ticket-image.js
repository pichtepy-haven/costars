/**
 * The designed CoStars ticket as a PNG picture.
 *
 *   GET /api/ticket-image?c=<ticket code>          picture the bot sends in Telegram (640 × 1320)
 *   GET /api/ticket-image?c=<code>&s=2&download=1  "Save image" on the ticket page (1280 × 2640)
 *   GET /api/ticket-image?demo=1                   sample ticket, to check the design after a deploy
 *   GET /api/ticket-image?check=1                  {ok, api}: lets the bot check this website talks to it
 *
 * The ticket code is signed by the bot, so the details come from the bot
 * (Apps Script ?action=ticket) and nobody can make a picture of another ticket.
 * The drawing is the same one the ticket page shows (public/ticketing/ticket-svg.js).
 */
import { access, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildTicketSvg, TICKET_W } from '../public/ticketing/ticket-svg.js'
import { API_URL, SITE_URL } from '../public/ticketing/config.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const FONT_DIR = join(HERE, '_fonts')
const POPPINS = ['Poppins-Regular.ttf', 'Poppins-Medium.ttf', 'Poppins-Bold.ttf', 'Poppins-Italic.ttf'].map((f) => join(FONT_DIR, f))
const BOT_API = process.env.COSTARS_API_URL || API_URL
const CODE = /^(\d{4,6}-\d{1,2})_([A-Za-z0-9_-]{12})$/
const KHMER = /[ក-៿᧠-᧿]/

const exists = (p) => access(p).then(() => true, () => false)

/* ---------------------------------------------------------- Khmer font */

let khmerFontPath = null

/** Hanuman Bold: bundled in api/_fonts, or downloaded once from Google Fonts and kept in /tmp. */
async function khmerFont() {
  if (khmerFontPath) return khmerFontPath
  for (const p of [join(FONT_DIR, 'Hanuman-Bold.ttf'), join(tmpdir(), 'costars-Hanuman-Bold.ttf')]) {
    if (await exists(p)) return (khmerFontPath = p)
  }
  // Google Fonts sends TrueType files to clients it doesn't know as browsers.
  const agents = [undefined, 'Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.0.9.2372 Mobile Safari/537.10+']
  for (const ua of agents) {
    try {
      const css = await fetchText('https://fonts.googleapis.com/css2?family=Hanuman:wght@700', ua ? { 'User-Agent': ua } : {})
      const faces = css.split('@font-face').slice(1)
      const face = faces.find((f) => /khmer|U\+1780/i.test(f)) || faces[0] || ''
      const m = face.match(/url\((https:[^)]+)\)\s*format\(['"](?:truetype|opentype)['"]\)/)
      if (!m) continue
      const res = await fetchWithTimeout(m[1], {}, 8000)
      if (!res.ok) continue
      const target = join(tmpdir(), 'costars-Hanuman-Bold.ttf')
      await writeFile(target, Buffer.from(await res.arrayBuffer()))
      return (khmerFontPath = target)
    } catch (err) {
      console.warn('Khmer font download failed:', err && err.message)
    }
  }
  return null
}

/* ---------------------------------------------------------- helpers */

async function fetchWithTimeout(url, headers = {}, ms = 12000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { headers, redirect: 'follow', signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}
async function fetchText(url, headers) {
  const res = await fetchWithTimeout(url, headers)
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`)
  return res.text()
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

/** Ticket details from the bot, in the shape buildTicketSvg wants. */
async function ticketFromBot(code) {
  // ?code= because Apps Script reserves the parameter names c and sid.
  const text = await fetchText(`${BOT_API}?action=ticket&code=${encodeURIComponent(code)}`)
  let info
  try {
    info = JSON.parse(text)
  } catch {
    throw new Error('The bot answered something that is not JSON')
  }
  if (!info.ok) return { error: info.error || 'invalid' }
  const tk = info.ticket
  const ev = info.event || {}
  return {
    ticket: {
      url: info.url,
      name: tk.name,
      ticketId: tk.id,
      orderId: tk.order,
      guestNo: tk.guestNo,
      guests: tk.guests,
      type: tk.type,
      status: tk.status,
      checkedInAt: tk.checkedInAt,
      event: { dateLabel: ev.dateLabel || undefined, timeLabel: ev.time || undefined, venue: ev.venue || undefined, venueArea: ev.venueArea || undefined },
    },
  }
}

const DEMO = {
  url: `${SITE_URL}/t/0000-1_DEMODEMODEMO`,
  name: 'Sokha Dara',
  ticketId: '0000-1',
  orderId: 'CS-0000',
  guestNo: 1,
  guests: 1,
  type: 'INDIVIDUAL',
  status: 'VALID',
}

/** SVG → PNG with resvg (loaded only when a picture is drawn). */
async function renderPng(svg, width, fontFiles) {
  const mod = await import('@resvg/resvg-js')
  const Resvg = mod.Resvg || (mod.default && mod.default.Resvg)
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Poppins', sansSerifFamily: 'Poppins' },
  })
  return await resvg.render().asPng()
}

/* ---------------------------------------------------------- handler */

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const q = url.searchParams
  if (q.has('check')) return sendJson(res, 200, { ok: true, api: BOT_API, site: SITE_URL, version: 1 })

  let ticket
  if (q.has('demo')) {
    ticket = { ...DEMO, name: q.get('name') ? String(q.get('name')).slice(0, 60) : DEMO.name, type: q.get('group') ? 'GROUP' : 'INDIVIDUAL', guests: q.get('group') ? 5 : 1 }
  } else {
    const code = String(q.get('c') || '').trim()
    if (!CODE.test(code)) return sendJson(res, 400, { ok: false, error: 'bad_code' })
    try {
      const got = await ticketFromBot(code)
      if (got.error) return sendJson(res, 404, { ok: false, error: got.error })
      ticket = got.ticket
    } catch (err) {
      console.error('ticket lookup failed:', err && err.message)
      return sendJson(res, 502, { ok: false, error: 'bot_unreachable' })
    }
  }

  try {
    const scale = Math.min(3, Math.max(1, Math.round(Number(q.get('s')) || 1)))
    const svg = buildTicketSvg(ticket)
    const fonts = POPPINS.slice()
    const ev = ticket.event || {}
    if (KHMER.test(`${ticket.name} ${ev.venue || ''} ${ev.venueArea || ''}`)) {
      const k = await khmerFont()
      if (k) fonts.push(k)
    }
    const png = await renderPng(svg, TICKET_W * scale, fonts)
    res.statusCode = 200
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Length', String(png.length))
    // Short cache: the picture shows "Checked in" once the guest is scanned.
    res.setHeader('Cache-Control', q.has('demo') ? 'public, max-age=300' : 'public, max-age=0, s-maxage=30')
    if (q.has('download')) res.setHeader('Content-Disposition', `attachment; filename="CoStars-ticket-${ticket.ticketId}.png"`)
    res.end(png)
  } catch (err) {
    console.error('ticket picture failed:', err && (err.stack || err.message))
    sendJson(res, 500, { ok: false, error: 'render_failed' })
  }
}
