import React from 'react'
import { ArrowRight, BellOff, CircleHelp, Clock, HandHeart, ListOrdered, Radio, UsersRound } from 'lucide-react'
import { agenda, event } from '../data.js'
import { useT } from '../i18n.jsx'
import { liveDetails } from '../lib/live.js'
import { durationOf, formatClock, formatDay, formatDuration, formatTime, toMinutes } from '../lib/time.js'
import { goToSection, hrefFor } from '../lib/router.js'
import { Avatar, StageLights, pad2 } from '../components/ui.jsx'

const clockOf = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

function Equalizer() {
  return (
    <span className="eq" aria-hidden="true">
      {Array.from({ length: 7 }, (_, i) => (
        <span key={i} />
      ))}
    </span>
  )
}

function NowCard({ info }) {
  const { t, loc, act, lang } = useT()
  const { current } = info
  const isAct = current.type === 'act'
  return (
    <article className={`now-card now-card--big ${isAct ? `now-card--${current.tone}` : ''}`}>
      <span className="eyebrow eyebrow--crimson">
        {isAct ? `${act(current.act)} · ` : ''}
        {t('now_on_stage')}
      </span>
      <h1 className="display now-card__title" id="view-title" tabIndex={-1}>
        {loc(current, 'title')}
      </h1>
      {loc(current, 'subtitle') && <p className="now-card__sub">{loc(current, 'subtitle')}</p>}

      {info.set && (
        <div className="now-set">
          <Avatar name={info.set.name} size={52} />
          <span className="now-set__text">
            <span className="now-set__label">
              {t('set_of', { n: pad2(info.setIndex + 1), total: info.setsTotal })} · {t('playing')}
            </span>
            <strong>{loc(info.set, 'name')}</strong>
            {(loc(info.set, 'piece') || loc(info.set, 'role')) && <span>{loc(info.set, 'piece') || loc(info.set, 'role')}</span>}
          </span>
          <Equalizer />
        </div>
      )}

      <div className="now-progress">
        <span className="progress" aria-hidden="true">
          <span className="progress__fill" style={{ width: `${Math.round(info.progress * 100)}%` }} />
        </span>
        <span className="now-progress__labels">
          <span>
            {formatTime(current.start, lang)} · {t('min_in', { n: info.elapsed })}
          </span>
          <span>
            {t('min_left', { n: info.left })} · {formatTime(current.end, lang)}
          </span>
        </span>
      </div>

      {isAct && (
        <a className="btn btn--cream" href={hrefFor.act(current.id)}>
          {t('see_who')}
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </a>
      )}
    </article>
  )
}

function UpNext({ fromMinutes }) {
  const { t, loc, act, lang } = useT()
  const later = agenda.filter((i) => toMinutes(i.start) > fromMinutes).slice(0, 3)
  if (!later.length) return null
  return (
    <aside className="up-next" aria-labelledby="up-next-title">
      <h2 className="eyebrow eyebrow--gold" id="up-next-title">
        {t('up_next')}
      </h2>
      <ol>
        {later.map((item) => (
          <li key={item.id} className={item.type === 'act' ? `up-next__act border-${item.tone}` : ''}>
            <span className={`display up-next__time ${item.type === 'act' ? `c-${item.tone}` : ''}`}>{formatClock(item.start)}</span>
            <span className="up-next__text">
              {item.type === 'act' && <span className={`up-next__label c-${item.tone}`}>{act(item.act)}</span>}
              <strong>{loc(item, 'title')}</strong>
              <span>
                {formatDuration(durationOf(item), lang)}
                {loc(item, 'subtitle') && item.type !== 'act' ? ` · ${loc(item, 'subtitle')}` : ''}
              </span>
            </span>
            {item.type === 'act' && (
              <a className="up-next__link" href={hrefFor.act(item.id)} aria-label={loc(item, 'title')}>
                <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
              </a>
            )}
          </li>
        ))}
      </ol>
    </aside>
  )
}

/** Acts with their status tonight: done, on now, later. */
function ActStatus({ live }) {
  const { t, loc, act } = useT()
  const acts = agenda.filter((i) => i.type === 'act')
  return (
    <section className="wrap act-status" aria-label={t('acts_title')}>
      {acts.map((item) => {
        const status =
          live.currentId === item.id ? 'now' : live.minutes >= toMinutes(item.end) ? 'done' : 'later'
        return (
          <a key={item.id} className={`qcard qcard--${item.tone} ${status === 'now' ? 'is-now' : ''}`} href={hrefFor.act(item.id)}>
            <span className={`q-eb c-${item.tone}`}>
              {act(item.act)} · {t(`status_${status}`)}
            </span>
            <span className="display q-t">{loc(item, 'title')}</span>
            <span className="q-s">{loc(item, 'summary') || loc(item, 'subtitle')}</span>
          </a>
        )
      })}
    </section>
  )
}

function TabBar() {
  const { t } = useT()
  const tabs = [
    { key: 'now', label: t('tab_now'), icon: Radio, href: hrefFor.live(), current: true },
    { key: 'schedule', label: t('nav_schedule'), icon: ListOrdered, section: 'schedule' },
    { key: 'artists', label: t('tab_artists'), icon: UsersRound, section: 'highlights' },
    { key: 'charity', label: t('nav_charity'), icon: HandHeart, href: hrefFor.charity() },
    { key: 'help', label: t('tab_help'), icon: CircleHelp, section: 'help' },
  ]
  return (
    <nav className="tab-bar glass" aria-label={t('menu')}>
      {tabs.map(({ key, label, icon: Icon, href, section, current }) => (
        <a
          key={key}
          href={href || '#/'}
          aria-current={current ? 'page' : undefined}
          onClick={
            section
              ? (e) => {
                  e.preventDefault()
                  goToSection(section)
                }
              : undefined
          }
        >
          <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  )
}

/** Tonight, live: what is on stage, what comes next. */
export default function LiveView({ live }) {
  const { t, lang } = useT()
  const info = liveDetails(agenda, live)
  const onStage = live.phase === 'live' && info.current
  const first = agenda[0]
  const nowLabel = typeof live.minutes === 'number' ? formatTime(clockOf(live.minutes), lang) : ''

  return (
    <div className="live-page live-bg">
      <StageLights beams={2} sparkles={false} />
      <div className="wrap live-top">
        <span className={`live-badge ${onStage ? '' : 'is-off'}`}>
          {onStage && <span className="pulse-dot" aria-hidden="true" />}
          {t('live')}
        </span>
        <span className="live-top__time">
          <Clock size={14} strokeWidth={2} aria-hidden="true" />
          {formatDay(event.date, lang)}
          {live.phase !== 'before-day' && live.phase !== 'after-day' && nowLabel ? ` · ${nowLabel}` : ''}
        </span>
      </div>

      {onStage ? (
        <>
          <div className="wrap live-grid">
            <div className="live-main">
              <NowCard info={info} />
              <div className="note">
                <BellOff size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>{t('silence_phones')}</span>
              </div>
            </div>
            <UpNext fromMinutes={live.minutes} />
          </div>
          <ActStatus live={live} />
        </>
      ) : (
        <div className="wrap live-idle">
          <h1 className="display" id="view-title" tabIndex={-1}>
            {live.phase === 'ended' || live.phase === 'after-day' ? t('thank_you_title') : t('live_soon_title')}
          </h1>
          <p>
            {live.phase === 'ended' || live.phase === 'after-day'
              ? t('thank_you_text')
              : t('live_soon_text', { time: first ? formatTime(first.start, lang) : '', day: formatDay(event.date, lang) })}
          </p>
          <a
            className="btn btn--cream"
            href="#/"
            onClick={(e) => {
              e.preventDefault()
              goToSection('schedule')
            }}
          >
            {t('see_running_order')}
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      )}
      <TabBar />
    </div>
  )
}
