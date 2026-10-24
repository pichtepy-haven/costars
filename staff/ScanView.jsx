import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Ban, CircleCheckBig, CircleX, LoaderCircle, LogOut, RotateCcw, TriangleAlert, Undo2, WifiOff } from 'lucide-react'
import { callApi, describeError } from './api.js'
import QrScanner from './QrScanner.jsx'
import { StaffFooter, StaffHeader } from './Shell.jsx'

const SUCCESS_MS = 2600 // how long a green "Checked in" card stays before scanning resumes
const SAME_CODE_MS = 10000 // ignore the same QR held in front of the camera
const UNDO_MS = 15 * 60000
const STATS_EVERY_MS = 60000

const clock = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
/** "2026-12-05 18:03:12" → "18:03" */
const shortTime = (stamp) => (/\d{2}:\d{2}/.exec(String(stamp || '')) || [stamp])[0]

const vibrate = (pattern) => {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* not supported */
  }
}

const VIEW = {
  checked_in: { tone: 'ok', Icon: CircleCheckBig, title: 'Checked in' },
  already_checked_in: { tone: 'warn', Icon: TriangleAlert, title: 'Already checked in' },
  not_found: { tone: 'bad', Icon: CircleX, title: 'Ticket not found' },
  not_valid: { tone: 'bad', Icon: Ban, title: 'Ticket not valid' },
  undone: { tone: 'info', Icon: Undo2, title: 'Check-in undone' },
  error: { tone: 'error', Icon: WifiOff, title: 'Not sent' },
}

function ResultCard({ result, onNext, onRetry, onUndo, undoBusy }) {
  if (result.kind === 'pending') {
    return (
      <div className="st-result st-result--pending" aria-hidden="true">
        <LoaderCircle className="st-spin st-result__icon" />
        <p className="st-result__title">Checking…</p>
        <p className="st-result__code">{result.scanned}</p>
      </div>
    )
  }
  const view = VIEW[result.kind] || VIEW.error
  const t = result.ticket
  const canUndo = result.kind === 'checked_in' && !result.undone && Date.now() - result.time < UNDO_MS
  return (
    <div className={`st-result st-result--${view.tone}`}>
      <view.Icon className="st-result__icon" aria-hidden="true" />
      <p className="st-result__title">{view.title}</p>
      {t?.holder ? <p className="st-result__name">{t.holder}</p> : null}
      {t ? (
        <p className="st-result__meta">
          {[t.type, t.code].filter(Boolean).join(' · ')}
          {t.order ? <span>Order {t.order}</span> : null}
        </p>
      ) : null}
      {result.kind === 'already_checked_in' ? (
        <p className="st-result__note">
          at {shortTime(t?.checkedInAt)}
          {t?.checkedInBy ? ` by ${t.checkedInBy}` : ''}
        </p>
      ) : null}
      {result.kind === 'not_valid' ? <p className="st-result__note">Status: {t?.status || 'not valid'}</p> : null}
      {result.kind === 'not_found' ? (
        <p className="st-result__note">
          Scanned: <span className="st-result__code">{result.scanned}</span>
          <br />
          Check the code, or send the guest to the coordinator.
        </p>
      ) : null}
      {result.kind === 'error' ? <p className="st-result__note">{result.message}</p> : null}

      <div className="st-result__actions">
        {canUndo ? (
          <button type="button" className="st-btn st-btn--ghost" onClick={() => onUndo(result)} disabled={undoBusy}>
            <Undo2 aria-hidden="true" /> Undo
          </button>
        ) : null}
        {result.kind === 'error' ? (
          <button type="button" className="st-btn st-btn--ghost" onClick={() => onRetry(result)}>
            <RotateCcw aria-hidden="true" /> Try again
          </button>
        ) : null}
        <button type="button" className="st-btn st-btn--primary" onClick={onNext}>
          Scan next
        </button>
      </div>
      {result.kind === 'checked_in' || result.kind === 'undone' ? <span className="st-result__timer" aria-hidden="true" /> : null}
    </div>
  )
}

export default function ScanView({ session, onLogout }) {
  const { token, staff } = session
  const [stats, setStats] = useState(session.stats || null)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [undoBusy, setUndoBusy] = useState(false)
  const [offline, setOffline] = useState(false)
  const [recent, setRecent] = useState([])
  const [manual, setManual] = useState('')
  const [announce, setAnnounce] = useState('')
  const lastRef = useRef({ text: '', at: 0 })
  const dismissRef = useRef(0)
  const busyRef = useRef(false)

  const expired = useCallback((err) => {
    if (err && err.code === 'unauthorized') {
      onLogout('Your login has ended. Please log in again.')
      return true
    }
    return false
  }, [onLogout])

  // Keep the totals fresh (several doors may be scanning) and check the login is still valid.
  useEffect(() => {
    let alive = true
    const refresh = () => {
      if (document.hidden) return
      callApi('stats', { token })
        .then((d) => {
          if (!alive) return
          setStats(d.stats)
          setOffline(false)
        })
        .catch((err) => {
          if (!alive || expired(err)) return
          if (err.code === 'network' || err.code === 'timeout') setOffline(true)
        })
    }
    refresh()
    const id = setInterval(refresh, STATS_EVERY_MS)
    const onVisible = () => !document.hidden && refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive = false
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [token, expired])

  // Sign out on this phone when the login expires.
  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() > session.expiresAt) onLogout('Your login has ended. Please log in again.')
    }, 30000)
    return () => clearInterval(id)
  }, [session.expiresAt, onLogout])

  useEffect(() => () => clearTimeout(dismissRef.current), [])

  const show = useCallback((r) => {
    clearTimeout(dismissRef.current)
    setResult(r)
    if (r.kind === 'checked_in' || r.kind === 'undone') {
      dismissRef.current = setTimeout(() => setResult((cur) => (cur === r ? null : cur)), SUCCESS_MS)
    }
  }, [])

  const submit = useCallback(
    async (raw, source) => {
      const text = String(raw || '').trim()
      if (!text || busyRef.current) return
      const now = Date.now()
      if (source === 'camera' && text === lastRef.current.text && now - lastRef.current.at < SAME_CODE_MS) return
      lastRef.current = { text, at: now }
      busyRef.current = true
      setBusy(true)
      show({ kind: 'pending', scanned: text })
      try {
        const data = await callApi('checkin', { token, code: text })
        setOffline(false)
        setStats(data.stats)
        const r = { id: `${now}-${Math.random()}`, kind: data.result, ticket: data.ticket, scanned: text, time: now }
        show(r)
        setRecent((list) => [r, ...list].slice(0, 12))
        const title = VIEW[r.kind]?.title || r.kind
        setAnnounce(`${title}${r.ticket?.holder ? `: ${r.ticket.holder}` : ''}`)
        vibrate(r.kind === 'checked_in' ? 90 : [70, 60, 70, 60, 70])
        if (source === 'manual' && r.kind === 'checked_in') setManual('')
      } catch (err) {
        if (expired(err)) return
        if (err.code === 'network' || err.code === 'timeout') setOffline(true)
        show({ kind: 'error', scanned: text, message: describeError(err) })
        setAnnounce(`Not sent. ${describeError(err)}`)
        vibrate([200, 80, 200])
        lastRef.current = { text: '', at: 0 }
      } finally {
        busyRef.current = false
        setBusy(false)
      }
    },
    [token, show, expired]
  )

  const undo = async (r) => {
    if (!r.ticket?.code) return
    setUndoBusy(true)
    try {
      const data = await callApi('undo', { token, code: r.ticket.code })
      setStats(data.stats)
      setRecent((list) => list.map((x) => (x.id === r.id ? { ...x, undone: true } : x)))
      show({ kind: 'undone', ticket: data.ticket, scanned: r.scanned, time: Date.now() })
      setAnnounce(`Check-in undone${data.ticket?.holder ? `: ${data.ticket.holder}` : ''}`)
      lastRef.current = { text: '', at: 0 }
    } catch (err) {
      if (expired(err)) return
      show({ kind: 'error', scanned: r.scanned, message: describeError(err) })
    } finally {
      setUndoBusy(false)
    }
  }

  const next = () => {
    clearTimeout(dismissRef.current)
    setResult(null)
  }

  const onManual = (e) => {
    e.preventDefault()
    submit(manual, 'manual')
  }

  const paused = busy || !!result
  const pct = stats && stats.total ? Math.min(100, Math.round((stats.checkedIn / stats.total) * 100)) : 0

  return (
    <div className="st-page st-page--scan">
      <StaffHeader />
      <main className="st-main st-main--scan" id="main">
        <h1 className="st-visually-hidden">Scan tickets</h1>
        <div className="st-who">
          <p>
            Signed in as <strong>{staff.name || staff.id}</strong>
            {staff.name ? <span> · {staff.id}</span> : null}
          </p>
          <button type="button" className="st-link" onClick={() => onLogout('')}>
            <LogOut aria-hidden="true" /> Log out
          </button>
        </div>

        <section className="st-stats" aria-label="Check-in progress">
          <p className="st-stats__label">Checked in</p>
          <p className="st-stats__value">
            {stats ? stats.checkedIn : '–'}
            <small> of {stats ? stats.total : '–'}</small>
          </p>
          <div
            className="st-meter"
            role="progressbar"
            aria-label="Guests checked in"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <span style={{ width: `${pct}%` }} />
          </div>
        </section>

        {offline ? (
          <p className="st-alert st-alert--error" role="status">
            <WifiOff aria-hidden="true" /> Can’t reach the check-in system. Check Wi-Fi or mobile data.
          </p>
        ) : null}

        <QrScanner paused={paused} onDetect={(text) => submit(text, 'camera')}>
          {result ? <ResultCard result={result} onNext={next} onRetry={(r) => submit(r.scanned, 'manual')} onUndo={undo} undoBusy={undoBusy} /> : null}
        </QrScanner>
        <p className="st-visually-hidden" aria-live="assertive" aria-atomic="true">
          {announce}
        </p>

        <form className="st-card st-manual" onSubmit={onManual}>
          <label htmlFor="st-code" className="st-manual__label">
            QR won’t scan? Type the ticket code
          </label>
          <div className="st-manual__row">
            <input
              id="st-code"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="e.g. CS-0001-1"
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={120}
            />
            <button type="submit" className="st-btn st-btn--primary" disabled={busy || !manual.trim()}>
              Check in
            </button>
          </div>
        </form>

        {recent.length ? (
          <section className="st-card st-recent" aria-labelledby="st-recent-title">
            <h2 id="st-recent-title">Recent scans on this phone</h2>
            <ol>
              {recent.map((r) => {
                const view = VIEW[r.kind] || VIEW.error
                const canUndo = r.kind === 'checked_in' && !r.undone && Date.now() - r.time < UNDO_MS
                return (
                  <li key={r.id} className={`st-recent__item st-recent__item--${r.undone ? 'info' : view.tone}`}>
                    <view.Icon className="st-recent__icon" aria-hidden="true" />
                    <div className="st-recent__body">
                      <span className="st-recent__name">{r.ticket?.holder || r.ticket?.code || r.scanned}</span>
                      <span className="st-recent__meta">
                        {clock(r.time)} · {r.undone ? 'Undone' : view.title}
                      </span>
                    </div>
                    {canUndo ? (
                      <button type="button" className="st-link" onClick={() => undo(r)} disabled={undoBusy}>
                        <Undo2 aria-hidden="true" /> Undo
                      </button>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          </section>
        ) : null}
      </main>
      <StaffFooter />
    </div>
  )
}
