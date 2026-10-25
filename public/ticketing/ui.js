/** Shared bits for the ticketing pages: icons, escaping, money, toasts. */

/** Lucide icons (ISC licence), 24px grid, drawn with currentColor. */
const PATHS = {
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  calendarPlus: '<path d="M8 2v4M16 2v4M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8M3 10h18M16 19h6M19 16v6"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  xCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
  door: '<path d="M13 4h3a2 2 0 0 1 2 2v14M2 20h3M13 20h9M10 12v.01M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"/>',
  hourglass: '<path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16M18 17V9M13 17V5M8 17v-3"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M3 12h.01M12 3h.01M12 16v.01M16 12h1M21 12v.01M12 21v-1"/>',
}

export function icon(name, extra = '') {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${PATHS[name] || ''}</svg>`
}

/*
 * The CoStars logo as paths, the same as the event guide's BrandMark (src/components/BrandMark.jsx):
 * “Co” over “St★rs” in Poppins Bold, the second line a little larger, a rounded star. Where “Co”
 * overlaps “St”, the letters of “Co” cut a thin gap (a mask, so any background shows through).
 */
const LOGO_CO = 'M24.17 0Q32.69 0 38.75 4.5Q44.82 9 46.86 16.77H34.05Q32.62 13.77 29.99 12.2Q27.37 10.63 24.03 10.63Q18.64 10.63 15.3 14.38Q11.96 18.13 11.96 24.4Q11.96 30.67 15.3 34.42Q18.64 38.17 24.03 38.17Q27.37 38.17 29.99 36.6Q32.62 35.04 34.05 32.04H46.86Q44.82 39.81 38.75 44.27Q32.69 48.74 24.17 48.74Q17.21 48.74 11.73 45.64Q6.24 42.53 3.17 37.01Q0.1 31.49 0.1 24.4Q0.1 17.31 3.17 11.76Q6.24 6.2 11.73 3.1Q17.21 0 24.17 0ZM47.18 29.38Q47.18 23.52 49.77 19.05Q52.36 14.59 56.86 12.2Q61.36 9.82 66.95 9.82Q72.54 9.82 77.04 12.2Q81.53 14.59 84.12 19.05Q86.71 23.52 86.71 29.38Q86.71 35.24 84.09 39.71Q81.47 44.17 76.93 46.56Q72.4 48.94 66.81 48.94Q61.22 48.94 56.76 46.56Q52.29 44.17 49.74 39.74Q47.18 35.31 47.18 29.38ZM74.85 29.38Q74.85 24.81 72.57 22.36Q70.29 19.9 66.95 19.9Q63.54 19.9 61.29 22.32Q59.04 24.74 59.04 29.38Q59.04 33.95 61.26 36.4Q63.47 38.85 66.81 38.85Q70.15 38.85 72.5 36.4Q74.85 33.95 74.85 29.38Z'
const LOGO_ST = 'M0 84.07H13.3Q13.59 86.92 15.27 88.42Q16.95 89.92 19.65 89.92Q22.43 89.92 24.03 88.64Q25.64 87.36 25.64 85.1Q25.64 83.2 24.36 81.96Q23.08 80.71 21.22 79.91Q19.36 79.11 15.93 78.08Q10.96 76.55 7.82 75.02Q4.68 73.48 2.41 70.49Q0.15 67.49 0.15 62.67Q0.15 55.51 5.33 51.46Q10.52 47.4 18.85 47.4Q27.32 47.4 32.51 51.46Q37.7 55.51 38.06 62.74H24.55Q24.4 60.26 22.72 58.83Q21.04 57.41 18.41 57.41Q16.14 57.41 14.76 58.62Q13.37 59.82 13.37 62.09Q13.37 64.57 15.71 65.96Q18.04 67.35 23.01 68.95Q27.98 70.63 31.08 72.17Q34.19 73.7 36.45 76.62Q38.72 79.55 38.72 84.15Q38.72 88.53 36.49 92.11Q34.26 95.69 30.02 97.81Q25.79 99.93 20.02 99.93Q14.39 99.93 9.94 98.1Q5.48 96.27 2.81 92.69Q0.15 89.12 0 84.07ZM64.24 88.82V99.42H57.88Q51.09 99.42 47.29 96.09Q43.49 92.77 43.49 85.24V69.03H38.52V58.65H43.49V48.72H55.98V58.65H64.16V69.03H55.98V85.39Q55.98 87.22 56.86 88.02Q57.73 88.82 59.78 88.82Z'
const LOGO_RS_STAR = 'M135.01 58.21V71.44H131.58Q126.9 71.44 124.57 73.45Q122.23 75.45 122.23 80.49V99.42H109.74V58.65H122.23V65.45Q124.42 62.09 127.71 60.15Q130.99 58.21 135.01 58.21ZM133.94 86.05H146.28Q146.5 88.17 148.26 89.48Q150.01 90.8 152.57 90.8Q154.9 90.8 156.18 89.88Q157.46 88.97 157.46 87.51Q157.46 85.75 155.63 84.91Q153.81 84.07 149.72 83.05Q145.33 82.03 142.41 80.9Q139.49 79.76 137.37 77.32Q135.25 74.87 135.25 70.71Q135.25 67.2 137.19 64.31Q139.12 61.43 142.89 59.75Q146.65 58.07 151.83 58.07Q159.51 58.07 163.93 61.87Q168.34 65.67 169 71.95H157.46Q157.17 69.83 155.6 68.59Q154.03 67.35 151.47 67.35Q149.28 67.35 148.11 68.19Q146.94 69.03 146.94 70.49Q146.94 72.24 148.8 73.12Q150.67 73.99 154.61 74.87Q159.14 76.04 161.99 77.17Q164.84 78.3 166.99 80.82Q169.15 83.34 169.22 87.58Q169.22 91.16 167.21 93.97Q165.2 96.79 161.44 98.39Q157.68 100 152.71 100Q147.38 100 143.21 98.17Q139.05 96.35 136.64 93.17Q134.23 89.99 133.94 86.05ZM84.89 59.91A2.08 2.08 0 0 1 88.62 59.91L94.04 70.94L106.21 72.69A2.08 2.08 0 0 1 107.36 76.24L98.55 84.81L100.64 96.92A2.08 2.08 0 0 1 97.62 99.11L86.75 93.38L75.88 99.11A2.08 2.08 0 0 1 72.86 96.92L74.95 84.81L66.14 76.24A2.08 2.08 0 0 1 67.3 72.69L79.46 70.94Z'
let logoCount = 0

/** The logo's SVG (a new mask id each time, so several logos can share a page). */
export function logoSvg() {
  const cut = `brand-cut-${++logoCount}`
  return `<svg viewBox="0 0 169.22 100" aria-hidden="true" focusable="false"><defs><mask id="${cut}" maskUnits="userSpaceOnUse" x="-5" y="-5" width="179.22" height="110"><rect x="-5" y="-5" width="179.22" height="110" fill="#fff"/><path d="${LOGO_CO}" fill="#000" stroke="#000" stroke-width="5.06" stroke-linejoin="round"/></mask></defs><g fill="currentColor"><path d="${LOGO_CO}"/><path d="${LOGO_ST}" mask="url(#${cut})"/><path d="${LOGO_RS_STAR}"/></g></svg>`
}

/**
 * CoStars logo, the same as the event guide's BrandMark: “Co” over “St★rs”.
 * tone: 'dark' (charcoal, on light backgrounds) or 'light' (white, on the stage hero).
 * With href it is a link; without, just the mark.
 */
export function logoHtml(href = '', tone = 'dark') {
  const mark = logoSvg()
  const cls = `brand-mark brand-mark--${tone === 'light' ? 'light' : 'dark'}`
  return href
    ? `<a class="${cls}" href="${href}" aria-label="CoStars">${mark}</a>`
    : `<span class="${cls}" role="img" aria-label="CoStars">${mark}</span>`
}

/** Curved edge at the bottom of the stage hero. */
export const HERO_WAVE = `<svg class="hero__wave" viewBox="0 0 400 52" preserveAspectRatio="none" aria-hidden="true">
  <path d="M0 18C80 34 170 46 250 40C320 35 370 22 400 14V52H0Z" fill="#810102"/>
  <path d="M0 16C80 32 170 44 250 38C320 33 370 20 400 12" fill="none" stroke="#D69A3C" stroke-width="2"/>
  <path d="M0 34C90 44 190 50 280 46C340 43 380 36 400 32V52H0Z" fill="#F5F4EF"/>
  <path d="M0 32C90 42 190 48 280 44C340 41 380 34 400 30" fill="none" stroke="#D69A3C" stroke-width="1.2" opacity="0.8"/>
</svg>`

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/** Fills {placeholders}. Values are escaped. */
export const fill = (s, vars = {}) => String(s).replace(/\{(\w+)\}/g, (all, k) => (k in vars ? esc(vars[k]) : all))

export const KHMER_DIGITS = '០១២៣៤៥៦៧៨៩'
export const khDigits = (v) => String(v).replace(/[0-9]/g, (d) => KHMER_DIGITS[Number(d)])

export function money(n, symbol = '$') {
  const v = Math.round((Number(n) || 0) * 100) / 100
  const [a, b] = String(v).split('.')
  return symbol + a.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (b ? '.' + b : '')
}
export function riel(n, rate) {
  if (!(rate > 0)) return ''
  const r = Math.round(((Number(n) || 0) * rate) / 100) * 100
  return String(r).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '៛'
}

let toastTimer = null
export function toast(message, ms = 2600) {
  let el = document.querySelector('.toast')
  if (!el) {
    el = document.createElement('div')
    el.className = 'toast'
    el.setAttribute('role', 'status')
    document.body.appendChild(el)
  }
  el.textContent = message
  el.hidden = false
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { el.hidden = true }, ms)
}

export function saveLang(lang) {
  try { localStorage.setItem('costars-lang', lang) } catch {}
}
export function savedLang() {
  try { return localStorage.getItem('costars-lang') || '' } catch { return '' }
}

/** Copies text. Resolves true when it worked (some in-app browsers block the clipboard). */
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {}
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

/** A random id for one form submission, so a double tap makes one order. */
export const nonce = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

/**
 * Wording from the "Web texts" tab of the bot's Google Sheet. The bot sends it with the data
 * the page loads anyway (webTexts: { en: { key: text }, km: { ... } }), so it costs no extra
 * request. A filled-in cell replaces the built-in text with the same key; anything missing,
 * empty or unknown keeps the built-in wording. < and > are dropped, so a cell can't add HTML.
 */
export function applyWebTexts(T, webTexts) {
  if (!webTexts || typeof webTexts !== 'object') return
  for (const lang of Object.keys(T)) {
    const rows = webTexts[lang]
    if (!rows || typeof rows !== 'object') continue
    for (const [key, value] of Object.entries(rows)) {
      if (!Object.prototype.hasOwnProperty.call(T.en, key) || typeof value !== 'string') continue
      const text = value.replace(/\r\n?/g, '\n').replace(/[<>]/g, '').trim()
      if (text) T[lang][key] = text
    }
  }
}
