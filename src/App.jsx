import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CalendarDays, UsersRound, HandHeart, School, Info, Phone } from 'lucide-react'
import SiteHeader from './components/SiteHeader.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import HomeView from './views/HomeView.jsx'
import ActView from './views/ActView.jsx'
import CharityView from './views/CharityView.jsx'
import NotFoundView from './views/NotFoundView.jsx'
import { agenda, event, charity } from './data.js'
import { DEFAULT_EXPANDED_ID } from './lib/config.js'
import { useLiveState } from './lib/time.js'
import {
  useHashRoute, restoreScroll, scrollToSection, takePendingSection, goToSection, hrefFor, wentBackFromHome,
} from './lib/router.js'

/** Fade sections in as they scroll into view, the first time a page is seen
 *  (skipped for reduced motion and when returning to a page). */
const seenRoutes = new Set()
const useReveal = (key) => {
  useLayoutEffect(() => {
    const nodes = document.querySelectorAll('.reveal:not(.is-visible)')
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const returning = seenRoutes.has(key)
    seenRoutes.add(key)
    if (reduce || returning || !('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-visible'))
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.04 },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [key])
}

export default function App({ contentVersion = 0 }) {
  const route = useHashRoute()
  const live = useLiveState(agenda, event, contentVersion)
  const acts = agenda.filter((item) => item.type === 'act')
  const [agendaOpenId, setAgendaOpenId] = useState(() =>
    live.phase === 'live' && live.currentId ? live.currentId : DEFAULT_EXPANDED_ID,
  )
  const [supportOpenId, setSupportOpenId] = useState('')
  const firstRender = useRef(true)

  const act = route.name === 'act' ? acts.find((a) => a.id === route.id) : null
  const view = route.name === 'act' ? (act ? 'act' : 'missing') : route.name

  // Scroll + focus handling whenever the route changes.
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (route.name === 'home') {
      const section = takePendingSection()
      if (section) scrollToSection(section, 'auto')
      else restoreScroll('home')
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' })
      document.getElementById('view-title')?.focus({ preventScroll: true })
    }
  }, [route.key])

  useEffect(() => {
    const titles = {
      home: `${event.brand}: ${event.guideLabel}`,
      act: act ? `${act.act}: ${act.title} | ${event.brand}` : '',
      charity: `${charity.title} | ${event.brand}`,
      missing: `Page not found | ${event.brand}`,
    }
    document.title = titles[view] || titles.home
  }, [view, act])

  useReveal(route.key)

  const openSupport = (id) => {
    setSupportOpenId(id)
    goToSection(id)
  }

  const menuItems = [
    { label: 'Performance Schedule', icon: CalendarDays, onSelect: () => goToSection('schedule') },
    { label: 'Agenda Highlights', icon: UsersRound, onSelect: () => goToSection('highlights') },
    { label: 'Charity Impact', icon: HandHeart, onSelect: () => goToSection('charity') },
    { label: charity.beneficiary.name, icon: School, onSelect: () => { window.location.hash = hrefFor.charity() } },
    { label: 'Event Etiquette', icon: Info, onSelect: () => openSupport('etiquette') },
    { label: 'Need Help?', icon: Phone, onSelect: () => openSupport('help') },
  ]

  const backToGuide = (section) => {
    if (!wentBackFromHome()) goToSection(section)
  }

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        Skip to content
      </a>

      {view === 'act' ? (
        <SiteHeader variant="act" backLabel="Agenda" onBack={() => backToGuide('highlights')} menuItems={menuItems} />
      ) : view === 'charity' ? (
        <SiteHeader variant="charity" backLabel="Back to the guide" title={charity.title} onBack={() => backToGuide('charity')} menuItems={menuItems} />
      ) : (
        <SiteHeader variant="home" menuItems={menuItems} />
      )}

      <main id="main" tabIndex={-1} key={route.key} className={`view view--${view}`}>
        {view === 'home' && (
          <HomeView
            live={live}
            agendaOpenId={agendaOpenId}
            setAgendaOpenId={setAgendaOpenId}
            supportOpenId={supportOpenId}
            setSupportOpenId={setSupportOpenId}
          />
        )}
        {view === 'act' && <ActView act={act} acts={acts} live={live} />}
        {view === 'charity' && <CharityView />}
        {view === 'missing' && <NotFoundView />}
      </main>

      <SiteFooter compact={view !== 'home'} />
    </div>
  )
}
