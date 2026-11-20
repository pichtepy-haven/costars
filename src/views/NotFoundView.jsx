import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useT } from '../i18n.jsx'
import { hrefFor } from '../lib/router.js'

export default function NotFoundView() {
  const { t } = useT()
  return (
    <section className="not-found wrap">
      <h1 className="display" id="view-title" tabIndex={-1}>
        {t('not_found_title')}
      </h1>
      <p>{t('not_found_text')}</p>
      <a className="btn btn--cream" href={hrefFor.home()}>
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        {t('back_guide')}
      </a>
    </section>
  )
}
