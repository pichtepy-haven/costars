import { useEffect, useState } from 'react'

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const formatTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = ((h + 11) % 12) + 1
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

export const formatRange = (item) => `${formatTime(item.start)} – ${formatTime(item.end)}`

export const durationOf = (item) => toMinutes(item.end) - toMinutes(item.start)

export const formatDuration = (minutes) => `${minutes} min`

/** Parse “+07:00” into minutes east of UTC. */
const offsetMinutes = (offset = '+00:00') => {
  const match = /^([+-])(\d{2}):?(\d{2})$/.exec(offset)
  if (!match) return 0
  const sign = match[1] === '-' ? -1 : 1
  return sign * (Number(match[2]) * 60 + Number(match[3]))
}

/**
 * Current time. For testing, add ?now=2026-12-05T18:20 to the URL
 * (interpreted in the event's time zone).
 */
export const getNow = (utcOffset) => {
  if (typeof window !== 'undefined') {
    const override = new URLSearchParams(window.location.search).get('now')
    if (override) {
      const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(override) ? override : `${override}${override.length <= 16 ? ':00' : ''}${utcOffset}`
      const parsed = new Date(iso)
      if (!Number.isNaN(parsed.getTime())) return parsed
    }
  }
  return new Date()
}

/** Wall-clock date + minutes-after-midnight in the event's time zone. */
export const eventClock = (date, utcOffset) => {
  const shifted = new Date(date.getTime() + offsetMinutes(utcOffset) * 60000)
  const dateStr = shifted.toISOString().slice(0, 10)
  return { dateStr, minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes() }
}

/**
 * Where we are in the running order right now.
 * phase: 'before-day' | 'before-start' | 'live' | 'ended' | 'after-day'
 */
export const getLiveState = (agenda, event, now) => {
  const { dateStr, minutes } = eventClock(now, event.utcOffset)
  if (dateStr < event.date) return { phase: 'before-day' }
  if (dateStr > event.date) return { phase: 'after-day' }
  const current = agenda.find((item) => minutes >= toMinutes(item.start) && minutes < toMinutes(item.end))
  const next = agenda.find((item) => toMinutes(item.start) > minutes)
  const first = agenda[0]
  const last = agenda[agenda.length - 1]
  let phase = 'live'
  if (first && minutes < toMinutes(first.start)) phase = 'before-start'
  else if (last && minutes >= toMinutes(last.end)) phase = 'ended'
  return { phase, currentId: current?.id ?? null, nextId: next?.id ?? null }
}

/** Live state that refreshes every 30 seconds and whenever the content changes. */
export const useLiveState = (agenda, event, contentVersion = 0) => {
  const compute = () => getLiveState(agenda, event, getNow(event.utcOffset))
  const [state, setState] = useState(compute)
  useEffect(() => {
    setState(compute())
    const timer = window.setInterval(() => setState(compute()), 30000)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentVersion])
  return state
}
