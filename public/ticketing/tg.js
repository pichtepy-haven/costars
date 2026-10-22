/**
 * Small, safe wrappers around Telegram.WebApp (https://core.telegram.org/bots/webapps).
 * Every helper works (or quietly does nothing) when the page is opened in a normal browser.
 */
const app = () => (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) || null
const at = (v) => {
  const w = app()
  try {
    return !!(w && w.isVersionAtLeast && w.isVersionAtLeast(v))
  } catch {
    return false
  }
}

/** True when the page runs inside Telegram as a Mini App. */
export const inTelegram = () => {
  const w = app()
  return !!(w && w.platform && w.platform !== 'unknown')
}

/** Signed launch data. Empty in a normal browser, and when opened from a key under the chat. */
export const initData = () => (app() && app().initData) || ''
export const tgUser = () => (app() && app().initDataUnsafe && app().initDataUnsafe.user) || null

export function ready({ header = '#FCF9F2', background = '#F5F4EF', bottom = '#FFFEFA' } = {}) {
  const w = app()
  if (!w) return
  try { w.ready() } catch {}
  try { w.expand() } catch {}
  if (at('6.1')) {
    try { w.setHeaderColor(header) } catch {}
    try { w.setBackgroundColor(background) } catch {}
  }
  if (at('7.10')) try { w.setBottomBarColor(bottom) } catch {}
  if (at('7.7')) try { w.disableVerticalSwipes() } catch {}
}

export function haptic(kind) {
  const h = app() && at('6.1') && app().HapticFeedback
  if (!h) return
  try {
    if (kind === 'success' || kind === 'error' || kind === 'warning') h.notificationOccurred(kind)
    else if (kind === 'select') h.selectionChanged()
    else h.impactOccurred(kind || 'light')
  } catch {}
}

/** Telegram's own big button at the bottom. Returns false when it isn't available. */
let mainHandler = null
export const mainButton = {
  available: () => inTelegram() && !!(app() && app().MainButton),
  set({ text, onClick, active = true, visible = true, shine = false }) {
    const mb = app() && app().MainButton
    if (!mb || !inTelegram()) return false
    try {
      const params = { text, color: '#810102', text_color: '#FFFFFF', is_active: active, is_visible: visible }
      if (at('7.10')) params.has_shine_effect = shine
      mb.setParams(params)
      if (onClick) {
        if (mainHandler) mb.offClick(mainHandler)
        mainHandler = onClick
        mb.onClick(mainHandler)
      }
    } catch {
      return false
    }
    return true
  },
  progress(on) {
    const mb = app() && app().MainButton
    if (!mb || !inTelegram()) return
    try { on ? mb.showProgress(false) : mb.hideProgress() } catch {}
  },
  hide() {
    const mb = app() && app().MainButton
    if (!mb) return
    try { mb.hide() } catch {}
  },
}

/** Ask before closing while the customer has typed something. */
export function closingConfirmation(on) {
  const w = app()
  if (!w || !at('6.2')) return
  try { on ? w.enableClosingConfirmation() : w.disableClosingConfirmation() } catch {}
}

export function close() {
  const w = app()
  if (w && inTelegram()) try { w.close() } catch {}
}

/** Opens a t.me link inside Telegram, or in a new tab in a browser. */
export function openTelegramLink(url) {
  const w = app()
  if (w && inTelegram()) {
    try { w.openTelegramLink(url); return } catch {}
  }
  window.open(url, '_blank', 'noopener')
}

export function openLink(url) {
  const w = app()
  if (w && inTelegram()) {
    try { w.openLink(url); return } catch {}
  }
  window.open(url, '_blank', 'noopener')
}

export function showAlert(message) {
  const w = app()
  if (w && inTelegram() && at('6.2')) {
    return new Promise((resolve) => {
      try { w.showAlert(message, () => resolve()) } catch { window.alert(message); resolve() }
    })
  }
  window.alert(message)
  return Promise.resolve()
}

export function showConfirm(message) {
  const w = app()
  if (w && inTelegram() && at('6.2')) {
    return new Promise((resolve) => {
      try { w.showConfirm(message, (ok) => resolve(!!ok)) } catch { resolve(window.confirm(message)) }
    })
  }
  return Promise.resolve(window.confirm(message))
}

/** Telegram's QR scanner (phone apps only). onText(text) returns true to close it. */
export const scanner = {
  available: () => inTelegram() && at('6.4') && !!(app() && app().showScanQrPopup) && !/^(tdesktop|web|weba|webk|macos|unigram)$/.test(app().platform),
  open(hint, onText) {
    const w = app()
    try {
      w.showScanQrPopup({ text: hint }, (text) => onText(text))
      return true
    } catch {
      return false
    }
  },
  close() {
    const w = app()
    try { w && w.closeScanQrPopup() } catch {}
  },
}

/** Asks Telegram for the customer's phone number. Resolves the number, '' if shared but unreadable, or null. */
export function requestPhone() {
  const w = app()
  if (!w || !inTelegram() || !at('6.9') || !w.requestContact) return Promise.resolve(null)
  return new Promise((resolve) => {
    try {
      w.requestContact((shared, res) => {
        if (!shared) return resolve(null)
        const c = res && res.responseUnsafe && res.responseUnsafe.contact
        resolve((c && c.phone_number) || '')
      })
    } catch {
      resolve(null)
    }
  })
}

/** Keyboard-launched Mini Apps send their answers to the bot this way (the page then closes). */
export function sendData(text) {
  const w = app()
  if (!w || !inTelegram()) return false
  try {
    w.sendData(text)
    return true
  } catch {
    return false
  }
}

export const platform = () => (app() && app().platform) || 'unknown'
export const languageCode = () => (tgUser() && tgUser().language_code) || ''
