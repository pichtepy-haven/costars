import React, { useState } from 'react'
import { MapPin, Droplets, CircleCheck } from 'lucide-react'
import SectionHeading from '../components/SectionHeading.jsx'
import Lightbox, { PhotoGrid } from '../components/Lightbox.jsx'
import { ImpactSteps } from '../components/CharityImpact.jsx'
import Button from '../components/Button.jsx'
import { charity } from '../data.js'
import { goToSection } from '../lib/router.js'

/** Charity Impact detail [UI2] with the beneficiary information [P1][P5][P6]. */
export default function CharityView() {
  const [index, setIndex] = useState(null)
  const { beneficiary, about } = charity

  return (
    <article className="charity-view" aria-labelledby="view-title">
      <div className="charity-hero charity-hero--tall">
        <img
          className="charity-hero__img"
          src={charity.heroImage.src}
          srcSet="/images/charity/school-gate-320.webp 320w, /images/charity/school-gate-640.webp 640w"
          sizes="(min-width: 720px) 760px, 100vw"
          alt={charity.heroImage.alt}
          decoding="async"
          width="640"
          height="482"
        />
        <div className="charity-hero__shade" aria-hidden="true" />
        <div className="charity-hero__copy">
          <p className="eyebrow eyebrow--light">Our beneficiary</p>
          <h1 id="view-title" tabIndex={-1}>
            {beneficiary.name}
          </h1>
          <p className="charity-hero__location">
            <MapPin size={15} aria-hidden="true" />
            <span>{beneficiary.location}</span>
          </p>
        </div>
      </div>

      <div className="page-section">
        <p className="pledge">{charity.feature.text}</p>

        <dl className="facts">
          {beneficiary.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>
                <span className="facts__value">{f.value}</span>
                <span className="facts__detail">{f.detail}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="water-note">
          <Droplets size={16} aria-hidden="true" />
          <span>
            <strong>Water:</strong> {beneficiary.water}
          </span>
        </p>
      </div>

      <section className="page-section" aria-labelledby="steps-title">
        <SectionHeading id="steps-title" title="Where your ticket goes" />
        <ImpactSteps className="impact-steps--boxed" />
      </section>

      <section className="page-section" aria-labelledby="needs-title">
        <SectionHeading id="needs-title" title={beneficiary.needsTitle} />
        <ul className="needs">
          {beneficiary.needs.map((need) => (
            <li key={need}>
              <CircleCheck size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{need}</span>
            </li>
          ))}
        </ul>
        <p className="source-note">{beneficiary.sourceNote}</p>
      </section>

      <section className="page-section" aria-labelledby="photos-title">
        <SectionHeading id="photos-title" title="Life at the school" />
        <PhotoGrid className="photo-grid--school" photos={beneficiary.photos} label={`Photos of ${beneficiary.name}`} onOpen={setIndex} />
      </section>

      <section className="page-section" aria-labelledby="about-title">
        <SectionHeading id="about-title" title={about.title} />
        <p className="about-text">{about.text}</p>
        <div className="vm-cards">
          <div className="vm-card">
            <h3>Vision</h3>
            <p>{about.vision}</p>
          </div>
          <div className="vm-card">
            <h3>Mission</h3>
            <p>{about.mission}</p>
          </div>
        </div>
      </section>

      <div className="page-section view-actions">
        <Button variant="primary" onClick={() => goToSection('schedule')}>
          Back to the schedule
        </Button>
      </div>

      <Lightbox photos={beneficiary.photos} index={index} onClose={() => setIndex(null)} onChange={setIndex} />
    </article>
  )
}
