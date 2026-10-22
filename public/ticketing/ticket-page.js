/**
 * Ticket page (/t/<code>). This address is what the ticket QR holds, so a guest
 * who scans their own QR lands here. Door staff check guests in from the
 * check-in page in Telegram; staff who scan with a phone camera get a button
 * that checks the guest in through the bot.
 */
import { apiGet } from './api.js'
import { BOT_USERNAME, botLink } from './config.js'
import { buildTicketSvg } from './ticket-svg.js'
import { encodeQR } from './qr.js'
import { esc, fill, icon, khDigits, logoHtml, savedLang, saveLang, toast } from './ui.js'

const T = {
  en: {
    pageTitle: 'Your CoStars ticket',
    valid: 'Valid ticket',
    validSub: 'Show this QR at the entrance\nOne QR lets one person in',
    checked: 'Checked in at {time}',
    checkedSub: 'Welcome! Enjoy the show 🎶',
    guestOf: 'Guest {n} of {total}',
    groupTip: 'Each person in your group has their own ticket\nSend this one to the friend it belongs to',
    tipsTitle: 'At the door',
    tip1: 'Turn up your screen brightness',
    tip2: 'Have this page or the ticket photo from Telegram ready',
    tip3: 'Doors open before the show, come a little early 😊',
    save: 'Save image',
    calendar: 'Add to calendar',
    share: 'Send to a friend',
    shareText: 'Your ticket for the CoStars Charity Mini Concert 🎟',
    copied: 'Link copied',
    guide: 'Event guide',
    bot: 'Open the bot',
    refresh: 'Refresh',
    updated: 'Up to date',
    staffTitle: 'For door staff',
    staffText: 'Scanned this with your phone camera? Check the guest in through the bot',
    staffBtn: 'Check in with Telegram',
    notFound: 'We couldn’t find this ticket',
    notFoundSub: 'Please open the ticket again from the CoStars bot in Telegram\nTap 🎫 My tickets to see all your tickets',
    netError: 'We couldn’t load your ticket 😥',
    netErrorSub: 'Please check your internet and try again',
    retry: 'Try again',
    calTitle: 'CoStars Charity Mini Concert',
    tapHint: 'Tap the ticket to make the QR bigger',
    closeHint: 'Tap anywhere to close',
  },
  km: {
    pageTitle: 'សំបុត្រ CoStars របស់អ្នក',
    valid: 'សំបុត្រត្រឹមត្រូវ',
    validSub: 'សូមបង្ហាញ QR នេះនៅច្រកចូល\nQR មួយសម្រាប់មនុស្សម្នាក់',
    checked: 'បានចូលនៅម៉ោង {time}',
    checkedSub: 'សូមស្វាគមន៍! សូមរីករាយជាមួយកម្មវិធី 🎶',
    guestOf: 'ភ្ញៀវទី {n} នៃ {total}',
    groupTip: 'សមាជិកក្រុមម្នាក់ៗមានសំបុត្រផ្ទាល់ខ្លួន\nសូមផ្ញើសំបុត្រនេះទៅមិត្តភក្តិដែលជាម្ចាស់',
    tipsTitle: 'នៅច្រកចូល',
    tip1: 'សូមបង្កើនពន្លឺអេក្រង់',
    tip2: 'សូមរៀបចំទំព័រនេះ ឬរូបសំបុត្រក្នុង Telegram ឲ្យរួចរាល់',
    tip3: 'សូមមកដល់មុនម៉ោងបន្តិច 😊',
    save: 'រក្សាទុករូបភាព',
    calendar: 'បញ្ចូលក្នុងប្រតិទិន',
    share: 'ផ្ញើទៅមិត្តភក្តិ',
    shareText: 'សំបុត្ររបស់អ្នកសម្រាប់ការប្រគុំតន្ត្រីសប្បុរសធម៌ CoStars 🎟',
    copied: 'បានចម្លងតំណ',
    guide: 'មគ្គុទ្ទេសក៍កម្មវិធី',
    bot: 'បើក Bot',
    refresh: 'ធ្វើបច្ចុប្បន្នភាព',
    updated: 'ទាន់សម័យហើយ',
    staffTitle: 'សម្រាប់បុគ្គលិកច្រកចូល',
    staffText: 'ស្កេនដោយកាមេរ៉ាទូរស័ព្ទមែនទេ? សូមឲ្យភ្ញៀវចូលតាម Bot',
    staffBtn: 'ឲ្យចូលតាម Telegram',
    notFound: 'រកមិនឃើញសំបុត្រនេះទេ',
    notFoundSub: 'សូមបើកសំបុត្រម្ដងទៀតពី CoStars Bot ក្នុង Telegram\nចុច 🎫 សំបុត្ររបស់ខ្ញុំ ដើម្បីមើលសំបុត្រទាំងអស់',
    netError: 'មិនអាចបើកសំបុត្ររបស់អ្នកបានទេ 😥',
    netErrorSub: 'សូមពិនិត្យអ៊ីនធឺណិត ហើយព្យាយាមម្ដងទៀត',
    retry: 'ព្យាយាមម្ដងទៀត',
    calTitle: 'ការប្រគុំតន្ត្រីសប្បុរសធម៌ CoStars',
    tapHint: 'ចុចលើសំបុត្រ ដើម្បីពង្រីក QR',
    closeHint: 'ចុចកន្លែងណាមួយដើម្បីបិទ',
  },
}

const $ = (sel) => document.querySelector(sel)
const app = $('#app')
const params = new URLSearchParams(location.search)
const code = (() => {
  const m = location.pathname.match(/\/t\/([^/?#]+)/)
  return decodeURIComponent((m && m[1]) || params.get('c') || '').trim()
})()

const state = {
  lang: /^(en|km)$/.test(params.get('lang') || '') ? params.get('lang') : savedLang() || (/^km/i.test(navigator.language || '') ? 'km' : 'en'),
  data: null,
  error: '',
  lastLoad: 0,
}
const t = (key, vars) => fill(T[state.lang][key] ?? T.en[key] ?? key, vars)
const br = (s) => s.split('\n').join('<br>')
const n = (v) => (state.lang === 'km' ? khDigits(v) : String(v))

async function load({ quiet = false } = {}) {
  state.lastLoad = Date.now()
  if (!code) {
    state.error = 'invalid'
    return render()
  }
  try {
    const res = await apiGet({ action: 'ticket', code })
    if (!res.ok) {
      state.error = res.error === 'not_found' || res.error === 'invalid' ? 'invalid' : 'network'
      if (!quiet || !state.data) render()
      return
    }
    const before = state.data && state.data.ticket.status
    state.data = res
    state.error = ''
    render()
    if (quiet && before && before !== res.ticket.status) toast(t('checked', { time: res.ticket.checkedInAt }))
  } catch {
    if (quiet && state.data) return
    state.error = 'network'
    render()
  }
}

function topbar() {
  return `
    <div class="topbar">
      ${logoHtml('/')}
      <div class="lang lang--light" role="group" aria-label="Language">
        <button type="button" data-lang="en" aria-pressed="${state.lang === 'en'}">EN</button>
        <button type="button" data-lang="km" aria-pressed="${state.lang === 'km'}">ខ្មែរ</button>
      </div>
    </div>`
}

function ticketSvg(d) {
  const tk = d.ticket
  const ev = d.event || {}
  return buildTicketSvg(
    {
      url: d.url,
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
    { transparent: true, title: `CoStars ticket ${tk.id} for ${tk.name}` },
  )
}

function render() {
  document.documentElement.lang = state.lang
  document.title = T[state.lang].pageTitle
  app.setAttribute('aria-busy', 'false')
  if (state.error) return renderError()
  const d = state.data
  const tk = d.ticket
  const checked = tk.status === 'CHECKED_IN'
  const group = tk.guests > 1
  const bot = d.bot || BOT_USERNAME
  app.innerHTML = `
    ${topbar()}
    <div class="status ${checked ? 'status--in' : 'status--ok'} rise" role="status">
      <span class="status__icon">${icon(checked ? 'heart' : 'checkCircle')}</span>
      <div>
        <b>${checked ? t('checked', { time: tk.checkedInAt }) : esc(T[state.lang].valid)}</b>
        <span>${br(esc(T[state.lang][checked ? 'checkedSub' : 'validSub']))}</span>
      </div>
      ${group ? `<span class="badge badge--wine">${t('guestOf', { n: n(tk.guestNo), total: n(tk.guests) })}</span>` : ''}
    </div>
    <figure class="ticket rise" style="animation-delay:.05s" role="button" tabindex="0" aria-label="${esc(T[state.lang].tapHint)}">${ticketSvg(d)}</figure>
    ${checked ? '' : `<p class="center muted small" style="margin:2px 0 12px">${icon('scan', 'style="display:inline;width:15px;height:15px;vertical-align:-2px;margin-right:4px"')}${esc(T[state.lang].tapHint)}</p>`}
    <div class="actions">
      <a class="btn btn--light" href="/api/ticket-image?c=${encodeURIComponent(d.code)}&s=2&download=1" download="CoStars-ticket-${esc(tk.id)}.png" id="save">${icon('download')}${esc(T[state.lang].save)}</a>
      <button type="button" class="btn btn--light" id="cal">${icon('calendarPlus')}${esc(T[state.lang].calendar)}</button>
      ${group ? `<button type="button" class="btn btn--light actions__wide" id="share">${icon('share')}${esc(T[state.lang].share)}</button>` : ''}
    </div>
    ${group ? `<div class="notice section">${icon('users')}<div>${br(esc(T[state.lang].groupTip))}</div></div>` : ''}
    ${checked ? '' : `
    <section class="section card card--pad">
      <h2 style="font-size:15px">${esc(T[state.lang].tipsTitle)}</h2>
      <ul class="tips">
        <li>${icon('sun')}<span>${esc(T[state.lang].tip1)}</span></li>
        <li>${icon('ticket')}<span>${esc(T[state.lang].tip2)}</span></li>
        <li>${icon('clock')}<span>${esc(T[state.lang].tip3)}</span></li>
      </ul>
    </section>`}
    <div class="links section">
      <a href="/">${icon('book')}${esc(T[state.lang].guide)}</a>
      <a href="https://t.me/${esc(bot)}">${icon('send')}${esc(T[state.lang].bot)}</a>
      <button type="button" id="refresh">${icon('refresh')}${esc(T[state.lang].refresh)}</button>
    </div>
    ${checked ? '' : `
    <details class="staff section">
      <summary>${icon('door')}${esc(T[state.lang].staffTitle)}</summary>
      <p>${esc(T[state.lang].staffText)}</p>
      <a class="btn btn--tg btn--block" href="${botLink('t_' + d.code)}">${icon('send')}${esc(T[state.lang].staffBtn)}</a>
    </details>`}`
  bind()
}

function renderError() {
  const net = state.error === 'network'
  app.innerHTML = `
    ${topbar()}
    <div class="state card rise">
      <div class="state__icon">${icon(net ? 'alert' : 'ticket')}</div>
      <h2>${esc(T[state.lang][net ? 'netError' : 'notFound'])}</h2>
      <p>${br(esc(T[state.lang][net ? 'netErrorSub' : 'notFoundSub']))}</p>
      ${net ? `<button type="button" class="btn" id="retry">${icon('refresh')}${esc(T[state.lang].retry)}</button>` : `<a class="btn btn--tg" href="${botLink()}">${icon('send')}${esc(T[state.lang].bot)}</a>`}
    </div>`
  bind()
}

function bind() {
  document.querySelectorAll('[data-lang]').forEach((b) =>
    b.addEventListener('click', () => {
      if (state.lang === b.dataset.lang) return
      state.lang = b.dataset.lang
      saveLang(state.lang)
      render()
    }),
  )
  const retry = $('#retry')
  if (retry) retry.addEventListener('click', () => load())
  const refresh = $('#refresh')
  if (refresh) refresh.addEventListener('click', async () => {
    refresh.disabled = true
    await load({ quiet: true })
    toast(T[state.lang].updated)
  })
  const cal = $('#cal')
  if (cal) cal.addEventListener('click', addToCalendar)
  const share = $('#share')
  if (share) share.addEventListener('click', shareTicket)
  const fig = $('.ticket')
  if (fig) {
    fig.addEventListener('click', showBigQr)
    fig.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showBigQr() } })
  }
}

/** Full-screen QR for the door: big, black on white, with a quiet zone. */
function showBigQr() {
  const d = state.data
  const qr = encodeQR(d.url, 'M')
  const size = qr.size + 8
  let path = ''
  qr.modules.forEach((row, y) => row.forEach((on, x) => { if (on) path += `M${x + 4} ${y + 4}h1v1h-1Z` }))
  const tk = d.ticket
  const el = document.createElement('div')
  el.className = 'qr-full'
  el.setAttribute('role', 'dialog')
  el.setAttribute('aria-label', 'QR code')
  el.innerHTML = `
    <div class="qr-full__card pop">
      <p class="eyebrow">${esc(tk.guests > 1 ? fill(T[state.lang].guestOf, { n: n(tk.guestNo), total: n(tk.guests) }) : 'CoStars')}</p>
      <h2>${esc(tk.name)}</h2>
      <svg viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#000"/></svg>
      <p class="qr-full__code">${esc(tk.order)}-${esc(tk.guestNo)}</p>
    </div>
    <p class="qr-full__hint">${esc(T[state.lang].closeHint)}</p>`
  const close = () => { el.remove(); document.removeEventListener('keydown', onKey) }
  const onKey = (e) => { if (e.key === 'Escape') close() }
  el.addEventListener('click', close)
  document.addEventListener('keydown', onKey)
  document.body.appendChild(el)
}

/* ------------------------------------------------------------ calendar */

function parseTime(text) {
  const m = String(text || '').match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\D+(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i)
  if (!m) return null
  const to24 = (h, min, ap) => {
    let x = Number(h) % 12
    if ((ap || '').toUpperCase() === 'PM') x += 12
    else if (!ap && Number(h) === 12) x = 12
    return [x, Number(min || 0)]
  }
  const endAp = m[6] || m[3]
  return { start: to24(m[1], m[2], m[3] || endAp), end: to24(m[4], m[5], endAp) }
}

function addToCalendar() {
  const d = state.data
  const ev = d.event || {}
  const ymd = /^\d{4}-\d{2}-\d{2}$/.test(ev.ymd || '') ? ev.ymd : '2026-12-05'
  const [y, mo, day] = ymd.split('-').map(Number)
  const tm = parseTime(ev.time)
  const pad = (v) => String(v).padStart(2, '0')
  // Cambodia is UTC+7 all year.
  const utc = ([h, min]) => {
    const dt = new Date(Date.UTC(y, mo - 1, day, h - 7, min))
    return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`
  }
  const now = new Date()
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`
  const icsText = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CoStars//Tickets//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:costars-${d.ticket.id}@costars-guide`,
    `DTSTAMP:${stamp}`,
    ...(tm ? [`DTSTART:${utc(tm.start)}`, `DTEND:${utc(tm.end)}`] : [`DTSTART;VALUE=DATE:${y}${pad(mo)}${pad(day)}`]),
    `SUMMARY:${icsText(T.en.calTitle)}`,
    `LOCATION:${icsText([ev.venue, ev.venueArea].filter(Boolean).join(', '))}`,
    `DESCRIPTION:${icsText(`Ticket ${d.ticket.id} for ${d.ticket.name}\nShow your QR at the entrance: ${d.url}`)}`,
    `URL:${d.url}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsText(T.en.calTitle)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  const a = document.createElement('a')
  a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines.join('\r\n'))
  a.download = 'CoStars-concert.ics'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

async function shareTicket() {
  const d = state.data
  const text = T[state.lang].shareText
  if (navigator.share) {
    try {
      await navigator.share({ title: 'CoStars ticket', text, url: d.url })
      return
    } catch (err) {
      if (err && err.name === 'AbortError') return
    }
  }
  try {
    await navigator.clipboard.writeText(d.url)
    toast(T[state.lang].copied)
  } catch {
    window.prompt(text, d.url)
  }
}

/* Coming back to the page (e.g. after the door scan) shows the newest status. */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.data && Date.now() - state.lastLoad > 30000) load({ quiet: true })
})

load()
