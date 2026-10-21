import React from 'react'
import { ChevronDown } from 'lucide-react'

/** Row from the “More for your evening” list [UI1]: dark icon disc, title, subtitle. */
export default function SupportAccordion({ id, icon: Icon, title, subtitle, expanded, onToggle, children }) {
  const panelId = `support-panel-${id}`
  const triggerId = `support-trigger-${id}`
  return (
    <div id={id} className={`support-item ${expanded ? 'is-open' : ''}`}>
      <h3 className="support-item__heading">
        <button id={triggerId} type="button" className="support-item__trigger" aria-expanded={expanded} aria-controls={panelId} onClick={() => onToggle(id)}>
          <span className="icon-disc" aria-hidden="true">
            <Icon size={18} strokeWidth={1.8} />
          </span>
          <span className="support-item__copy">
            <span className="support-item__title">{title}</span>
            <span className="support-item__subtitle">{subtitle}</span>
          </span>
          <ChevronDown className="support-item__chevron" size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={triggerId} className="support-item__panel">
        <div className="support-item__panel-inner">
          <div className="support-item__content">{children}</div>
        </div>
      </div>
    </div>
  )
}
