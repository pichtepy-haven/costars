import { toMinutes } from './time.js'

/**
 * Details of what is on stage, from the live state (see time.js).
 * For an act whose sets all have a duration, works out the set playing now
 * by adding the durations from the start of the act.
 */
export const liveDetails = (agenda, live) => {
  const current = agenda.find((i) => i.id === live.currentId) || null
  const next = agenda.find((i) => i.id === live.nextId) || null
  if (!current || typeof live.minutes !== 'number') return { current, next }
  const start = toMinutes(current.start)
  const end = toMinutes(current.end)
  const elapsed = Math.max(0, live.minutes - start)
  const total = Math.max(1, end - start)
  const left = Math.max(0, end - live.minutes)
  let set = null
  let setIndex = -1
  const programme = current.type === 'act' ? current.programme || [] : []
  if (programme.length && programme.every((p) => p.durationMin)) {
    let t = start
    for (let i = 0; i < programme.length; i += 1) {
      const d = programme[i].durationMin
      if (live.minutes >= t && live.minutes < t + d) {
        set = programme[i]
        setIndex = i
        break
      }
      t += d
    }
  }
  return { current, next, elapsed, total, left, progress: Math.min(1, elapsed / total), set, setIndex, setsTotal: programme.length }
}

/** Acts of the running order, numbered from 1. */
export const actNumber = (agenda, id) => agenda.filter((i) => i.type === 'act').findIndex((a) => a.id === id) + 1
