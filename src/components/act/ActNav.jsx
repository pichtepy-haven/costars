import React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { agenda } from '../../data.js'
import { useT } from '../../i18n.jsx'
import { formatTime } from '../../lib/time.js'
import { goToSection, hrefFor } from '../../lib/router.js'

/** The moment before and after this act (skipping breaks): another act or the schedule. */
const neighbours = (id) => {
  const list = agenda.filter((i) => i.type !== 'break')
  const at = list.findIndex((i) => i.id === id)
  return [list[at - 1], list[at + 1]]
}

function NavCard({ item, dir }) {
  const { loc, act, lang } = useT()
  if (!item) return <span />
  const isAct = item.type === 'act'
  const label = isAct ? act(item.act) : formatTime(item.start, lang)
  const Arrow = dir === 'prev' ? ArrowLeft : ArrowRight
  const props = isAct
    ? { href: hrefFor.act(item.id) }
    : {
        href: '#/',
        onClick: (e) => {
          e.preventDefault()
          goToSection('schedule')
        },
      }
  return (
    <a className={`act-nav__card act-nav__card--${dir} ${isAct ? `nav-${item.tone} border-${item.tone}` : ''}`} {...props}>
      <span className={`act-nav__label ${isAct ? `c-${item.tone}` : ''}`}>
        {dir === 'prev' && <Arrow size={14} strokeWidth={2} aria-hidden="true" />}
        {label}
        {dir === 'next' && <Arrow size={14} strokeWidth={2} aria-hidden="true" />}
      </span>
      <span className="act-nav__title">{loc(item, 'title')}</span>
    </a>
  )
}

export default function ActNav({ act: item }) {
  const { t } = useT()
  const [prev, next] = neighbours(item.id)
  return (
    <nav className="act-nav wrap" aria-label={t("running_order")}>
      <NavCard item={prev} dir="prev" />
      <NavCard item={next} dir="next" />
    </nav>
  )
}
