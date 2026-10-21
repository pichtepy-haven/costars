import { useEffect, useState } from 'react'

/**
 * Tiny hash router. Routes:
 *   #/                 home (the guide)
 *   #/act/<agenda id>  act detail
 *   #/charity          charity & beneficiary page
 * Hash URLs work on any static host (Vercel included) with no rewrite rules,
 * and survive refreshes and direct links.
 */
export const parseHash = (hash) => {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'act' && parts[1]) return { name: 'act', id: decodeURIComponent(parts[1]), key: `act/${parts[1]}` }
  if (parts[0] === 'charity') return { name: 'charity', key: 'charity' }
  return { name: 'home', key: 'home' }
}

export const hrefFor = {
  home: () => '#/',
  act: (id) => `#/act/${encodeURIComponent(id)}`,
  charity: () => '#/charity',
}

const scrollMemory = new Map()
let pendingSection = null
let previousKey = null

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Scroll a home-page section into view, leaving room for the sticky header. */
export const scrollToSection = (id, behavior) => {
  const el = document.getElementById(id)
  if (!el) return
  const header = document.querySelector('.site-header')
  const offset = (header?.offsetHeight ?? 0) + 12
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: Math.max(0, top), behavior: behavior ?? (reduceMotion() ? 'auto' : 'smooth') })
}

/** Go to a section of the home page from anywhere in the guide. */
export const goToSection = (id) => {
  if (parseHash(window.location.hash).name === 'home') {
    scrollToSection(id)
  } else {
    pendingSection = id
    window.location.hash = '#/'
  }
}

export const takePendingSection = () => {
  const id = pendingSection
  pendingSection = null
  return id
}

export const useHashRoute = () => {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    let currentKey = parseHash(window.location.hash).key
    const onHashChange = () => {
      scrollMemory.set(currentKey, window.scrollY) // still the old page's position
      const next = parseHash(window.location.hash)
      previousKey = currentKey
      currentKey = next.key
      setRoute(next)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}

/** Restore the remembered scroll position for a route (top of page if new). */
export const restoreScroll = (key) => {
  window.scrollTo({ top: scrollMemory.get(key) ?? 0, behavior: 'auto' })
}

/**
 * “Back” from a sub-page: if the visitor came from the guide, step back in
 * history (so the browser Back button stays in sync). Returns false when the
 * page was opened directly, so the caller can navigate instead.
 */
export const wentBackFromHome = () => {
  if (previousKey === 'home') {
    window.history.back()
    return true
  }
  return false
}
