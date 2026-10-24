/**
 * CoStars ticket artwork.
 *
 * buildTicketSvg(ticket) returns one SVG string. The same drawing is used by
 *  • the ticket page (/t/<code>), shown inline in the browser, and
 *  • /api/ticket-image, turned into the PNG the Telegram bot sends.
 *
 * ticket = {
 *   url:       text inside the QR (the ticket page address)
 *   name:      ticket holder (Latin or Khmer)
 *   ticketId:  '0002-1'   orderId: 'CS-0002'
 *   guestNo, guests, type: 'INDIVIDUAL' | 'GROUP'
 *   status:    'VALID' | 'CHECKED_IN'    checkedInAt: '16:42' (optional)
 *   event: { title, tagline, dateLabel, timeLabel, venue, venueArea, quote }
 * }
 * Fonts: Poppins (400, 500, 700, italic) and Hanuman (700) for Khmer.
 */
import { encodeQR } from './qr.js'
import { MUSICIANS, POPPINS } from './art.js'

export const TICKET_W = 640
export const TICKET_H = 1320

const C = {
  page: '#F2EDE4',
  cream: '#FBF6EC',
  paper: '#FFFDF9',
  ink: '#2A2320',
  muted: '#625A55',
  label: '#9B6A4F',
  wine: '#810102',
  wineDeep: '#5A0606',
  wineSoft: '#A43A35',
  gold: '#D69A3C',
  goldSoft: '#E5C394',
  line: '#E6D6C1',
  rose: '#E7C2B4',
  green: '#2F7A35',
  greenBg: '#E2F0DE',
  amber: '#8A5A1E',
  amberBg: '#F5E6CC',
}

const KHMER = /[ក-៿᧠-᧿]/

export const DEFAULT_EVENT = {
  title: 'CHARITY MINI CONCERT',
  tagline: 'Music Brings Us Together',
  dateLabel: 'Sat, 5 Dec 2026',
  timeLabel: '4:00 PM to 7:00 PM',
  venue: 'Venue coming soon',
  venueArea: 'Phnom Penh, Cambodia',
  quote: 'Thank you for being part of something bigger',
}

/* ------------------------------------------------------------ text helpers */

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const isKhmerZeroWidth = (c) => (c >= 0x17b7 && c <= 0x17bd) || (c >= 0x17c6 && c <= 0x17d3) || c === 0x17dd
// Vowel signs written beside the consonant (ា េ ែ ៃ ោ ៅ ...): about half as wide as a consonant in Hanuman.
const isKhmerSideVowel = (c) => c === 0x17b6 || (c >= 0x17be && c <= 0x17c5)

/** Approximate width of a text run in px (Poppins metrics; Khmer from Hanuman Bold averages). */
export function textWidth(str, weight = 'regular', size = 16, spacing = 0) {
  const table = POPPINS[weight] || POPPINS.regular
  let units = 0
  let count = 0
  let afterCoeng = false
  for (const ch of String(str)) {
    const c = ch.codePointAt(0)
    count++
    if (afterCoeng) { afterCoeng = false; continue } // subscript consonant sits under the previous one
    if (c === 0x17d2) { afterCoeng = true; continue }
    if (c >= 32 && c < 127) units += table[c - 32]
    else if (c >= 0x1780 && c <= 0x17ff) units += isKhmerZeroWidth(c) ? 0 : isKhmerSideVowel(c) ? 320 : 730
    else units += 620
  }
  return (units / 1000) * size + spacing * Math.max(0, count - 1)
}

/** Splits text into at most maxLines lines that fit maxWidth; the last line gets "…" if cut. */
export function wrapText(str, weight, size, maxWidth, maxLines = 2, spacing = 0) {
  const words = String(str).trim().split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''
  for (const word of words) {
    const next = current ? current + ' ' + word : word
    if (textWidth(next, weight, size, spacing) <= maxWidth || !current) current = next
    else { lines.push(current); current = word }
  }
  if (current) lines.push(current)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    let last = kept[maxLines - 1] + ' ' + lines.slice(maxLines).join(' ')
    while (last.length > 1 && textWidth(last + '…', weight, size, spacing) > maxWidth) last = last.slice(0, -1)
    kept[maxLines - 1] = last.trimEnd() + '…'
    return kept
  }
  return lines.map((line) => {
    let l = line
    if (textWidth(l, weight, size, spacing) <= maxWidth) return l
    while (l.length > 1 && textWidth(l + '…', weight, size, spacing) > maxWidth) l = l.slice(0, -1)
    return l + '…'
  })
}

/** Picks a font size (and one or two lines) so the holder name fits. */
function fitName(name) {
  const khmer = KHMER.test(name)
  const maxW = 476
  const one = textWidth(name, 'bold', 1)
  let size = Math.min(khmer ? 30 : 34, maxW / one)
  if (size >= 22) return { lines: [name], size, khmer }
  size = khmer ? 24 : 26
  return { lines: wrapText(name, 'bold', size, maxW, 2), size, khmer }
}

/* -------------------------------------------------------------- drawings */

const star4 = (x, y, r, fill, opacity = 1) =>
  `<path transform="translate(${x} ${y}) scale(${r / 12})" fill="${fill}" opacity="${opacity}" d="M0-12C1.6-3.2 3.2-1.6 12 0C3.2 1.6 1.6 3.2 0 12C-1.6 3.2-3.2 1.6-12 0C-3.2-1.6-1.6-3.2 0-12Z"/>`

const diamond = (x, y, r, fill) => `<path fill="${fill}" d="M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}Z"/>`

/** Khmer-style four-petal ornament ("kbach"). */
function ornament(x, y, s, main, dark, light = C.cream) {
  const petal = 'M0-5C5-9 6.5-17 0-27C-6.5-17-5-9 0-5Z'
  const petals = [0, 90, 180, 270]
    .map((a) => `<path transform="rotate(${a})" d="${petal}" fill="${main}" stroke="${dark}" stroke-width="1.1"/>`)
    .join('')
  const leaves = [45, 135, 225, 315]
    .map((a) => `<path transform="rotate(${a})" d="M0-7C3-10 3.5-14 0-17C-3.5-14-3-10 0-7Z" fill="${light}" stroke="${dark}" stroke-width="0.9"/>`)
    .join('')
  return `<g transform="translate(${x} ${y}) scale(${s})">${leaves}${petals}<path d="M0-7L7 0L0 7L-7 0Z" fill="${light}" stroke="${dark}" stroke-width="1.1"/><circle r="2.6" fill="${dark}"/></g>`
}

/** Line icons (Lucide, MIT licence) drawn at 24px and scaled. */
const ICONS = {
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
}
const icon = (name, x, y, size, color, width = 2) =>
  `<g transform="translate(${x} ${y}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g>`

/** One Angkor-style tower: tiered spire on a base. */
function tower(cx, base, w, h) {
  const half = w / 2
  const top = base - h
  const spire = `M${cx - half} ${base}L${cx - half} ${base - h * 0.32}C${cx - half} ${base - h * 0.62} ${cx - w * 0.28} ${base - h * 0.86} ${cx} ${top}C${cx + w * 0.28} ${base - h * 0.86} ${cx + half} ${base - h * 0.62} ${cx + half} ${base - h * 0.32}L${cx + half} ${base}Z`
  const tiers = [0.36, 0.5, 0.63, 0.75, 0.85]
    .map((f) => {
      const yy = base - h * f
      const k = f < 0.5 ? half : half * (1 - (f - 0.32) * 0.9)
      return `M${cx - k - 2} ${yy}L${cx + k + 2} ${yy}`
    })
    .join('')
  return { spire, tiers }
}

function palm(x, base, h, flip = 1) {
  const top = base - h
  const fx = x + 6 * flip
  const trunk = `M${x - 1.6} ${base}C${x + 3 * flip} ${base - h * 0.4} ${x + 1 * flip} ${base - h * 0.75} ${fx - 1.4} ${top}L${fx + 1.4} ${top}C${x + 3 * flip + 3} ${base - h * 0.75} ${x + 5 * flip + 2} ${base - h * 0.4} ${x + 1.6} ${base}Z`
  const leaf = (angle, len) =>
    `<path transform="translate(${fx} ${top}) rotate(${angle})" d="M0 0C${len * 0.3} ${-len * 0.22} ${len * 0.75} ${-len * 0.18} ${len} ${len * 0.12}C${len * 0.7} ${-len * 0.02} ${len * 0.3} ${-len * 0.02} 0 0Z"/>`
  const leaves = [-160, -125, -95, -60, -25, 10, 170].map((a, i) => leaf(a, h * (i % 2 ? 0.42 : 0.5))).join('')
  return `<path d="${trunk}"/>${leaves}`
}

function angkor(y) {
  const parts = [
    tower(320, y, 40, 92),
    tower(268, y, 32, 70),
    tower(372, y, 32, 70),
    tower(226, y, 26, 54),
    tower(414, y, 26, 54),
  ]
  const gallery = `M168 ${y}L168 ${y - 16}L196 ${y - 24}L444 ${y - 24}L472 ${y - 16}L472 ${y}Z`
  const steps = `M150 ${y}L490 ${y}L490 ${y + 8}L150 ${y + 8}Z`
  const fill = '#E7DAC6'
  return `<g opacity="0.85" fill="${fill}">
    <path d="${steps}"/>
    <path d="${gallery}"/>
    ${parts.map((p) => `<path d="${p.spire}"/><path d="${p.tiers}" stroke="${C.cream}" stroke-width="1.6" opacity="0.7" fill="none"/>`).join('')}
    ${palm(126, y + 8, 74, 1)}${palm(156, y + 8, 50, -1)}${palm(514, y + 8, 66, -1)}${palm(486, y + 8, 44, 1)}
  </g>`
}

/** The ticket outline: rounded corners, a notch at the top and the bottom. */
function outline(x0, y0, x1, y1, r, n) {
  const cx = (x0 + x1) / 2
  return [
    `M${x0 + r} ${y0}`,
    `L${cx - n} ${y0}`,
    `A${n} ${n} 0 0 0 ${cx + n} ${y0}`,
    `L${x1 - r} ${y0}`,
    `A${r} ${r} 0 0 1 ${x1} ${y0 + r}`,
    `L${x1} ${y1 - r}`,
    `A${r} ${r} 0 0 1 ${x1 - r} ${y1}`,
    `L${cx + n} ${y1}`,
    `A${n} ${n} 0 0 0 ${cx - n} ${y1}`,
    `L${x0 + r} ${y1}`,
    `A${r} ${r} 0 0 1 ${x0} ${y1 - r}`,
    `L${x0} ${y0 + r}`,
    `A${r} ${r} 0 0 1 ${x0 + r} ${y0}`,
    'Z',
  ].join('')
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

export function buildTicketSvg(t, { scale = 1, idPrefix = 'cs', transparent = false, title = '' } = {}) {
  const ev = { ...DEFAULT_EVENT, ...(t.event || {}) }
  const W = TICKET_W
  const H = TICKET_H
  const id = (s) => `${idPrefix}-${s}`
  const x0 = 20, y0 = 20, x1 = W - 20, y1 = H - 20
  const shape = outline(x0, y0, x1, y1, 22, 24)
  const group = t.type === 'GROUP'
  const checked = t.status === 'CHECKED_IN'

  // --- header -------------------------------------------------------------
  const pleats = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="340" fill="url(#${id('pleat')})"/>`
  const beams = [
    [330, -18, 0.55], [430, -12, 0.75], [540, 8, 0.6], [610, 20, 0.45],
  ]
    .map(([bx, rot, o]) => `<path transform="rotate(${rot} ${bx} 20)" d="M${bx - 14} 20L${bx + 14} 20L${bx + 70} 330L${bx - 70} 330Z" fill="url(#${id('beam')})" opacity="${o}"/>`)
    .join('')
  const dots = [
    [262, 196, 3.2], [300, 150, 2.2], [360, 118, 2.6], [395, 210, 1.8], [470, 160, 2.4], [512, 104, 1.8],
    [560, 182, 2.8], [588, 136, 1.6], [430, 236, 2.2], [500, 226, 1.6], [338, 236, 1.6], [606, 222, 2],
  ]
    .map(([dx, dy, r]) => `<circle cx="${dx}" cy="${dy}" r="${r}" fill="#FFE2B8" opacity="0.55"/>`)
    .join('')
  const sil = `<g transform="translate(206 168) scale(${410 / MUSICIANS.viewBox[0]})"><path fill-rule="evenodd" fill="#140605" d="${MUSICIANS.d}"/></g>`

  // CoStars word mark, drawn like the event guide's (Co / St★rs): tight letters and lines, and the
  // star in the same colour as the text. A thin outline of the same colour makes Poppins Bold read
  // as the guide's ExtraBold in the PNG too, where only the bundled weights exist.
  const logoX = 46
  const F = 47
  const LS = -0.055 * F
  const coY = 92
  const stY = coY + 0.8 * F
  const starSize = 0.64 * F
  const starX = logoX + textWidth('St', 'bold', F, LS) + LS + 0.005 * F
  const starY = stY + 0.035 * F - starSize
  const logo = `
    <g font-family="Poppins" font-weight="700" font-size="${F}" letter-spacing="${LS.toFixed(2)}" fill="${C.ink}" stroke="${C.ink}" stroke-width="1.2" stroke-linejoin="round">
      <text x="${logoX}" y="${coY}">Co</text>
      <text x="${logoX}" y="${stY.toFixed(1)}">St</text>
      <path transform="translate(${starX.toFixed(2)} ${starY.toFixed(2)}) scale(${(starSize / 24).toFixed(4)})" stroke-width="2.2" d="M12 3.6 14.76 9.4 21.13 10.23 16.47 14.65 17.64 20.97 12 17.9 6.36 20.97 7.53 14.65 2.87 10.23 9.24 9.4Z"/>
      <text x="${(starX + starSize + 0.012 * F).toFixed(2)}" y="${stY.toFixed(1)}">rs</text>
    </g>`

  const titleRight = x1 - 26
  const header = `
    <text x="${titleRight}" y="66" text-anchor="end" font-family="Poppins" font-weight="500" font-size="15" letter-spacing="2.4" fill="#FFF6EA">${esc(ev.title)}</text>
    <text x="${titleRight}" y="90" text-anchor="end" font-family="Poppins" font-style="italic" font-weight="400" font-size="14" letter-spacing="0.6" fill="#F4DCC6">${esc(ev.tagline)}</text>
    <path d="M${titleRight - 186} 108H${titleRight - 102}M${titleRight - 84} 108H${titleRight}" stroke="${C.goldSoft}" stroke-width="1.1" opacity="0.9"/>
    ${diamond(titleRight - 93, 108, 5, C.gold)}`

  // --- body ---------------------------------------------------------------
  const cx = W / 2
  const fit = fitName(t.name || 'Guest')
  const nameFont = fit.khmer ? "'Hanuman', Poppins" : 'Poppins'
  const nameY = fit.lines.length > 1 ? 398 : 412
  const nameSvg = fit.lines
    .map((line, i) => `<text x="${cx}" y="${nameY + i * fit.size * 1.12}" text-anchor="middle" font-family="${nameFont}" font-weight="700" font-size="${fit.size.toFixed(1)}" fill="${C.ink}">${esc(line)}</text>`)
    .join('')

  const pillText = group ? 'GROUP ADMISSION' : 'GENERAL ADMISSION'
  const pillW = textWidth(pillText, 'bold', 14, 2.2) + 46
  const pillY = 438
  const pill = `
    <path d="M${cx - pillW / 2 - 70} ${pillY + 17}H${cx - pillW / 2 - 22}M${cx + pillW / 2 + 22} ${pillY + 17}H${cx + pillW / 2 + 70}" stroke="${C.goldSoft}" stroke-width="1.2"/>
    ${diamond(cx - pillW / 2 - 16, pillY + 17, 5, C.wine)}${diamond(cx + pillW / 2 + 16, pillY + 17, 5, C.wine)}
    <rect x="${cx - pillW / 2}" y="${pillY}" width="${pillW}" height="34" rx="17" fill="${C.wine}"/>
    <text x="${cx}" y="${pillY + 22.5}" text-anchor="middle" font-family="Poppins" font-weight="700" font-size="14" letter-spacing="2.2" fill="#FFF4EA">${pillText}</text>`

  // QR code in a white square with wine corner brackets.
  const qr = encodeQR(t.url || 'https://costars-guide.vercel.app', 'M')
  const box = 236
  const boxX = cx - box / 2
  const boxY = 494
  const m = Math.floor((box - 30) / qr.size)
  const qrSide = m * qr.size
  const qrX = cx - qrSide / 2
  const qrY = boxY + (box - qrSide) / 2
  const g = 12 // bracket gap
  const L = 38
  const bx0 = boxX - g, by0 = boxY - g, bx1 = boxX + box + g, by1 = boxY + box + g
  const brackets = `<path fill="none" stroke="${C.wine}" stroke-width="3.4" stroke-linecap="round" d="M${bx0} ${by0 + L}V${by0 + 8}Q${bx0} ${by0} ${bx0 + 8} ${by0}H${bx0 + L}M${bx1 - L} ${by0}H${bx1 - 8}Q${bx1} ${by0} ${bx1} ${by0 + 8}V${by0 + L}M${bx1} ${by1 - L}V${by1 - 8}Q${bx1} ${by1} ${bx1 - 8} ${by1}H${bx1 - L}M${bx0 + L} ${by1}H${bx0 + 8}Q${bx0} ${by1} ${bx0} ${by1 - 8}V${by1 - L}"/>`
  const qrSvg = `
    <rect x="${boxX}" y="${boxY}" width="${box}" height="${box}" rx="12" fill="#FFFFFF" stroke="${C.line}" stroke-width="1"/>
    <path d="${qrPath(qr.modules, qrX, qrY, m)}" fill="#1C1614" shape-rendering="crispEdges"/>
    ${brackets}
    ${star4(cx - 182, boxY + box / 2, 15, C.rose)}${star4(cx - 158, boxY + box / 2 + 34, 6, C.rose, 0.8)}
    ${star4(cx + 182, boxY + box / 2, 15, C.rose)}${star4(cx + 158, boxY + box / 2 - 34, 6, C.rose, 0.8)}`

  const codeText = `${t.orderId || 'CS-' + String(t.ticketId || '').split('-')[0]}-${t.guestNo || 1}`
  const codeY = boxY + box + 50
  const code = `<text x="${cx}" y="${codeY}" text-anchor="middle" font-family="Poppins" font-weight="700" font-size="23" letter-spacing="3.2" fill="${C.ink}">${esc(codeText)}</text>`
  const statusText = checked ? `Checked in${t.checkedInAt ? ' ' + t.checkedInAt : ''}` : 'Valid Ticket'
  const statusW = textWidth(statusText, 'medium', 15) + 60
  const statusY = codeY + 20
  const status = `
    <rect x="${cx - statusW / 2}" y="${statusY}" width="${statusW}" height="32" rx="16" fill="${checked ? C.amberBg : C.greenBg}"/>
    ${icon(checked ? 'clock' : 'check', cx - statusW / 2 + 15, statusY + 7, 18, checked ? C.amber : C.green, 2.3)}
    <text x="${cx - statusW / 2 + 41}" y="${statusY + 21.5}" font-family="Poppins" font-weight="500" font-size="15" fill="${checked ? C.amber : C.green}">${esc(statusText)}</text>`

  // Details panel: date, venue, ticket type, thank-you line.
  const px0 = 56, px1 = W - 56
  const py0 = statusY + 52
  const midX = cx
  const venueLines = wrapText(ev.venue, 'bold', 15.5, px1 - midX - 64, 2)
  const row1 = venueLines.length > 1 ? 114 : 100
  const row2 = 100
  const venueY = py0 + 58
  const venueSvg = venueLines
    .map((line, i) => `<text x="${midX + 52}" y="${venueY + i * 19}" font-family="${KHMER.test(line) ? "'Hanuman', Poppins" : 'Poppins'}" font-weight="700" font-size="15.5" fill="${C.ink}">${esc(line)}</text>`)
    .join('')
  const areaY = venueY + (venueLines.length - 1) * 19 + 4
  const typeValue = group ? `Group of ${t.guests}` : 'Standard'
  // Several Standard tickets bought together also say which guest this QR is for.
  const typeSub = group || t.guests > 1 ? `Guest ${t.guestNo} of ${t.guests}, one QR each` : 'One person, drink included'
  const quoteLines = wrapText(ev.quote, 'italic', 13.5, px1 - midX - 70, 3)
  const label = (x, y, text) => `<text x="${x}" y="${y}" font-family="Poppins" font-weight="500" font-size="11" letter-spacing="2" fill="${C.label}">${text}</text>`
  const details = `
    <rect x="${px0}" y="${py0}" width="${px1 - px0}" height="${row1 + row2}" rx="16" fill="${C.paper}" stroke="${C.line}" stroke-width="1.2"/>
    <path d="M${midX} ${py0 + 18}V${py0 + row1 - 18}M${px0 + 20} ${py0 + row1}H${px1 - 20}M${midX} ${py0 + row1 + 18}V${py0 + row1 + row2 - 18}" stroke="${C.line}" stroke-width="1.2"/>
    ${icon('calendar', px0 + 20, py0 + 22, 22, C.wine, 2)}
    ${label(px0 + 54, py0 + 34, 'EVENT DATE')}
    <text x="${px0 + 54}" y="${py0 + 58}" font-family="Poppins" font-weight="700" font-size="16.5" fill="${C.ink}">${esc(ev.dateLabel)}</text>
    <text x="${px0 + 54}" y="${py0 + 80}" font-family="Poppins" font-weight="400" font-size="13.5" fill="${C.muted}">${esc(ev.timeLabel)}</text>
    ${icon('pin', midX + 18, py0 + 22, 22, C.wine, 2)}
    ${label(midX + 52, py0 + 34, 'EVENT VENUE')}
    ${venueSvg}
    <text x="${midX + 52}" y="${areaY + 16}" font-family="${KHMER.test(ev.venueArea) ? "'Hanuman', Poppins" : 'Poppins'}" font-weight="400" font-size="13" fill="${C.muted}">${esc(ev.venueArea)}</text>
    ${icon('ticket', px0 + 20, py0 + row1 + 22, 22, C.wine, 2)}
    ${label(px0 + 54, py0 + row1 + 34, 'TICKET TYPE')}
    <text x="${px0 + 54}" y="${py0 + row1 + 58}" font-family="Poppins" font-weight="700" font-size="16.5" fill="${C.ink}">${esc(typeValue)}</text>
    <text x="${px0 + 54}" y="${py0 + row1 + 80}" font-family="Poppins" font-weight="400" font-size="12.5" fill="${C.muted}">${esc(typeSub)}</text>
    ${quoteLines.map((line, i) => `<text x="${midX + 28}" y="${py0 + row1 + 40 + i * 19}" font-family="Poppins" font-style="italic" font-weight="400" font-size="13.5" fill="#9A5743">${esc(line)}</text>`).join('')}
    ${star4(px1 - 30, py0 + row1 + row2 - 24, 11, C.gold)}`

  const bodyBottom = py0 + row1 + row2

  // --- assemble -------------------------------------------------------------
  const perforations = []
  for (let yy = 300; yy <= 1130; yy += 18) {
    perforations.push(`<circle cx="${x0}" cy="${yy}" r="5.2"/><circle cx="${x1}" cy="${yy}" r="5.2"/>`)
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W * scale}" height="${H * scale}" viewBox="0 0 ${W} ${H}"${title ? ' role="img"' : ''}>
  ${title ? `<title>${esc(title)}</title>` : ''}
  <defs>
    <clipPath id="${id('clip')}"><path d="${shape}"/></clipPath>
    <linearGradient id="${id('stage')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2A0806"/><stop offset="0.35" stop-color="#6C150F"/><stop offset="0.7" stop-color="#4B0C09"/><stop offset="1" stop-color="#1C0806"/>
    </linearGradient>
    <linearGradient id="${id('pleat')}" x1="0" y1="0" x2="26" y2="0" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
      <stop offset="0" stop-color="#000" stop-opacity="0.45"/><stop offset="0.3" stop-color="#000" stop-opacity="0.1"/><stop offset="0.5" stop-color="#FF7850" stop-opacity="0.12"/><stop offset="0.72" stop-color="#000" stop-opacity="0.06"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/>
    </linearGradient>
    <linearGradient id="${id('beam')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFE7BF" stop-opacity="0.85"/><stop offset="0.55" stop-color="#FFC27A" stop-opacity="0.18"/><stop offset="1" stop-color="#FFB060" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${id('glow')}" cx="0.62" cy="0.62" r="0.55">
      <stop offset="0" stop-color="#FF9A4A" stop-opacity="0.55"/><stop offset="1" stop-color="#FF9A4A" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id('logoPanel')}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFEFA"/><stop offset="1" stop-color="#F6EEE1"/>
    </linearGradient>
    <linearGradient id="${id('waveA')}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#5A0606"/><stop offset="0.55" stop-color="#810102"/><stop offset="1" stop-color="#9A1B17"/>
    </linearGradient>
    <linearGradient id="${id('waveB')}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#9A1B17"/><stop offset="1" stop-color="#6C0A0A"/>
    </linearGradient>
    <radialGradient id="${id('body')}" cx="0.5" cy="0.45" r="0.7">
      <stop offset="0" stop-color="#FFFCF5"/><stop offset="1" stop-color="#F8F0E2"/>
    </radialGradient>
    <filter id="${id('shadow')}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="9"/></filter>
  </defs>
  ${transparent ? '' : `<rect width="${W}" height="${H}" fill="${C.page}"/>`}
  <path d="${shape}" transform="translate(0 7)" fill="#5A3A2A" opacity="0.22" filter="url(#${id('shadow')})"/>
  <g clip-path="url(#${id('clip')})">
    <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#${id('body')})"/>
    <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="340" fill="url(#${id('stage')})"/>
    ${pleats}
    <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="340" fill="url(#${id('glow')})"/>
    ${beams}
    ${dots}
    ${sil}
    <path d="M${x0} ${y0}H352C318 88 262 140 178 166C116 185 62 190 ${x0} 188Z" fill="url(#${id('logoPanel')})"/>
    <path d="M352 ${y0}C318 88 262 140 178 166C116 185 62 190 ${x0} 188" fill="none" stroke="${C.goldSoft}" stroke-width="1.4" opacity="0.8"/>
    ${logo}
    ${header}
    <path d="M${x0} 196C120 214 236 262 382 270C470 275 560 262 ${x1} 244V360H${x0}Z" fill="url(#${id('waveA')})"/>
    <path d="M${x0} 192C120 210 236 258 382 266C470 271 560 258 ${x1} 240" fill="none" stroke="${C.gold}" stroke-width="2.6"/>
    <path d="M${x0} 252C140 262 262 302 400 300C500 298 568 286 ${x1} 276V360H${x0}Z" fill="url(#${id('waveB')})" opacity="0.9"/>
    <path d="M${x0} 286C150 290 270 324 410 320C512 317 574 306 ${x1} 298V420H${x0}Z" fill="url(#${id('body')})"/>
    <path d="M${x0} 282C150 286 270 320 410 316C512 313 574 302 ${x1} 294" fill="none" stroke="${C.gold}" stroke-width="1.6" opacity="0.9"/>
    ${ornament(112, 268, 1.05, C.goldSoft, '#A8774A')}
    <rect x="44" y="330" width="${W - 88}" height="${bodyBottom + 18 - 330}" rx="16" fill="none" stroke="${C.line}" stroke-width="1"/>
    <text x="${cx}" y="372" text-anchor="middle" font-family="Poppins" font-weight="500" font-size="13.5" letter-spacing="3.6" fill="${C.label}">TICKET HOLDER</text>
    ${nameSvg}
    ${pill}
    ${qrSvg}
    ${code}
    ${status}
    ${details}
    ${angkor(y1 - 110)}
    <path d="M${x0} ${y1 - 116}C150 ${y1 - 132} 262 ${y1 - 100} 400 ${y1 - 94}C500 ${y1 - 90} 570 ${y1 - 108} ${x1} ${y1 - 120}V${y1}H${x0}Z" fill="url(#${id('waveB')})"/>
    <path d="M${x0} ${y1 - 120}C150 ${y1 - 136} 262 ${y1 - 104} 400 ${y1 - 98}C500 ${y1 - 94} 570 ${y1 - 112} ${x1} ${y1 - 124}" fill="none" stroke="${C.gold}" stroke-width="2.2"/>
    <path d="M${x0} ${y1 - 80}C170 ${y1 - 60} 300 ${y1 - 80} 420 ${y1 - 70}C520 ${y1 - 62} 580 ${y1 - 74} ${x1} ${y1 - 84}V${y1}H${x0}Z" fill="url(#${id('waveA')})"/>
    ${ornament(cx, y1 - 48, 0.95, '#C9898A', '#5A0606', '#F3D9C8')}
  </g>
  <g fill="${transparent ? '#F5F4EF' : C.page}">${perforations.join('')}</g>
</svg>`
}
