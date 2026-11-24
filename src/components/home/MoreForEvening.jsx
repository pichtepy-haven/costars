import React from 'react'
import { ChevronDown, ChevronRight, MapPin, Phone } from 'lucide-react'
import { charity, etiquette, help } from '../../data.js'
import { useT } from '../../i18n.jsx'
import { useIsDesktop } from '../../lib/useMedia.js'
import { IconTile, SectionHead } from '../ui.jsx'

function EtiquetteList() {
  const { loc } = useT()
  return (
    <ul className="etiquette">
      {etiquette.items.map((item) => (
        <li key={item.text}>
          <IconTile icon={item.icon} tone="gold" size={36} iconSize={18} />
          <span>
            {loc(item, 'title') && <strong>{loc(item, 'title')}</strong>}
            <span>{loc(item, 'text')}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function HelpContent() {
  const { t, loc } = useT()
  return (
    <div className="help-body">
      <p>{loc(help, 'text')}</p>
      {loc(help, 'desk') && (
        <div className="help-desk">
          <MapPin size={18} strokeWidth={1.8} aria-hidden="true" />
          <span>
            <strong>{loc(help, 'desk')}</strong>
            {loc(help, 'deskText') && <span>{loc(help, 'deskText')}</span>}
          </span>
        </div>
      )}
      {help.phone && (
        <a className="help-call" href={`tel:${help.phone.replace(/[^\d+]/g, '')}`}>
          <IconTile icon="phone" tone="crimson" size={36} iconSize={18} />
          <span>
            <strong>{t('help_call')}</strong>
            <span>{help.phone}</span>
          </span>
          <ChevronRight size={18} strokeWidth={1.8} aria-hidden="true" />
        </a>
      )}
    </div>
  )
}

function AboutContent() {
  const { t, loc } = useT()
  const a = charity.about
  return (
    <div className="about-body">
      <p>{loc(a, 'text')}</p>
      {loc(a, 'vision') && (
        <div className="about-box">
          <span className="display c-gold">{t('vision')}</span>
          <p>{loc(a, 'vision')}</p>
        </div>
      )}
      {loc(a, 'mission') && (
        <div className="about-box">
          <span className="display c-crimson">{t('mission')}</span>
          <p>{loc(a, 'mission')}</p>
        </div>
      )}
    </div>
  )
}

/** Etiquette, help and about: an accordion on phones, three cards on desktop. */
export default function MoreForEvening({ openId, setOpenId }) {
  const { t } = useT()
  const desktop = useIsDesktop()
  const panels = [
    { id: 'etiquette', icon: 'phone-off', tone: 'gold', title: t('etiquette_title'), sub: t('etiquette_sub'), body: <EtiquetteList /> },
    { id: 'help', icon: 'help', tone: 'crimson', title: t('help_title'), sub: t('help_sub'), body: <HelpContent /> },
    { id: 'about', icon: 'star', tone: 'champagne', title: t('about_title'), sub: t('about_sub'), body: <AboutContent /> },
  ]
  return (
    <section id="help" className="section wrap reveal" aria-labelledby="more-title">
      <SectionHead id="more-title" eyebrow={t('more_eyebrow')} title={t('more_title')} className="sec-head--small" />
      {desktop ? (
        <div className="more-grid">
          {panels.map((p) => (
            <article key={p.id} id={p.id} className="more-card">
              <header className="more-card__head">
                <IconTile icon={p.icon} tone={p.tone} />
                <span>
                  <h3>{p.title}</h3>
                  <span>{p.sub}</span>
                </span>
              </header>
              {p.body}
            </article>
          ))}
        </div>
      ) : (
        <div className="accordion">
          {panels.map((p) => {
            const open = openId === p.id
            return (
              <div key={p.id} id={p.id} className="accordion__item">
                <h3 className="accordion__heading">
                  <button type="button" aria-expanded={open} aria-controls={`more-${p.id}`} onClick={() => setOpenId(open ? '' : p.id)}>
                    <IconTile icon={p.icon} tone={p.tone} />
                    <span className="accordion__text">
                      <span className="accordion__title">{p.title}</span>
                      <span className="accordion__sub">{p.sub}</span>
                    </span>
                    <ChevronDown size={18} strokeWidth={1.8} aria-hidden="true" className={`chev ${open ? 'open' : ''}`} />
                  </button>
                </h3>
                {open && (
                  <div className="accordion__panel" id={`more-${p.id}`}>
                    {p.body}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
