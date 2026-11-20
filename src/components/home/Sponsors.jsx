import React from 'react'
import { sponsors } from '../../data.js'
import { useT } from '../../i18n.jsx'
import { SectionHead } from '../ui.jsx'

/** Sponsor logos (Sheet tab “Sponsors”). Hidden while the list is empty. */
export default function Sponsors() {
  const { t } = useT()
  if (!sponsors.list?.length) return null
  return (
    <section id="sponsors" className="section wrap reveal" aria-labelledby="sponsors-title">
      <SectionHead id="sponsors-title" eyebrow={t('sponsors_eyebrow')} title={t('sponsors_title')} className="sec-head--small" />
      <ul className="sponsor-grid">
        {sponsors.list.map((s) => {
          const inner = s.logo ? <img src={s.logo} alt={s.name} loading="lazy" /> : <span>{s.name}</span>
          return (
            <li key={s.name}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.logo ? s.name : undefined}>
                  {inner}
                </a>
              ) : (
                <div>{inner}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
