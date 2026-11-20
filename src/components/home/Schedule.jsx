import React from 'react'
import { BellOff, ChevronDown, ChevronRight, Coffee } from 'lucide-react'
import { agenda } from '../../data.js'
import { useT } from '../../i18n.jsx'
import { durationOf, formatClock, formatDuration, formatPeriod, formatRange, formatTime } from '../../lib/time.js'
import { hrefFor } from '../../lib/router.js'
import { useIsDesktop } from '../../lib/useMedia.js'
import { Note, SectionHead } from '../ui.jsx'

const NowBadge = () => {
  const { t } = useT()
  return (
    <span className="now-badge">
      <span className="pulse-dot" aria-hidden="true" />
      {t('now_badge')}
    </span>
  )
}

/** Second line of a card: “30 min · Doors open”. */
const metaLine = (item, loc, lang) => [formatDuration(durationOf(item), lang), loc(item, 'subtitle')].filter(Boolean).join(' · ')

function MobileRow({ item, isNow, open, onToggle }) {
  const { loc, act, lang } = useT()
  const tone = item.type === 'act' ? item.tone : ''
  const time = (
    <div className={`sched-time ${tone ? `c-${tone}` : ''} ${item.type === 'break' ? 'is-muted' : ''}`}>
      <span className="display">{formatClock(item.start)}</span>
      <span>{formatPeriod(item.start, lang)}</span>
    </div>
  )

  if (item.type === 'act') {
    return (
      <li className={`sched-row sched-row--act ${isNow ? 'is-now' : ''}`}>
        {time}
        <div className="sched-dot-col" aria-hidden="true">
          <span className={`sched-dot sched-dot--act bg-${item.tone}`} />
        </div>
        <a className={`sched-act row-act-${item.tone}`} href={hrefFor.act(item.id)}>
          <span className="sched-act__text">
            <span className={`sched-act__eyebrow c-${item.tone}`}>
              {act(item.act)} · {formatDuration(durationOf(item), lang)}
            </span>
            <span className="sched-act__title">{loc(item, 'title')}</span>
            {loc(item, 'subtitle') && <span className="sched-sub">{loc(item, 'subtitle')}</span>}
            {isNow && <NowBadge />}
          </span>
          <ChevronRight size={20} strokeWidth={1.8} aria-hidden="true" className={`c-${item.tone}`} />
        </a>
      </li>
    )
  }

  if (item.type === 'break') {
    return (
      <li className={`sched-row sched-row--break ${isNow ? 'is-now' : ''}`}>
        {time}
        <div className="sched-dot-col" aria-hidden="true">
          <span className="sched-dot sched-dot--break" />
        </div>
        <div className="sched-break">
          <Coffee size={16} strokeWidth={1.8} aria-hidden="true" />
          <span className="sched-break__title">{loc(item, 'title')}</span>
          {isNow ? <NowBadge /> : <span>{formatDuration(durationOf(item), lang)}</span>}
        </div>
      </li>
    )
  }

  const panelId = `sched-${item.id}`
  const hasDetails = Boolean(loc(item, 'description') || loc(item, 'note'))
  return (
    <li className={`sched-row ${isNow ? 'is-now' : ''}`}>
      {time}
      <div className="sched-dot-col" aria-hidden="true">
        <span className={`sched-dot ${open || isNow ? 'is-open' : ''}`} />
      </div>
      <div className={`sched-card ${open ? 'is-open' : ''}`}>
        <button
          type="button"
          className="sched-card__head"
          aria-expanded={hasDetails ? open : undefined}
          aria-controls={hasDetails ? panelId : undefined}
          onClick={hasDetails ? onToggle : undefined}
          disabled={!hasDetails}
        >
          <span className="sched-card__text">
            <span className="sched-card__title">{loc(item, 'title')}</span>
            <span className="sched-sub">{metaLine(item, loc, lang)}</span>
            {isNow && <NowBadge />}
          </span>
          {hasDetails && <ChevronDown size={18} strokeWidth={1.8} aria-hidden="true" className={`chev ${open ? 'open' : ''}`} />}
        </button>
        {open && hasDetails && (
          <div className="sched-card__body" id={panelId}>
            {loc(item, 'description') && <p>{loc(item, 'description')}</p>}
            {item.host?.name && (
              <p className="sched-host">
                {item.host.name}
                {item.host.role ? ` · ${item.host.role}` : ''}
              </p>
            )}
            {loc(item, 'note') && <Note icon={item.noteIcon || 'info'}>{loc(item, 'note')}</Note>}
          </div>
        )}
      </div>
    </li>
  )
}

const SEG_CLASS = { ceremony: 'seg--ceremony', break: 'seg--break' }

/** Desktop: a bar of the whole evening, sized by duration. */
function TimelineBar({ live }) {
  const { loc, act, lang } = useT()
  const first = agenda[0]
  const last = agenda[agenda.length - 1]
  if (!first || !last) return null
  const label = agenda.map((i) => `${formatTime(i.start, lang)} ${loc(i, 'title')}`).join(', ')
  return (
    <div className="sched-bar" role="img" aria-label={label}>
      <div className="sched-bar__track">
        {agenda.map((item) => {
          const now = live.phase === 'live' && live.currentId === item.id
          const pct = now ? Math.min(100, Math.max(0, ((live.minutes - toMin(item.start)) / durationOf(item)) * 100)) : 0
          return (
            <span
              key={item.id}
              className={`seg ${item.type === 'act' ? `bg-${item.tone}` : SEG_CLASS[item.type] || ''} ${now ? 'is-now' : ''}`}
              style={{ flex: durationOf(item) }}
            >
              {now && <span className="seg__fill" style={{ width: `${pct}%` }} />}
            </span>
          )
        })}
      </div>
      <div className="sched-bar__labels" aria-hidden="true">
        {agenda.map((item) => (
          <span key={item.id} style={{ flex: durationOf(item) }} className={item.type === 'act' ? `c-${item.tone}` : ''}>
            <strong>{formatClock(item.start)}</strong>
            <span>{item.type === 'act' ? act(item.act) : ''}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

const toMin = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3))

function DesktopCard({ item, isNow }) {
  const { loc, act, lang } = useT()
  const head = (
    <>
      <span className={`display sched-tile__time ${item.type === 'act' ? `c-${item.tone}` : item.type === 'break' ? 'is-muted' : ''}`}>
        {formatRange(item, lang)}
      </span>
      <span className="sched-tile__title">
        {item.type === 'act' ? `${act(item.act)} · ` : ''}
        {loc(item, 'title')}
      </span>
      <span className="sched-sub">{metaLine(item, loc, lang)}</span>
      {isNow && <NowBadge />}
    </>
  )
  if (item.type === 'act') {
    return (
      <li className="sched-tile-li">
        <a className={`sched-tile sched-tile--act border-${item.tone} ${isNow ? 'is-now' : ''}`} href={hrefFor.act(item.id)}>
          {head}
          <span className={`sched-tile__more c-${item.tone}`}>
            <ChevronRight size={18} strokeWidth={1.8} aria-hidden="true" />
          </span>
        </a>
      </li>
    )
  }
  return (
    <li className={`sched-tile ${item.type === 'break' ? 'sched-tile--break' : ''} ${isNow ? 'is-now' : ''}`}>
      {head}
      {item.type !== 'break' && loc(item, 'description') && <span className="sched-tile__desc">{loc(item, 'description')}</span>}
      {item.host?.name && <span className="sched-tile__desc">{item.host.name}{item.host.role ? ` · ${item.host.role}` : ''}</span>}
      {item.type !== 'break' && loc(item, 'note') && <span className="sched-tile__note">{loc(item, 'note')}</span>}
    </li>
  )
}

export default function Schedule({ live, openId, setOpenId }) {
  const { t } = useT()
  const desktop = useIsDesktop()
  const isNow = (item) => live.phase === 'live' && live.currentId === item.id
  return (
    <section id="schedule" className="section wrap reveal" aria-labelledby="schedule-title">
      <SectionHead id="schedule-title" eyebrow={t('schedule_eyebrow')} title={t('schedule_title')} intro={desktop ? '' : t('schedule_hint')} />
      {desktop ? (
        <>
          <TimelineBar live={live} />
          <ol className="sched-grid">
            {agenda.map((item) => (
              <DesktopCard key={item.id} item={item} isNow={isNow(item)} />
            ))}
          </ol>
          <div className="note note--wide">
            <BellOff size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{t('silence_phones')}</span>
          </div>
        </>
      ) : (
        <div className="sched-wrap">
          <div className="sched__rail rail" aria-hidden="true" />
          <ol className="sched">
          {agenda.map((item) => (
            <MobileRow
              key={item.id}
              item={item}
              isNow={isNow(item)}
              open={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? '' : item.id)}
            />
          ))}
          </ol>
        </div>
      )}
    </section>
  )
}
