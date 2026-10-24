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

/** The five-point star that replaces the “a” in “CoStars” (same as the event guide's StarGlyph). */
export const STAR = '<svg class="brand-mark__star" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.6 14.76 9.4 21.13 10.23 16.47 14.65 17.64 20.97 12 17.9 6.36 20.97 7.53 14.65 2.87 10.23 9.24 9.4Z" fill="currentColor" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>'

/**
 * CoStars word mark, the same as the event guide's BrandMark: “Co” over “St★rs”.
 * tone: 'dark' (charcoal, on light backgrounds) or 'light' (white, on the stage hero).
 * With href it is a link; without, just the mark.
 */
export function logoHtml(href = '', tone = 'dark') {
  const mark = `<span class="brand-mark__line" aria-hidden="true">Co</span><span class="brand-mark__line" aria-hidden="true">St${STAR}rs</span>`
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
