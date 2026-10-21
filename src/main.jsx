import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import {
  applySheetContent, loadSheetContent, readCachedContent, writeCachedContent,
} from './lib/sheetContent.js'
import './styles.css'

const root = createRoot(document.getElementById('root'))
let contentVersion = 0
let applied = ''

const render = () =>
  root.render(
    <React.StrictMode>
      <App contentVersion={contentVersion} />
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
if (cached) apply(cached)
render()

// 2. Fetch the latest version of the sheet and update the page if it changed.
let lastFetch = 0
const refresh = () => {
  if (Date.now() - lastFetch < 60000) return
  lastFetch = Date.now()
  loadSheetContent()
    .then((tabs) => {
      if (tabs && apply(tabs)) {
        writeCachedContent(tabs)
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
