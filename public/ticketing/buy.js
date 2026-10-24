/**
 * Ticket form (/buy). Opened inside Telegram from the CoStars bot.
 *
 *  • From a button in the chat or the 🎟 Tickets button: Telegram signs the
 *    launch (initData), so the form loads the customer's details and sends the
 *    order straight to the bot. The page then shows the payment KHQR
 *    (/api/khqr), and the bot sends it to the chat too.
 *  • From the 🎟 key under the chat: there is no signature, so the form hands
 *    its answers to Telegram (sendData) and the bot replies in the chat.
 *  • In a normal browser: the page shows the tickets and a button to open the bot.
 */
import { apiGet, apiPost } from './api.js'
import { botLink } from './config.js'
import * as tg from './tg.js'
import { HERO_WAVE, applyWebTexts, copyText, esc, fill, icon, khDigits, logoHtml, money, nonce, riel, savedLang, saveLang, toast } from './ui.js'

/** The ticket KHQR as a picture (api/khqr.js turns the bot's copy into an image address). */
const KHQR_URL = '/api/khqr'

const T = {
  en: {
    pageTitle: 'CoStars tickets',
    title: 'Get your tickets',
    subtitle: 'Every ticket helps buy school supplies for children in need 💛',
    step1: 'Choose your ticket',
    indName: 'Standard',
    indDesc: 'Per person, drink included',
    qtyLabel: 'How many tickets?',
    qtyHint: 'Each person gets their own QR',
    qtyLess: 'One ticket less',
    qtyMore: 'One ticket more',
    qtyMax: 'You can buy up to {max} tickets at a time',
    badQty: 'Please choose 1 to {max} tickets',
    nameHintMany: 'This name goes on all {n} tickets',
    totalOf: '{n} tickets × {price}',
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
    namePh: 'e.g. Sok Dara',
    phone: 'Phone number',
    phoneHint: 'So our team can reach you if needed',
    phonePh: '012 345 678',
    usePhone: 'Use my Telegram number',
    phoneShared: 'Thanks! Your number was shared with the bot',
    badName: 'Please type a name with 2 to 60 letters',
    badPhone: 'Please type 8 to 15 digits, like 012 345 678',
    pickTicket: 'Please choose a ticket first',
    step3: 'How you pay',
    pay1: 'Tap {button} below',
    pay2: 'Pay with KHQR in the chat and write your order number in the remark',
    pay2Here: 'Scan the KHQR that shows up on this page and write your order number in the remark',
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
    doneScan: 'Scan this KHQR with your bank app to pay',
    doneNoQr: 'We sent the payment KHQR to your chat',
    doneSent: 'We also sent this KHQR to your chat',
    orderNo: 'Order number',
    toPay: 'Amount to pay',
    tickets: 'Tickets',
    copy: 'Copy',
    copied: 'Order number copied',
    copyFail: 'Your order number is {order}',
    saveQr: 'Save QR',
    qrAlt: 'KHQR code to pay for your CoStars tickets',
    qrError: 'The QR couldn’t load here\nYou’ll also find it in your chat with the bot',
    done1: 'Scan this KHQR, or save it and open it in your bank app',
    done2: 'Pay {amount} and write {order} in the remark',
    done3: 'Send a photo of your receipt in the chat',
    done4: 'Your QR tickets arrive in the chat 🎟',
    doneGo: 'Send my receipt in the chat',
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
    title: 'ទិញសំបុត្ររបស់អ្នក',
    subtitle: 'សំបុត្រនីមួយៗជួយទិញសម្ភារៈសិក្សាជូនកុមារដែលខ្វះខាត 💛',
    step1: 'ជ្រើសរើសសំបុត្រ',
    indName: 'ស្តង់ដារ',
    indDesc: 'តម្លៃក្នុងម្នាក់ រួមទាំងភេសជ្ជៈ',
    qtyLabel: 'តើអ្នកចង់បានសំបុត្រប៉ុន្មានសន្លឹក?',
    qtyHint: 'ម្នាក់ៗទទួលបាន QR ផ្ទាល់ខ្លួន',
    qtyLess: 'បន្ថយមួយសន្លឹក',
    qtyMore: 'បន្ថែមមួយសន្លឹក',
    qtyMax: 'អ្នកអាចទិញបានច្រើនបំផុត {max} សន្លឹកក្នុងមួយដង',
    badQty: 'សូមជ្រើសរើសសំបុត្រពី ១ ដល់ {max} សន្លឹក',
    nameHintMany: 'ឈ្មោះនេះនឹងបង្ហាញនៅលើសំបុត្រទាំង {n} សន្លឹក',
    totalOf: '{n} សន្លឹក × {price}',
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
    namePh: 'ឧ. សុខ ដារ៉ា',
    phone: 'លេខទូរស័ព្ទ',
    phoneHint: 'ដើម្បីឲ្យក្រុមការងារអាចទាក់ទងអ្នកបាន ពេលចាំបាច់',
    phonePh: '012 345 678',
    usePhone: 'ប្រើលេខ Telegram របស់ខ្ញុំ',
    phoneShared: 'អរគុណ! លេខរបស់អ្នកត្រូវបានចែករំលែកជាមួយ Bot ហើយ',
    badName: 'សូមវាយឈ្មោះដែលមានពី ២ ដល់ ៦០ តួអក្សរ',
    badPhone: 'សូមវាយលេខពី ៨ ដល់ ១៥ ខ្ទង់ ឧទាហរណ៍ 012 345 678',
    pickTicket: 'សូមជ្រើសរើសសំបុត្រជាមុនសិន',
    step3: 'របៀបបង់ប្រាក់',
    pay1: 'ចុច {button} ខាងក្រោម',
    pay2: 'បង់ប្រាក់តាម KHQR ក្នុងការជជែក ហើយសរសេរលេខបញ្ជាទិញក្នុងប្រអប់ចំណាំ',
    pay2Here: 'ស្កេន KHQR ដែលនឹងបង្ហាញនៅលើទំព័រនេះ ហើយសរសេរលេខបញ្ជាទិញក្នុងប្រអប់ចំណាំ',
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
    doneScan: 'ស្កេន KHQR នេះជាមួយកម្មវិធីធនាគាររបស់អ្នក ដើម្បីបង់ប្រាក់',
    doneNoQr: 'យើងបានផ្ញើ KHQR សម្រាប់បង់ប្រាក់ទៅក្នុងការជជែករបស់អ្នកហើយ',
    doneSent: 'យើងក៏បានផ្ញើ KHQR នេះទៅក្នុងការជជែករបស់អ្នកដែរ',
    orderNo: 'លេខបញ្ជាទិញ',
    toPay: 'ចំនួនទឹកប្រាក់ត្រូវបង់',
    tickets: 'សំបុត្រ',
    copy: 'ចម្លង',
    copied: 'បានចម្លងលេខបញ្ជាទិញ',
    copyFail: 'លេខបញ្ជាទិញរបស់អ្នកគឺ {order}',
    saveQr: 'រក្សាទុក QR',
    qrAlt: 'KHQR សម្រាប់បង់ប្រាក់សំបុត្រ CoStars',
    qrError: 'មិនអាចបង្ហាញ QR នៅទីនេះបានទេ\nអ្នកក៏អាចរកវាឃើញក្នុងការជជែកជាមួយ Bot ដែរ',
    done1: 'ស្កេន KHQR នេះ ឬរក្សាទុកវា ហើយបើកក្នុងកម្មវិធីធនាគាររបស់អ្នក',
    done2: 'បង់ {amount} ហើយសរសេរ {order} ក្នុងប្រអប់ចំណាំ',
    done3: 'ផ្ញើរូបថតបង្កាន់ដៃក្នុងការជជែក',
    done4: 'សំបុត្រ QR របស់អ្នកនឹងផ្ញើមកក្នុងការជជែក 🎟',
    doneGo: 'ផ្ញើបង្កាន់ដៃក្នុងការជជែក',
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
  qty: 1, // Standard tickets in this order
  name: '',
  phone: '',
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

/** Most Standard tickets in one order (Settings → max_standard in the bot's sheet, 10 by default). */
function maxQty() {
  const m = Math.floor(Number(state.info && state.info.maxStandard))
  return m >= 1 ? Math.min(m, 99) : 10
}
/** How many tickets this order is for: the chosen number for Standard, one ticket for a Group. */
const qtyOf = (type) => (type === 'GROUP' ? 1 : state.qty)
/** What the order costs: a Group ticket, or the Standard price times the number of tickets. */
const orderAmount = (type) => Math.round(priceOf(type) * qtyOf(type) * 100) / 100

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
  applyWebTexts(T, info.webTexts) // wording from the Web texts tab of the bot's Sheet
  if (!state.langFixed && (info.lang === 'km' || info.lang === 'en')) state.lang = info.lang
  if (info.last && MODE === 'api' && !state.name && !state.phone) {
    state.name = info.last.name || ''
    state.phone = info.last.phone || ''
  }
  // Pick a ticket that is still on sale (nothing is picked on the browser page, where it is only a price list).
  const onSale = (type) => !!type && info.salesOpen && (type === 'GROUP' ? info.canGroup : info.canIndividual)
  if (MODE === 'browser') state.type = ''
  else if (!onSale(state.type)) state.type = onSale('INDIVIDUAL') ? 'INDIVIDUAL' : onSale('GROUP') ? 'GROUP' : ''
  state.qty = Math.min(Math.max(state.qty, 1), maxQty())
  render()
  // Fetch the payment QR while the customer fills in the form, so it shows at once after ordering.
  if (MODE === 'api' && info.khqr) preloadKhqr()
}

let khqrPreload = null
function preloadKhqr() {
  if (khqrPreload) return
  khqrPreload = new Image()
  khqrPreload.decoding = 'async'
  khqrPreload.src = KHQR_URL
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
        ${logoHtml('', 'light')}
        <div class="lang" role="group" aria-label="Language">
          <button type="button" data-lang="en" aria-pressed="${state.lang === 'en'}">EN</button>
          <button type="button" data-lang="km" aria-pressed="${state.lang === 'km'}">ខ្មែរ</button>
        </div>
      </div>
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
  // The ticket that isn't chosen fades to grey (it can still be tapped to switch to it).
  const dimmed = MODE !== 'browser' && can && !!state.type && state.type !== type
  return `
    <${tag} class="choice${dimmed ? ' choice--dimmed' : ''}" data-type="${type}" ${attrs}>
      <span class="choice__icon">${icon(group ? 'users' : 'user')}</span>
      <span>
        <span class="choice__name">${name}</span>
        <span class="choice__desc">${lines(desc)}</span>
        ${badges.length ? `<span class="choice__badges">${badges.join('')}</span>` : ''}
      </span>
      <span class="choice__price"><b>${esc(money(amount, p.symbol))}</b>${r ? `<span>${esc(r)}</span>` : ''}</span>
    </${tag}>`
}

/** Under the Standard ticket: how many tickets. Typed in or changed with − and +. */
function qtyHtml() {
  const max = maxQty()
  const err = state.errors.qty
  return `
    <div class="qty" role="group" aria-labelledby="qty-label">
      <div class="qty__text">
        <span class="qty__label" id="qty-label">${esc(T[state.lang].qtyLabel)}</span>
        <span class="qty__hint" id="qty-hint">${esc(T[state.lang].qtyHint)}</span>
      </div>
      <div class="stepper" id="stepper" aria-invalid="${!!err}">
        <button type="button" class="stepper__btn" data-step="-1" aria-label="${esc(T[state.lang].qtyLess)}" ${state.qty <= 1 ? 'disabled' : ''}>${icon('minus')}</button>
        <input class="stepper__input" id="qty" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" enterkeyhint="done"
          role="spinbutton" aria-valuemin="1" aria-valuemax="${max}" aria-valuenow="${state.qty}" aria-labelledby="qty-label" aria-describedby="qty-hint"
          value="${state.qty}" />
        <button type="button" class="stepper__btn" data-step="1" aria-label="${esc(T[state.lang].qtyMore)}" ${state.qty >= max ? 'disabled' : ''}>${icon('plus')}</button>
      </div>
      ${err ? `<span class="field__error qty__error" role="alert">${esc(err)}</span>` : ''}
    </div>`
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
    out.push(`<div class="notice rise">${icon(key === 'openWaiting' ? 'hourglass' : 'receipt')}<div>${lines(t(key, { order: info.open.order, amount: info.open.amountText || '' }))}</div></div>`)
  }
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
          ${err.name ? `<span class="field__error" role="alert">${esc(err.name)}</span>` : `<span class="field__hint" id="name-hint">${esc(nameHint())}</span>`}
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

function nameHint() {
  if (state.type === 'GROUP') return T[state.lang].nameHintGrp
  return state.qty > 1 ? t('nameHintMany', { n: n(state.qty) }) : T[state.lang].nameHintInd
}

/** Inside #total: the amount, its riel price, and "3 tickets × $8" for several Standard tickets. */
function totalInner() {
  const type = state.type || 'INDIVIDUAL'
  const amount = orderAmount(type)
  const r = riel(amount, prices().khrRate)
  const many = type !== 'GROUP' && state.qty > 1
  return `
    <span>${esc(T[state.lang].total)}${many ? `<small class="total__of">${t('totalOf', { n: n(state.qty), price: money(priceOf(type), prices().symbol) })}</small>` : ''}</span>
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
          <li>${esc(T[state.lang][MODE === 'api' && state.info.khqr ? 'pay2Here' : 'pay2'])}</li>
          <li>${esc(T[state.lang].pay3)}</li>
          <li>${esc(T[state.lang].pay4)}</li>
        </ol>
        <div class="total" id="total" aria-live="polite">${totalInner()}</div>
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
  const showQty = canBuyHere && info.salesOpen && info.canIndividual && state.type === 'INDIVIDUAL'
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
        ${showQty ? qtyHtml() : ''}
        ${choiceHtml('GROUP')}
      </div>
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

/**
 * After ordering: the order number, the amount and the payment KHQR right on the page,
 * then where to send the receipt. Without a KHQR set in the bot, the steps point to the chat.
 */
function renderDone() {
  const d = state.done
  tg.closingConfirmation(false)
  // Worked out here (not taken from the bot's answer) so it follows the language switch on this page.
  const amount = amountText(d.amount)
  const p = prices()
  const r = riel(d.amount, p.khrRate)
  const showQr = d.khqr !== false
  const guests = Number(d.guests) || 1
  const ticketLabel = d.type === 'GROUP' ? t('grpName', { size: n(guests) }) : guests > 1 ? `${T[state.lang].indName} × ${n(guests)}` : T[state.lang].indName
  // The order number never breaks across two lines in the steps.
  const keepOrder = (html) => html.split(esc(d.order)).join(`<span class="nowrap">${esc(d.order)}</span>`)
  app.innerHTML = `
    ${heroHtml(true)}
    <section class="pay card rise" aria-labelledby="pay-title">
      <div class="pay__head">
        <div class="state__icon state__icon--green pop">${icon('check')}</div>
        <h2 id="pay-title">${keepOrder(t('doneTitle', { order: d.order }))}</h2>
        <p>${esc(T[state.lang][showQr ? 'doneScan' : 'doneNoQr'])}</p>
      </div>
      <dl class="pay__facts">
        <div class="pay__fact">
          <dt>${esc(T[state.lang].orderNo)}</dt>
          <dd><b class="pay__order">${esc(d.order)}</b>
            <button type="button" class="chip-btn" id="copy-order" aria-label="${esc(T[state.lang].copy)} ${esc(d.order)}">${icon('copy')}${esc(T[state.lang].copy)}</button></dd>
        </div>
        <div class="pay__fact">
          <dt>${esc(T[state.lang].toPay)}</dt>
          <dd><b class="pay__amount">${esc(money(d.amount, p.symbol))}</b>${r ? `<span>${esc(T[state.lang].or)} ${esc(r)}</span>` : ''}</dd>
        </div>
        <div class="pay__fact">
          <dt>${esc(T[state.lang].tickets)}</dt>
          <dd><span class="pay__ticket">${esc(ticketLabel)}</span></dd>
        </div>
      </dl>
      ${showQr ? `
      <figure class="khqr">
        <div class="khqr__frame is-loading" id="khqr-frame">
          <img id="khqr-img" src="${KHQR_URL}" alt="${esc(T[state.lang].qrAlt)}" decoding="async" />
          <p class="khqr__error" hidden>${icon('alert')}<span>${lines(esc(T[state.lang].qrError))}</span></p>
        </div>
      </figure>
      <a class="btn btn--light btn--block" id="save-qr" href="${KHQR_URL}?download=1" download="CoStars-KHQR.jpg">${icon('download')}${esc(T[state.lang].saveQr)}</a>` : ''}
      <ol class="steps pay__steps">
        ${showQr ? `<li>${esc(T[state.lang].done1)}</li>` : ''}
        <li>${keepOrder(t('done2', { amount, order: d.order }))}</li>
        <li>${esc(T[state.lang].done3)}</li>
        <li>${esc(T[state.lang].done4)}</li>
      </ol>
      ${d.sent ? (showQr ? `<p class="pay__note">${icon('send')}<span>${esc(T[state.lang].doneSent)}</span></p>` : '')
               : `<p class="notice">${icon('info')}<span>${lines(esc(T[state.lang].notSent))}</span></p>`}
      ${tg.mainButton.available() ? '' : `<a class="btn btn--block btn--big" href="${botLink()}">${icon('send')}${esc(T[state.lang][d.sent ? 'doneGo' : 'openBot'])}</a>`}
    </section>
    ${footerHtml()}`
  bindLang()
  bindDone()
  tg.mainButton.progress(false)
  tg.mainButton.set({
    text: T[state.lang][d.sent ? 'doneGo' : 'openBot'],
    onClick: () => (d.sent ? tg.close() : tg.openTelegramLink(botLink())),
    shine: true,
  })
}

function bindDone() {
  const d = state.done
  const copy = $('#copy-order')
  if (copy) {
    copy.addEventListener('click', async () => {
      const ok = await copyText(d.order)
      tg.haptic(ok ? 'success' : 'warning')
      toast(ok ? T[state.lang].copied : t('copyFail', { order: d.order }))
    })
  }
  const img = $('#khqr-img')
  if (img) {
    const frame = $('#khqr-frame')
    const shown = () => frame.classList.remove('is-loading')
    const failed = () => {
      frame.classList.remove('is-loading')
      frame.classList.add('is-error')
      img.hidden = true
      frame.querySelector('.khqr__error').hidden = false
      const save = $('#save-qr')
      if (save) save.hidden = true
    }
    if (img.complete) (img.naturalWidth ? shown : failed)()
    else {
      img.addEventListener('load', shown, { once: true })
      img.addEventListener('error', failed, { once: true })
    }
  }
  const save = $('#save-qr')
  if (save) {
    // Inside Telegram a download link does nothing: use Telegram's download sheet, or open the picture to save it.
    save.addEventListener('click', (e) => {
      if (!tg.inTelegram()) return
      e.preventDefault()
      e.stopPropagation()
      const url = new URL(save.getAttribute('href'), location.href).href
      if (!tg.downloadFile(url, 'CoStars-KHQR.jpg')) tg.openLink(new URL(KHQR_URL, location.href).href)
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
  bindQty()
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
}

/** The − / + buttons and the number box under the Standard ticket. */
function bindQty() {
  const input = $('#qty')
  if (!input) return
  app.querySelectorAll('.stepper__btn').forEach((b) =>
    b.addEventListener('click', () => {
      setQty(state.qty + Number(b.dataset.step))
      tg.haptic('select')
    }),
  )
  input.addEventListener('input', () => {
    const digits = input.value.replace(/\D/g, '').slice(0, 2)
    if (digits !== input.value) input.value = digits
    if (!digits) return // still typing: keep the last number until they finish
    const wanted = Number(digits)
    if (wanted > maxQty()) {
      toast(t('qtyMax', { max: n(maxQty()) }))
      return setQty(maxQty())
    }
    if (wanted >= 1) setQty(wanted, { keepInput: true })
  })
  input.addEventListener('blur', () => {
    if (input.value !== String(state.qty)) setQty(state.qty)
  })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      setQty(state.qty + (e.key === 'ArrowUp' ? 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      input.blur()
    }
  })
}

/** Sets the number of Standard tickets and updates the box, the buttons, the total and the name hint in place. */
function setQty(value, { keepInput = false } = {}) {
  const max = maxQty()
  state.qty = Math.min(Math.max(Math.floor(Number(value)) || 1, 1), max)
  const input = $('#qty')
  if (input) {
    if (!keepInput) input.value = String(state.qty)
    input.setAttribute('aria-valuenow', String(state.qty))
    const [less, more] = app.querySelectorAll('.stepper__btn')
    if (less) less.disabled = state.qty <= 1
    if (more) more.disabled = state.qty >= max
  }
  if (state.errors.qty) {
    state.errors.qty = ''
    const stepper = $('#stepper')
    if (stepper) stepper.setAttribute('aria-invalid', 'false')
    const errEl = app.querySelector('.qty__error')
    if (errEl) errEl.remove()
  }
  const total = $('#total')
  if (total) total.innerHTML = totalInner()
  const hint = $('#name-hint')
  if (hint) hint.textContent = nameHint()
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
  const amount = state.type ? money(orderAmount(state.type), prices().symbol) : ''
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
  const qty = qtyOf(state.type)
  if (state.type === 'INDIVIDUAL' && !(Number.isInteger(qty) && qty >= 1 && qty <= maxQty())) errors.qty = t('badQty', { max: n(maxQty()) })
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
  const order = { action: 'order', type: state.type, name, phone, lang: state.lang, nonce: state.attempt.nonce }
  if (state.type === 'INDIVIDUAL') order.qty = qty

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
    state.errors = { [res.error === 'bad_name' ? 'name' : res.error === 'bad_qty' ? 'qty' : 'phone']: res.message.replace(/\s*🙏$/, '') }
    return render()
  }
  if (res && (res.error === 'group_gone' || res.error === 'sold_out' || res.error === 'sales_closed' || res.error === 'not_enough')) {
    await tg.showAlert(res.message)
    return load()
  }
  return tg.showAlert((res && (res.message || res.detail)) || T[state.lang].netError)
}

load()
