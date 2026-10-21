import React from 'react'
import { SHOW_PLACEHOLDERS } from '../lib/config.js'

/**
 * Marks content that still has to be supplied in src/data.js.
 * Visible only in development (or with VITE_SHOW_PLACEHOLDERS=true);
 * renders nothing on the live site.
 */
export default function Placeholder({ label, block = false, className = '' }) {
  if (!SHOW_PLACEHOLDERS) return null
  return (
    <span className={`todo ${block ? 'todo--block' : ''} ${className}`} title="Development only: add this in src/data.js">
      To supply: {label}
    </span>
  )
}
