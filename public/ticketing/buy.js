/**
 * Ticket form (/buy). Opened inside Telegram from the CoStars bot.
 *
 *  • From a button in the chat or the 🎟 Tickets button: Telegram signs the
 *    launch (initData), so the form loads the customer's details and sends the
 *    order straight to the bot. The page then shows the KHQR to pay (the bot
 *    also sends it to the chat).
 *  • From the 🎟 key under the chat: there is no signature, so the form hands
 *    its answers to Telegram (sendData) and the bot replies in the chat.
 *  • In a normal browser: the page shows the tickets and a button to open the bot.
 */
import { apiGet, apiPost } from './api.js'
import { botLink } from './config.js'
import * as tg from './tg.js'
import { HERO_WAVE, copyText, esc, fill, icon, khDigits, logoHtml, money, nonce, riel, savedLang, saveLang, toast } from './ui.js'

const T = {
  en: {
    pageTitle: 'CoStars tickets',
    eyebrow: 'Charity Mini Concert',
    title: 'Get your tickets',
    subtitle: 'Every ticket helps buy school supplies for children in need 💛',
    step1: 'Choose your ticket',
    indName: 'Standard',
    indDesc: '1 person, drink included',
    grpName: 'Group of {size}',
    grpDesc: '{size} people, drinks included\nEveryone gets their own QR',
    save: 'Save {amount}',
    left: 'Only {n} left',
    lastOne: 'Last one!',
    promo: 'Limited promotion',
    soldOut: 'Sold out',
    step2: 'Your details',
    nameInd: 'Your full name',
    nameGrp: 'Group name',
    nameHintInd: 'This name goes on your ticket',
    nameHintGrp: 'One name for the whole group is enough',
    nameHintMany: 'This name goes on all {n} tickets',
    namePh: 'e.g. Sok Dara',
    phone: 'Phone number',
    phoneHint: 'So our team can reach you if needed',
    phonePh: '012 345 678',
    usePhone: 'Use my Telegram number',
    phoneShared: 'Thanks! Your number was shared with the bot',
    welcomeBack: 'Welcome back! We filled in your details from last time',
    badName: 'Please type a name with 2 to 60 letters',
    badPhone: 'Please type 8 to 15 digits, like 012 345 678',
    pickTicket: 'Please choose a ticket first',
    qtyLabel: 'How many tickets?',
    qtyHint: '{price} each, up to {max} tickets',
    qtyLess: 'One ticket less',
    qtyMore: 'One ticket more',
    badQty: 'Please choose 1 to {max} tickets',
    qtyBreak: '{n} tickets × {price}',
    step3: 'How you pay',
    pay1: 'Tap {button} below',
    pay2: 'Scan the KHQR on the next screen and write your order number in the remark',
    pay3: 'Send a photo of your receipt in the chat',
    pay4: 'Your QR ticket arrives in Telegram 🎟',
    total: 'Total',
    or: 'or',
    noCancel: 'Tickets can’t be cancelled after payment',
    confirm: 'Confirm and pay {amount}',
    confirmShort: 'Confirm and pay',
    sending: 'Sending…',
    openWaiting: 'Order {order} is waiting for payment ({amount})\nSending this form replaces it with a new order',
    openChecking: 'We’re checking your payment for {order}\nYour QR tickets will arrive in the chat soon',
    yourTickets: 'Your tickets',
    guestOf: 'Guest {n} of {total}',
    checkedIn: 'Checked in',
    salesClosed: 'Ticket sales are closed for now',
    salesClosedSub: 'Thank you so much for your support 💛',
    soldOutAll: 'Tickets are sold out 😢',
    soldOutSub: 'You can still help the children: tap 💝 Donate in the bot',
    doneTitle: 'Order {order} is ready 🎉',
    doneSent: 'We sent the payment KHQR to your chat',
    done1: 'Open the chat with the CoStars bot',
    done2: 'Pay {amount} and write {order} in the remark',
    done3: 'Send a photo of your receipt in the chat',
    doneGo: 'Go to the chat to pay',
    payNow: 'Pay',
    payScan: 'Scan this KHQR with your bank app',
    remark: 'Write this in the remark',
    copy: 'Copy',
    copied: 'Copied {order}',
    saveQr: 'Save the KHQR',
    savedQr: 'Saved 👍',
    khqr1: 'Scan or save this KHQR and pay {amount} in your bank app',
    khqr2: 'Write {order} in the remark',
    khqr3: 'Send a photo of your receipt in the chat with the bot',
    khqr4: 'Your QR ticket arrives in Telegram 🎟',
    khqrAlso: 'The same KHQR is also in your chat with the bot',
    khqrFail: 'The KHQR didn’t load here\nYou’ll find it in your chat with the bot',
    goReceipt: 'Go to the chat to send the receipt',
    showKhqr: 'Show the payment KHQR',
    khqrAlt: 'KHQR to pay CoStars',
    notSent: 'We couldn’t message you yet\nOpen the bot, tap Start, then tap 🎫 My tickets to see the payment QR',
    openBot: 'Open the CoStars bot',
    browserTitle: 'Tickets are sold in Telegram',
    browserSub: 'Open our bot, tap the ticket form and pay with KHQR\nIt only takes a minute',
    browserBtn: 'Buy in Telegram',
    netError: 'We couldn’t reach the ticket desk 😥\nPlease check your internet and try again',
    loadError: 'The ticket form couldn’t load',
    retry: 'Try again',
    already: 'Your order was already sent\nPlease check the chat for the payment QR',
    help: 'Questions? Tap 📞 Contact in the bot',
    prices: 'Ticket prices',
    thanksTitle: 'Thank you!',
    thanksSub: 'You’re helping children get the school supplies they need 💛',
  },
  km: {
    pageTitle: 'សំបុត្រ CoStars',
    eyebrow: 'ការប្រគុំតន្ត្រីសប្បុរសធម៌',
    title: 'ទិញសំបុត្ររបស់អ្នក',
    subtitle: 'សំបុត្រនីមួយៗជួយទិញសម្ភារៈសិក្សាជូនកុមារដែលខ្វះខាត 💛',
    step1: 'ជ្រើសរើសសំបុត្រ',
    indName: 'ស្តង់ដារ',
    indDesc: '១ នាក់ រួមទាំងភេសជ្ជៈ',
    grpName: 'ក្រុម {size} នាក់',
    grpDesc: '{size} នាក់ រួមទាំងភេសជ្ជៈ\nម្នាក់ៗទទួលបាន QR ផ្ទាល់ខ្លួន',
    save: 'សន្សំបាន {amount}',
    left: 'នៅសល់តែ {n} ប៉ុណ្ណោះ',
    lastOne: 'សល់ចុងក្រោយ!',
    promo: 'ប្រូម៉ូសិនមានចំនួនកំណត់',
    soldOut: 'លក់អស់ហើយ',
    step2: 'ព័ត៌មានរបស់អ្នក',
    nameInd: 'ឈ្មោះពេញរបស់អ្នក',
    nameGrp: 'ឈ្មោះក្រុម',
    nameHintInd: 'ឈ្មោះនេះនឹងបង្ហាញនៅលើសំបុត្ររបស់អ្នក',
    nameHintGrp: 'ឈ្មោះតែមួយសម្រាប់ក្រុមទាំងមូលគឺគ្រប់គ្រាន់ហើយ',
    nameHintMany: 'ឈ្មោះនេះនឹងបង្ហាញនៅលើសំបុត្រទាំង {n} សន្លឹក',
    namePh: 'ឧ. សុខ ដារ៉ា',
    phone: 'លេខទូរស័ព្ទ',
    phoneHint: 'ដើម្បីឲ្យក្រុមការងារអាចទាក់ទងអ្នកបាន ពេលចាំបាច់',
    phonePh: '012 345 678',
    usePhone: 'ប្រើលេខ Telegram របស់ខ្ញុំ',
    phoneShared: 'អរគុណ! លេខរបស់អ្នកត្រូវបានចែករំលែកជាមួយ Bot ហើយ',
    welcomeBack: 'សូមស្វាគមន៍ការត្រឡប់មកវិញ! យើងបានបំពេញព័ត៌មានពីលើកមុនឲ្យរួចហើយ',
    badName: 'សូមវាយឈ្មោះដែលមានពី ២ ដល់ ៦០ តួអក្សរ',
    badPhone: 'សូមវាយលេខពី ៨ ដល់ ១៥ ខ្ទង់ ឧទាហរណ៍ 012 345 678',
    pickTicket: 'សូមជ្រើសរើសសំបុត្រជាមុនសិន',
    qtyLabel: 'ចំនួនសំបុត្រ',
    qtyHint: 'សន្លឹកមួយ {price} ទិញបានដល់ {max} សន្លឹក',
    qtyLess: 'ដកមួយសន្លឹក',
    qtyMore: 'បន្ថែមមួយសន្លឹក',
    badQty: 'សូមជ្រើសរើសសំបុត្រពី ១ ដល់ {max} សន្លឹក',
    qtyBreak: 'សំបុត្រ {n} សន្លឹក × {price}',
    step3: 'របៀបបង់ប្រាក់',
    pay1: 'ចុច {button} ខាងក្រោម',
    pay2: 'ស្កេន KHQR នៅអេក្រង់បន្ទាប់ ហើយសរសេរលេខបញ្ជាទិញក្នុងប្រអប់ចំណាំ',
    pay3: 'ផ្ញើរូបថតបង្កាន់ដៃក្នុងការជជែក',
    pay4: 'សំបុត្រ QR របស់អ្នកនឹងផ្ញើមកក្នុង Telegram 🎟',
    total: 'សរុប',
    or: 'ឬ',
    noCancel: 'សំបុត្រមិនអាចលុបចោលបានទេ បន្ទាប់ពីបង់ប្រាក់រួច',
    confirm: 'បញ្ជាក់ និងបង់ {amount}',
    confirmShort: 'បញ្ជាក់ និងបង់ប្រាក់',
    sending: 'កំពុងផ្ញើ…',
    openWaiting: 'ការបញ្ជាទិញ {order} កំពុងរង់ចាំការបង់ប្រាក់ ({amount})\nការផ្ញើទម្រង់នេះនឹងជំនួសវាដោយការបញ្ជាទិញថ្មី',
    openChecking: 'យើងកំពុងពិនិត្យការបង់ប្រាក់សម្រាប់ {order}\nសំបុត្រ QR នឹងផ្ញើមកក្នុងការជជែកឆាប់ៗ',
    yourTickets: 'សំបុត្ររបស់អ្នក',
    guestOf: 'ភ្ញៀវទី {n} នៃ {total}',
    checkedIn: 'បានចូលរួចហើយ',
    salesClosed: 'ការលក់សំបុត្របានបិទសិនហើយ',
    salesClosedSub: 'សូមអរគុណយ៉ាងច្រើនចំពោះការគាំទ្រ 💛',
    soldOutAll: 'សំបុត្រលក់អស់ហើយ 😢',
    soldOutSub: 'អ្នកនៅតែអាចជួយកុមារបាន៖ ចុច 💝 បរិច្ចាគ ក្នុង Bot',
    doneTitle: 'ការបញ្ជាទិញ {order} រួចរាល់ហើយ 🎉',
    doneSent: 'យើងបានផ្ញើ KHQR សម្រាប់បង់ប្រាក់ទៅក្នុងការជជែករបស់អ្នកហើយ',
    done1: 'បើកការជជែកជាមួយ CoStars Bot',
    done2: 'បង់ {amount} ហើយសរសេរ {order} ក្នុងប្រអប់ចំណាំ',
    done3: 'ផ្ញើរូបថតបង្កាន់ដៃក្នុងការជជែក',
    doneGo: 'ទៅកាន់ការជជែកដើម្បីបង់ប្រាក់',
    payNow: 'បង់',
    payScan: 'ស្កេន KHQR នេះជាមួយកម្មវិធីធនាគាររបស់អ្នក',
    remark: 'សរសេរលេខនេះក្នុងប្រអប់ចំណាំ',
    copy: 'ចម្លង',
    copied: 'បានចម្លង {order}',
    saveQr: 'រក្សាទុក KHQR',
    savedQr: 'បានរក្សាទុក 👍',
    khqr1: 'ស្កេន ឬរក្សាទុក KHQR នេះ ហើយបង់ {amount} ក្នុងកម្មវិធីធនាគារ',
    khqr2: 'សរសេរ {order} ក្នុងប្រអប់ចំណាំ',
    khqr3: 'ផ្ញើរូបថតបង្កាន់ដៃក្នុងការជជែកជាមួយ Bot',
    khqr4: 'សំបុត្រ QR របស់អ្នកនឹងផ្ញើមកក្នុង Telegram 🎟',
    khqrAlso: 'KHQR ដដែលនេះក៏មាននៅក្នុងការជជែកជាមួយ Bot ដែរ',
    khqrFail: 'មិនអាចបង្ហាញ KHQR នៅទីនេះបានទេ\nសូមមើលវានៅក្នុងការជជែកជាមួយ Bot',
    goReceipt: 'ទៅកាន់ការជជែកដើម្បីផ្ញើបង្កាន់ដៃ',
    showKhqr: 'បង្ហាញ KHQR សម្រាប់បង់ប្រាក់',
    khqrAlt: 'KHQR សម្រាប់បង់ប្រាក់ជូន CoStars',
    notSent: 'យើងមិនទាន់អាចផ្ញើសារទៅអ្នកបានទេ\nសូមបើក Bot ចុច Start រួចចុច 🎫 សំបុត្ររបស់ខ្ញុំ ដើម្បីមើល QR បង់ប្រាក់',
    openBot: 'បើក CoStars Bot',
    browserTitle: 'សំបុត្រលក់តាម Telegram',
    browserSub: 'បើក Bot របស់យើង បំពេញទម្រង់ ហើយបង់ប្រាក់តាម KHQR\nចំណាយពេលតែមួយនាទីប៉ុណ្ណោះ',
    browserBtn: 'ទិញក្នុង Telegram',
    netError: 'មិនអាចភ្ជាប់ទៅកាន់ផ្នែកលក់សំបុត្របានទេ 😥\nសូមពិនិត្យអ៊ីនធឺណិត ហើយព្យាយាមម្ដងទៀត',
    loadError: 'មិនអាចបើកទម្រង់ទិញសំបុត្របានទេ',
    retry: 'ព្យាយាមម្ដងទៀត',
    already: 'ការបញ្ជាទិញរបស់អ្នកត្រូវបានផ្ញើរួចហើយ\nសូមពិនិត្យ QR បង់ប្រាក់ក្នុងការជជែក',
    help: 'មានសំណួរ? ចុច 📞 ទំនាក់ទំនង ក្នុង Bot',
    prices: 'តម្លៃសំបុត្រ',
    thanksTitle: 'សូមអរគុណ!',
    thanksSub: 'អ្នកកំពុងជួយឲ្យកុមារមានសម្ភារៈសិក្សាដែលពួកគេត្រូវការ 💛',
  },
}

const $ = (sel, root = document) => root.querySelector(sel)
const app = $('#app')
const params = new URLSearchParams(location.search)
const MODE = tg.initData() ? 'api' : tg.inTelegram() ? 'keyboard' : 'browser'

const state = {
  lang: pickLang(params.get('lang')),
  langFixed: /^(en|km)$/.test(params.get('lang') || ''),
  info: null,
  type: '',
  qty: 1,
  name: '',
  phone: '',
  prefilled: false,
  errors: {},
  busy: false,
  attempt: null,
  done: null,
}

function pickLang(fromUrl) {
  if (fromUrl === 'km' || fromUrl === 'en') return fromUrl
  const saved = savedLang()
  if (saved === 'km' || saved === 'en') return saved
  return /^km/i.test(tg.languageCode()) ? 'km' : 'en'
}

const t = (key, vars) => fill(T[state.lang][key] ?? T.en[key] ?? key, vars)
const lines = (s) => s.split('\n').join('<br>')
const n = (v) => (state.lang === 'km' ? khDigits(v) : String(v))

/* ------------------------------------------------------------- numbers */

function prices() {
  const p = (state.info && state.info.prices) || { individual: 8, group: 38, symbol: '$', khrRate: 0 }
  return p
}
const priceOf = (type) => (type === 'GROUP' ? prices().group : prices().individual)
/** Most Standard tickets in one order (the bot's max_standard setting, fewer when seats run out). */
const maxQty = () => Math.max(1, Number(state.info && state.info.maxStandard) || 10)
const qtyOf = (type) => (type === 'GROUP' ? 1 : state.qty)
const totalOf = (type) => priceOf(type) * qtyOf(type)
const amountText = (amount) => {
  const r = riel(amount, prices().khrRate)
  return money(amount, prices().symbol) + (r ? ` ${T[state.lang].or} ${r}` : '')
}

function cleanName(v) {
  const s = String(v || '').replace(/\s+/g, ' ').trim().replace(/^[=+@-]+\s*/, '')
  return s.length >= 2 && s.length <= 60 && s[0] !== '/' ? s : ''
}
function cleanPhone(v) {
  const raw = String(v || '').trim()
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 15 ? (raw[0] === '+' ? '+' : '') + digits : ''
}

/* ------------------------------------------------------------- loading */

async function load() {
  tg.ready()
  try {
    state.info = MODE === 'api' ? await apiPost({ action: 'form', initData: tg.initData() }) : await apiGet({ action: 'info' })
    if (!state.info || !state.info.ok) throw new Error((state.info && (state.info.detail || state.info.error)) || 'not ok')
  } catch (err) {
    console.warn('form data failed', err)
    return renderLoadError()
  }
  const info = state.info
  if (!state.langFixed && (info.lang === 'km' || info.lang === 'en')) state.lang = info.lang
  if (info.last && MODE === 'api' && !state.name && !state.phone) {
    state.name = info.last.name || ''
    state.phone = info.last.phone || ''
    state.prefilled = !!(state.name || state.phone)
  }
  // Pick a ticket that is still on sale (nothing is picked on the browser page, where it is only a price list).
  const onSale = (type) => !!type && info.salesOpen && (type === 'GROUP' ? info.canGroup : info.canIndividual)
  state.qty = Math.min(Math.max(1, state.qty), maxQty())
  if (MODE === 'browser') state.type = ''
  else if (!onSale(state.type)) state.type = onSale('INDIVIDUAL') ? 'INDIVIDUAL' : onSale('GROUP') ? 'GROUP' : ''
  render()
}

/* ------------------------------------------------------------- views */

function event() {
  const ev = (state.info && state.info.event && (state.info.event[state.lang] || state.info.event.en)) || {}
  return {
    date: state.lang === 'km' ? ev.date || '' : ev.dateLabel || ev.date || '',
    time: ev.time || '',
    venue: ev.venue || '',
    area: ev.venueArea || '',
  }
}

function heroHtml(done = false) {
  return `
    <header class="hero">
      <div class="hero__sil"></div>
      <div class="hero__top">
        ${logoHtml()}
        <div class="lang" role="group" aria-label="Language">
          <button type="button" data-lang="en" aria-pressed="${state.lang === 'en'}">EN</button>
          <button type="button" data-lang="km" aria-pressed="${state.lang === 'km'}">ខ្មែរ</button>
        </div>
      </div>
      <p class="hero__title">${esc(T[state.lang].eyebrow)}</p>
      <h1>${esc(T[state.lang][done ? 'thanksTitle' : 'title'])}</h1>
      <p class="hero__sub">${esc(T[state.lang][done ? 'thanksSub' : 'subtitle'])}</p>
      ${HERO_WAVE}
    </header>`
}

function factsHtml() {
  const ev = event()
  return `
    <div class="facts rise">
      <div class="fact">${icon('calendar')}<div><b>${esc(ev.date)}</b><span>${esc(ev.time)}</span></div></div>
      <div class="fact">${icon('pin')}<div><b>${esc(ev.venue)}</b><span>${esc(ev.area)}</span></div></div>
    </div>`
}

function choiceHtml(type) {
  const info = state.info
  const p = prices()
  const size = info.groupSize || 5
  const group = type === 'GROUP'
  const can = group ? info.canGroup && info.salesOpen : info.canIndividual && info.salesOpen
  const amount = priceOf(type)
  const r = riel(amount, p.khrRate)
  const badges = []
  if (!can) badges.push(`<span class="badge badge--grey">${esc(T[state.lang].soldOut)}</span>`)
  else if (group) {
    const saving = p.individual * size - p.group
    if (saving > 0) badges.push(`<span class="badge badge--green">${esc(t('save', { amount: money(saving, p.symbol) }))}</span>`)
    if (info.groupLeft === 1) badges.push(`<span class="badge badge--wine">${esc(T[state.lang].lastOne)}</span>`)
    else if (info.groupLeft <= 5) badges.push(`<span class="badge">🔥 ${esc(t('left', { n: n(info.groupLeft) }))}</span>`)
    else badges.push(`<span class="badge">🔥 ${esc(T[state.lang].promo)}</span>`)
  }
  const name = group ? t('grpName', { size: n(size) }) : esc(T[state.lang].indName)
  const desc = group ? t('grpDesc', { size: n(size) }) : esc(T[state.lang].indDesc)
  const tag = MODE === 'browser' ? 'div' : 'button'
  const attrs = MODE === 'browser' ? '' : `type="button" role="radio" aria-checked="${state.type === type}" aria-disabled="${!can}" ${can ? '' : 'tabindex="-1"'}`
  return `
    <${tag} class="choice" data-type="${type}" ${attrs}>
      <span class="choice__icon">${icon(group ? 'users' : 'user')}</span>
      <span>
        <span class="choice__name">${name}</span>
        <span class="choice__desc">${lines(desc)}</span>
        ${badges.length ? `<span class="choice__badges">${badges.join('')}</span>` : ''}
      </span>
      <span class="choice__price"><b>${esc(money(amount, p.symbol))}</b>${r ? `<span>${esc(r)}</span>` : ''}</span>
    </${tag}>`
}

function noticesHtml() {
  const info = state.info
  const out = []
  if (!info.salesOpen) {
    out.push(`<div class="notice notice--red rise">${icon('info')}<div><b>${esc(T[state.lang].salesClosed)}</b><br>${esc(T[state.lang].salesClosedSub)}</div></div>`)
  } else if (!info.canIndividual && !info.canGroup) {
    out.push(`<div class="notice notice--red rise">${icon('info')}<div><b>${esc(T[state.lang].soldOutAll)}</b><br>${esc(T[state.lang].soldOutSub)}</div></div>`)
  }
  if (info.open && info.salesOpen) {
    const key = info.open.status === 'AWAITING_PAYMENT' ? 'openWaiting' : 'openChecking'
    const showPay = key === 'openWaiting' && info.khqr && MODE === 'api'
    out.push(`<div class="notice rise">${icon(key === 'openWaiting' ? 'hourglass' : 'receipt')}<div>${lines(t(key, { order: info.open.order, amount: info.open.amountText || '' }))}${
      showPay ? `<br><button type="button" class="btn btn--light btn--small" id="show-khqr" style="margin-top:8px">${icon('qr')}${esc(T[state.lang].showKhqr)}</button>` : ''}</div></div>`)
  }
  if (state.prefilled) out.push(`<div class="notice notice--green rise">${icon('heart')}<div>${esc(T[state.lang].welcomeBack)}</div></div>`)
  return out.length ? `<div class="section" style="display:grid;gap:10px">${out.join('')}</div>` : ''
}

function ownedHtml() {
  const list = (state.info && state.info.tickets) || []
  if (!list.length) return ''
  const chips = list
    .map((x) => {
      const label = x.guests > 1 ? t('guestOf', { n: n(x.guestNo), total: n(x.guests) }) : esc(x.id)
      const done = x.status === 'CHECKED_IN'
      return `<a href="/t/${encodeURIComponent(x.code)}" data-ticket="${esc(x.code)}">${icon('ticket')}<span>${label}</span>${done ? `<span class="badge badge--green">${esc(T[state.lang].checkedIn)}</span>` : ''}</a>`
    })
    .join('')
  return `
    <section class="section">
      <div class="section__head">${icon('ticket', 'style="width:20px;height:20px;color:#810102"')}<h2>${esc(T[state.lang].yourTickets)}</h2></div>
      <div class="owned">${chips}</div>
    </section>`
}

function nameHint() {
  if (state.type === 'GROUP') return esc(T[state.lang].nameHintGrp)
  return state.qty > 1 ? t('nameHintMany', { n: n(state.qty) }) : esc(T[state.lang].nameHintInd)
}

/** How many Standard tickets: − 1 + with a box to type the number. */
function qtyHtml() {
  const max = maxQty()
  const err = state.errors.qty
  return `
    <div class="qty card rise" id="qty-box">
      <label class="qty__text" for="qty">
        <b>${esc(T[state.lang].qtyLabel)}</b>
        ${err ? `<span class="field__error" role="alert">${esc(err)}</span>` : `<span>${t('qtyHint', { price: money(prices().individual, prices().symbol), max: n(max) })}</span>`}
      </label>
      <div class="qty__ctrl">
        <button type="button" class="qty__btn" data-step="-1" aria-label="${esc(T[state.lang].qtyLess)}" ${state.qty <= 1 ? 'disabled' : ''}>${icon('minus')}</button>
        <input class="qty__input" id="qty" type="number" inputmode="numeric" pattern="[0-9]*" min="1" max="${max}" step="1" value="${state.qty}" aria-invalid="${!!err}" />
        <button type="button" class="qty__btn" data-step="1" aria-label="${esc(T[state.lang].qtyMore)}" ${state.qty >= max ? 'disabled' : ''}>${icon('plus')}</button>
      </div>
    </div>`
}

function formHtml() {
  const group = state.type === 'GROUP'
  const err = state.errors
  const canUsePhone = MODE === 'api' && tg.inTelegram()
  return `
    <section class="section">
      <div class="section__head"><span class="step-no">${n(2)}</span><h2>${esc(T[state.lang].step2)}</h2></div>
      <div class="card card--pad">
        <label class="field">
          <span class="field__label" id="name-label">${esc(T[state.lang][group ? 'nameGrp' : 'nameInd'])}</span>
          <input class="input" id="name" name="name" autocomplete="name" maxlength="80" enterkeyhint="next"
            placeholder="${esc(T[state.lang].namePh)}" value="${esc(state.name)}" aria-invalid="${!!err.name}" aria-describedby="name-hint" />
          ${err.name ? `<span class="field__error" role="alert">${esc(err.name)}</span>` : `<span class="field__hint" id="name-hint">${nameHint()}</span>`}
        </label>
        <label class="field">
          <span class="field__label">${esc(T[state.lang].phone)}</span>
          <span class="field__row">
            <input class="input" id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="24" enterkeyhint="done"
              placeholder="${esc(T[state.lang].phonePh)}" value="${esc(state.phone)}" aria-invalid="${!!err.phone}" />
          </span>
          ${err.phone ? `<span class="field__error" role="alert">${esc(err.phone)}</span>` : `<span class="field__hint">${esc(T[state.lang].phoneHint)}</span>`}
          ${canUsePhone ? `<button type="button" class="btn btn--ghost btn--small" id="use-phone" style="margin-top:6px">${icon('phone')}${esc(T[state.lang].usePhone)}</button>` : ''}
        </label>
      </div>
    </section>`
}

function totalInner() {
  const type = state.type || 'INDIVIDUAL'
  const amount = totalOf(type)
  const r = riel(amount, prices().khrRate)
  const breakdown = type !== 'GROUP' && state.qty > 1 ? `<small>${t('qtyBreak', { n: n(state.qty), price: money(prices().individual, prices().symbol) })}</small>` : ''
  return `<span>${esc(T[state.lang].total)}${breakdown}</span>
          <div style="text-align:right"><b>${esc(money(amount, prices().symbol))}</b>${r ? `<br><span>${esc(T[state.lang].or)} ${esc(r)}</span>` : ''}</div>`
}

function payHtml() {
  const buttonName = `<b>${esc(T[state.lang].confirmShort)}</b>`
  return `
    <section class="section">
      <div class="section__head"><span class="step-no">${n(3)}</span><h2>${esc(T[state.lang].step3)}</h2></div>
      <div class="card card--pad">
        <ol class="steps">
          <li>${fill(T[state.lang].pay1, {}).replace('{button}', buttonName)}</li>
          <li>${esc(T[state.lang].pay2)}</li>
          <li>${esc(T[state.lang].pay3)}</li>
          <li>${esc(T[state.lang].pay4)}</li>
        </ol>
        <div class="total" id="total">${totalInner()}</div>
      </div>
      <p class="notice notice--plain" style="margin-top:10px">${icon('info')}<span>${esc(T[state.lang].noCancel)}</span></p>
    </section>`
}

function browserCtaHtml() {
  return `
    <section class="section card card--pad center rise">
      <div class="state__icon" style="width:56px;height:56px;margin-bottom:10px">${icon('send')}</div>
      <h2>${esc(T[state.lang].browserTitle)}</h2>
      <p class="muted small" style="margin:6px 0 14px">${lines(esc(T[state.lang].browserSub))}</p>
      <a class="btn btn--tg btn--block btn--big" href="${botLink('buy')}">${icon('send')}${esc(T[state.lang].browserBtn)}</a>
    </section>`
}

function footerHtml() {
  return `<p class="footer-note">${esc(T[state.lang].help)}</p>`
}

function render() {
  document.documentElement.lang = state.lang
  document.title = T[state.lang].pageTitle
  app.setAttribute('aria-busy', 'false')
  if (state.done) return renderDone()
  const info = state.info
  const open = info.salesOpen && (info.canIndividual || info.canGroup)
  const canBuyHere = MODE !== 'browser'
  app.innerHTML = `
    ${heroHtml()}
    ${factsHtml()}
    ${noticesHtml()}
    ${ownedHtml()}
    <section class="section">
      ${canBuyHere
        ? `<div class="section__head"><span class="step-no">${n(1)}</span><h2>${esc(T[state.lang].step1)}</h2></div>`
        : `<div class="section__head">${icon('ticket', 'style="width:22px;height:22px;color:#810102"')}<h2>${esc(T[state.lang].prices)}</h2></div>`}
      <div class="choices ${canBuyHere ? '' : 'choices--static'}" ${canBuyHere ? 'role="radiogroup"' : ''} aria-label="${esc(T[state.lang][canBuyHere ? 'step1' : 'prices'])}">
        ${choiceHtml('INDIVIDUAL')}
        ${choiceHtml('GROUP')}
      </div>
      ${open && canBuyHere && state.type === 'INDIVIDUAL' ? qtyHtml() : ''}
    </section>
    ${open && canBuyHere ? formHtml() + payHtml() : ''}
    ${open && !canBuyHere ? browserCtaHtml() : ''}
    ${open && canBuyHere && !tg.mainButton.available() ? `<button type="button" class="btn btn--block btn--big section" id="submit">${icon('check')}<span id="submit-text"></span></button>` : ''}
    ${footerHtml()}`
  bind()
  updateButton()
}

function renderLoadError() {
  app.setAttribute('aria-busy', 'false')
  tg.mainButton.hide()
  app.innerHTML = `
    ${heroHtml()}
    <div class="state card rise">
      <div class="state__icon">${icon('alert')}</div>
      <h2>${esc(T[state.lang].loadError)}</h2>
      <p>${lines(esc(T[state.lang].netError))}</p>
      <button type="button" class="btn" id="retry">${icon('refresh')}${esc(T[state.lang].retry)}</button>
    </div>`
  $('#retry').addEventListener('click', () => location.reload())
  bindLang()
}

/** The KHQR picture, served by the website from the bot (v changes when an admin sets a new KHQR). */
const khqrUrl = (download) => `/api/khqr?v=${encodeURIComponent((state.info && state.info.khqr) || '')}${download ? '&download=1' : ''}`

function khqrHtml(d) {
  const p = prices()
  const r = riel(d.amount, p.khrRate)
  return `
    <div class="khqr rise" style="animation-delay:.05s">
      <p class="khqr__amount"><span>${esc(T[state.lang].payNow)}</span><b>${esc(money(d.amount, p.symbol))}</b>${r ? `<small>${esc(T[state.lang].or)} ${esc(r)}</small>` : ''}</p>
      <p class="khqr__sub">${esc(T[state.lang].payScan)}</p>
      <div class="khqr__img"><img src="${khqrUrl(false)}" alt="${esc(T[state.lang].khqrAlt)}" id="khqr-img" /></div>
      <p class="khqr__fail" id="khqr-fail" hidden>${lines(esc(T[state.lang].khqrFail))}</p>
      <div class="khqr__remark">
        <div><span>${esc(T[state.lang].remark)}</span><b>${esc(d.order)}</b></div>
        <button type="button" class="btn btn--light btn--small" id="copy-order">${icon('copy')}${esc(T[state.lang].copy)}</button>
      </div>
      <button type="button" class="btn btn--light btn--block" id="save-khqr">${icon('download')}${esc(T[state.lang].saveQr)}</button>
    </div>`
}

function renderDone() {
  const d = state.done
  tg.closingConfirmation(false)
  const amount = d.amountText || amountText(d.amount)
  const showKhqr = !!(state.info && state.info.khqr) && d.sent
  app.innerHTML = `
    ${heroHtml(true)}
    <div class="state card rise" style="margin-top:-36px;position:relative">
      <div class="state__icon state__icon--green pop">${icon('check')}</div>
      <h2>${t('doneTitle', { order: d.order })}</h2>
      ${d.ticket ? `<p class="muted">${esc(d.ticket)}</p>` : ''}
      ${showKhqr ? khqrHtml(d) : d.sent ? `<p>${esc(T[state.lang].doneSent)}</p>` : `<p class="notice" style="text-align:left;margin-top:12px">${lines(esc(T[state.lang].notSent))}</p>`}
      <ol class="steps" style="text-align:left;margin:18px auto 0;max-width:360px">
        ${showKhqr
          ? `<li>${t('khqr1', { amount })}</li><li>${t('khqr2', { order: d.order })}</li><li>${esc(T[state.lang].khqr3)}</li><li>${esc(T[state.lang].khqr4)}</li>`
          : `<li>${esc(T[state.lang].done1)}</li><li>${t('done2', { amount, order: d.order })}</li><li>${esc(T[state.lang].done3)}</li>`}
      </ol>
      ${showKhqr ? `<p class="muted small" style="margin-top:6px">${esc(T[state.lang].khqrAlso)}</p>` : ''}
      ${tg.mainButton.available() ? '' : `<a class="btn btn--block btn--big" href="${botLink()}">${icon('send')}${esc(T[state.lang][d.sent ? (showKhqr ? 'goReceipt' : 'doneGo') : 'openBot'])}</a>`}
    </div>
    ${footerHtml()}`
  bindLang()
  bindKhqr(d)
  tg.mainButton.progress(false)
  tg.mainButton.set({
    text: T[state.lang][d.sent ? (showKhqr ? 'goReceipt' : 'doneGo') : 'openBot'],
    onClick: () => (d.sent ? tg.close() : tg.openTelegramLink(botLink())),
    shine: true,
  })
}

function bindKhqr(d) {
  const img = $('#khqr-img')
  if (img) {
    img.addEventListener('error', () => {
      img.closest('.khqr__img').hidden = true
      $('#khqr-fail').hidden = false
      const save = $('#save-khqr')
      if (save) save.hidden = true
    })
  }
  const copy = $('#copy-order')
  if (copy) {
    copy.addEventListener('click', async () => {
      await copyText(d.order)
      tg.haptic('success')
      toast(T[state.lang].copied.replace('{order}', d.order))
    })
  }
  const save = $('#save-khqr')
  if (save) {
    save.addEventListener('click', async () => {
      const url = new URL(khqrUrl(true), location.href).href
      if (tg.download.available()) {
        const ok = await tg.download.file(url, `CoStars-KHQR-${d.order}.jpg`)
        if (ok) toast(T[state.lang].savedQr)
        return
      }
      tg.openLink(url)
    })
  }
}

/* ------------------------------------------------------------- behaviour */

/** Inside Telegram, links to other pages of the website open in the browser, so the form stays open. */
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href]')
  if (!a || !tg.inTelegram()) return
  const url = new URL(a.getAttribute('href'), location.href)
  if (url.hostname === 't.me') {
    e.preventDefault()
    return tg.openTelegramLink(url.href)
  }
  if (url.origin !== location.origin) return
  e.preventDefault()
  tg.openLink(url.href)
})

function bindLang() {
  app.querySelectorAll('[data-lang]').forEach((b) =>
    b.addEventListener('click', () => {
      if (state.lang === b.dataset.lang) return
      state.lang = b.dataset.lang
      state.langFixed = true
      saveLang(state.lang)
      tg.haptic('select')
      if (state.info) render()
      else renderLoadError()
    }),
  )
}

function bind() {
  bindLang()
  app.querySelectorAll('.choice').forEach((el) =>
    el.addEventListener('click', () => {
      if (el.getAttribute('aria-disabled') === 'true' || MODE === 'browser') return
      if (state.type === el.dataset.type) return
      state.type = el.dataset.type
      state.errors.type = ''
      tg.haptic('select')
      // Keep what was typed; re-render the parts that depend on the ticket.
      render()
    }),
  )
  const name = $('#name')
  const phone = $('#phone')
  if (name) {
    name.addEventListener('input', () => {
      state.name = name.value
      dirty()
      if (state.errors.name && cleanName(name.value)) clearError('name')
    })
    name.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); phone && phone.focus() } })
  }
  if (phone) {
    phone.addEventListener('input', () => {
      state.phone = phone.value
      dirty()
      if (state.errors.phone && cleanPhone(phone.value)) clearError('phone')
    })
    phone.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); phone.blur() } })
  }
  const usePhone = $('#use-phone')
  if (usePhone) {
    usePhone.addEventListener('click', async () => {
      const got = await tg.requestPhone()
      if (got === null) return
      if (got) {
        state.phone = got.replace(/^(\d)/, '+$1')
        $('#phone').value = state.phone
        clearError('phone')
        dirty()
      }
      toast(T[state.lang].phoneShared)
    })
  }
  const submit = $('#submit')
  if (submit) submit.addEventListener('click', onSubmit)
  bindQty()
  const showKhqr = $('#show-khqr')
  if (showKhqr) {
    showKhqr.addEventListener('click', () => {
      const o = state.info.open
      tg.haptic('light')
      state.done = { order: o.order, amount: o.amount, amountText: o.amountText, sent: true }
      render()
      window.scrollTo(0, 0)
    })
  }
}

/* How many Standard tickets. Typing updates the total right away; the number is tidied when the box loses focus. */
function bindQty() {
  const input = $('#qty')
  if (!input) return
  app.querySelectorAll('.qty__btn').forEach((b) =>
    b.addEventListener('click', () => {
      setQty(state.qty + Number(b.dataset.step))
      input.value = state.qty
      tg.haptic('select')
    }),
  )
  input.addEventListener('input', () => {
    const v = parseInt(input.value, 10)
    if (v >= 1 && v <= maxQty()) setQty(v)
  })
  input.addEventListener('blur', () => {
    const v = parseInt(input.value, 10)
    setQty(Number.isFinite(v) ? v : state.qty)
    input.value = state.qty
  })
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); input.blur() } })
  input.addEventListener('focus', () => input.select())
}

function setQty(v) {
  const max = maxQty()
  state.qty = Math.min(Math.max(1, Math.round(v) || 1), max)
  if (state.errors.qty) {
    state.errors.qty = ''
    const box = $('#qty-box')
    if (box) box.outerHTML = qtyHtml()
    bindQty()
  }
  app.querySelectorAll('.qty__btn').forEach((b) => {
    b.disabled = Number(b.dataset.step) < 0 ? state.qty <= 1 : state.qty >= max
  })
  const total = $('#total')
  if (total) total.innerHTML = totalInner()
  const hint = $('#name-hint')
  if (hint) hint.innerHTML = nameHint()
  updateButton()
}

function clearError(field) {
  state.errors[field] = ''
  const input = $('#' + field)
  if (!input) return
  input.setAttribute('aria-invalid', 'false')
  const errEl = input.closest('.field').querySelector('.field__error')
  if (errEl) errEl.remove()
}

function dirty() {
  tg.closingConfirmation(!!(state.name || state.phone) && !state.done)
}

function updateButton() {
  const info = state.info
  const open = info && info.salesOpen && (info.canIndividual || info.canGroup)
  if (!open || MODE === 'browser' || state.done) {
    tg.mainButton.hide()
    return
  }
  const amount = state.type ? money(totalOf(state.type), prices().symbol) : ''
  const text = state.busy ? T[state.lang].sending : state.type ? t('confirm', { amount }) : T[state.lang].confirmShort
  const used = tg.mainButton.set({ text, onClick: onSubmit, active: !state.busy })
  tg.mainButton.progress(state.busy)
  const fallback = $('#submit-text')
  if (!used && fallback) {
    fallback.textContent = text
    $('#submit').disabled = state.busy
  }
}

async function onSubmit() {
  if (state.busy || state.done) return
  const errors = {}
  if (!state.type) errors.type = T[state.lang].pickTicket
  const qtyInput = $('#qty')
  if (qtyInput && state.type === 'INDIVIDUAL') {
    const v = Number(qtyInput.value)
    if (!(Number.isInteger(v) && v >= 1 && v <= maxQty())) errors.qty = fill(T[state.lang].badQty, { max: n(maxQty()) })
    else state.qty = v
  }
  const qty = qtyOf(state.type)
  const name = cleanName(state.name)
  const phone = cleanPhone(state.phone)
  if (!name) errors.name = T[state.lang].badName
  if (!phone) errors.phone = T[state.lang].badPhone
  if (errors.type || errors.qty || errors.name || errors.phone) {
    state.errors = errors
    tg.haptic('error')
    render()
    const first = errors.type ? null : $(errors.qty ? '#qty' : errors.name ? '#name' : '#phone')
    if (first) {
      first.focus()
      first.scrollIntoView({ block: 'center', behavior: 'smooth' })
    } else toast(errors.type)
    return
  }
  // The same answers keep the same nonce, so retrying after a lost answer never makes two orders.
  const key = [state.type, qty, name, phone, state.lang].join('|')
  if (!state.attempt || state.attempt.key !== key) state.attempt = { key, nonce: nonce() }
  const order = { action: 'order', type: state.type, qty, name, phone, lang: state.lang, nonce: state.attempt.nonce }

  if (MODE === 'keyboard') {
    tg.haptic('success')
    if (tg.sendData(JSON.stringify(order))) return
  }

  state.busy = true
  updateButton()
  let res
  try {
    res = await apiPost({ ...order, initData: tg.initData() })
  } catch (err) {
    state.busy = false
    updateButton()
    tg.haptic('error')
    return tg.showAlert(T[state.lang].netError)
  }
  state.busy = false
  if (res && res.ok) {
    tg.haptic('success')
    state.done = res
    return render()
  }
  if (res && res.duplicate) {
    updateButton()
    return tg.showAlert(T[state.lang].already)
  }
  updateButton()
  tg.haptic('error')
  if (res && (res.error === 'bad_name' || res.error === 'bad_phone' || res.error === 'bad_qty')) {
    state.errors = { [{ bad_name: 'name', bad_phone: 'phone', bad_qty: 'qty' }[res.error]]: res.message.replace(/\s*🙏$/, '') }
    return render()
  }
  if (res && (res.error === 'group_gone' || res.error === 'sold_out' || res.error === 'seats_few' || res.error === 'sales_closed')) {
    await tg.showAlert(res.message)
    return load()
  }
  return tg.showAlert((res && (res.message || res.detail)) || T[state.lang].netError)
}

load()
