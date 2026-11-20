import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import SiteHeader from './components/SiteHeader.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import HomeView from './views/HomeView.jsx'
import ActView from './views/ActView.jsx'
import CharityView from './views/CharityView.jsx'
import LiveView from './views/LiveView.jsx'
import NotFoundView from './views/NotFoundView.jsx'
import { agenda, event, charity } from './data.js'
import { DEFAULT_EXPANDED_ID } from './lib/config.js'
import { useLiveState } from './lib/time.js'
import { useT } from './i18n.jsx'
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
  const { t, loc, act: actLabel, lang } = useT()
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
    const brand = event.brand
    const titles = {
      home: `${brand}: ${t('event_guide')}`,
      act: act ? `${actLabel(act.act)}: ${loc(act, 'title')} | ${brand}` : '',
      charity: `${loc(charity, 'title')} | ${brand}`,
      live: `${t('live_now')} | ${brand}`,
      missing: `${t('not_found_title')} | ${brand}`,
    }
    document.title = titles[view] || titles.home
  }, [view, act, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  useReveal(route.key)

  // “Live now” appears on the day of the event.
  const eventDay = ['before-start', 'live', 'ended'].includes(live.phase)
  const onStage = live.phase === 'live'
  const actDot = { gold: 'gold', crimson: 'crimson', violet: 'violet' }

  const menuItems = [
    { key: 'home', label: t('menu_home'), sub: t('menu_home_sub'), dot: 'cream', href: hrefFor.home(), current: view === 'home' },
    ...(eventDay
      ? [{ key: 'live', label: t('live_now'), sub: t('live_now_sub'), dot: 'red', pulse: onStage, href: hrefFor.live(), current: view === 'live' }]
      : []),
    ...acts.map((a) => ({
      key: a.id,
      label: actLabel(a.act),
      sub: loc(a, 'title'),
      dot: actDot[a.tone] || 'gold',
      href: hrefFor.act(a.id),
      current: view === 'act' && act?.id === a.id,
    })),
    { key: 'charity', label: t('menu_charity'), sub: loc(charity.beneficiary, 'name'), dot: 'gold-soft', href: hrefFor.charity(), current: view === 'charity' },
    {
      key: 'help',
      label: t('nav_help'),
      sub: t('menu_help_sub'),
      dot: 'muted',
      href: '#/',
      onSelect: () => {
        setSupportOpenId('etiquette')
        goToSection('help')
      },
    },
  ]

  const navItems = [
    { key: 'home', label: t('nav_home'), href: hrefFor.home(), current: view === 'home' },
    ...(eventDay ? [{ key: 'live', label: t('live_now'), href: hrefFor.live(), current: view === 'live', pulse: onStage }] : []),
    ...acts.map((a) => ({ key: a.id, label: actLabel(a.act), href: hrefFor.act(a.id), current: view === 'act' && act?.id === a.id })),
    { key: 'charity', label: t('nav_charity'), href: hrefFor.charity(), current: view === 'charity' },
  ]

  const backToGuide = (section) => {
    if (!wentBackFromHome()) goToSection(section)
  }

  const actIndex = act ? acts.findIndex((a) => a.id === act.id) + 1 : 0

  return (
    <div className={`app-shell lang-${lang}`}>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        {t('skip')}
      </a>

      {view === 'act' ? (
        <SiteHeader
          variant="sub"
          backLabel={t('back_agenda')}
          label={t('act_of', { act: actLabel(act.act) })}
          onBack={() => backToGuide('highlights')}
          items={menuItems}
          navItems={navItems}
        />
      ) : view === 'charity' ? (
        <SiteHeader variant="sub" backLabel={t('back_guide')} label={loc(charity, 'title')} onBack={() => backToGuide('charity')} items={menuItems} navItems={navItems} />
      ) : (
        <SiteHeader variant="home" items={menuItems} navItems={navItems} />
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
        {view === 'act' && <ActView act={act} live={live} key={`${act.id}-${actIndex}`} />}
        {view === 'charity' && <CharityView />}
        {view === 'live' && <LiveView live={live} />}
        {view === 'missing' && <NotFoundView />}
      </main>

      <SiteFooter compact={view !== 'home'} />
    </div>
  )
}
