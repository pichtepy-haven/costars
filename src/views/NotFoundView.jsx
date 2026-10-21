import React from 'react'
import Button from '../components/Button.jsx'

export default function NotFoundView() {
  return (
    <div className="page-section not-found">
      <h1 id="view-title" tabIndex={-1}>
        We couldn’t find that page
      </h1>
      <p>The link may be out of date. Everything for tonight is in the main guide.</p>
      <Button variant="primary" href="#/">
        Open the event guide
      </Button>
    </div>
  )
}
