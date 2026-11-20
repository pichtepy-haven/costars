import React from 'react'
import { useT } from '../../i18n.jsx'
import { Avatar, Chip, QuoteMark, SectionHead, initialsOf, pad2 } from '../ui.jsx'

const QUOTE_COLOR = { gold: '#F5B544', crimson: '#FF5A5F', violet: '#A78BFA' }

/** “Sets 01 & 05”: the sets an artist plays in, from the line-up. */
const setsFor = (artist, act, t) => {
  const idx = (act.programme || [])
    .map((p, i) => (p.name.includes(artist.name) ? i + 1 : 0))
    .filter(Boolean)
  if (!idx.length) return ''
  return idx.length === 1 ? t('set_n', { n: pad2(idx[0]) }) : t('sets_n', { n: idx.map(pad2).join(' & ') })
}

/** Large card: photo or emblem, name, role, facts, quote. */
export function FeaturedArtist({ artist, act, id }) {
  const { t, loc } = useT()
  const tags = (loc(artist, 'sets') || '').split('|').map((s) => s.trim()).filter(Boolean)
  const nationality = loc(artist, 'nationality')
  const NameTag = loc(artist, 'title') ? 'h3' : 'h2'
  return (
    <section id={id} className="section wrap reveal" aria-labelledby={`${id}-title`}>
      {loc(artist, 'title') ? (
        <SectionHead eyebrow={t('meet_artist')} tone={act.tone} title={loc(artist, 'title')} id={`${id}-title`} />
      ) : (
        <p className={`eyebrow eyebrow--${act.tone}`}>{t('meet_artist')}</p>
      )}
      <article className={`featured-artist border-${act.tone} featured-artist--${act.tone} ${artist.photo ? 'has-photo' : ''}`}>
        {artist.photo ? (
          <figure className="featured-artist__photo">
            <img src={artist.photo} alt={artist.photoAlt || artist.name} loading="lazy" />
            {artist.photoCredit && <figcaption>{artist.photoCredit}</figcaption>}
          </figure>
        ) : (
          <div className="featured-artist__emblem" aria-hidden="true">
            <span className="emblem">
              <span className="display">{artist.initials || initialsOf(artist.name)}</span>
            </span>
          </div>
        )}
        <div className="featured-artist__body">
          <div className="featured-artist__head">
            <div>
              <NameTag className="display" id={loc(artist, 'title') ? undefined : `${id}-title`}>
                {loc(artist, 'name')}
              </NameTag>
              {loc(artist, 'role') && <span>{loc(artist, 'role')}</span>}
            </div>
            {artist.years && (
              <div className="years">
                <span className={`display c-${act.tone}`}>{artist.years}</span>
                <span>{loc(artist, 'yearsLabel') || t('years_playing')}</span>
              </div>
            )}
          </div>
          {(nationality || tags.length > 0) && (
            <div className="chip-row">
              {nationality && <Chip>{nationality}</Chip>}
              {tags.map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
            </div>
          )}
          {loc(artist, 'quote') && (
            <blockquote className={`quote quote--${act.tone}`}>
              <QuoteMark color={QUOTE_COLOR[act.tone]} />
              <p>{loc(artist, 'quote')}</p>
            </blockquote>
          )}
        </div>
      </article>
    </section>
  )
}

function ArtistCard({ artist, act }) {
  const { t, loc } = useT()
  const sets = loc(artist, 'sets') || setsFor(artist, act, t)
  return (
    <article className={`artist-card border-${act.tone}`}>
      <div className={`artist-portrait artist-portrait--${act.tone}`}>
        <Avatar name={artist.name} initials={artist.initials} photo={artist.photo} size={100} className={`avatar-ring--${act.tone} avatar-ring--glow`} />
        {loc(artist, 'role') && <span className={`artist-role c-${act.tone}-soft`}>{loc(artist, 'role')}</span>}
      </div>
      <div className="artist-card__body">
        <div className="artist-card__head">
          <h3 className="display">{loc(artist, 'name')}</h3>
          {artist.years && (
            <span className="years years--small">
              <span className={`display c-${act.tone}`}>{artist.years}</span>
              <span>{loc(artist, 'yearsLabel') || t('years_playing')}</span>
            </span>
          )}
        </div>
        {sets && <Chip className="chip--small">{sets}</Chip>}
        {loc(artist, 'quote') && (
          <blockquote className={`quote quote--small quote--${act.tone}`}>
            <QuoteMark color={QUOTE_COLOR[act.tone]} size={20} />
            <p>{loc(artist, 'quote')}</p>
          </blockquote>
        )}
      </div>
    </article>
  )
}

/** Swipe row (phones) / grid (desktop) of the other artists of the act. */
export function ArtistGrid({ artists, act, featured }) {
  const { t, loc, act: actLabel } = useT()
  if (!artists.length) return null
  return (
    <section className="section reveal" aria-labelledby="artists-title">
      <div className="wrap">
        <SectionHead
          id="artists-title"
          tone={act.tone}
          eyebrow={featured ? t('more_artists', { act: actLabel(act.act) }) : t('meet_artists')}
          title={loc(act, 'artistsTitle') || t('meet_artists')}
          aside={artists.length > 1 ? <span className="swipe-hint">{t('swipe')}</span> : null}
          split
        />
      </div>
      <div className="artist-scroller scroller">
        {artists.map((a) => (
          <ArtistCard key={a.name} artist={a} act={act} />
        ))}
      </div>
    </section>
  )
}
