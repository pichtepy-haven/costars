import React from 'react'
import { useT } from '../../i18n.jsx'
import { Sparkle } from '../ui.jsx'

/** Scrolling band of words under the hero (text: Sheet “Text” tab, key marquee). */
export default function Marquee() {
  const { t } = useT()
  const words = t('marquee').split('|').map((w) => w.trim()).filter(Boolean)
  if (!words.length) return null
  const run = (k) => (
    <div className="marquee__run display" key={k}>
      {[...words, ...words].map((w, i) => (
        <React.Fragment key={`${k}-${i}`}>
          <span className={i % 2 ? 'is-outline' : ''}>{w}</span>
          <Sparkle size={12} />
        </React.Fragment>
      ))}
    </div>
  )
  return (
    <div className="marquee" role="img" aria-label={words.join(', ')}>
      <div className="marquee__track" aria-hidden="true">
        {run('a')}
        {run('b')}
      </div>
    </div>
  )
}
