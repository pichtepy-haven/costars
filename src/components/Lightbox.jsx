import React, { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

/** Accessible photo viewer built on the native <dialog> element. */
export default function Lightbox({ photos, index, onClose, onChange }) {
  const ref = useRef(null)
  const open = index !== null && index !== undefined && photos[index]

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    }
    if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else dialog.removeAttribute('open')
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'ArrowRight') onChange((index + 1) % photos.length)
      if (e.key === 'ArrowLeft') onChange((index - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, photos.length, onChange])

  const photo = open ? photos[index] : null
  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-label="Photo viewer"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      {photo && (
        <figure className="lightbox__figure">
          <img src={photo.src} alt={photo.alt} />
          <figcaption>
            <span>{photo.alt}</span>
            <span className="lightbox__count">
              {index + 1} / {photos.length}
            </span>
          </figcaption>
        </figure>
      )}
      <button type="button" className="icon-button lightbox__close" onClick={onClose} aria-label="Close photo">
        <X size={22} />
      </button>
      {photos.length > 1 && (
        <>
          <button type="button" className="icon-button lightbox__nav lightbox__nav--prev" onClick={() => onChange((index - 1 + photos.length) % photos.length)} aria-label="Previous photo">
            <ChevronLeft size={24} />
          </button>
          <button type="button" className="icon-button lightbox__nav lightbox__nav--next" onClick={() => onChange((index + 1) % photos.length)} aria-label="Next photo">
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </dialog>
  )
}

/** Grid of thumbnails that open the Lightbox. */
export function PhotoGrid({ photos, onOpen, label, className = '' }) {
  return (
    <ul className={`photo-grid ${className}`} aria-label={label}>
      {photos.map((photo, i) => (
        <li key={photo.src}>
          <button type="button" className="photo-grid__item" onClick={() => onOpen(i)} aria-label={`View photo: ${photo.alt}`}>
            <img src={photo.thumb || photo.src} alt="" loading="lazy" decoding="async" />
          </button>
        </li>
      ))}
    </ul>
  )
}
