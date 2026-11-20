import React from 'react'
import { Clock } from 'lucide-react'
import { useT } from '../../i18n.jsx'
import { durationOf, formatDuration, formatRange } from '../../lib/time.js'
import { StageLights, pad2 } from '../ui.jsx'

/** Act page opening: photo hero when the act has a photo, stage lights otherwise. */
export default function ActHero({ act: item, number, count, countLabel, isNow }) {
  const { t, loc, act, lang } = useT()
  const chips = (
    <div className="hero-chips">
      <span className="glass hero-chip">
        <Clock size={14} strokeWidth={2} aria-hidden="true" />
        {formatRange(item, lang)}
      </span>
      <span className="glass hero-chip">{formatDuration(durationOf(item), lang)}</span>
      {count > 0 && <span className="glass hero-chip">{countLabel}</span>}
      {isNow && (
        <span className="hero-chip hero-chip--live">
          <span className="pulse-dot" aria-hidden="true" />
          {t('now_on_stage')}
        </span>
      )}
    </div>
  )
  const text = (
    <div className="act-hero__text">
      <span className={`act-pill act-pill--${item.tone}`}>{act(item.act)}</span>
      <h1 className="display act-hero__title" id="view-title" tabIndex={-1}>
        {loc(item, 'title')}
      </h1>
      {loc(item, 'subtitle') && <p className="act-hero__sub">{loc(item, 'subtitle')}</p>}
      {chips}
    </div>
  )

  if (item.image) {
    return (
      <section className="act-hero act-hero--photo">
        <img src={item.image} alt={item.imageAlt || ''} style={{ objectPosition: item.imagePosition || '50% 30%' }} />
        <div className="hero-shade" aria-hidden="true" />
        <div className="wrap act-hero__inner">{text}</div>
      </section>
    )
  }

  return (
    <section className={`act-hero act-hero--stage act-hero--${item.tone}`}>
      <StageLights beams={2} sparkles={false} />
      <span className={`numeral numeral--${item.tone} act-hero__numeral`} aria-hidden="true">
        {pad2(number)}
      </span>
      <div className="wrap act-hero__inner">{text}</div>
      <div className="floor-glow" aria-hidden="true" />
      <img className="act-hero__musicians" src="/images/brand/musicians.svg" alt="" aria-hidden="true" />
    </section>
  )
}
