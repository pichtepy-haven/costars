/**
 * CoStars ticket artwork.
 *
 * buildTicketSvg(ticket) returns one SVG string. The same drawing is used by
 *  • the ticket page (/t/<code>), shown inline in the browser, and
 *  • /api/ticket-image, turned into the PNG the Telegram bot sends.
 *
 * The picture is the designed ticket as a background image, with only the live parts drawn
 * on top: holder name, QR code, ticket code, status (Verified / Checked in), Event Date,
 * Event Venue and the "With Sincere Appreciation" note. Everything else (logo, Ticket Holder,
 * General Admission, frames, boxes, icons, Angkor) is in the background, ticket-bg.jpg in this
 * folder. The ticket page shows it cut to the ticket's outline (TICKET_OUTLINE in art.js);
 * /api/ticket-image puts it on white.
 * Positions below are measured on the design (3392 × 6250 px) and scaled to 640 × 1180.
 *
 * ticket = {
 *   url:       text inside the QR (the ticket page address)
 *   name:      ticket holder (Latin or Khmer)
 *   ticketId:  '0002-1'   orderId: 'CS-0002'   guestNo: 1
 *   status:    'VALID' | 'CHECKED_IN'    checkedInAt: '16:42' (optional)
 *   event: { ymd: '2026-12-05', dateLabel, timeLabel, venue, venueArea }
 * }
 * Fonts: Poppins Bold (name) and Cabin 400/500/700 (the rest). Khmer falls back to Kantumruy Pro.
 */
import { encodeQR } from './qr.js'
import { CABIN, EXTRA, POPPINS, TICKET_OUTLINE } from './art.js'

export const TICKET_W = 640
export const TICKET_H = 1180
/** Background used by the ticket page. /api/ticket-image passes the same file as a data: URL. */
export const TICKET_BG = '/ticketing/ticket-bg.jpg'

const INK = '#342D2D'
const GREEN = '#B7E79C'
const AMBER = '#E3B676'
const KHMER = /[ក-៿᧠-᧿]/

export const DEFAULT_EVENT = {
  ymd: '2026-12-05',
  dateLabel: 'Sat, 5 Dec 2026',
  timeLabel: '4:30 PM to 8:30 PM',
  venue: 'Sabay Cinema, Aeon Mall Mean Chey',
  venueArea: 'Phnom Penh, Cambodia',
}

/** The thank-you note, line by line as in the design (justified, last line left). */
const THANKS = {
  title: 'With Sincere Appreciation',
  lines: [
    'On behalf of the CoStars team, we sincerely thank you',
    'for being part of our charity concert. Your presence and',
    'support mean a great deal to us and to the children at',
    'L’aang Primary School. Through your participation, you',
    'are helping us support their education and create a',
    'better learning environment. We are truly grateful to',
    'have you join us for this meaningful event.',
  ],
}

/* ------------------------------------------------------------ layout */

// Design pixels → ticket units.
const DX = TICKET_W / 3392
const DY = TICKET_H / 6250
const X = (px) => Math.round(px * DX * 100) / 100
const Y = (px) => Math.round(px * DY * 100) / 100

const CX = X(1696)
const NAME = { y: Y(1767), size: X(295), track: -0.065, maxW: 440 }
const QR_BOX = { x: X(1053), y: Y(2358), size: X(1284), r: X(90) }
const CODE = { y: Y(3770), size: X(112), track: -0.071 }
const STATUS = { y: Y(3859), w: X(755), h: Y(120), base: Y(3943), size: X(72) }
const BOX = { x: X(933), maxW: X(762) } // text inside the Event Date / Event Venue boxes
const HEAD = { size: X(73), track: -0.01 }
const DATE = { head: Y(4306), value: Y(4394), size: X(48) }
const VENUE = { head: Y(4642), lines: [Y(4725), Y(4769)], size: X(42) }
const NOTE = { x0: X(1928), x1: X(2764), head: Y(4264), headSize: X(65), first: Y(4365), lead: Y(4365 + 41.83) - Y(4365), size: X(39.5), track: -0.035 }

const POPPINS_FONT = "Poppins, 'Kantumruy Pro'"
const CABIN_FONT = "Cabin, 'Kantumruy Pro'"
const fontFor = (text, latin) => (KHMER.test(text) ? "'Kantumruy Pro', " + latin.split(',')[0] : latin)

/* ------------------------------------------------------------ text helpers */

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const n2 = (v) => Math.round(v * 100) / 100

const isKhmerZeroWidth = (c) => (c >= 0x17b7 && c <= 0x17bd) || (c >= 0x17c6 && c <= 0x17d3) || c === 0x17dd

/**
 * Approximate width of a text run in px (Poppins or Cabin metrics; Khmer estimated).
 * spacing is the letter spacing in px.
 */
export function textWidth(str, weight = 'regular', size = 16, spacing = 0, family = 'poppins') {
  const fam = family === 'cabin' ? CABIN : POPPINS
  const table = fam[weight] || fam.regular
  const extra = (EXTRA[family] || {})[weight] || {}
  let units = 0
  let count = 0
  let afterCoeng = false
  for (const ch of String(str)) {
    const c = ch.codePointAt(0)
    count++
    if (afterCoeng) { afterCoeng = false; continue } // subscript consonant sits under the previous one
    if (c === 0x17d2) { afterCoeng = true; continue }
    if (c >= 32 && c < 127) units += table[c - 32]
    else if (extra[c]) units += extra[c]
    else if (c >= 0x1780 && c <= 0x17ff) units += isKhmerZeroWidth(c) ? 0 : 640
    else units += 620
  }
  return (units / 1000) * size + spacing * Math.max(0, count - 1)
}

/** Splits text into at most maxLines lines that fit maxWidth; the last line gets "…" if cut. */
export function wrapText(str, weight, size, maxWidth, maxLines = 2, spacing = 0, family = 'poppins') {
  const width = (s) => textWidth(s, weight, size, spacing, family)
  const words = String(str).trim().split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''
  for (const word of words) {
    const next = current ? current + ' ' + word : word
    if (width(next) <= maxWidth || !current) current = next
    else { lines.push(current); current = word }
  }
  if (current) lines.push(current)
  const cut = (line) => {
    let l = line
    while (l.length > 1 && width(l + '…') > maxWidth) l = l.slice(0, -1)
    return l.trimEnd() + '…'
  }
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = cut(kept[maxLines - 1] + ' ' + lines.slice(maxLines).join(' '))
    return kept
  }
  return lines.map((line) => (width(line) <= maxWidth ? line : cut(line)))
}

/** One line in a box: the design size if it fits, else smaller (down to minSize), else cut with "…". */
function fitLine(text, weight, size, maxW, minSize) {
  const t = String(text || '').trim()
  const w = textWidth(t, weight, size, 0, 'cabin')
  if (w <= maxW) return { text: t, size }
  const smaller = (size * maxW) / w
  if (smaller >= minSize) return { text: t, size: smaller }
  return { text: wrapText(t, weight, minSize, maxW, 1, 0, 'cabin')[0] || '', size: minSize }
}

/** Picks a font size (and one or two lines) so the holder name fits. */
function fitName(name) {
  const khmer = KHMER.test(name)
  const track = khmer ? 0 : NAME.track // letter spacing would pull Khmer marks apart
  const perPx = textWidth(name, 'bold', 1, track)
  const size = Math.min(khmer ? 42 : NAME.size, NAME.maxW / perPx)
  const oneWord = !/\s/.test(name.trim())
  if (size >= (khmer ? 24 : 29) || oneWord) {
    const s = Math.max(size, 20)
    const lines = s > size ? wrapText(name, 'bold', s, NAME.maxW, 1, track * s) : [name]
    return { lines, size: s, track, khmer }
  }
  const s = khmer ? 24 : 29
  return { lines: wrapText(name, 'bold', s, NAME.maxW, 2, track * s), size: s, track, khmer }
}

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']

/** "4:30 PM to 8:30 PM" → "4:30 PM" (the design shows the start time). */
function startTime(text) {
  const s = String(text || '').trim()
  const m = s.match(/(\d{1,2}(?::\d{2})?)\s*(am|pm)?/i)
  if (!m) return s
  const ap = (m[2] || (s.match(/\b(am|pm)\b/i) || [])[1] || '').toUpperCase()
  return ap ? `${m[1]} ${ap}` : m[1]
}

/** "Sat, 5 Dec 2026" or "Saturday, 5th December 2026" → "2026-12-05" ('' if it can't tell). */
function ymdFrom(label) {
  const m = String(label || '').match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3})[A-Za-z]*\.?,?\s+(\d{4})/)
  const month = m ? MONTHS.findIndex((name) => name.startsWith(m[2].toUpperCase())) + 1 : 0
  return month ? `${m[3]}-${String(month).padStart(2, '0')}-${m[1].padStart(2, '0')}` : ''
}

/** The Event Date line as in the design: "On 05th DECEMBER 2026 | 4:30 PM". */
function dateLine(ev) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ev.ymd || ''))
  let date = ev.dateLabel || ''
  if (m && Number(m[2]) >= 1 && Number(m[2]) <= 12) {
    const day = Number(m[3])
    const teen = day % 100 >= 11 && day % 100 <= 13
    const suffix = teen ? 'th' : ['th', 'st', 'nd', 'rd'][day % 10] || 'th'
    date = `On ${m[3]}${suffix} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`
  }
  return [date, startTime(ev.timeLabel)].filter(Boolean).join(' | ')
}

/** Justified lines: first word on the left edge, last word on the right edge, even gaps between. */
function justified(lines, { x0, x1, y, lead, size, track }) {
  return lines
    .map((line, i) => {
      const yy = n2(y + i * lead)
      const words = line.split(' ')
      if (i === lines.length - 1 || words.length < 2) return `<text x="${x0}" y="${yy}">${esc(line)}</text>`
      const widths = words.map((w) => textWidth(w, 'regular', size, track * size, 'cabin'))
      const gap = (x1 - x0 - widths.reduce((a, b) => a + b, 0)) / (words.length - 1)
      let x = x0
      return words
        .map((w, k) => {
          const el = k === words.length - 1 ? `<text x="${x1}" y="${yy}" text-anchor="end">${esc(w)}</text>` : `<text x="${n2(x)}" y="${yy}">${esc(w)}</text>`
          x += widths[k] + gap
          return el
        })
        .join('')
    })
    .join('')
}

/** QR modules as one path (each dark module is a square). */
function qrPath(modules, x, y, m) {
  let d = ''
  modules.forEach((row, j) => {
    let i = 0
    while (i < row.length) {
      if (!row[i]) { i++; continue }
      let k = i
      while (k < row.length && row[k]) k++
      d += `M${x + i * m} ${y + j * m}h${(k - i) * m}v${m}h${-(k - i) * m}Z`
      i = k
    }
  })
  return d
}

/* -------------------------------------------------------------- the ticket */

export function buildTicketSvg(t, { scale = 1, idPrefix = 'cs', transparent = false, title = '', background = TICKET_BG } = {}) {
  const given = Object.fromEntries(Object.entries(t.event || {}).filter(([, v]) => v != null && v !== ''))
  const ev = { ...DEFAULT_EVENT, ...given }
  if (given.dateLabel && !given.ymd) ev.ymd = ymdFrom(given.dateLabel) // never mix a new date label with the default date
  const W = TICKET_W
  const H = TICKET_H
  const checked = t.status === 'CHECKED_IN'

  // Holder name: one line, or two for long names, centred on the design's line.
  const fit = fitName(String(t.name || 'Guest').trim() || 'Guest')
  const nameFont = fit.khmer ? "'Kantumruy Pro', Poppins" : POPPINS_FONT
  const capMid = NAME.y - 0.3525 * NAME.size
  const firstY = fit.lines.length > 1 ? capMid - 0.1975 * fit.size : capMid + 0.3525 * fit.size
  const name = fit.lines
    .map((line, i) => `<text x="${CX}" y="${n2(firstY + i * fit.size * 1.1)}">${esc(line)}</text>`)
    .join('')
  const nameSvg = `<g text-anchor="middle" font-family="${nameFont}" font-weight="700" font-size="${n2(fit.size)}" letter-spacing="${n2(fit.track * fit.size)}" fill="${INK}">${name}</g>`

  // QR code in a white square where the design has the dark placeholder. Whole-pixel modules.
  const qr = encodeQR(t.url || 'https://costars-guide.vercel.app', 'M')
  const m = Math.max(1, Math.floor((QR_BOX.size - 24) / qr.size))
  const side = m * qr.size
  const qx = Math.round(QR_BOX.x + (QR_BOX.size - side) / 2)
  const qy = Math.round(QR_BOX.y + (QR_BOX.size - side) / 2)
  const qrSvg = `
    <rect x="${QR_BOX.x}" y="${QR_BOX.y}" width="${QR_BOX.size}" height="${QR_BOX.size}" rx="${QR_BOX.r}" fill="#FFFFFF"/>
    <path d="${qrPath(qr.modules, qx, qy, m)}" fill="${INK}" shape-rendering="crispEdges"/>`

  // Ticket code under the QR (staff type it when a QR won't scan).
  const codeText = `${t.orderId || 'CS-' + String(t.ticketId || '').split('-')[0]}-${t.guestNo || 1}`
  const code = `<text x="${CX}" y="${CODE.y}" text-anchor="middle" font-family="${CABIN_FONT}" font-weight="400" font-size="${CODE.size}" letter-spacing="${n2(CODE.track * CODE.size)}" fill="${INK}">${esc(codeText)}</text>`

  // Status pill: Verified, or Checked in 16:42 once scanned at the door.
  const statusText = checked ? `Checked in${t.checkedInAt ? ' ' + t.checkedInAt : ''}` : 'Verified'
  const statusW = Math.max(STATUS.w, textWidth(statusText, 'bold', STATUS.size, 0, 'cabin') + 44)
  const status = `
    <rect x="${n2(CX - statusW / 2)}" y="${STATUS.y}" width="${n2(statusW)}" height="${STATUS.h}" rx="${n2(STATUS.h / 2)}" fill="${checked ? AMBER : GREEN}"/>
    <text x="${CX}" y="${STATUS.base}" text-anchor="middle" font-family="${CABIN_FONT}" font-weight="700" font-size="${STATUS.size}" fill="#FFFFFF">${esc(statusText)}</text>`

  // Event Date and Event Venue, inside the beige boxes.
  const dateValue = fitLine(dateLine(ev), 'regular', DATE.size, BOX.maxW, X(40))
  const venueLines = [ev.venue, ev.venueArea].filter(Boolean).map((line) => fitLine(line, 'medium', VENUE.size, BOX.maxW, X(36)))
  const head = (y, text) => `<text x="${BOX.x}" y="${y}" font-family="${CABIN_FONT}" font-weight="700" font-size="${HEAD.size}" letter-spacing="${n2(HEAD.track * HEAD.size)}" fill="${INK}">${text}</text>`
  const details = `
    ${head(DATE.head, 'Event Date')}
    <text x="${BOX.x}" y="${DATE.value}" font-family="${fontFor(dateValue.text, CABIN_FONT)}" font-weight="400" font-size="${n2(dateValue.size)}" fill="${INK}">${esc(dateValue.text)}</text>
    ${head(VENUE.head, 'Event Venue')}
    ${venueLines.map((l, i) => `<text x="${BOX.x}" y="${VENUE.lines[i]}" font-family="${fontFor(l.text, CABIN_FONT)}" font-weight="500" font-size="${n2(l.size)}" fill="${INK}">${esc(l.text)}</text>`).join('')}`

  // With Sincere Appreciation.
  const note = `
    <text x="${X(1927)}" y="${NOTE.head}" font-family="${CABIN_FONT}" font-weight="700" font-size="${NOTE.headSize}" letter-spacing="${n2(HEAD.track * NOTE.headSize)}" fill="${INK}">${esc(THANKS.title)}</text>
    <g font-family="${CABIN_FONT}" font-weight="400" font-size="${NOTE.size}" letter-spacing="${n2(NOTE.track * NOTE.size)}" fill="${INK}">${justified(THANKS.lines, { x0: NOTE.x0, x1: NOTE.x1, y: NOTE.first, lead: NOTE.lead, size: NOTE.size, track: NOTE.track })}</g>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W * scale}" height="${H * scale}" viewBox="0 0 ${W} ${H}"${title ? ' role="img"' : ''}>
  ${title ? `<title>${esc(title)}</title>` : ''}
  <defs><clipPath id="${idPrefix}-outline"><path d="${TICKET_OUTLINE}"/></clipPath></defs>
  ${transparent ? '' : `<rect width="${W}" height="${H}" fill="#FFFFFF"/>`}
  ${background ? `<image x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" href="${esc(background)}" clip-path="url(#${idPrefix}-outline)"/>` : ''}
  ${nameSvg}
  ${qrSvg}
  ${code}
  ${status}
  ${details}
  ${note}
</svg>`
}
