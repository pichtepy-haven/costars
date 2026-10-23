import React, { useCallback, useEffect, useState } from 'react'
import LoginView from './LoginView.jsx'
import ScanView from './ScanView.jsx'
import { clearSession, loadSession, saveSession } from './session.js'

export default function StaffApp() {
  const [session, setSession] = useState(loadSession)
  const [notice, setNotice] = useState('')

  const handleLogin = useCallback((s) => {
    saveSession(s)
    setNotice('')
    setSession(s)
  }, [])

  const handleLogout = useCallback((reason) => {
    clearSession()
    setNotice(reason || '')
    setSession(null)
  }, [])

  useEffect(() => {
    document.title = session ? 'Scan tickets · CoStars Staff' : 'Staff Login · CoStars'
    window.scrollTo(0, 0)
  }, [session])

  return session ? <ScanView session={session} onLogout={handleLogout} /> : <LoginView notice={notice} onLogin={handleLogin} />
}
