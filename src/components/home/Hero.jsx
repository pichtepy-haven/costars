import React, { useEffect, useState } from 'react'
import { ArrowDown, ArrowRight, MapPin } from 'lucide-react'
import { agenda, event, welcome } from '../../data.js'
import { useT } from '../../i18n.jsx'
import { formatDay, formatTime, startDate } from '../../lib/time.js'
import { liveDetails } from '../../lib/live.js'
import { goToSection, hrefFor } from '../../lib/router.js'
import { StageLights } from '../ui.jsx'

const pad = (n) => String(n).padStart(2, '0')

/** Days / hours / minutes / seconds until `target`, ticking every second. */
const useCountdown = (target) => {
  const calc = () => Math.max(0, target.getTime() - Date.now())
  const [left, setLeft] = useState(calc)
  useEffect(() => {
    setLeft(calc())
    const id = window.setInterval(() => setLeft(calc()), 1000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.getTime()])
  const s = Math.floor(left / 1000)
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

function Venue() {
  const { t, loc, lang } = useT()
  const show = agenda.find((i) => i.id !== 'arrival') || agenda[0]
  return (
    <div className="venue">
      <MapPin size={18} strokeWidth={1.8} aria-hidden="true" />
      <span>
        <strong>{loc(event, 'venue')}</strong>
        <span>
          {loc(event, 'hall')}
          {show ? ` · ${t('show_starts')} ${formatTime(show.start, lang)}` : ''}
        </span>
      </span>
    </div>
  )
}

function Countdown() {
  const { t, lang } = useT()
  const doors = agenda[0]
  const cd = useCountdown(startDate(event, doors?.start || '16:30'))
  const units = [
    [cd.d, t('days')],
    [pad(cd.h), t('hours')],
    [pad(cd.m), t('mins')],
    [pad(cd.s), t('secs')],
  ]
  return (
    <div className="hero-card glass">
      <div className="hero-card__top">
        <span className="eyebrow eyebrow--gold">{t('doors_open_in')}</span>
        <span>
          {formatDay(event.date, lang)}
          {doors ? ` · ${formatTime(doors.start, lang)}` : ''}
        </span>
      </div>
      <div className="countdown" role="timer" aria-live="off" aria-label={`${t('doors_open_in')} ${cd.d} ${t('days')} ${cd.h} ${t('hours')} ${cd.m} ${t('mins')}`}>
        {units.map(([value, label], i) => (
          <div key={label} className={`countdown__unit ${i === 3 ? 'is-sec' : ''}`} aria-hidden="true">
            <span className="display">{value}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <Venue />
    </div>
  )
}

/** Compact “Now on stage” card for the hero during the show. */
function NowOnStage({ live }) {
  const { t, loc, act } = useT()
  const info = liveDetails(agenda, live)
  const { current, next } = info
  if (!current) return <Countdown />
  return (
    <a className="hero-card hero-card--live now-card" href={hrefFor.live()}>
      <div className="hero-card__top">
        <span className="live-badge">
          <span className="pulse-dot" aria-hidden="true" />
          {t('live')}
        </span>
        <span>{t('min_left', { n: info.left })}</span>
      </div>
      <div className="now-mini">
        <span className="eyebrow eyebrow--crimson">
          {current.type === 'act' ? `${act(current.act)} · ` : ''}
          {t('now_on_stage')}
        </span>
        <span className="display now-mini__title">{loc(current, 'title')}</span>
        {info.set && (
          <span className="now-mini__set">
            {t('playing')}: <strong>{loc(info.set, 'name')}</strong>
          </span>
        )}
        <span className="progress" aria-hidden="true">
          <span className="progress__fill" style={{ width: `${Math.round(info.progress * 100)}%` }} />
        </span>
        {next && (
          <span className="now-mini__next">
            {t('up_next')}: {loc(next, 'title')}
          </span>
        )}
      </div>
      <span className="now-mini__cta">
        {t('see_who')}
        <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
      </span>
    </a>
  )
}

function ThankYou() {
  const { t } = useT()
  return (
    <div className="hero-card glass">
      <span className="eyebrow eyebrow--gold">{t('thank_you_title')}</span>
      <p className="hero-card__text">{t('thank_you_text')}</p>
      <Venue />
    </div>
  )
}

/** Split “Welcome to CoStars” into the small line and the big last word. */
const splitTitle = (title) => {
  const m = /^(.*\s)?(\S+)$/.exec(title.trim())
  return m ? [m[1]?.trim() || '', m[2]] : ['', title]
}

export default function Hero({ live }) {
  const { t, loc } = useT()
  const [small, big] = splitTitle(loc(welcome, 'title') || `${t('welcome_to')} ${event.brand}`)
  const showLive = live.phase === 'live' && live.currentId
  const ended = live.phase === 'ended' || live.phase === 'after-day'
  return (
    <section className="hero hero-bg" aria-labelledby="view-title">
      <StageLights beams={4} />
      <div className="hero__inner wrap">
        <h1 className="display hero__title" id="view-title" tabIndex={-1}>
          {small && <span className="hero__welcome">{small}</span>}
          <span className="hero__brand">{big}</span>
          <span className="hero__edition">
            <span className="gold-line" aria-hidden="true" />
            {loc(event, 'edition')}
            <span className="gold-line gold-line--r" aria-hidden="true" />
          </span>
        </h1>
        <div className="hero__grid">
          <div className="hero__copy">
            <p className="hero__message">{loc(welcome, 'message')}</p>
            <div className="hero__ctas">
              <a
                className="btn btn--cream"
                href="#/"
                onClick={(e) => {
                  e.preventDefault()
                  goToSection('schedule')
                }}
              >
                {t('see_running_order')}
                <ArrowDown size={16} strokeWidth={2} aria-hidden="true" />
              </a>
            </div>
          </div>
          {showLive ? <NowOnStage live={live} /> : ended ? <ThankYou /> : <Countdown />}
        </div>
      </div>
      <div className="floor-glow" aria-hidden="true" />
      <img className="hero__musicians" src="/images/brand/musicians.svg" alt="" aria-hidden="true" />
    </section>
  )
}
