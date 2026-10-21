import React from 'react'

export function Diamond({ className = '' }) {
  return (
    <svg className={`diamond ${className}`} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M8 1.6 14.4 8 8 14.4 1.6 8Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5.7 10.3 8 8 10.3 5.7 8Z" fill="currentColor" />
    </svg>
  )
}

/** Thin rule with the CoStars diamond. variant 'motif' adds the Khmer-inspired band. */
export default function SectionDivider({ variant = 'line', className = '' }) {
  return (
    <div className={`ornament ornament--${variant} ${className}`} aria-hidden="true">
      <span className="ornament__line" />
      <Diamond />
      <span className="ornament__line" />
    </div>
  )
}
