import React from 'react'
import BrandMark from '../src/components/BrandMark.jsx'

export function StaffHeader({ label = 'Staff Check-In' }) {
  return (
    <header className="st-header">
      <div className="st-header__inner">
        <BrandMark />
        <span className="st-header__label">{label}</span>
      </div>
    </header>
  )
}

export function Ornament() {
  return (
    <div className="st-ornament" aria-hidden="true">
      <span />
      <i />
      <span />
    </div>
  )
}

export function StaffFooter() {
  return (
    <footer className="st-footer">
      <Ornament />
      <p className="st-footer__line">Together, we create a brighter tomorrow.</p>
      <div className="st-footer__motif" aria-hidden="true" />
    </footer>
  )
}

/** Shield with a padlock, as in the staff login mockup. */
export function ShieldLock({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        d="M24 4.5 39 10v12.2c0 9.6-6.3 17.3-15 21.3-8.7-4-15-11.7-15-21.3V10Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <rect x="17.5" y="22" width="13" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M20.5 22v-3a3.5 3.5 0 0 1 7 0v3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="24" cy="27" r="1.4" fill="currentColor" />
    </svg>
  )
}
