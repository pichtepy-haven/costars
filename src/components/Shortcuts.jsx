import React from 'react'
import { CalendarDays, UsersRound, HeartHandshake, Heart } from 'lucide-react'
import { goToSection, hrefFor } from '../lib/router.js'

/** Quick-navigation tiles under the welcome banner [UI2]. */
const shortcuts = [
  { label: 'Schedule', icon: CalendarDays, onClick: () => goToSection('schedule') },
  { label: 'Performers', icon: UsersRound, onClick: () => goToSection('highlights') },
  { label: 'Charity', icon: HeartHandshake, onClick: () => goToSection('charity') },
  { label: 'Impact', icon: Heart, href: hrefFor.charity() },
]

export default function Shortcuts() {
  return (
    <nav className="shortcuts" aria-label="Quick links">
      <ul>
        {shortcuts.map(({ label, icon: Icon, onClick, href }) => (
          <li key={label}>
            {href ? (
              <a className="shortcut" href={href}>
                <Icon size={21} strokeWidth={2} aria-hidden="true" />
                <span>{label}</span>
              </a>
            ) : (
              <button type="button" className="shortcut" onClick={onClick}>
                <Icon size={21} strokeWidth={2} aria-hidden="true" />
                <span>{label}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
