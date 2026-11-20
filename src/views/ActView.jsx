import React from 'react'
import { agenda, artists, dances, gestures } from '../data.js'
import { useT } from '../i18n.jsx'
import { liveDetails } from '../lib/live.js'
import ActHero from '../components/act/ActHero.jsx'
import Dances from '../components/act/Dances.jsx'
import Gestures from '../components/act/Gestures.jsx'
import Lineup from '../components/act/Lineup.jsx'
import { ArtistGrid, FeaturedArtist } from '../components/act/Artists.jsx'
import ActNav from '../components/act/ActNav.jsx'

/** Photo credits of an act page (dance photos + gesture illustrations). */
function Credits({ items }) {
  const list = items.map((s) => (s || '').trim().replace(/\.+$/, '')).filter(Boolean)
  if (!list.length) return null
  return <p className="credits wrap">{list.join('. ')}.</p>
}

export default function ActView({ act, live }) {
  const { t, loc } = useT()
  const number = agenda.filter((i) => i.type === 'act').findIndex((a) => a.id === act.id) + 1
  const actDances = dances.filter((d) => d.actId === act.id)
  const actArtists = artists.filter((a) => a.actId === act.id)
  const featured = actArtists.find((a) => a.featured)
  const others = actArtists.filter((a) => a !== featured)
  const isNow = live.phase === 'live' && live.currentId === act.id
  const info = isNow ? liveDetails(agenda, live) : null
  const featuredId = featured ? 'meet-artist' : undefined

  const count = actDances.length || act.programme?.length || 0
  const countLabel = actDances.length
    ? t('n_dances', { n: actDances.length })
    : t('n_sets', { n: act.programme?.length || 0 })

  return (
    <>
      <ActHero act={act} number={number} count={count} countLabel={countLabel} isNow={isNow} />

      {loc(act, 'description') && (
        <section className="wrap act-intro reveal">
          <p>{loc(act, 'description')}</p>
        </section>
      )}

      {act.tone === 'crimson' && (
        <div className="piano wrap" aria-hidden="true">
          <div className="piano__keys">
            {Array.from({ length: 14 }, (_, i) => (
              <span key={i} className={`key-w ${[2, 5, 9, 12].includes(i) ? 'lit' : ''}`} style={{ animationDelay: `${-0.8 * [2, 5, 9, 12].indexOf(i)}s` }} />
            ))}
            {[1, 2, 4, 5, 6, 8, 9, 11, 12, 13].map((k) => (
              <span key={`b${k}`} className="key-b" style={{ left: `${(k / 14) * 100 - 2.1}%` }} />
            ))}
          </div>
        </div>
      )}

      {actDances.length > 0 ? (
        <>
          <Dances act={act} dances={actDances} />
          {act.id === 'act-1' && <Gestures />}
        </>
      ) : (
        <Lineup act={act} playingIndex={info?.setIndex ?? -1} featuredId={featuredId} />
      )}

      {featured && <FeaturedArtist artist={featured} act={act} id={featuredId} />}
      <ArtistGrid artists={others} act={act} featured={Boolean(featured)} />

      <ActNav act={act} />

      {actDances.length > 0 && (
        <Credits
          items={[
            ...actDances.map((d) => d.credit),
            act.id === 'act-1' ? gestures.credit : '',
          ]}
        />
      )}
    </>
  )
}
