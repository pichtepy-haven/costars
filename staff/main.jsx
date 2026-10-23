import React from 'react'
import { createRoot } from 'react-dom/client'
import StaffApp from './StaffApp.jsx'
import './staff.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StaffApp />
  </React.StrictMode>
)
