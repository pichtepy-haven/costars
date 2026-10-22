/**
 * Check-in page (/admin): the "check point" for door staff and organizers.
 * Opened inside Telegram with /admin (or /scan, which opens the scanner right away).
 * Every request carries Telegram's signature; the bot checks the Staff tab.
 *
 *  • Scan: Telegram's own QR scanner (phone apps). Each ticket QR holds the
 *    ticket page address; the bot checks the signature and marks it used.
 *  • Search: by name, phone, order or ticket number, then check in by hand.
 *  • Live numbers and the newest check-ins, refreshed every 15 seconds.
 *  • Admins also see sales.
 */
import { apiPost } from './api.js'
import { botLink } from './config.js'
import * as tg from './tg.js'
import { esc, icon, toast } from './ui.js'

const $ = (sel, root = document) => root.querySelector(sel)
const app = $('#app')
const REFRESH_MS = 15000

const state = {
  me: null, // dashboard answer
  result: null, // last scan / manual check-in result
  lastCode: '',
  busy: false,
  query: '',
  results: null,
  searching: false,
  timer: null,
  loadedAt: 0,
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

/* ------------------------------------------------------------- data */

async function call(body) {
  return apiPost({ ...body, initData: tg.initData() })
}

async function refresh({ quiet = false } = {}) {
  try {
    const res = await call({ action: 'dashboard' })
    if (!res.ok) return quiet ? null : renderProblem(res)
    state.me = res
    state.loadedAt = Date.now()
    if (quiet) updateLive()
    else render()
  } catch (err) {
    if (!quiet) renderProblem({ error: 'network' })
  }
}

function schedule() {
  clearInterval(state.timer)
  state.timer = setInterval(() => {
    if (document.visibilityState === 'visible' && !state.busy) refresh({ quiet: true })
  }, REFRESH_MS)
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.me && Date.now() - state.loadedAt > 5000) refresh({ quiet: true })
})

/* ------------------------------------------------------------- views */

function ring(done, total) {
  const pct = total ? Math.min(1, done / total) : 0
  const r = 52
  const c = 2 * Math.PI * r
  return `
    <svg class="ring" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="#f1e6da" stroke-width="12"/>
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="url(#ringGrad)" stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${(c * pct).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 60 60)"/>
      <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d69a3c"/><stop offset="1" stop-color="#810102"/></linearGradient></defs>
    </svg>`
}

function counterHtml() {
  const c = state.me.counts
  const pct = c.total ? Math.round((c.checkedIn / c.total) * 100) : 0
  return `
    <section class="counter card" id="counter">
      <div class="counter__ring">${ring(c.checkedIn, c.total)}<div class="counter__num"><b>${c.checkedIn}</b><span>${pct}%</span></div></div>
      <div class="counter__text">
        <p class="eyebrow">Checked in</p>
        <p class="counter__big">${c.checkedIn} <span>of ${plural(c.total, 'ticket')}</span></p>
        <p class="muted small">${c.total - c.checkedIn} still to come</p>
        <p class="counter__updated small">${icon('refresh')}Updated ${esc(state.me.updated)}</p>
      </div>
    </section>`
}

function resultHtml() {
  const r = state.result
  if (!r) return ''
  const kind = r.network ? 'warn' : r.ok ? 'ok' : 'bad'
  const iconName = r.network ? 'alert' : r.ok ? 'check' : 'x'
  // For a group guest the pill already says "Guest 3 of 5": keep only the ticket number below it.
  const detailText = r.ok && r.guests > 1 && r.ticket ? `Ticket ${r.ticket}` : r.detail || ''
  const detail = esc(detailText).split('\n').join('<br>')
  const title = r.ok ? esc(r.name || r.title) : esc(r.title)
  return `
    <section class="result result--${kind} pop" id="result" role="alert">
      <div class="result__icon">${icon(iconName)}</div>
      <div class="result__body">
        <p class="result__label">${r.network ? 'Not sent' : r.ok ? 'Welcome in' : 'Do not let in'}</p>
        <h2>${title}</h2>
        ${r.ok && r.guests > 1 ? `<p class="result__guest">Guest ${r.guestNo} of ${r.guests}</p>` : ''}
        <p class="result__detail">${detail}</p>
        ${r.network ? '<button type="button" class="btn btn--small" id="resend">Try again</button>' : ''}
      </div>
      <button type="button" class="result__close" id="dismiss" aria-label="Close">${icon('x')}</button>
    </section>`
}

function scanHtml() {
  const can = tg.scanner.available()
  if (can) {
    return tg.mainButton.available()
      ? ''
      : `<button type="button" class="btn btn--block btn--big section" id="scan">${icon('scan')}Scan ticket</button>`
  }
  return `<div class="notice notice--plain section">${icon('info')}<div>Scanning works in the Telegram app on phones<br>Here you can find guests by name and check them in</div></div>`
}

function searchHtml() {
  return `
    <section class="section">
      <div class="section__head">${icon('search', 'class="head-icon"')}<h2>Find a guest</h2></div>
      <label class="search">
        ${icon('search')}
        <input class="input" id="q" type="search" inputmode="search" autocomplete="off" placeholder="Name, phone, order or ticket number" value="${esc(state.query)}" />
      </label>
      <div id="results">${resultsHtml()}</div>
    </section>`
}

function resultsHtml() {
  if (state.searching) return '<div class="skeleton" style="height:80px;margin-top:10px"></div>'
  const list = state.results
  if (!list) return ''
  if (!list.length) return `<p class="muted small" style="margin:10px 2px">Nobody found for “${esc(state.query)}”</p>`
  return list
    .map(
      (o) => `
      <article class="guest card">
        <header>
          <div><b>${esc(o.name)}</b><span>${esc(o.order)}${o.phone4 ? `, phone ending ${esc(o.phone4)}` : ''}</span></div>
          <span class="badge ${o.type === 'GROUP' ? 'badge--wine' : 'badge--grey'}">${o.type === 'GROUP' ? 'Group' : 'Standard'}</span>
        </header>
        <ul>
          ${o.tickets
            .map(
              (x) => `
            <li>
              <span class="guest__no">${x.guests > 1 ? `Guest ${x.guestNo} of ${x.guests}` : 'Ticket'}<small>${esc(x.id)}</small></span>
              ${
                x.status === 'CHECKED_IN'
                  ? `<span class="badge badge--green">${icon('check', 'style="width:12px;height:12px"')}In ${esc(x.time)}${x.by ? ` by ${esc(x.by)}` : ''}</span>`
                  : `<button type="button" class="btn btn--small" data-checkin="${esc(x.id)}" data-name="${esc(o.name)}" data-guest="${x.guests > 1 ? `guest ${x.guestNo} of ${x.guests}` : ''}">Check in</button>`
              }
            </li>`,
            )
            .join('')}
        </ul>
      </article>`,
    )
    .join('')
}

function recentHtml() {
  const list = state.me.recent || []
  return `
    <section class="section">
      <div class="section__head">${icon('clock', 'class="head-icon"')}<h2>Latest check-ins</h2></div>
      <div class="card recent" id="recent">${recentItems(list)}</div>
    </section>`
}

function recentItems(list) {
  if (!list.length) return '<p class="muted small" style="margin:0;padding:14px">No one checked in yet</p>'
  return `<ul>${list
    .map(
      (x) => `
      <li>
        <time>${esc(x.time)}</time>
        <div><b>${esc(x.name)}</b><span>${x.guests > 1 ? `Guest ${x.guestNo} of ${x.guests}, ` : ''}ticket ${esc(x.ticket)}</span></div>
        <small>${esc(x.by)}</small>
      </li>`,
    )
    .join('')}</ul>`
}

function salesHtml() {
  const s = state.me.sales
  if (!s) return ''
  const tile = (label, value, sub, iconName) => `
    <div class="tile">${icon(iconName)}<span>${label}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ''}</div>`
  return `
    <section class="section">
      <div class="section__head">${icon('chart', 'class="head-icon"')}<h2>Sales</h2><span class="badge ${s.salesOpen ? 'badge--green' : 'badge--red'}" style="margin-left:auto">${s.salesOpen ? 'Open' : 'Closed'}</span></div>
      <div class="tiles" id="sales">
        ${tile('Guests', `${s.guests}`, `of ${s.capacity} seats, ${Math.max(s.seatsLeft, 0)} left`, 'users')}
        ${tile('Ticket money', esc(s.money), plural(s.paidOrders, 'paid order'), 'wallet')}
        ${tile('Group promotion', `${s.groupsSold} / ${s.groupTotal}`, `${Math.max(s.groupTotal - s.groupsSold, 0)} left`, 'ticket')}
        ${tile('To check', `${s.pending}`, `receipts, ${s.awaiting} waiting to pay`, 'receipt')}
      </div>
      <p class="muted small" style="margin:8px 2px 0">Approve receipts in the admin group as usual</p>
    </section>`
}

function headerHtml() {
  const me = state.me
  return `
    <header class="admin-head">
      <div>
        <p class="admin-head__eyebrow">CoStars check point</p>
        <h1>Door check-in</h1>
      </div>
      <div class="admin-head__me">${icon('user')}<span>${esc(me.staff)}</span><em>${me.role === 'ADMIN' ? 'Admin' : 'Door'}</em></div>
    </header>`
}

function render() {
  app.setAttribute('aria-busy', 'false')
  app.innerHTML = `
    ${headerHtml()}
    ${counterHtml()}
    <div id="result-slot">${resultHtml()}</div>
    ${scanHtml()}
    ${searchHtml()}
    ${recentHtml()}
    ${salesHtml()}
    <p class="footer-note">Keep this page open at the door<br>It refreshes by itself every 15 seconds</p>`
  bind()
  setMainButton()
}

/** Refreshes the numbers without touching what staff are typing. */
function updateLive() {
  const counter = $('#counter')
  if (counter) counter.outerHTML = counterHtml()
  const recent = $('#recent')
  if (recent) recent.innerHTML = recentItems(state.me.recent || [])
  const sales = $('#sales')
  if (sales && state.me.sales) sales.closest('.section').outerHTML = salesHtml()
}

function renderProblem(res) {
  app.setAttribute('aria-busy', 'false')
  tg.mainButton.hide()
  let title = 'Something went wrong'
  let body = esc(res.detail || res.title || '')
  let action = '<button type="button" class="btn" id="retry">' + icon('refresh') + 'Try again</button>'
  if (res.error === 'not_staff') {
    title = 'You’re not on the staff list yet'
    body = `Ask an organizer to add your Telegram ID to the Staff tab with the role DOOR<br><br><span class="idbox">${esc(res.userId)}</span>`
    action = `<button type="button" class="btn btn--light" id="copy-id" data-id="${esc(res.userId)}">${icon('copy')}Copy my ID</button>`
  } else if (res.error === 'auth' && !tg.initData()) {
    title = 'Open this page from the bot'
    body = 'Send /admin to the CoStars bot in a private chat, then tap 🚪 Open check-in'
    action = `<a class="btn btn--tg" href="${botLink('admin')}">${icon('send')}Open the bot</a>`
  } else if (res.error === 'network') {
    title = 'Can’t reach the bot'
    body = 'Please check the internet connection and try again'
  }
  app.innerHTML = `
    <div class="state card rise">
      <div class="state__icon">${icon(res.error === 'not_staff' ? 'door' : 'alert')}</div>
      <h2>${title}</h2>
      <p>${body}</p>
      ${action}
    </div>`
  const retry = $('#retry')
  if (retry) retry.addEventListener('click', () => { app.setAttribute('aria-busy', 'true'); refresh() })
  const copy = $('#copy-id')
  if (copy) copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(copy.dataset.id); toast('Copied') } catch { toast(copy.dataset.id) }
  })
}

/* ------------------------------------------------------------- scanning */

function setMainButton() {
  if (!tg.scanner.available()) return tg.mainButton.hide()
  tg.mainButton.set({ text: state.busy ? 'Checking…' : state.result ? '📷 Scan next ticket' : '📷 Scan ticket', onClick: openScanner, active: !state.busy })
  tg.mainButton.progress(state.busy)
}

function openScanner() {
  if (state.busy) return
  const opened = tg.scanner.open('Point the camera at the ticket QR', (text) => {
    if (!text) return false
    checkIn({ code: text })
    return true // close the scanner and show the answer
  })
  if (!opened) toast('The scanner could not open on this device')
}

async function checkIn({ code, ticket, name }) {
  state.busy = true
  state.lastCode = code || ''
  setMainButton()
  showResult({ ok: true, title: 'Checking…', name: name || 'Checking…', detail: '', pending: true })
  let res
  try {
    res = await call(code ? { action: 'checkin', code } : { action: 'checkin_id', ticket })
  } catch (err) {
    res = { ok: false, network: true, title: 'Can’t reach the bot', detail: 'Nothing was saved\nCheck the internet, then try again', retry: { code, ticket } }
  }
  state.busy = false
  if (res.error === 'auth' || res.error === 'not_staff') return renderProblem(res)
  showResult(res)
  tg.haptic(res.network ? 'warning' : res.ok ? 'success' : 'error')
  if (res.counts && state.me) {
    state.me.counts = res.counts
    const counter = $('#counter')
    if (counter) counter.outerHTML = counterHtml()
  }
  setMainButton()
  if (!res.network) refresh({ quiet: true })
  if (state.results && state.query) search(state.query, { quiet: true })
}

function showResult(res) {
  state.result = res
  const slot = $('#result-slot')
  if (!slot) return
  slot.innerHTML = res.pending ? `<section class="result result--wait" id="result"><div class="result__icon">${icon('hourglass')}</div><div class="result__body"><p class="result__label">Checking the ticket</p><h2>One moment…</h2></div></section>` : resultHtml()
  const dismiss = $('#dismiss')
  if (dismiss) dismiss.addEventListener('click', () => { state.result = null; slot.innerHTML = ''; setMainButton() })
  const resend = $('#resend')
  if (resend) resend.addEventListener('click', () => checkIn(res.retry || {}))
  slot.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}

/* ------------------------------------------------------------- search */

let searchTimer = null
let searchSeq = 0
async function search(q, { quiet = false } = {}) {
  const seq = ++searchSeq
  state.query = q
  if (q.trim().length < 2) {
    state.results = null
    $('#results').innerHTML = ''
    return
  }
  if (!quiet) {
    state.searching = true
    $('#results').innerHTML = resultsHtml()
  }
  try {
    const res = await call({ action: 'search', q })
    if (seq !== searchSeq) return
    state.searching = false
    state.results = res.ok ? res.results : []
  } catch {
    if (seq !== searchSeq) return
    state.searching = false
    state.results = null
    toast('Search failed, please try again')
  }
  const box = $('#results')
  if (box) box.innerHTML = resultsHtml()
}

function bind() {
  const q = $('#q')
  if (q) {
    q.addEventListener('input', () => {
      clearTimeout(searchTimer)
      searchTimer = setTimeout(() => search(q.value), 450)
    })
    q.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); clearTimeout(searchTimer); search(q.value); q.blur() }
    })
  }
  const scan = $('#scan')
  if (scan) scan.addEventListener('click', openScanner)
}

// "Check in" buttons in the search results (one listener for the whole page).
app.addEventListener('click', async (e) => {
  const b = e.target.closest && e.target.closest('[data-checkin]')
  if (!b || state.busy) return
  const who = b.dataset.name + (b.dataset.guest ? `, ${b.dataset.guest}` : '')
  if (!(await tg.showConfirm(`Check in ${who}?`))) return
  checkIn({ ticket: b.dataset.checkin, name: b.dataset.name })
})

/* ------------------------------------------------------------- start */

async function start() {
  tg.ready({ header: '#4b0c09', background: '#F5F4EF' })
  if (!tg.initData()) return renderProblem({ error: 'auth' })
  await refresh()
  if (!state.me) return
  schedule()
  if (location.hash === '#scan' && tg.scanner.available()) setTimeout(openScanner, 350)
}

start()
