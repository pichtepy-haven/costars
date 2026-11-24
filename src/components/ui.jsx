import React from 'react'
import { getIcon } from '../lib/icons.js'

/* Small building blocks shared by every page of the guide. */

export const TONE_ICON_BG = {
  gold: 'tone-gold',
  crimson: 'tone-crimson',
  champagne: 'tone-champagne',
  teal: 'tone-teal',
}

/**
 * Section heading: small coloured eyebrow, display title, optional intro.
 * split: on desktop the intro sits to the right of the title.
 * aside: e.g. the “Swipe →” hint, at the end of the heading on phones.
 */
export function SectionHead({ eyebrow, title, intro, tone = 'gold', id, aside, split = false, as: H = 'h2', className = '' }) {
  return (
    <div className={`sec-head ${split ? 'sec-head--split' : ''} ${className}`}>
      {eyebrow && <p className={`eyebrow eyebrow--${tone}`}>{eyebrow}</p>}
      <H className="display sec-title" id={id}>
        {title}
      </H>
      {intro && <p className="sec-intro">{intro}</p>}
      {aside}
    </div>
  )
}

/** Four-point star used as a sparkle. */
export function Sparkle({ size = 12, color = '#F5B544', className = '', style }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" focusable="false">
      <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
    </svg>
  )
}

/** Swaying stage lights + sparkles behind a hero. */
export function StageLights({ beams = 3, sparkles = true }) {
  return (
    <div className="stage-lights" aria-hidden="true">
      {Array.from({ length: beams }, (_, i) => (
        <div key={i} className={`beam b${i + 1}`} />
      ))}
      {sparkles && (
        <>
          <Sparkle className="twinkle tw1" size={14} />
          <Sparkle className="twinkle tw2" size={8} color="#FCF9F2" />
          <Sparkle className="twinkle tw3" size={10} color="#FF8A8E" />
        </>
      )}
    </div>
  )
}

export function QuoteMark({ color = '#F5B544', size = 26 }) {
  return (
    <svg width={size} height={(size * 20) / 26} viewBox="0 0 26 20" aria-hidden="true" focusable="false">
      <path d="M0 20V12C0 5 4 1 10 0l1 3C7 4 5 7 5 10h5v10ZM15 20V12c0-7 4-11 10-12l1 3c-4 1-6 4-6 7h5v10Z" fill={color} />
    </svg>
  )
}

export function MenuGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M4 7h16M4 12h16M10 17h10" />
    </svg>
  )
}

/** Gold info box under an agenda item. */
export function Note({ icon = 'info', children }) {
  const Icon = getIcon(icon)
  return (
    <div className="note">
      <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

/** Rounded icon tile. */
export function IconTile({ icon, tone = 'gold', size = 40, iconSize = 20, className = '' }) {
  const Icon = getIcon(icon)
  return (
    <span className={`icon-tile ${TONE_ICON_BG[tone] || ''} ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <Icon size={iconSize} strokeWidth={1.8} />
    </span>
  )
}

/** “Song Hui Chan” → “SC”, “Princess Buppha Devi Dance School” → “PB”. */
export const initialsOf = (name = '') => {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  if (!words.length) return '★'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

/** Initials in a gradient ring (photo when there is one). */
export function Avatar({ name, initials, photo, size = 44, className = '' }) {
  return (
    <span className={`avatar-ring ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      {photo ? (
        <img src={photo} alt="" loading="lazy" />
      ) : (
        <span className="display" style={{ fontSize: Math.max(11, Math.round(size * 0.3)) }}>
          {initials || initialsOf(name)}
        </span>
      )}
    </span>
  )
}

export function Chip({ children, tone, as: Tag = 'span', className = '', ...rest }) {
  return (
    <Tag className={`chip ${tone ? `chip--${tone}` : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

/** Two digits for set numbers: 1 → “01”. */
export const pad2 = (n) => String(n).padStart(2, '0')
