/**
 * Phones: a title that only just misses fitting on one line is made a little smaller so it
 * fits, instead of breaking with an empty gap at the end of the first line. Titles that would
 * have to shrink a lot keep their size and wrap. Desktop keeps the sizes from styles.css.
 *
 * Works for English and Khmer. It runs again when the page, the language, the Sheet content,
 * the screen width or the fonts change.
 */

const TITLES = 'h1, h2, h3, h4, [class*="__title"], [class*="-title"], .set-rows__text strong, .tribute-chip'
const SMALL = '.tribute-chip' // small labels may go down to 11px
const PHONE = '(max-width: 959.98px)'
const MAX_CHARS = 70 // longer text is a sentence, not a title: leave it to wrap
const MIN_PX = 13

/** How many lines the element's text takes now. */
function lineCount(el) {
  const range = document.createRange()
  range.selectNodeContents(el)
  const tops = []
  for (const r of range.getClientRects()) {
    if (r.width < 1 || r.height < 4) continue
    if (!tops.some((t) => Math.abs(t - r.top) < r.height * 0.5)) tops.push(r.top)
  }
  return tops.length
}

/** Big titles may shrink to 78% of their size, smaller ones to 86%, never below 13px (11px for small labels). */
function fit(el) {
  el.style.fontSize = ''
  const text = el.textContent.trim()
  if (!text || text.length > MAX_CHARS || !el.offsetParent || lineCount(el) < 2) return
  const base = parseFloat(getComputedStyle(el).fontSize)
  const min = Math.max(el.matches(SMALL) ? 11 : MIN_PX, base * (base >= 22 ? 0.78 : 0.86))
  if (min >= base) return
  el.style.fontSize = `${min}px`
  if (lineCount(el) > 1) {
    el.style.fontSize = '' // would need to shrink too much: keep the size and wrap
    return
  }
  let lo = min
  let hi = base
  for (let i = 0; i < 7; i += 1) {
    const mid = (lo + hi) / 2
    el.style.fontSize = `${mid}px`
    if (lineCount(el) === 1) lo = mid
    else hi = mid
  }
  el.style.fontSize = `${Math.floor(lo * 10) / 10}px`
}

export function startFitText(root = document.getElementById('root')) {
  if (!root || typeof window === 'undefined' || !window.matchMedia || !document.createRange) return
  const phone = window.matchMedia(PHONE)
  let frame = 0

  const run = () => {
    frame = 0
    for (const el of root.querySelectorAll(TITLES)) {
      if (el.querySelector(TITLES)) continue // fit the innermost title only
      if (phone.matches) fit(el)
      else if (el.style.fontSize) el.style.fontSize = ''
    }
  }
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(run)
  }

  // Only changes to titles count (the countdown ticking every second does not).
  const touchesTitle = (m) => {
    const node = m.target.nodeType === 1 ? m.target : m.target.parentElement
    if (node && node.closest && node.closest(TITLES)) return true
    for (const added of m.addedNodes) {
      if (added.nodeType === 1 && (added.matches(TITLES) || added.querySelector(TITLES))) return true
    }
    return false
  }
  new MutationObserver((list) => {
    if (list.some(touchesTitle)) schedule()
  }).observe(root, { childList: true, subtree: true, characterData: true })

  window.addEventListener('resize', schedule)
  if (phone.addEventListener) phone.addEventListener('change', schedule)
  if (document.fonts) {
    document.fonts.ready.then(schedule)
    if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', schedule)
  }
  schedule()
}
