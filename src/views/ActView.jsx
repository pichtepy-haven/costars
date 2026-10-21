import React, { useState } from 'react'
import { Clock, Music } from 'lucide-react'
import StageCover from '../components/StageCover.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import Placeholder from '../components/Placeholder.jsx'
import Button from '../components/Button.jsx'
import Lightbox, { PhotoGrid } from '../components/Lightbox.jsx'
import { SHOW_PLACEHOLDERS } from '../lib/config.js'
import { durationOf, formatDuration, formatRange } from '../lib/time.js'
import { hrefFor } from '../lib/router.js'

function PerformerCard({ performer, index, onOpenPhotos }) {
  const { name, role, piece, durationMin, bio, photos = [] } = performer
  return (
    <li className="performer">
      {photos[0] ? (
        <button type="button" className="performer__photo" onClick={() => onOpenPhotos(photos, 0)} aria-label={`View photos of ${name}`}>
          <img src={photos[0].thumb || photos[0].src} alt="" loading="lazy" decoding="async" />
        </button>
      ) : (
        <span className="performer__no" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      )}
      <div className="performer__body">
        <div className="performer__head">
          <h3 className="performer__name">{name}</h3>
          {durationMin ? <span className="performer__duration">{durationMin} min</span> : <Placeholder label="duration" />}
        </div>
        <p className="performer__role">{role}</p>
        {piece ? (
          <p className="performer__piece">
            <Music size={14} aria-hidden="true" />
            <span>{piece}</span>
          </p>
        ) : (
          piece === '' && <Placeholder label="piece / repertoire" />
        )}
        {bio ? <p className="performer__bio">{bio}</p> : <Placeholder label="biography" />}
        {photos.length > 1 && (
          <PhotoGrid className="performer__photos" photos={photos} label={`Photos of ${name}`} onOpen={(i) => onOpenPhotos(photos, i)} />
        )}
        {photos.length === 0 && <Placeholder label="photo(s)" />}
      </div>
    </li>
  )
}

/** Act detail page [UI2]: hero, timing, description, About the Performers, photos. */
export default function ActView({ act, acts, live }) {
  const [viewer, setViewer] = useState({ photos: [], index: null })
  const openPhotos = (photos, index) => setViewer({ photos, index })
  const position = acts.findIndex((a) => a.id === act.id)
  const prev = acts[position - 1]
  const next = acts[position + 1]
  const isNow = live.phase === 'live' && live.currentId === act.id

  return (
    <article className="act-view" aria-labelledby="view-title">
      <nav className="act-switch" aria-label="Acts">
        <ul>
          {acts.map((a) => (
            <li key={a.id}>
              <a className={`chip ${a.id === act.id ? 'chip--active' : ''}`} href={hrefFor.act(a.id)} aria-current={a.id === act.id ? 'page' : undefined}>
                {a.filterLabel || a.act}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <StageCover
        className="act-view__hero"
        size="wide"
        tone={act.tone}
        icon={act.icon}
        label={act.act}
        image={act.image}
        alt={act.imageAlt}
        eager
      />

      <header className="act-view__header">
        <p className="eyebrow">{act.act}</p>
        <h1 id="view-title" tabIndex={-1}>
          {act.title}
        </h1>
        <p className="act-view__meta">
          <Clock size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>{formatRange(act)}</span>
          <span aria-hidden="true">•</span>
          <span>{formatDuration(durationOf(act))}</span>
          {isNow && <span className="status-pill status-pill--now">Now</span>}
        </p>
      </header>

      <p className="act-view__description">{act.description}</p>

      <section className="act-view__performers" aria-labelledby="performers-title">
        <SectionHeading id="performers-title" title="About the Performers" as="h2" />
        {act.performersIntro && <p className="act-view__intro">{act.performersIntro}</p>}
        <ol className="performer-list">
          {act.programme.map((p, i) => (
            <PerformerCard key={p.id} performer={p} index={i} onOpenPhotos={openPhotos} />
          ))}
        </ol>
      </section>

      {act.gallery?.length > 0 ? (
        <section className="act-view__gallery" aria-label={`${act.title} photos`}>
          <PhotoGrid photos={act.gallery} label={`${act.title} photos`} onOpen={(i) => openPhotos(act.gallery, i)} />
        </section>
      ) : (
        SHOW_PLACEHOLDERS && (
          <div className="act-view__gallery">
            <ul className="photo-grid photo-grid--todo" aria-hidden="true">
              <li />
              <li />
              <li />
            </ul>
            <Placeholder label="act gallery photos (hidden on the live site until added)" block />
          </div>
        )
      )}

      <nav className="act-view__pager" aria-label="More acts">
        {prev ? (
          <Button variant="secondary" direction="back" href={hrefFor.act(prev.id)}>
            {prev.act}
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button variant="secondary" href={hrefFor.act(next.id)}>
            {next.act}
          </Button>
        ) : (
          <Button variant="secondary" href={hrefFor.charity()}>
            Charity impact
          </Button>
        )}
      </nav>

      <Lightbox photos={viewer.photos} index={viewer.index} onClose={() => setViewer({ photos: [], index: null })} onChange={(i) => setViewer((v) => ({ ...v, index: i }))} />
    </article>
  )
}
