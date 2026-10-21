import React from 'react'
import StageCover from './StageCover.jsx'
import { event, welcome } from '../data.js'

/** Welcome banner [UI1][UI2]. */
export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <StageCover
        className="hero__media"
        size="hero"
        tone="crimson"
        image={welcome.image}
        alt={welcome.imageAlt}
        silhouette
        eager
      />
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__copy">
        <p className="hero__eyebrow">
          {event.edition} <span aria-hidden="true">·</span> <time dateTime={event.date}>{event.dateLabel}</time>
        </p>
        <h1 id="hero-title">{welcome.title}</h1>
        <p className="hero__message">{welcome.message}</p>
      </div>
    </section>
  )
}
