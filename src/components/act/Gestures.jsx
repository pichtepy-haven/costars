import React, { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { gestures } from '../../data.js'
import { useT } from '../../i18n.jsx'
import { prefersReducedMotion } from '../../lib/useMedia.js'
import { SectionHead, pad2 } from '../ui.jsx'

const TONE_TEXT = { teal: 'c-teal', gold: 'c-gold', crimson: 'c-crimson', violet: 'c-violet' }

/** Slideshow that steps through the gestures every 3 seconds. */
function GestureShow({ items, phases }) {
  const { t, loc, km } = useT()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  useEffect(() => {
    if (!playing || items.length < 2) return undefined
    const id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), 3000)
    return () => window.clearInterval(id)
  }, [playing, items.length])
  const phaseOf = (g) => phases.find((p) => p.id === g.phase) || {}
  return (
    <div className="gesture-show">
      <div className="gesture-show__frames" role="img" aria-label={t('gestures_title')}>
        {items.map((g, i) => {
          const phase = phaseOf(g)
          return (
            <figure key={g.name} className={`gesture-frame ${i === index ? 'is-on' : ''}`} aria-hidden={i !== index}>
              <img src={g.image} alt="" loading={i < 2 ? 'eager' : 'lazy'} />
              <figcaption>
                <span>
                  <span className={`display gesture-frame__eyebrow ${TONE_TEXT[phase.tone] || ''}`}>
                    {pad2(i + 1)} · {loc(phase, 'name')}
                  </span>
                  <span className="display gesture-frame__name">{loc(g, 'name')}</span>
                </span>
                {!km && g.name_km && (
                  <span className="km-text gesture-frame__km" lang="km">
                    {g.name_km}
                  </span>
                )}
              </figcaption>
            </figure>
          )
        })}
        <button type="button" className="gesture-show__toggle" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t('pause') : t('play')}>
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        </button>
      </div>
      <div className="gesture-dots" aria-hidden="true">
        {items.map((g, i) => (
          <span key={g.name} className={i === index ? 'is-on' : ''} />
        ))}
      </div>
    </div>
  )
}

/** Act I: the eight hand gestures, grouped by the four phases of a plant's life. */
export default function Gestures() {
  const { t, loc, km } = useT()
  const { items, phases } = gestures
  if (!items.length) return null
  return (
    <section className="section wrap reveal" aria-labelledby="gestures-title">
      <SectionHead id="gestures-title" eyebrow={t('gestures_eyebrow')} title={t('gestures_title')} intro={t('gestures_text')} split />
      <div className="gestures">
        <GestureShow items={items} phases={phases} />
        <div className="gesture-phases">
          {phases.map((phase) => {
            const list = items.filter((g) => g.phase === phase.id)
            if (!list.length) return null
            return (
              <div key={phase.id} className="gesture-phase">
                <div className="gesture-phase__head">
                  <span className={`display ${TONE_TEXT[phase.tone] || ''}`}>{loc(phase, 'name')}</span>
                  {loc(phase, 'text') && <span>{loc(phase, 'text')}</span>}
                </div>
                <ol>
                  {list.map((g) => (
                    <li key={g.name}>
                      <img src={g.image} alt={`${loc(g, 'name')}`} loading="lazy" />
                      <span>
                        <strong>{loc(g, 'name')}</strong>
                        {!km && g.name_km && (
                          <span className="km-text" lang="km">
                            {g.name_km}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
