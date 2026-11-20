import React from 'react'
import { ArrowRight, MapPin } from 'lucide-react'
import { charity } from '../data.js'
import { useT } from '../i18n.jsx'
import { SectionHead, pad2 } from '../components/ui.jsx'
import { FactTile, ImpactSteps } from '../components/home/CharityHighlight.jsx'

function DonateButton({ className = '' }) {
  const { t } = useT()
  return (
    <a className={`btn btn--gold ${className}`} href={charity.donateUrl || '/donate'}>
      {t('donate_button')}
      <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
    </a>
  )
}

/** L'aang Primary School: who the concert supports and what they need. */
export default function CharityView() {
  const { t, loc } = useT()
  const b = charity.beneficiary
  return (
    <>
      <section className="charity-hero ch-hero">
        <div className="charity-hero__media">
          <div className="photo-glow" aria-hidden="true" />
          <img src={charity.heroImage.src} alt={charity.heroImage.alt} />
          <div className="hero-shade" aria-hidden="true" />
        </div>
        <div className="wrap charity-hero__text">
          <p className="eyebrow eyebrow--gold">{loc(charity, 'tagline') || t('charity_title')}</p>
          <h1 className="display charity-hero__title" id="view-title" tabIndex={-1}>
            {loc(b, 'name')}
          </h1>
          <p className="charity-hero__place">
            <MapPin size={16} strokeWidth={1.8} aria-hidden="true" />
            {loc(b, 'location')}
          </p>
          <DonateButton className="charity-hero__cta" />
        </div>
      </section>

      <section className="wrap charity-facts reveal">
        <div className="hundred">
          <span className="display hundred__value">{charity.share}</span>
          <span className="hundred__text">{loc(charity, 'sharePageText')}</span>
        </div>
        <div className="fact-grid">
          {b.facts.map((f) => (
            <FactTile key={f.label} fact={f} />
          ))}
        </div>
      </section>

      <section id="where" className="section wrap reveal" aria-labelledby="steps-title">
        <SectionHead id="steps-title" eyebrow={t('steps_eyebrow')} title={t('steps_title')} />
        <div className="steps-wrap">
          <span className="step-line" aria-hidden="true" />
          <ImpactSteps full className="impact-steps--page" />
        </div>
      </section>

      {b.photos?.length > 0 && (
        <section className="section wrap reveal" aria-labelledby="gallery-title">
          <SectionHead id="gallery-title" eyebrow={t('gallery_eyebrow')} title={t('gallery_title')} />
          <div className="school-gallery">
            {b.photos.map((p) => (
              <img key={p.src} src={p.src} alt={p.alt} loading="lazy" />
            ))}
          </div>
        </section>
      )}

      {b.needs?.length > 0 && (
        <section className="section wrap needs reveal" aria-labelledby="needs-title">
          <SectionHead id="needs-title" eyebrow={t('needs_eyebrow')} title={t('needs_title')} />
          <div>
            <ol className="needs-list">
              {b.needs.map((n, i) => (
                <li key={n.title}>
                  <span className="display">{pad2(i + 1)}</span>
                  <span>
                    <strong>{loc(n, 'title')}</strong>
                    {loc(n, 'text') && <span>{loc(n, 'text')}</span>}
                  </span>
                </li>
              ))}
            </ol>
            {loc(b, 'sourceNote') && <p className="source-note">{loc(b, 'sourceNote')}</p>}
          </div>
        </section>
      )}

      <section className="section wrap reveal">
        <div className="donate-cta cta">
          <div>
            <h2 className="display">{t('donate_title')}</h2>
            <p>{t('donate_text')}</p>
          </div>
          <DonateButton />
        </div>
      </section>
    </>
  )
}
