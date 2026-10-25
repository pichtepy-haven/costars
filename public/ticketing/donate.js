/**
 * Donation form (/donate). Works like the ticket form (/buy):
 *
 *  • From the 💝 button in the bot: Telegram signs the launch (initData), so the form loads the
 *    donor's name and open donation and sends the donation straight to the bot. The page then
 *    shows the donation number and the KHQR (/api/khqr?for=donation); the bot sends it to the
 *    chat too. The donor sends the receipt in the chat and the admins confirm it.
 *  • From a key under the chat: there is no signature, so the form hands its answers to
 *    Telegram (sendData) and the bot replies in the chat.
 *  • In a normal browser: the donation KHQR to scan, and a button to donate in the bot.
 */
import { apiGet, apiPost } from './api.js'
import { botLink } from './config.js'
import * as tg from './tg.js'
import { HERO_WAVE, applyWebTexts, copyText, esc, fill, icon, khDigits, logoHtml, money, nonce, riel, savedLang, saveLang, toast } from './ui.js'

/** The donation KHQR as a picture (api/khqr.js; the ticket KHQR when no donation KHQR is set). */
const KHQR_URL = '/api/khqr?for=donation'
const KHQR_DOWNLOAD = '/api/khqr?for=donation&download=1'

const T = {
  en: {
    pageTitle: 'Donate to CoStars',
    title: 'Make a donation',
    subtitle: 'Every gift buys school supplies for children in need 💛',
    impactTitle: 'Where your gift goes',
    impactText: 'All of it goes to school supplies and learning needs for the children of L’aang Primary School in Siem Reap',
    step1: 'Choose an amount',
    other: 'Other',
    otherSub: 'Any amount',
    otherLabel: 'Your amount in US dollars',
    otherPh: '15',
    otherHint: 'You can pay in dollars or riel with KHQR',
    badAmount: 'Please choose an amount, or type one from {min} to {max}',
    step2: 'Your name',
    nameLabel: 'Your name (optional)',
    nameHint: 'So we know who to thank. Leave it empty to give anonymously',
    namePh: 'e.g. Sok Dara',
    badName: 'Please type a name with 2 to 60 letters, or leave it empty',
    step3: 'How to give',
    pay1: 'Tap {button} below',
    pay2: 'Pay with KHQR in the chat and write your donation number in the remark',
    pay2Here: 'Scan the KHQR that shows up on this page and write your donation number in the remark',
    pay3: 'Send a photo of your receipt in the chat',
    pay4: 'Our team confirms your gift and thanks you in the chat 💛',
    total: 'Your gift',
    or: 'or',
    confirm: 'Donate {amount}',
    confirmShort: 'Donate',
    sending: 'Sending…',
    openWaiting: 'Donation {donation} is waiting for payment ({amount})\nSending this form replaces it with a new one',
    openChecking: 'We’re checking your receipt for donation {donation}\nThank you for your patience 💛',
    givenBefore: 'Thank you for giving before! 💛',
    doneTitle: 'Donation {donation} is ready 💝',
    doneScan: 'Scan this KHQR with your bank app to give',
    doneNoQr: 'We sent the KHQR to your chat',
    doneSent: 'We also sent this KHQR to your chat',
    donationNo: 'Donation number',
    toPay: 'Your gift',
    copy: 'Copy',
    copied: 'Donation number copied',
    copyFail: 'Your donation number is {donation}',
    saveQr: 'Save QR',
    qrAlt: 'KHQR code to donate to CoStars',
    qrError: 'The QR couldn’t load here\nYou’ll also find it in your chat with the bot',
    done1: 'Scan this KHQR, or save it and open it in your bank app',
    done2: 'Pay {amount} and write {donation} in the remark',
    done3: 'Send a photo of your receipt in the chat',
    done4: 'Our team confirms your gift and thanks you in the chat 💛',
    doneGo: 'Send my receipt in the chat',
    notSent: 'We couldn’t message you yet\nOpen the bot, tap Start, then send your receipt there',
    openBot: 'Open the CoStars bot',
    browserTitle: 'Give with KHQR',
    browserSub: 'Scan this KHQR with your bank app and give any amount you like',
    browser1: 'Scan the KHQR, or save it and open it in your bank app',
    browser2: 'Give any amount you like, in dollars or riel',
    browser3: 'For a thank-you and a confirmed gift, donate in our Telegram bot instead',
    browserBtn: 'Donate in Telegram',
    noQrTitle: 'Donations are made in Telegram',
    noQrSub: 'Open our bot and tap 💝 Make a Donation\nIt only takes a minute',
    netError: 'We couldn’t reach the donation desk 😥\nPlease check your internet and try again',
    loadError: 'The donation form couldn’t load',
    retry: 'Try again',
    already: 'Your donation was already sent\nPlease check the chat for the KHQR',
    help: 'Questions? Tap 📞 Contact in the bot',
    thanksTitle: 'Thank you!',
    thanksSub: 'Your gift helps children get the school supplies they need 💛',
  },
  km: {
    pageTitle: 'បរិច្ចាគជូន CoStars',
    title: 'ចូលរួមបរិច្ចាគ',
    subtitle: 'រាល់ការបរិច្ចាគជួយទិញសម្ភារៈសិក្សាជូនកុមារដែលខ្វះខាត 💛',
    impactTitle: 'ការបរិច្ចាគរបស់អ្នកទៅណា',
    impactText: 'ទាំងអស់សម្រាប់សម្ភារៈសិក្សា និងតម្រូវការសិក្សារបស់កុមារនៅសាលាបឋមសិក្សាល្អាង ខេត្តសៀមរាប',
    step1: 'ជ្រើសរើសចំនួនទឹកប្រាក់',
    other: 'ផ្សេងទៀត',
    otherSub: 'ចំនួនណាក៏បាន',
    otherLabel: 'ចំនួនទឹកប្រាក់របស់អ្នក (ដុល្លារ)',
    otherPh: '15',
    otherHint: 'អ្នកអាចបង់ជាដុល្លារ ឬរៀលតាម KHQR',
    badAmount: 'សូមជ្រើសរើសចំនួនទឹកប្រាក់ ឬវាយចំនួនពី {min} ដល់ {max}',
    step2: 'ឈ្មោះរបស់អ្នក',
    nameLabel: 'ឈ្មោះរបស់អ្នក (មិនចាំបាច់)',
    nameHint: 'ដើម្បីឲ្យយើងដឹងថាត្រូវអរគុណនរណា។ ទុកទទេ ប្រសិនបើចង់បរិច្ចាគដោយមិនបញ្ចេញឈ្មោះ',
    namePh: 'ឧ. សុខ ដារ៉ា',
    badName: 'សូមវាយឈ្មោះដែលមានពី ២ ដល់ ៦០ តួអក្សរ ឬទុកទទេ',
    step3: 'របៀបបរិច្ចាគ',
    pay1: 'ចុច {button} ខាងក្រោម',
    pay2: 'បង់ប្រាក់តាម KHQR ក្នុងការជជែក ហើយសរសេរលេខបរិច្ចាគក្នុងប្រអប់ចំណាំ',
    pay2Here: 'ស្កេន KHQR ដែលនឹងបង្ហាញនៅលើទំព័រនេះ ហើយសរសេរលេខបរិច្ចាគក្នុងប្រអប់ចំណាំ',
    pay3: 'ផ្ញើរូបថតបង្កាន់ដៃក្នុងការជជែក',
    pay4: 'ក្រុមការងារនឹងបញ្ជាក់ ហើយផ្ញើសារអរគុណក្នុងការជជែក 💛',
    total: 'ការបរិច្ចាគរបស់អ្នក',
    or: 'ឬ',
    confirm: 'បរិច្ចាគ {amount}',
    confirmShort: 'បរិច្ចាគ',
    sending: 'កំពុងផ្ញើ…',
    openWaiting: 'ការបរិច្ចាគ {donation} កំពុងរង់ចាំការបង់ប្រាក់ ({amount})\nការផ្ញើទម្រង់នេះនឹងជំនួសវាដោយការបរិច្ចាគថ្មី',
    openChecking: 'យើងកំពុងពិនិត្យបង្កាន់ដៃសម្រាប់ការបរិច្ចាគ {donation}\nសូមអរគុណចំពោះការអត់ធ្មត់ 💛',
    givenBefore: 'សូមអរគុណចំពោះការបរិច្ចាគពីមុនរបស់អ្នក! 💛',
    doneTitle: 'ការបរិច្ចាគ {donation} រួចរាល់ហើយ 💝',
    doneScan: 'ស្កេន KHQR នេះជាមួយកម្មវិធីធនាគាររបស់អ្នក ដើម្បីបរិច្ចាគ',
    doneNoQr: 'យើងបានផ្ញើ KHQR ទៅក្នុងការជជែករបស់អ្នកហើយ',
    doneSent: 'យើងក៏បានផ្ញើ KHQR នេះទៅក្នុងការជជែករបស់អ្នកដែរ',
    donationNo: 'លេខបរិច្ចាគ',
    toPay: 'ការបរិច្ចាគរបស់អ្នក',
    copy: 'ចម្លង',
    copied: 'បានចម្លងលេខបរិច្ចាគ',
    copyFail: 'លេខបរិច្ចាគរបស់អ្នកគឺ {donation}',
    saveQr: 'រក្សាទុក QR',
    qrAlt: 'KHQR សម្រាប់បរិច្ចាគជូន CoStars',
    qrError: 'មិនអាចបង្ហាញ QR នៅទីនេះបានទេ\nអ្នកក៏អាចរកវាឃើញក្នុងការជជែកជាមួយ Bot ដែរ',
    done1: 'ស្កេន KHQR នេះ ឬរក្សាទុកវា ហើយបើកក្នុងកម្មវិធីធនាគាររបស់អ្នក',
    done2: 'បង់ {amount} ហើយសរសេរ {donation} ក្នុងប្រអប់ចំណាំ',
    done3: 'ផ្ញើរូបថតបង្កាន់ដៃក្នុងការជជែក',
    done4: 'ក្រុមការងារនឹងបញ្ជាក់ ហើយផ្ញើសារអរគុណក្នុងការជជែក 💛',
    doneGo: 'ផ្ញើបង្កាន់ដៃក្នុងការជជែក',
    notSent: 'យើងមិនទាន់អាចផ្ញើសារទៅអ្នកបានទេ\nសូមបើក Bot ចុច Start រួចផ្ញើបង្កាន់ដៃនៅទីនោះ',
    openBot: 'បើក CoStars Bot',
    browserTitle: 'បរិច្ចាគតាម KHQR',
    browserSub: 'ស្កេន KHQR នេះជាមួយកម្មវិធីធនាគាររបស់អ្នក ហើយបរិច្ចាគតាមលទ្ធភាព',
    browser1: 'ស្កេន KHQR ឬរក្សាទុកវា ហើយបើកក្នុងកម្មវិធីធនាគាររបស់អ្នក',
    browser2: 'បរិច្ចាគចំនួនណាក៏បាន ជាដុល្លារ ឬរៀល',
    browser3: 'ដើម្បីទទួលបានការបញ្ជាក់ និងសារអរគុណ សូមបរិច្ចាគតាម Telegram Bot របស់យើង',
    browserBtn: 'បរិច្ចាគក្នុង Telegram',
    noQrTitle: 'ការបរិច្ចាគធ្វើឡើងតាម Telegram',
    noQrSub: 'បើក Bot របស់យើង ហើយចុច 💝 ចូលរួមបរិច្ចាគ\nចំណាយពេលតែមួយនាទីប៉ុណ្ណោះ',
    netError: 'មិនអាចភ្ជាប់ទៅកាន់ផ្នែកបរិច្ចាគបានទេ 😥\nសូមពិនិត្យអ៊ីនធឺណិត ហើយព្យាយាមម្ដងទៀត',
    loadError: 'មិនអាចបើកទម្រង់បរិច្ចាគបានទេ',
    retry: 'ព្យាយាមម្ដងទៀត',
    already: 'ការបរិច្ចាគរបស់អ្នកត្រូវបានផ្ញើរួចហើយ\nសូមពិនិត្យ KHQR ក្នុងការជជែក',
    help: 'មានសំណួរ? ចុច 📞 ទំនាក់ទំនង ក្នុង Bot',
    thanksTitle: 'សូមអរគុណ!',
    thanksSub: 'ការបរិច្ចាគរបស់អ្នកជួយឲ្យកុមារមានសម្ភារៈសិក្សាដែលពួកគេត្រូវការ 💛',
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
  pick: '', // a preset amount (as text) or 'other'
  other: '', // what was typed in Other
  name: '',
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

/* ------------------------------------------------------------- amounts */

const info = () => state.info || {}
const symbol = () => info().symbol || '$'
const rate = () => Number(info().khrRate) || 0
const minAmount = () => Number(info().min) || 1
const maxAmount = () => Number(info().max) || 10000
const amountText = (amount) => {
  const r = riel(amount, rate())
  return money(amount, symbol()) + (r ? ` ${T[state.lang].or} ${r}` : '')
}

/** A dollar amount typed by the donor: digits (Khmer digits too) with up to 2 decimals. 0 when it isn't one. */
function parseAmount(v) {
  const s = khToLatin(String(v || '')).replace(/[\s,$]/g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return 0
  const n = Math.round(Number(s) * 100) / 100
  return n >= minAmount() && n <= maxAmount() ? n : 0
}
const khToLatin = (s) => s.replace(/[០-៩]/g, (d) => String('០១២៣៤៥៦៧៨៩'.indexOf(d)))

/** The amount chosen now: the preset, or what was typed in Other. */
function chosenAmount() {
  if (state.pick === 'other') return parseAmount(state.other)
  return parseAmount(state.pick)
}

function cleanName(v) {
  const s = String(v || '').replace(/\s+/g, ' ').trim().replace(/^[=+@-]+\s*/, '')
  return s.length >= 2 && s.length <= 60 && s[0] !== '/' ? s : ''
}

/* ------------------------------------------------------------- loading */

async function load() {
  tg.ready()
  try {
    state.info = MODE === 'api' ? await apiPost({ action: 'donate_form', initData: tg.initData() }) : await apiGet({ action: 'donate_info' })
    if (!state.info || !state.info.ok) throw new Error((state.info && (state.info.detail || state.info.error)) || 'not ok')
  } catch (err) {
    console.warn('donation form data failed', err)
    return renderLoadError()
  }
  applyWebTexts(T, state.info.webTexts) // wording from the Web texts tab of the bot's Sheet
  if (!state.langFixed && (state.info.lang === 'km' || state.info.lang === 'en')) state.lang = state.info.lang
  if (MODE === 'api' && !state.name && state.info.lastName) state.name = state.info.lastName
  // Start on the second amount (the first is often too small to feel right), or the open donation's amount.
  const amounts = state.info.amounts || []
  const open = state.info.open && Number(state.info.open.amount)
  if (!state.pick) state.pick = open && amounts.includes(open) ? String(open) : open ? 'other' : String(amounts[1] ?? amounts[0] ?? '')
  if (state.pick === 'other' && open && !state.other) state.other = String(open)
  render()
  // Fetch the KHQR while the donor fills in the form, so it shows at once afterwards.
  if (MODE === 'api' && state.info.khqr) preloadKhqr()
}

let khqrPreload = null
function preloadKhqr() {
  if (khqrPreload) return
  khqrPreload = new Image()
  khqrPreload.decoding = 'async'
  khqrPreload.src = KHQR_URL
}

/* ------------------------------------------------------------- views */

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

/** Under the hero, where the ticket form shows the date and venue: where the gift goes. */
function impactHtml() {
  return `
    <div class="facts impact rise">
      <div class="fact">${icon('heart')}<div><b>${esc(T[state.lang].impactTitle)}</b><span>${esc(T[state.lang].impactText)}</span></div></div>
    </div>`
}

function noticesHtml() {
  const out = []
  const open = info().open
  if (open) {
    const key = open.status === 'AWAITING_PAYMENT' ? 'openWaiting' : 'openChecking'
    out.push(`<div class="notice rise">${icon(key === 'openWaiting' ? 'hourglass' : 'receipt')}<div>${lines(t(key, { donation: open.donation, amount: amountText(open.amount) }))}</div></div>`)
  } else if (info().given > 0) {
    out.push(`<div class="notice notice--green rise">${icon('heart')}<div>${esc(T[state.lang].givenBefore)}</div></div>`)
  }
  return out.length ? `<div class="section" style="display:grid;gap:10px">${out.join('')}</div>` : ''
}

function amountsHtml() {
  const err = state.errors.amount
  const chips = (info().amounts || []).map((a) => {
    const on = state.pick === String(a)
    const r = riel(a, rate())
    return `<button type="button" class="amount" role="radio" aria-checked="${on}" data-amount="${a}"><b>${esc(money(a, symbol()))}</b>${r ? `<span>${esc(r)}</span>` : ''}</button>`
  })
  const other = state.pick === 'other'
  chips.push(`<button type="button" class="amount amount--other" role="radio" aria-checked="${other}" data-amount="other"><b>${esc(T[state.lang].other)}</b><span>${esc(T[state.lang].otherSub)}</span></button>`)
  const typed = parseAmount(state.other)
  return `
    <section class="section">
      <div class="section__head"><span class="step-no">${n(1)}</span><h2>${esc(T[state.lang].step1)}</h2></div>
      <div class="amounts" role="radiogroup" aria-label="${esc(T[state.lang].step1)}">${chips.join('')}</div>
      ${other ? `
      <div class="card card--pad other-amount"><label class="field">
        <span class="field__label">${esc(T[state.lang].otherLabel)}</span>
        <span class="money-input"><span class="money-input__sym" aria-hidden="true">${esc(symbol())}</span>
          <input class="input" id="other" inputmode="decimal" autocomplete="off" maxlength="9" enterkeyhint="next"
            placeholder="${esc(T[state.lang].otherPh)}" value="${esc(state.other)}" aria-invalid="${!!err}" aria-describedby="other-hint" /></span>
        ${err ? `<span class="field__error" role="alert">${esc(err)}</span>`
              : `<span class="field__hint" id="other-hint">${typed && rate() ? `= ${esc(riel(typed, rate()))} · ` : ''}${esc(T[state.lang].otherHint)}</span>`}
      </label></div>`
        : err ? `<p class="field__error" role="alert">${esc(err)}</p>` : ''}
    </section>`
}

function nameHtml() {
  const err = state.errors.name
  return `
    <section class="section">
      <div class="section__head"><span class="step-no">${n(2)}</span><h2>${esc(T[state.lang].step2)}</h2></div>
      <div class="card card--pad">
        <label class="field">
          <span class="field__label">${esc(T[state.lang].nameLabel)}</span>
          <input class="input" id="name" name="name" autocomplete="name" maxlength="80" enterkeyhint="done"
            placeholder="${esc(T[state.lang].namePh)}" value="${esc(state.name)}" aria-invalid="${!!err}" aria-describedby="name-hint" />
          ${err ? `<span class="field__error" role="alert">${esc(err)}</span>` : `<span class="field__hint" id="name-hint">${esc(T[state.lang].nameHint)}</span>`}
        </label>
      </div>
    </section>`
}

function totalInner() {
  const amount = chosenAmount()
  const r = amount ? riel(amount, rate()) : ''
  return `
    <span>${esc(T[state.lang].total)}</span>
    <div style="text-align:right"><b>${amount ? esc(money(amount, symbol())) : '–'}</b>${r ? `<br><span>${esc(T[state.lang].or)} ${esc(r)}</span>` : ''}</div>`
}

function payHtml() {
  const buttonName = `<b>${esc(T[state.lang].confirmShort)}</b>`
  return `
    <section class="section">
      <div class="section__head"><span class="step-no">${n(3)}</span><h2>${esc(T[state.lang].step3)}</h2></div>
      <div class="card card--pad">
        <ol class="steps">
          <li>${fill(T[state.lang].pay1, {}).replace('{button}', buttonName)}</li>
          <li>${esc(T[state.lang][MODE === 'api' && info().khqr ? 'pay2Here' : 'pay2'])}</li>
          <li>${esc(T[state.lang].pay3)}</li>
          <li>${esc(T[state.lang].pay4)}</li>
        </ol>
        <div class="total" id="total" aria-live="polite">${totalInner()}</div>
      </div>
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
  if (MODE === 'browser') return renderBrowser()
  app.innerHTML = `
    ${heroHtml()}
    ${impactHtml()}
    ${noticesHtml()}
    ${amountsHtml()}
    ${nameHtml()}
    ${payHtml()}
    ${!tg.mainButton.available() ? `<button type="button" class="btn btn--block btn--big section" id="submit">${icon('heart')}<span id="submit-text"></span></button>` : ''}
    ${footerHtml()}`
  bind()
  updateButton()
}

/** In a normal browser: the KHQR to scan straight away, and a way to donate in the bot for a thank-you. */
function renderBrowser() {
  tg.mainButton.hide()
  const hasQr = !!info().khqr
  app.innerHTML = `
    ${heroHtml()}
    ${impactHtml()}
    <section class="section card card--pad center rise">
      ${hasQr ? `
      <h2>${esc(T[state.lang].browserTitle)}</h2>
      <p class="muted small" style="margin:6px 0 0">${esc(T[state.lang].browserSub)}</p>
      <figure class="khqr">
        <div class="khqr__frame is-loading" id="khqr-frame">
          <img id="khqr-img" src="${KHQR_URL}" alt="${esc(T[state.lang].qrAlt)}" decoding="async" />
          <p class="khqr__error" hidden>${icon('alert')}<span>${lines(esc(T[state.lang].qrError))}</span></p>
        </div>
      </figure>
      <a class="btn btn--light btn--block" id="save-qr" href="${KHQR_DOWNLOAD}" download="CoStars-donation-KHQR.jpg" style="max-width:280px;margin:0 auto">${icon('download')}${esc(T[state.lang].saveQr)}</a>
      <ol class="steps pay__steps">
        <li>${esc(T[state.lang].browser1)}</li>
        <li>${esc(T[state.lang].browser2)}</li>
        <li>${esc(T[state.lang].browser3)}</li>
      </ol>` : `
      <div class="state__icon" style="width:56px;height:56px;margin-bottom:10px">${icon('send')}</div>
      <h2>${esc(T[state.lang].noQrTitle)}</h2>
      <p class="muted small" style="margin:6px 0 0">${lines(esc(T[state.lang].noQrSub))}</p>`}
      <a class="btn btn--tg btn--block btn--big" style="margin-top:16px" href="${botLink('donate')}">${icon('send')}${esc(T[state.lang].browserBtn)}</a>
    </section>
    ${footerHtml()}`
  bindLang()
  bindQr()
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

/** After donating: the donation number, the amount and the KHQR, then where to send the receipt. */
function renderDone() {
  const d = state.done
  tg.closingConfirmation(false)
  const amount = amountText(d.amount)
  const r = riel(d.amount, rate())
  const showQr = d.khqr !== false
  // The donation number never breaks across two lines in the steps.
  const keep = (html) => html.split(esc(d.donation)).join(`<span class="nowrap">${esc(d.donation)}</span>`)
  app.innerHTML = `
    ${heroHtml(true)}
    <section class="pay card rise" aria-labelledby="pay-title">
      <div class="pay__head">
        <div class="state__icon state__icon--green pop">${icon('heart')}</div>
        <h2 id="pay-title">${keep(t('doneTitle', { donation: d.donation }))}</h2>
        <p>${esc(T[state.lang][showQr ? 'doneScan' : 'doneNoQr'])}</p>
      </div>
      <dl class="pay__facts">
        <div class="pay__fact">
          <dt>${esc(T[state.lang].donationNo)}</dt>
          <dd><b class="pay__order">${esc(d.donation)}</b>
            <button type="button" class="chip-btn" id="copy-order" aria-label="${esc(T[state.lang].copy)} ${esc(d.donation)}">${icon('copy')}${esc(T[state.lang].copy)}</button></dd>
        </div>
        <div class="pay__fact">
          <dt>${esc(T[state.lang].toPay)}</dt>
          <dd><b class="pay__amount">${esc(money(d.amount, symbol()))}</b>${r ? `<span>${esc(T[state.lang].or)} ${esc(r)}</span>` : ''}</dd>
        </div>
      </dl>
      ${showQr ? `
      <figure class="khqr">
        <div class="khqr__frame is-loading" id="khqr-frame">
          <img id="khqr-img" src="${KHQR_URL}" alt="${esc(T[state.lang].qrAlt)}" decoding="async" />
          <p class="khqr__error" hidden>${icon('alert')}<span>${lines(esc(T[state.lang].qrError))}</span></p>
        </div>
      </figure>
      <a class="btn btn--light btn--block" id="save-qr" href="${KHQR_DOWNLOAD}" download="CoStars-donation-KHQR.jpg">${icon('download')}${esc(T[state.lang].saveQr)}</a>` : ''}
      <ol class="steps pay__steps">
        ${showQr ? `<li>${esc(T[state.lang].done1)}</li>` : ''}
        <li>${keep(t('done2', { amount, donation: d.donation }))}</li>
        <li>${esc(T[state.lang].done3)}</li>
        <li>${esc(T[state.lang].done4)}</li>
      </ol>
      ${d.sent ? (showQr ? `<p class="pay__note">${icon('send')}<span>${esc(T[state.lang].doneSent)}</span></p>` : '')
               : `<p class="notice">${icon('info')}<span>${lines(esc(T[state.lang].notSent))}</span></p>`}
      ${tg.mainButton.available() ? '' : `<a class="btn btn--block btn--big" href="${botLink()}">${icon('send')}${esc(T[state.lang][d.sent ? 'doneGo' : 'openBot'])}</a>`}
    </section>
    ${footerHtml()}`
  bindLang()
  bindQr()
  const copy = $('#copy-order')
  if (copy) {
    copy.addEventListener('click', async () => {
      const ok = await copyText(d.donation)
      tg.haptic(ok ? 'success' : 'warning')
      toast(ok ? T[state.lang].copied : t('copyFail', { donation: d.donation }))
    })
  }
  tg.mainButton.progress(false)
  tg.mainButton.set({
    text: T[state.lang][d.sent ? 'doneGo' : 'openBot'],
    onClick: () => (d.sent ? tg.close() : tg.openTelegramLink(botLink())),
    shine: true,
  })
}

/** The KHQR picture: a message if it can't load, and saving it inside Telegram. */
function bindQr() {
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
      if (!tg.downloadFile(url, 'CoStars-donation-KHQR.jpg')) tg.openLink(new URL(KHQR_URL, location.href).href)
    })
  }
}

/* ------------------------------------------------------------- behaviour */

/** Inside Telegram, t.me links open in Telegram and other pages in the browser, so the form stays open. */
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href]')
  if (!a || !tg.inTelegram()) return
  const url = new URL(a.getAttribute('href'), location.href)
  if (url.hostname === 't.me') {
    e.preventDefault()
    return tg.openTelegramLink(url.href)
  }
  if (url.origin !== location.origin || /^\/api\//.test(url.pathname)) return
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
  app.querySelectorAll('.amount').forEach((el) =>
    el.addEventListener('click', () => {
      const pick = el.dataset.amount
      if (state.pick === pick) return
      state.pick = pick
      state.errors.amount = ''
      tg.haptic('select')
      render()
      if (pick === 'other') {
        const box = $('#other')
        if (box) box.focus()
      }
    }),
  )
  const other = $('#other')
  if (other) {
    other.addEventListener('input', () => {
      state.other = other.value
      dirty()
      if (state.errors.amount && parseAmount(other.value)) {
        state.errors.amount = ''
        other.setAttribute('aria-invalid', 'false')
        // The error goes and the hint comes back in its place.
        const errEl = other.closest('.field').querySelector('.field__error')
        if (errEl) errEl.outerHTML = `<span class="field__hint" id="other-hint"></span>`
      }
      const hint = $('#other-hint')
      const typed = parseAmount(other.value)
      if (hint) hint.textContent = (typed && rate() ? `= ${riel(typed, rate())} · ` : '') + T[state.lang].otherHint
      const total = $('#total')
      if (total) total.innerHTML = totalInner()
      updateButton()
    })
    other.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); const nm = $('#name'); nm ? nm.focus() : other.blur() } })
  }
  const name = $('#name')
  if (name) {
    name.addEventListener('input', () => {
      state.name = name.value
      dirty()
      if (state.errors.name && (!name.value.trim() || cleanName(name.value))) {
        state.errors.name = ''
        name.setAttribute('aria-invalid', 'false')
        const errEl = name.closest('.field').querySelector('.field__error')
        if (errEl) errEl.remove()
      }
    })
    name.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); name.blur() } })
  }
  const submit = $('#submit')
  if (submit) submit.addEventListener('click', onSubmit)
}

function dirty() {
  tg.closingConfirmation(!!(state.other || state.name) && !state.done)
}

function updateButton() {
  if (MODE === 'browser' || state.done) {
    tg.mainButton.hide()
    return
  }
  const amount = chosenAmount()
  const text = state.busy ? T[state.lang].sending : amount ? t('confirm', { amount: money(amount, symbol()) }) : T[state.lang].confirmShort
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
  const amount = chosenAmount()
  const typedName = String(state.name || '').trim()
  const name = typedName ? cleanName(typedName) : ''
  const errors = {}
  if (!amount) errors.amount = t('badAmount', { min: money(minAmount(), symbol()), max: money(maxAmount(), symbol()) })
  if (typedName && !name) errors.name = T[state.lang].badName
  if (errors.amount || errors.name) {
    state.errors = errors
    tg.haptic('error')
    render()
    const first = errors.amount ? $('#other') || $('.amounts') : $('#name')
    if (first) {
      if (first.focus) first.focus()
      first.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
    return
  }
  // The same answers keep the same nonce, so retrying after a lost answer never makes two donations.
  const key = [amount, name, state.lang].join('|')
  if (!state.attempt || state.attempt.key !== key) state.attempt = { key, nonce: nonce() }
  const gift = { action: 'donate', amount, name, lang: state.lang, nonce: state.attempt.nonce }

  if (MODE === 'keyboard') {
    tg.haptic('success')
    if (tg.sendData(JSON.stringify(gift))) return
  }

  state.busy = true
  updateButton()
  let res
  try {
    res = await apiPost({ ...gift, initData: tg.initData() })
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
  if (res && (res.error === 'bad_amount' || res.error === 'bad_name')) {
    state.errors = res.error === 'bad_amount'
      ? { amount: t('badAmount', { min: money(minAmount(), symbol()), max: money(maxAmount(), symbol()) }) }
      : { name: T[state.lang].badName }
    return render()
  }
  return tg.showAlert((res && (res.message || res.detail)) || T[state.lang].netError)
}

load()
