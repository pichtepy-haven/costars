import React from 'react'
import { Music } from 'lucide-react'
import { useT } from '../../i18n.jsx'
import { formatDuration } from '../../lib/time.js'
import { Avatar, SectionHead, pad2 } from '../ui.jsx'

const SET_COLORS = ['#FF5A5F', '#FF8A8E', '#FF5A5F', '#FF8A8E', '#F5B544', '#FFB3B5']

/** “Song Hui Chan & Oum Pisey” → ['Song Hui Chan', 'Oum Pisey'] */
const peopleOf = (name) => name.split(/\s+&\s+|\s+and\s+/i).map((s) => s.trim()).filter(Boolean).slice(0, 3)

function PlayingTag() {
  const { t } = useT()
  return (
    <span className="now-badge">
      <span className="pulse-dot" aria-hidden="true" />
      {t('playing')}
    </span>
  )
}

/** Act II style: compact rows with avatars and a bar of set lengths. */
function SetRows({ act: item, playingIndex }) {
  const { t, loc, lang } = useT()
  const sets = item.programme
  const timed = sets.filter((p) => p.durationMin)
  const total = timed.reduce((sum, p) => sum + p.durationMin, 0)
  return (
    <>
      {timed.length === sets.length && sets.length > 2 && (
        <div className="set-lengths">
          <div className="set-lengths__head">
            <span>{t('set_lengths')}</span>
            <span>{t('min_music', { n: total })}</span>
          </div>
          <div className="set-lengths__bar" role="img" aria-label={`${t('set_lengths')}: ${sets.map((p) => formatDuration(p.durationMin, lang)).join(', ')}`}>
            {sets.map((p, i) => (
              <span key={p.id} style={{ flex: p.durationMin, background: SET_COLORS[i % SET_COLORS.length] }} />
            ))}
          </div>
        </div>
      )}
      <ol className="set-rows">
        {sets.map((p, i) => (
          <li key={p.id} className={playingIndex === i ? 'is-playing' : ''}>
            <span className="display set-num">{pad2(i + 1)}</span>
            <span className="avatar-stack">
              {p.photos?.[0]?.src ? (
                <Avatar name={p.name} photo={p.photos[0].src} size={48} />
              ) : (
                peopleOf(p.name).map((person) => <Avatar key={person} name={person} size={peopleOf(p.name).length > 1 ? 40 : 48} />)
              )}
            </span>
            <span className="set-rows__text">
              <strong>{loc(p, 'name')}</strong>
              {loc(p, 'role') && <span>{loc(p, 'role')}</span>}
              {loc(p, 'piece') && (
                <span className="set-piece">
                  <Music size={13} strokeWidth={2} aria-hidden="true" />
                  {loc(p, 'piece')}
                </span>
              )}
              {p.bio && <span className="set-bio">{p.bio}</span>}
              {playingIndex === i && <PlayingTag />}
            </span>
            {p.durationMin && <span className={`set-dur c-${item.tone}`}>{formatDuration(p.durationMin, lang)}</span>}
          </li>
        ))}
      </ol>
    </>
  )
}

/** Act III style: one card per set, with the tribute, band and setlist. */
function TributeCards({ act: item, playingIndex, featuredId }) {
  const { t, loc, lang } = useT()
  return (
    <ol className="tribute-cards">
      {item.programme.map((p, i) => (
        <li key={p.id} className={`tribute-card border-${item.tone} ${playingIndex === i ? 'is-playing' : ''}`}>
          <div className="tribute-card__head">
            <span className="display set-num">{pad2(i + 1)}</span>
            <span className="tribute-card__name">
              <strong>{loc(p, 'name')}</strong>
              {loc(p, 'role') && <span>{loc(p, 'role')}</span>}
            </span>
            {p.durationMin && <span className={`set-dur c-${item.tone}`}>{formatDuration(p.durationMin, lang)}</span>}
          </div>
          {(loc(p, 'piece') || loc(p, 'with') || playingIndex === i) && (
            <div className="tribute-card__chips">
              {playingIndex === i && <PlayingTag />}
              {loc(p, 'piece') && <span className={`tribute-chip tribute-chip--${item.tone}`}>{loc(p, 'piece')}</span>}
              {loc(p, 'with') &&
                (featuredId ? (
                  <a className="chip" href={`#${featuredId}`} onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(featuredId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}>
                    {loc(p, 'with')}
                  </a>
                ) : (
                  <span className="chip">{loc(p, 'with')}</span>
                ))}
            </div>
          )}
          {p.bio && <p className="tribute-card__bio">{p.bio}</p>}
          {p.setlist?.length > 0 && (
            <div className="setlist">
              <span className={`setlist__title c-${item.tone}`}>{t('setlist')}</span>
              <ol style={{ '--setlist-rows': Math.ceil(p.setlist.length / 2) }}>
                {p.setlist.map((song, n) => (
                  <li key={`${song}-${n}`}>
                    <span className="display">{pad2(n + 1)}</span>
                    {song}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </li>
      ))}
    </ol>
  )
}

/** The sets of an act, in running order. */
export default function Lineup({ act: item, playingIndex = -1, featuredId }) {
  const { t, loc } = useT()
  if (!item.programme?.length) return null
  const style = item.lineupStyle || (item.programme.some((p) => p.setlist?.length || p.with) ? 'tribute' : 'sets')
  return (
    <section className="section wrap reveal" aria-labelledby="lineup-title">
      <SectionHead
        id="lineup-title"
        tone={item.tone}
        eyebrow={t('lineup_eyebrow')}
        title={loc(item, 'lineupTitle') || t('lineup_eyebrow')}
        intro={loc(item, 'performersIntro')}
        split
      />
      {style === 'tribute' ? (
        <TributeCards act={item} playingIndex={playingIndex} featuredId={featuredId} />
      ) : (
        <SetRows act={item} playingIndex={playingIndex} />
      )}
    </section>
  )
}
