import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import BrandMark from './BrandMark.jsx'
import { MenuGlyph } from './ui.jsx'
import { useLang, useT } from '../i18n.jsx'

/** Phone: one button that switches to the other language. */
function LangToggle() {
  const { lang, setLang } = useLang()
  const { t } = useT()
  const next = lang === 'km' ? 'en' : 'km'
  return (
    <button
      type="button"
      className="lang-btn"
      onClick={() => setLang(next)}
      aria-label={`${t('switch_language')}: ${next === 'km' ? 'ខ្មែរ' : 'English'}`}
    >
      {next === 'km' ? <span lang="km">ខ្មែរ</span> : 'EN'}
    </button>
  )
}

/** Desktop: EN | ខ្មែរ segmented switch. */
function LangSegments() {
  const { lang, setLang } = useLang()
  const { t } = useT()
  return (
    <div className="lang-segs" role="group" aria-label={t('switch_language')}>
      <button type="button" className={`lang-seg ${lang === 'en' ? 'on' : ''}`} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
        EN
      </button>
      <button type="button" lang="km" className={`lang-seg ${lang === 'km' ? 'on' : ''}`} aria-pressed={lang === 'km'} onClick={() => setLang('km')}>
        ខ្មែរ
      </button>
    </div>
  )
}

/**
 * Floating glass header with the phone menu.
 *  variant  'home' (logo) | 'sub' (back link + page label)
 *  items    [{ key, label, sub, dot, href, pulse, current }]
 */
export default function SiteHeader({ variant = 'home', backLabel, onBack, label, items = [], navItems = [] }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  // Close on Escape, keep focus in the menu, lock the page scroll while open.
  useEffect(() => {
    if (!open) return undefined
    const first = menuRef.current?.querySelector('a, button')
    first?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
      if (e.key === 'Tab' && menuRef.current) {
        const nodes = [buttonRef.current, ...menuRef.current.querySelectorAll('a, button')].filter(Boolean)
        const i = nodes.indexOf(document.activeElement)
        if (e.shiftKey && i <= 0) {
          e.preventDefault()
          nodes[nodes.length - 1].focus()
        } else if (!e.shiftKey && i === nodes.length - 1) {
          e.preventDefault()
          nodes[0].focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.documentElement.classList.add('menu-open')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('menu-open')
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <header className={`site-header site-header--${variant}`}>
        <div className="site-header__bar glass">
          {variant === 'sub' ? (
            <>
              <a
                className="header-back"
                href="#/"
                onClick={(e) => {
                  if (onBack) {
                    e.preventDefault()
                    onBack()
                  }
                }}
              >
                <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
                <span>{backLabel}</span>
              </a>
              {label && <span className="header-label">{label}</span>}
            </>
          ) : null}
          <a className={`header-brand ${variant === 'sub' ? 'header-brand--desk' : ''}`} href="#/" aria-label={`CoStars ${t('event_guide')}`}>
            <BrandMark tone="light" />
            <span className="header-label">{t('event_guide')}</span>
          </a>

          <nav className="header-nav" aria-label={t('menu')}>
            {navItems.map((item) => (
              <a key={item.key} href={item.href} aria-current={item.current ? 'page' : undefined} className={item.current ? 'is-current' : ''}>
                {item.pulse && <span className="pulse-dot" aria-hidden="true" />}
                {item.label}
              </a>
            ))}
            <LangSegments />
          </nav>

          <div className="header-actions">
            <LangToggle />
            <button
              ref={buttonRef}
              type="button"
              className="menu-btn"
              aria-label={open ? t('close_menu') : t('menu')}
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} strokeWidth={1.8} aria-hidden="true" /> : <MenuGlyph />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <>
          <div className="menu-backdrop" aria-hidden="true" onClick={close} />
          <nav id="site-menu" ref={menuRef} className="menu-panel" aria-label={t('menu')}>
            {items.map((item) => (
              <a
                key={item.key}
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={`menu-item ${item.current ? 'is-current' : ''}`}
                onClick={(e) => {
                  close()
                  if (item.onSelect) {
                    e.preventDefault()
                    item.onSelect()
                  }
                }}
              >
                <span className={`menu-dot dot-${item.dot} ${item.pulse ? 'pulse' : ''}`} aria-hidden="true" />
                <span className="menu-item__text">
                  <span className="menu-item__label">{item.label}</span>
                  {item.sub && <span className="menu-item__sub">{item.sub}</span>}
                </span>
                {item.current ? (
                  <span className="menu-here">{t('here')}</span>
                ) : (
                  <ChevronRight size={18} strokeWidth={1.8} aria-hidden="true" className="menu-chev" />
                )}
              </a>
            ))}
          </nav>
        </>
      )}
    </>
  )
}
