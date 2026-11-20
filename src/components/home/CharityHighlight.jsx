import React from 'react'
import { ArrowRight } from 'lucide-react'
import { charity } from '../../data.js'
import { useT } from '../../i18n.jsx'
import { hrefFor } from '../../lib/router.js'
import { SectionHead, pad2 } from '../ui.jsx'

const STEP_TONES = ['gold', 'crimson', 'violet']

/** Numbered “where the money goes” list (home: short lines, charity page: full). */
export function ImpactSteps({ full = false, className = '' }) {
  const { loc } = useT()
  return (
    <ol className={`impact-steps ${className}`}>
      {charity.steps.map((s, i) => (
        <li key={s.title}>
          <span className={`step-num display tone-${STEP_TONES[i % 3]}`}>{pad2(i + 1)}</span>
          <span className="impact-steps__text">
            <span className="impact-steps__title">{loc(s, 'title')}</span>
            <span className="impact-steps__sub">{full ? loc(s, 'text') : loc(s, 'short') || loc(s, 'text')}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

export function FactTile({ fact, className = '' }) {
  const { loc } = useT()
  return (
    <div className={`fact-tile ${className}`}>
      <span className="display fact-tile__value">{fact.value}</span>
      <span className="fact-tile__label">{loc(fact, 'label')}</span>
      {loc(fact, 'detail') && <span className="fact-tile__detail">{loc(fact, 'detail')}</span>}
    </div>
  )
}

export default function CharityHighlight() {
  const { t, loc } = useT()
  const b = charity.beneficiary
  const facts = b.facts.filter((f) => f.home)
  return (
    <section id="charity" className="section wrap reveal" aria-labelledby="charity-title">
      <SectionHead id="charity-title" eyebrow={t('charity_eyebrow')} title={loc(charity, 'tagline') || t('charity_title')} />
      <div className="charity-grid">
        <div className="hundred-tile">
          <span className="display hundred-tile__value">{charity.share}</span>
          <span className="hundred-tile__text">{loc(charity, 'shareText')}</span>
        </div>
        <figure className="school-photo">
          <img src={charity.featureImage.src} alt={charity.featureImage.alt} loading="lazy" />
          <figcaption>
            <strong>{loc(b, 'name')}</strong>
            <span>{loc(b, 'area')}</span>
          </figcaption>
        </figure>
        {facts.slice(0, 2).map((f, i) => (
          <FactTile key={f.label} fact={f} className={`fact-${i + 1}`} />
        ))}
        <ImpactSteps className="charity-grid__steps" />
      </div>
      <a className="btn btn--outline btn--block" href={hrefFor.charity()}>
        {t('learn_school')}
        <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
      </a>
    </section>
  )
}
