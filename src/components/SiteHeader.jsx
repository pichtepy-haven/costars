import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Menu as MenuIcon, X } from 'lucide-react'
import BrandMark from './BrandMark.jsx'
import { event } from '../data.js'

/**
 * Sticky header.
 *  variant 'home'    → logo · “Event Guide” · menu         [UI1][UI2]
 *  variant 'act'     → ‹ Agenda · centred logo · menu       [UI2 detail screens]
 *  variant 'charity' → ‹ logo “Charity Impact” · menu       [UI2 charity screen]
 */
export default function SiteHeader({ variant = 'home', backLabel, onBack, title, menuItems }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const back = (
    <a
      href="#/"
      className="site-header__back"
      onClick={(e) => {
        e.preventDefault()
        onBack?.()
      }}
    >
      <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
      <span className={variant === 'charity' ? 'visually-hidden' : ''}>{backLabel}</span>
    </a>
  )

  return (
    <header className={`site-header site-header--${variant} ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="site-header__inner">
        {variant === 'home' && (
          <>
            <a href="#/" className="site-header__brand" aria-label={`${event.brand} ${event.guideLabel}: home`}>
              <BrandMark />
            </a>
            <span className="site-header__title">{event.guideLabel}</span>
          </>
        )}
        {variant === 'act' && (
          <>
            {back}
            <a href="#/" className="site-header__brand site-header__brand--center" aria-label={`${event.brand} ${event.guideLabel}: home`}>
              <BrandMark />
            </a>
          </>
        )}
        {variant === 'charity' && (
          <>
            {back}
            <a href="#/" className="site-header__brand" aria-label={`${event.brand} ${event.guideLabel}: home`}>
              <BrandMark />
            </a>
            <span className="site-header__title">{title}</span>
          </>
        )}
        <SiteMenu items={menuItems} />
      </div>
    </header>
  )
}

function SiteMenu({ items }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    panelRef.current?.querySelector('a, button')?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onPointer = (e) => {
      if (!panelRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <div className="site-menu">
      <button
        ref={buttonRef}
        type="button"
        className="icon-button site-menu__toggle"
        aria-expanded={open}
        aria-controls="site-menu-panel"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={22} strokeWidth={1.8} /> : <MenuIcon size={23} strokeWidth={1.6} />}
      </button>
      <nav id="site-menu-panel" ref={panelRef} className={`site-menu__panel ${open ? 'is-open' : ''}`} aria-label="Guide sections" hidden={!open}>
        <ul>
          {items.map(({ label, icon: Icon, onSelect }) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onSelect()
                }}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
