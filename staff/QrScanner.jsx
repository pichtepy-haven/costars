import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, LoaderCircle } from 'lucide-react'

let jsQrPromise = null

/** Loads the jsQR reader (only on phones without a built-in QR reader, e.g. iPhone). */
function loadJsQr() {
  if (!jsQrPromise) {
    jsQrPromise = import('jsqr')
      .then((m) => m.default || m)
      .catch(() => {
        jsQrPromise = null
        throw new Error('jsQR failed to load')
      })
  }
  return jsQrPromise
}

/** Returns an async (video) => text|null function, using the fastest reader available. */
async function createReader(canvas) {
  if ('BarcodeDetector' in window) {
    try {
      const formats = await window.BarcodeDetector.getSupportedFormats()
      if (formats.includes('qr_code')) {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
        return { interval: 120, read: async (video) => (await detector.detect(video))[0]?.rawValue || null }
      }
    } catch {
      /* fall through to jsQR */
    }
  }
  const jsQR = await loadJsQr()
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  return {
    interval: 150,
    read: async (video) => {
      const vw = video.videoWidth
      const vh = video.videoHeight
      if (!vw || !vh) return null
      // Read the centre square (where the frame guide is), scaled down for speed.
      const side = Math.min(vw, vh)
      const size = Math.min(side, 640)
      canvas.width = size
      canvas.height = size
      ctx.drawImage(video, (vw - side) / 2, (vh - side) / 2, side, side, 0, 0, size, size)
      const img = ctx.getImageData(0, 0, size, size)
      const code = jsQR(img.data, size, size, { inversionAttempts: 'attemptBoth' })
      return code && code.data ? code.data : null
    },
  }
}

function cameraMessage(err) {
  const name = err && err.name
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'Camera access is blocked. Allow the camera for this site in your browser settings, then tap Start camera.'
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No camera found on this device. Type the ticket code below instead.'
  if (name === 'NotReadableError' || name === 'AbortError') return 'The camera is busy in another app. Close that app and try again.'
  return 'Couldn’t start the camera. Try again, or type the ticket code below.'
}

/**
 * Camera viewfinder that reports each QR code it reads via onDetect(text).
 * While `paused` the camera keeps running (so it resumes instantly) but nothing is read.
 * `children` are drawn on top of the viewfinder (the result card).
 */
export default function QrScanner({ paused, onDetect, children }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef = useRef(0)
  const wantedRef = useRef(false)
  const pausedRef = useRef(paused)
  const detectRef = useRef(onDetect)
  const [state, setState] = useState('idle') // idle · starting · live · error
  const [message, setMessage] = useState('')

  pausedRef.current = paused
  detectRef.current = onDetect

  const stop = useCallback(() => {
    clearTimeout(timerRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const start = useCallback(async () => {
    wantedRef.current = true
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('error')
      setMessage(
        window.isSecureContext
          ? 'This browser can’t use the camera. Type the ticket code below instead.'
          : 'The camera only works on the secure (https) address of this page.'
      )
      return
    }
    stop()
    setState('starting')
    setMessage('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      if (!wantedRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      streamRef.current = stream
      const video = videoRef.current
      video.srcObject = stream
      await video.play()
      const reader = await createReader(canvasRef.current)
      setState('live')
      const tick = async () => {
        if (!streamRef.current) return
        if (!pausedRef.current && video.readyState >= 2) {
          try {
            const text = await reader.read(video)
            if (text && !pausedRef.current && streamRef.current) detectRef.current(text)
          } catch {
            /* a frame that can't be read: try the next one */
          }
        }
        timerRef.current = setTimeout(tick, reader.interval)
      }
      tick()
    } catch (err) {
      stop()
      setState('error')
      setMessage(err && err.message === 'jsQR failed to load' ? 'The QR reader didn’t load. Check the connection and try again.' : cameraMessage(err))
    }
  }, [stop])

  const turnOff = () => {
    wantedRef.current = false
    stop()
    setState('idle')
  }

  // Start automatically when camera permission was already given on this phone.
  useEffect(() => {
    let cancelled = false
    navigator.permissions
      ?.query({ name: 'camera' })
      .then((p) => {
        if (!cancelled && p.state === 'granted') start()
      })
      .catch(() => {})
    return () => {
      cancelled = true
      wantedRef.current = false
      stop()
    }
  }, [start, stop])

  // Phones stop the camera in the background; restart it when the page is back.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        if (streamRef.current) stop()
      } else if (wantedRef.current && !streamRef.current) start()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [start, stop])

  const live = state === 'live'
  return (
    <div className="st-scanner">
      <div className={`st-viewfinder${live ? ' is-live' : ''}`}>
        <video ref={videoRef} muted playsInline autoPlay aria-hidden="true" />
        <canvas ref={canvasRef} hidden />
        {live ? (
          <div className="st-reticle" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <i />
          </div>
        ) : (
          <div className="st-viewfinder__idle">
            <Camera className="st-viewfinder__icon" aria-hidden="true" />
            <p className={state === 'error' ? 'is-error' : ''} role={state === 'error' ? 'alert' : undefined}>
              {message || 'Use the phone camera to scan the QR code on each ticket.'}
            </p>
            <button type="button" className="st-btn st-btn--primary" onClick={start} disabled={state === 'starting'}>
              {state === 'starting' ? (
                <>
                  <LoaderCircle className="st-spin" aria-hidden="true" /> Starting camera…
                </>
              ) : (
                <>
                  <Camera aria-hidden="true" /> {state === 'error' ? 'Try again' : 'Start camera'}
                </>
              )}
            </button>
          </div>
        )}
        {children}
      </div>
      {live ? (
        <div className="st-scanner__bar">
          <p>Hold the QR code inside the frame.</p>
          <button type="button" className="st-link" onClick={turnOff}>
            <CameraOff aria-hidden="true" /> Camera off
          </button>
        </div>
      ) : null}
    </div>
  )
}
