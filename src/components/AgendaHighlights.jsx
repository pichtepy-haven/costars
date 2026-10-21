import React from 'react'
import { ChevronRight } from 'lucide-react'
import StageCover from './StageCover.jsx'
import SectionHeading from './SectionHeading.jsx'
import { agenda } from '../data.js'
import { durationOf, formatDuration, formatRange } from '../lib/time.js'
import { hrefFor } from '../lib/router.js'

/** Agenda Highlights [UI2]: the three acts, each opening its detail page. */
export default function AgendaHighlights({ live }) {
  const acts = agenda.filter((item) => item.type === 'act')
  return (
    <section id="highlights" className="page-section reveal" aria-labelledby="highlights-title">
      <SectionHeading id="highlights-title" title="Agenda Highlights" subtitle="Discover the key moments of our concert." />
      <ul className="highlights">
        {acts.map((act) => (
          <li key={act.id}>
            <a className="highlight-card" href={hrefFor.act(act.id)}>
              <StageCover
                className="highlight-card__media"
                size="card"
                tone={act.tone}
                icon={act.icon}
                label={act.act}
                image={act.image}
                alt={act.imageAlt}
              />
              <span className="highlight-card__body">
                <span className="highlight-card__title">{act.title}</span>
                <span className="highlight-card__meta">{formatRange(act)}</span>
                <span className="highlight-card__meta">
                  {formatDuration(durationOf(act))}
                  {live.phase === 'live' && live.currentId === act.id && <span className="status-pill status-pill--now">Now</span>}
                </span>
              </span>
              <ChevronRight className="highlight-card__chevron" size={19} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
