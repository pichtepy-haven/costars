import React from 'react'
import { ChevronDown, Info, UserRound } from 'lucide-react'
import StageCover from './StageCover.jsx'
import Button from './Button.jsx'
import Placeholder from './Placeholder.jsx'
import { durationOf, formatDuration, formatRange } from '../lib/time.js'
import { hrefFor } from '../lib/router.js'

const toneFor = (item) => item.tone || (item.type === 'break' ? 'amber' : 'wine')

/**
 * One row of the Performance Schedule accordion [UI1].
 * Collapsed: dot · title · time · chevron. Expanded: dark header + detail card.
 */
export default function AgendaItem({ item, expanded, onToggle, status }) {
  const panelId = `agenda-panel-${item.id}`
  const triggerId = `agenda-trigger-${item.id}`
  const isAct = item.type === 'act'
  const minutes = durationOf(item)

  return (
    <li className={`agenda-item agenda-item--${item.type} ${expanded ? 'is-open' : ''} ${status === 'now' ? 'is-now' : ''}`}>
      <h3 className="agenda-item__heading">
        <button
          id={triggerId}
          type="button"
          className="agenda-item__trigger"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={(e) => onToggle(item.id, e.currentTarget)}
        >
          <span className={`dot dot--${item.type}`} aria-hidden="true" />
          <span className="agenda-item__text">
            <span className="agenda-item__title">
              {isAct && <span className="agenda-item__act">{item.act}: </span>}
              {item.title}
            </span>
            <span className="agenda-item__time">
              {formatRange(item)}
              <span className="agenda-item__duration"> · {formatDuration(minutes)}</span>
            </span>
          </span>
          {status === 'now' && <span className="status-pill status-pill--now">Now</span>}
          {status === 'next' && <span className="status-pill status-pill--next">Up next</span>}
          <ChevronDown className="agenda-item__chevron" size={19} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </h3>

      <div id={panelId} role="region" aria-labelledby={triggerId} className="agenda-item__panel">
        <div className="agenda-item__panel-inner">
          <div className="agenda-item__card">
            <div className="agenda-item__body">
              <StageCover
                className="agenda-item__media"
                size="thumb"
                tone={toneFor(item)}
                icon={item.icon}
                label={isAct ? item.act : undefined}
                image={item.image}
                alt={item.imageAlt}
              />
              <div className="agenda-item__copy">
                {item.subtitle && <p className="agenda-item__subtitle">{item.subtitle}</p>}
                <p className="agenda-item__desc">{item.description}</p>
                {item.host &&
                  (item.host.name ? (
                    <p className="agenda-item__host">
                      <UserRound size={15} aria-hidden="true" />
                      <span>
                        <strong>{item.host.name}</strong>, {item.host.role}
                      </span>
                    </p>
                  ) : (
                    <Placeholder label="host / emcee name" />
                  ))}
                {item.note && (
                  <p className="note">
                    <Info size={15} strokeWidth={1.8} aria-hidden="true" />
                    <span>
                      <strong>Note:</strong> {item.note}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {isAct && item.programme?.length > 0 && (
              <div className="agenda-item__lineup">
                <p className="eyebrow">Line-up</p>
                <ol className="lineup">
                  {item.programme.map((p) => (
                    <li key={p.id}>
                      <span className="lineup__name">{p.name}</span>
                      <span className="lineup__role">{p.role}</span>
                    </li>
                  ))}
                </ol>
                <Button variant="primary" href={hrefFor.act(item.id)} className="agenda-item__cta">
                  Meet the performers
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
