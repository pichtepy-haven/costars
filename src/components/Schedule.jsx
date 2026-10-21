import React from 'react'
import { Radio } from 'lucide-react'
import AgendaItem from './AgendaItem.jsx'
import SectionHeading from './SectionHeading.jsx'
import { agenda } from '../data.js'
import { formatTime } from '../lib/time.js'

/** Keep the tapped row still while the previously open row collapses above it. */
const holdPosition = (el, duration = 480) => {
  if (!el) return
  const startTop = el.getBoundingClientRect().top
  const t0 = performance.now()
  const step = () => {
    const delta = el.getBoundingClientRect().top - startTop
    if (Math.abs(delta) > 0.5) window.scrollBy(0, delta)
    if (performance.now() - t0 < duration) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

/** Performance Schedule [UI1]: full running order from the proposal [P2]. */
export default function Schedule({ openId, setOpenId, live }) {
  const toggle = (id, triggerEl) => {
    holdPosition(triggerEl)
    setOpenId((current) => (current === id ? '' : id))
  }

  const current = agenda.find((item) => item.id === live.currentId)
  const statusFor = (id) => {
    if (live.phase === 'live' && id === live.currentId) return 'now'
    if ((live.phase === 'live' || live.phase === 'before-start') && id === live.nextId) return 'next'
    return undefined
  }

  return (
    <section id="schedule" className="page-section reveal" aria-labelledby="schedule-title">
      <SectionHeading id="schedule-title" title="Performance Schedule" subtitle="Tap each performance to see more details." />

      {live.phase === 'live' && current && (
        <p className="live-banner" role="status">
          <Radio size={16} aria-hidden="true" />
          <span>
            <strong>Happening now:</strong> {current.act ? `${current.act}: ` : ''}
            {current.title}, until {formatTime(current.end)}
          </span>
        </p>
      )}

      <ol className="agenda-list">
        {agenda.map((item) => (
          <AgendaItem
            key={item.id}
            item={item}
            expanded={openId === item.id}
            onToggle={toggle}
            status={statusFor(item.id)}
          />
        ))}
      </ol>
    </section>
  )
}
