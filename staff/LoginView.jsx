import React, { useEffect, useRef, useState } from 'react'
import { ArrowRight, Eye, EyeOff, LoaderCircle, Lock, ScanLine, User } from 'lucide-react'
import { callApi, describeError } from './api.js'
import { DEMO_MODE } from './config.js'
import { DEMO_LOGIN } from './demo.js'
import { lastStaffId } from './session.js'
import { Ornament, ShieldLock, StaffFooter, StaffHeader } from './Shell.jsx'

export default function LoginView({ notice, onLogin }) {
  const [staffId, setStaffId] = useState(lastStaffId)
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const idRef = useRef(null)
  const pwRef = useRef(null)

  useEffect(() => {
    ;(staffId ? pwRef : idRef).current?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async (event) => {
    event?.preventDefault()
    if (busy) return
    const id = staffId.trim()
    if (!id || !password) {
      setError('Enter your Staff ID and password.')
      ;(!id ? idRef : pwRef).current?.focus()
      return
    }
    setBusy(true)
    setError('')
    try {
      const data = await callApi('login', { staffId: id, password })
      setPassword('')
      onLogin({ token: data.token, staff: data.staff, expiresAt: data.expiresAt, stats: data.stats })
    } catch (err) {
      setError(describeError(err))
      setBusy(false)
      if (err.code === 'invalid') pwRef.current?.select()
    }
  }

  // "Scan Ticket Directly": log in (if both fields are filled) and go straight to the scanner.
  const scanDirect = () => {
    if (staffId.trim() && password) return submit()
    setError('Log in first. The scanner opens straight after.')
    ;(!staffId.trim() ? idRef : pwRef).current?.focus()
  }

  return (
    <div className="st-page">
      <StaffHeader />
      <main className="st-main" id="main">
        <Ornament />
        <h1 className="st-title">Event Staff Login</h1>
        <p className="st-lede">Scan customer tickets to check them in at the event.</p>

        <section className="st-card st-login" aria-labelledby="st-access">
          <ShieldLock className="st-login__icon" />
          <h2 id="st-access" className="st-login__title">
            Staff Access
          </h2>
          <p className="st-login__sub">Please log in to continue</p>

          {DEMO_MODE ? (
            <div className="st-preview" role="note">
              <p>
                <strong>Preview mode.</strong> Not connected to the ticket database yet. Log in with Staff ID{' '}
                <b>{DEMO_LOGIN.staffId}</b> and password <b>{DEMO_LOGIN.password}</b>.
              </p>
              <button
                type="button"
                className="st-link"
                onClick={() => {
                  setStaffId(DEMO_LOGIN.staffId)
                  setPassword(DEMO_LOGIN.password)
                  setError('')
                }}
              >
                Fill in demo login
              </button>
            </div>
          ) : null}

          {notice ? (
            <p className="st-alert st-alert--info" role="status">
              {notice}
            </p>
          ) : null}

          <form className="st-form" onSubmit={submit} noValidate>
            <label className="st-field">
              <span className="st-visually-hidden">Staff ID</span>
              <User className="st-field__icon" aria-hidden="true" />
              <input
                ref={idRef}
                name="username"
                autoComplete="username"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Staff ID"
                value={staffId}
                maxLength={60}
                onChange={(e) => setStaffId(e.target.value)}
                aria-invalid={error && !staffId.trim() ? 'true' : undefined}
              />
            </label>
            <label className="st-field">
              <span className="st-visually-hidden">Password</span>
              <Lock className="st-field__icon" aria-hidden="true" />
              <input
                ref={pwRef}
                name="password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Password"
                value={password}
                maxLength={200}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="st-field__toggle"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
                aria-pressed={show}
              >
                {show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </label>

            {error ? (
              <p className="st-alert st-alert--error" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="st-btn st-btn--primary st-btn--block" disabled={busy}>
              {busy ? (
                <>
                  <LoaderCircle className="st-spin" aria-hidden="true" /> Logging in…
                </>
              ) : (
                <>
                  Log In <ArrowRight aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="st-or" aria-hidden="true">
            <span>OR</span>
          </div>

          <button type="button" className="st-direct" onClick={scanDirect} disabled={busy}>
            <span className="st-direct__title">
              <ScanLine aria-hidden="true" /> Scan Ticket Directly
            </span>
            <span className="st-direct__text">
              The scanner opens as soon as you log in. No account? Ask the event coordinator for a Staff ID.
            </span>
          </button>
        </section>
      </main>
      <StaffFooter />
    </div>
  )
}
