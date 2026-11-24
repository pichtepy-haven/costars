import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { LangProvider } from './i18n.jsx'
import {
  CORE_TABS, EXTRA_TABS, applySheetContent, loadSheetContent, readCachedContent, writeCachedContent,
} from './lib/sheetContent.js'
import { startFitText } from './lib/fitText.js'
import './styles.css'

const root = createRoot(document.getElementById('root'))
let contentVersion = 0
let applied = ''
let latest = {} // last good copy of every tab

const render = () =>
  root.render(
    <React.StrictMode>
      <LangProvider>
        <App contentVersion={contentVersion} />
      </LangProvider>
    </React.StrictMode>,
  )

const apply = (tabs) => {
  const snapshot = JSON.stringify(tabs)
  if (snapshot === applied) return false
  try {
    applySheetContent(tabs)
    applied = snapshot
    contentVersion += 1
    return true
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[content sheet] ignored:', error)
    return false
  }
}

// 1. Show the last copy of the Google Sheet this phone downloaded (if any)
//    straight away, otherwise the content built into src/data.js.
const cached = readCachedContent()
if (cached) {
  latest = cached
  apply(cached)
}
render()
startFitText()

// 2. Fetch the latest version of the sheet and update the page if it changed.
//    Times and line-up every minute; the other tabs every 10 minutes.
let lastCore = 0
let lastExtra = 0
const refresh = () => {
  const now = Date.now()
  const tabs = []
  if (now - lastCore >= 60000) {
    lastCore = now
    tabs.push(...CORE_TABS)
  }
  if (now - lastExtra >= 600000) {
    lastExtra = now
    tabs.push(...EXTRA_TABS)
  }
  if (!tabs.length) return
  loadSheetContent({ tabs })
    .then((fresh) => {
      if (!fresh) return
      latest = { ...latest, ...fresh }
      if (apply(latest)) {
        writeCachedContent(latest)
        render()
      }
    })
    .catch(() => {})
}
refresh()

// 3. Check again when a guest returns to the guide (e.g. after locking their phone).
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refresh()
})
