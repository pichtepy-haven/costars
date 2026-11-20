import React from 'react'
import { useT } from '../../i18n.jsx'
import { SectionHead, pad2 } from '../ui.jsx'

function DanceCard({ dance, index }) {
  const { t, loc, km } = useT()
  return (
    <article className={`dance-card dance-card--${dance.tone}`}>
      {dance.image && (
        <figure className="dance-card__media">
          <img src={dance.image} alt={dance.imageAlt || ''} loading="lazy" style={{ objectPosition: dance.imagePosition || '50% 40%' }} />
        </figure>
      )}
      <div className="dance-card__body">
        <span className={`display dance-card__eyebrow c-${dance.tone}`}>
          {t('dance_n', { n: pad2(index + 1) })}
          {loc(dance, 'kind') ? ` · ${loc(dance, 'kind')}` : ''}
        </span>
        <h3 className="display dance-card__title">{loc(dance, 'name')}</h3>
        {(dance.localName || dance.romanized) && (
          <div className="dance-card__names">
            {!km && dance.localName && (
              <span className="km-text" lang="km">
                {dance.localName}
              </span>
            )}
            {dance.romanized && <span>{dance.romanized}</span>}
          </div>
        )}
        {loc(dance, 'description') && <p>{loc(dance, 'description')}</p>}
        {dance.moments?.length > 0 && (
          <div className="moments">
            <span className={`moments__title c-${dance.tone}`}>{t('moments_title')}</span>
            <ol>
              {dance.moments.map((m, i) => (
                <li key={m.title}>
                  {m.image && <img src={m.image} alt={m.imageAlt || ''} loading="lazy" />}
                  <span>
                    <span className="moments__head">
                      <span className={`display c-${dance.tone}`}>{pad2(i + 1)}</span>
                      <strong>{loc(m, 'title')}</strong>
                    </span>
                    {loc(m, 'text') && <span className="moments__text">{loc(m, 'text')}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </article>
  )
}

/** Act I: the dances, each with its three moments. */
export default function Dances({ act, dances }) {
  const { t, loc } = useT()
  if (!dances.length) return null
  return (
    <section className="section wrap reveal" aria-labelledby="dances-title">
      <SectionHead
        id="dances-title"
        eyebrow={t('dances_eyebrow')}
        title={loc(act, 'lineupTitle') || t('dances_title')}
        intro={loc(act, 'performersIntro')}
        split
      />
      <div className="dance-grid">
        {dances.map((d, i) => (
          <DanceCard key={d.id} dance={d} index={i} />
        ))}
      </div>
    </section>
  )
}
