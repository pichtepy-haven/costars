import React from 'react'
import BrandMark from './BrandMark.jsx'
import StageCover from './StageCover.jsx'
import SectionDivider from './SectionDivider.jsx'
import { event, values } from '../data.js'
import { getIcon } from '../lib/icons.js'

/** Quote band + values row [UI2], closing line [UI1]. compact = sub-pages. */
export default function SiteFooter({ compact = false }) {
  return (
    <footer className={`site-footer ${compact ? 'site-footer--compact' : ''}`}>
      {!compact && (
        <>
          <div className="quote-band">
            <StageCover className="quote-band__media" size="band" tone="crimson" silhouette />
            <div className="quote-band__shade" aria-hidden="true" />
            <div className="quote-band__copy">
              <p className="quote-band__quote">“{event.quote}”</p>
              <BrandMark tone="light" />
            </div>
          </div>
          <ul className="values" aria-label="What CoStars stands for">
            {values.map((v) => {
              const Icon = getIcon(v.icon)
              return (
                <li key={v.label}>
                  <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                  <span>{v.label}</span>
                </li>
              )
            })}
          </ul>
          <div className="motif-band" aria-hidden="true" />
        </>
      )}
      <div className="site-footer__closing">
        <p className="site-footer__kicker">{event.name}</p>
        <SectionDivider />
        <p className="site-footer__small">
          {event.tagline}
          <br />
          {event.organizer}.
        </p>
      </div>
    </footer>
  )
}
