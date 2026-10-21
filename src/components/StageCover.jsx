import React, { useState } from 'react'
import { getIcon } from '../lib/icons.js'

/**
 * Visual for an agenda item. Shows the real photo when one is set in
 * src/data.js; otherwise a branded “stage” artwork (curtain, spotlight,
 * optional musicians silhouette from the proposal) so nothing looks broken
 * and no stock photo is passed off as the real performers.
 */
export default function StageCover({
  tone = 'crimson',
  icon,
  label,
  image,
  alt = '',
  size = 'md',
  silhouette = false,
  eager = false,
  sizes,
  srcSet,
  className = '',
}) {
  const [failed, setFailed] = useState(false)
  const Icon = icon ? getIcon(icon) : null
  const showImage = Boolean(image) && !failed

  return (
    <div className={`stage stage--${tone} stage--${size} ${showImage ? 'stage--photo' : ''} ${className}`}>
      {showImage ? (
        <img
          className="stage__img"
          src={image}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="stage__art" aria-hidden="true">
          <span className="stage__curtain" />
          <span className="stage__spot" />
          {silhouette && <span className="stage__silhouette" />}
          {Icon && <Icon className="stage__icon" strokeWidth={1.2} />}
          {label && <span className="stage__label">{label}</span>}
        </div>
      )}
    </div>
  )
}
