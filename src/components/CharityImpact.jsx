import React from 'react'
import Button from './Button.jsx'
import { charity } from '../data.js'
import { getIcon } from '../lib/icons.js'
import { hrefFor } from '../lib/router.js'

/** The three “where the money goes” steps [P3], laid out like the UI2 pillars. */
export function ImpactSteps({ className = '' }) {
  return (
    <ol className={`impact-steps ${className}`}>
      {charity.steps.map((step) => {
        const Icon = getIcon(step.icon)
        return (
          <li key={step.title}>
            <Icon size={28} strokeWidth={1.6} aria-hidden="true" />
            <strong>{step.title}</strong>
            <span>{step.text}</span>
          </li>
        )
      })}
    </ol>
  )
}

/** Charity Impact band + “Education Changes Lives” card [UI2]. */
export default function CharityImpact() {
  const { feature } = charity
  return (
    <section id="charity" className="charity reveal" aria-labelledby="charity-title">
      <div className="charity-hero">
        <img
          className="charity-hero__img"
          src={charity.heroImage.src}
          alt=""
          loading="lazy"
          decoding="async"
          width="640"
          height="482"
        />
        <div className="charity-hero__shade" aria-hidden="true" />
        <div className="charity-hero__copy">
          <h2 id="charity-title">{charity.title}</h2>
          <p>{charity.tagline}</p>
        </div>
      </div>

      <ImpactSteps />

      <article className="feature-card">
        <img
          className="feature-card__img"
          src={feature.image.src}
          srcSet="/images/charity/school-students-320.webp 320w, /images/charity/school-students-640.webp 640w"
          sizes="(min-width: 720px) 300px, 42vw"
          alt={feature.image.alt}
          loading="lazy"
          decoding="async"
          width="640"
          height="480"
        />
        <div className="feature-card__copy">
          <h3>{feature.title}</h3>
          <p>{feature.text}</p>
          <Button variant="action" href={hrefFor.charity()}>
            {feature.cta}
          </Button>
        </div>
      </article>
    </section>
  )
}
