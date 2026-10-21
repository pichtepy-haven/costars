import React from 'react'
import { Diamond } from './SectionDivider.jsx'

export default function SectionHeading({ id, title, subtitle, as: Tag = 'h2', className = '' }) {
  return (
    <div className={`section-heading ${className}`}>
      <div className="section-heading__row">
        <Tag id={id} className="section-heading__title" tabIndex={Tag === 'h1' ? -1 : undefined}>
          {title}
        </Tag>
        <span className="section-heading__rule" aria-hidden="true">
          <span />
          <Diamond />
          <span className="section-heading__rule-end" />
        </span>
      </div>
      {subtitle && <p className="section-heading__subtitle">{subtitle}</p>}
    </div>
  )
}
