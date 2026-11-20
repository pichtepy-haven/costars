import { useEffect, useState } from 'react'

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Khmer word for the part of the day (morning, afternoon, evening, night). */
const kmPeriod = (h) => (h < 12 ? 'ព្រឹក' : h < 16 ? 'រសៀល' : h < 19 ? 'ល្ងាច' : 'យប់')

/** "17:10" → "5:10" */
export const formatClock = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`
}

/** "17:10" → "PM" / "ល្ងាច" */
export const formatPeriod = (hhmm, lang = 'en') => {
  const h = Number(hhmm.split(':')[0])
  if (lang === 'km') return kmPeriod(h)
  return h >= 12 ? 'PM' : 'AM'
}

/** "17:10" → "5:10 PM" / "5:10 ល្ងាច" */
export const formatTime = (hhmm, lang = 'en') => `${formatClock(hhmm)} ${formatPeriod(hhmm, lang)}`

/** "5:10 – 5:55 PM" (the period once when both ends share it) */
export const formatRange = (item, lang = 'en') => {
  const a = formatPeriod(item.start, lang)
  const b = formatPeriod(item.end, lang)
  return a === b
    ? `${formatClock(item.start)} – ${formatClock(item.end)} ${b}`
    : `${formatTime(item.start, lang)} – ${formatTime(item.end, lang)}`
}

export const durationOf = (item) => toMinutes(item.end) - toMinutes(item.start)

export const formatDuration = (minutes, lang = 'en') => `${minutes} ${lang === 'km' ? 'នាទី' : 'min'}`

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_KM = ['ថ្ងៃអាទិត្យ', 'ថ្ងៃច័ន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍']
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_EN_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTHS_KM = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']

/** "2026-12-05" → "Sat 5 Dec" / "ថ្ងៃសៅរ៍ ទី5 ធ្នូ" (long: "Saturday 5 December 2026") */
export const formatDay = (isoDate, lang = 'en', long = false) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || '')
  if (!m) return ''
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  const dow = d.getUTCDay()
  const day = d.getUTCDate()
  const mon = d.getUTCMonth()
  if (lang === 'km') return `${DAYS_KM[dow]} ទី${day} ${MONTHS_KM[mon]}${long ? ` ${m[1]}` : ''}`
  return long ? `${day} ${MONTHS_EN_LONG[mon]} ${m[1]}` : `${DAYS_EN[dow]} ${day} ${MONTHS_EN[mon]}`
}

/** The moment an item starts on the event day, as a Date. */
export const startDate = (event, hhmm) => new Date(`${event.date}T${hhmm}:00${event.utcOffset}`)

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
  if (dateStr < event.date) return { phase: 'before-day', minutes }
  if (dateStr > event.date) return { phase: 'after-day', minutes }
  const current = agenda.find((item) => minutes >= toMinutes(item.start) && minutes < toMinutes(item.end))
  const next = agenda.find((item) => toMinutes(item.start) > minutes)
  const first = agenda[0]
  const last = agenda[agenda.length - 1]
  let phase = 'live'
  if (first && minutes < toMinutes(first.start)) phase = 'before-start'
  else if (last && minutes >= toMinutes(last.end)) phase = 'ended'
  return { phase, minutes, currentId: current?.id ?? null, nextId: next?.id ?? null }
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
