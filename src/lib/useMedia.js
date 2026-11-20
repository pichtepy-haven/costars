import { useEffect, useState } from 'react'

const match = (query) => typeof window !== 'undefined' && Boolean(window.matchMedia?.(query).matches)

/** True while the media query matches; follows window resizes. */
export const useMedia = (query) => {
  const [matches, setMatches] = useState(() => match(query))
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [query])
  return matches
}

/** Desktop layout from 960px (matches the @media rules in styles.css). */
export const useIsDesktop = () => useMedia('(min-width: 960px)')

export const prefersReducedMotion = () => match('(prefers-reduced-motion: reduce)')
