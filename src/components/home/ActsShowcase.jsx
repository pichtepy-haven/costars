import React from 'react'
import { ArrowRight } from 'lucide-react'
import { agenda } from '../../data.js'
import { useT } from '../../i18n.jsx'
import { formatRange, formatClock, formatTime } from '../../lib/time.js'
import { hrefFor } from '../../lib/router.js'
import { getIcon } from '../../lib/icons.js'
import { SectionHead, pad2 } from '../ui.jsx'

/** “Three acts, one stage”: one card per act (swipe on phones, grid on desktop). */
export default function ActsShowcase({ live }) {
  const { t, loc, act, lang } = useT()
  const acts = agenda.filter((i) => i.type === 'act')
  if (!acts.length) return null
  const first = acts[0]
  const last = acts[acts.length - 1]
  const intro = t('acts_intro', { start: formatClock(first.start), end: formatTime(last.end, lang) })
  return (
    <section id="highlights" className="section reveal" aria-labelledby="acts-title">
      <div className="wrap">
        <SectionHead
          id="acts-title"
          eyebrow={t('acts_eyebrow')}
          title={t('acts_title')}
          intro={intro}
          split
          aside={<span className="swipe-hint">{t('swipe')}</span>}
        />
      </div>
      <div className="acts-scroller scroller">
        {acts.map((item, i) => {
          const Icon = getIcon(item.icon)
          const now = live.phase === 'live' && live.currentId === item.id
          return (
            <a key={item.id} className={`act-card act-${item.tone} border-${item.tone}`} href={hrefFor.act(item.id)}>
              <span className={`numeral numeral--${item.tone}`} aria-hidden="true">
                {pad2(i + 1)}
              </span>
              <span className="act-card__top">
                <span className={`act-card__label c-${item.tone}`}>{act(item.act)}</span>
                <span className="glass act-card__time">
                  {now && <span className="pulse-dot" aria-hidden="true" />}
                  {formatRange(item, lang)}
                </span>
              </span>
              <span className="act-card__body">
                <span className={`icon-tile tone-${item.tone}`} style={{ width: 46, height: 46 }} aria-hidden="true">
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <span className="display act-card__title">{loc(item, 'title')}</span>
                <span className="act-card__summary">{loc(item, 'summary') || loc(item, 'subtitle')}</span>
                <span className={`act-card__cta c-${item.tone}`}>
                  {t('meet_performers')}
                  <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                </span>
              </span>
            </a>
          )
        })}
      </div>
    </section>
  )
}
