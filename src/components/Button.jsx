import React from 'react'
import { ArrowRight, ArrowLeft } from 'lucide-react'

/** Pill button from the UI kit. variant: 'primary' | 'secondary' | 'action'. */
export default function Button({ variant = 'primary', href, onClick, children, direction = 'forward', className = '', ...rest }) {
  const Arrow = direction === 'back' ? ArrowLeft : ArrowRight
  const cls = `btn btn--${variant} ${direction === 'back' ? 'btn--back' : ''} ${className}`
  const content = (
    <>
      {direction === 'back' && <Arrow className="btn__icon" size={17} aria-hidden="true" />}
      <span>{children}</span>
      {direction !== 'back' && <Arrow className="btn__icon" size={17} aria-hidden="true" />}
    </>
  )
  if (href) {
    return (
      <a className={cls} href={href} onClick={onClick} {...rest}>
        {content}
      </a>
    )
  }
  return (
    <button type="button" className={cls} onClick={onClick} {...rest}>
      {content}
    </button>
  )
}
