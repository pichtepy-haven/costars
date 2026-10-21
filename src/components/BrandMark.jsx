import React from 'react'

/** The five-point star that replaces the “a” in “CoStars”. */
export function StarGlyph({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 3.6 14.76 9.4 21.13 10.23 16.47 14.65 17.64 20.97 12 17.9 6.36 20.97 7.53 14.65 2.87 10.23 9.24 9.4Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * CoStars word mark. layout: 'stacked' (Co / St★rs) or 'inline' (CoSt★rs).
 * tone: 'dark' (charcoal) or 'light' (white, for dark backgrounds).
 */
export default function BrandMark({ layout = 'stacked', tone = 'dark', className = '' }) {
  return (
    <span className={`brand-mark brand-mark--${layout} brand-mark--${tone} ${className}`} role="img" aria-label="CoStars">
      <span className="brand-mark__line" aria-hidden="true">Co</span>
      <span className="brand-mark__line" aria-hidden="true">
        St<StarGlyph className="brand-mark__star" />rs
      </span>
    </span>
  )
}
