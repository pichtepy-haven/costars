import React from 'react'
import { UsersRound, Handshake, Phone, Star, Send } from 'lucide-react'
import SupportAccordion from './SupportAccordion.jsx'
import SectionHeading from './SectionHeading.jsx'
import Placeholder from './Placeholder.jsx'
import { SHOW_PLACEHOLDERS } from '../lib/config.js'
import { etiquette, sponsors, help, charity } from '../data.js'

/** Event Etiquette · Our Sponsors · Need Help? · About CoStars [UI1]. */
export default function MoreInfo({ openId, setOpenId }) {
  const toggle = (id) => setOpenId((current) => (current === id ? '' : id))
  const hasSponsors = sponsors.list.length > 0
  const hasContact = Boolean(help.phone || help.telegram)

  return (
    <section className="page-section reveal" aria-labelledby="more-title">
      <SectionHeading id="more-title" title="More for your evening" subtitle="Everything you need for a thoughtful, memorable experience." />
      <div className="support-list">
        <SupportAccordion id="etiquette" icon={UsersRound} title={etiquette.title} subtitle={etiquette.subtitle} expanded={openId === 'etiquette'} onToggle={toggle}>
          <ul className="bullets">
            {etiquette.items.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </SupportAccordion>

        {(hasSponsors || SHOW_PLACEHOLDERS) && (
          <div id="sponsors" className="support-item support-item--static">
            <div className="support-item__trigger" role="presentation">
              <span className="icon-disc" aria-hidden="true">
                <Handshake size={18} strokeWidth={1.8} />
              </span>
              <div className="support-item__copy">
                <h3 className="support-item__title">{sponsors.title}</h3>
                <p className="support-item__subtitle">{sponsors.subtitle}</p>
              </div>
            </div>
            <ul className="sponsor-logos">
              {hasSponsors
                ? sponsors.list.map((s) => (
                    <li key={s.name}>
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`${s.name} (opens in a new tab)`}>
                          {s.logo ? <img src={s.logo} alt={s.name} loading="lazy" /> : <span>{s.name}</span>}
                        </a>
                      ) : s.logo ? (
                        <img src={s.logo} alt={s.name} loading="lazy" />
                      ) : (
                        <span>{s.name}</span>
                      )}
                    </li>
                  ))
                : [1, 2, 3, 4].map((n) => (
                    <li key={n} className="sponsor-logos__todo">
                      Logo here
                    </li>
                  ))}
            </ul>
            {!hasSponsors && <Placeholder label="sponsor names & logos (section hidden on the live site until added)" block />}
          </div>
        )}

        <SupportAccordion id="help" icon={Phone} title={help.title} subtitle={help.subtitle} expanded={openId === 'help'} onToggle={toggle}>
          <p>{help.text}</p>
          {hasContact ? (
            <div className="contact-links">
              {help.phone && (
                <a className="btn btn--secondary btn--small" href={`tel:${help.phone.replace(/[^+\d]/g, '')}`}>
                  <Phone size={16} aria-hidden="true" />
                  <span>Call {help.phone}</span>
                </a>
              )}
              {help.telegram && (
                <a className="btn btn--secondary btn--small" href={help.telegram} target="_blank" rel="noopener noreferrer">
                  <Send size={16} aria-hidden="true" />
                  <span>Message us on Telegram</span>
                </a>
              )}
            </div>
          ) : (
            <Placeholder label="official phone number or Telegram link" block />
          )}
        </SupportAccordion>

        <SupportAccordion id="about" icon={Star} title={charity.about.title} subtitle="A student-led project from NUM." expanded={openId === 'about'} onToggle={toggle}>
          <p>{charity.about.text}</p>
          <dl className="vision-mission">
            <div>
              <dt>Vision</dt>
              <dd>{charity.about.vision}</dd>
            </div>
            <div>
              <dt>Mission</dt>
              <dd>{charity.about.mission}</dd>
            </div>
          </dl>
        </SupportAccordion>
      </div>
    </section>
  )
}
