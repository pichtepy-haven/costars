/**
 * Where the ticket pages find the CoStars Telegram bot.
 *
 * API_URL is the bot's Google Apps Script web app address
 * (Apps Script → Deploy → Manage deployments → Web app URL, ends with /exec).
 * It is public on purpose: every request that changes something is signed by
 * Telegram, and ticket pages need the signed ticket code.
 *
 * After changing it, push to GitHub: Vercel publishes the website again.
 */
export const API_URL = 'https://script.google.com/macros/s/AKfycbxDjlZVrm8ES8CAyFfK9L_XqEbMP5ijyTeGxhsYZRyy4pEJFIYb5qu68gtQXIRRGxQe/exec'

/** The bot's username, without @. */
export const BOT_USERNAME = 'CoStarsConcertBot'

/** The website's own address (used in links shared outside it). */
export const SITE_URL = 'https://costars-guide.vercel.app'

/**
 * For testing on your own computer only: a page opened from http://localhost
 * may use ?api=<address> to talk to a test copy of the bot.
 */
export function apiUrl() {
  if (typeof location === 'undefined') return API_URL
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)
  const override = local ? new URLSearchParams(location.search).get('api') : ''
  return override || API_URL
}

export const botLink = (start) => `https://t.me/${BOT_USERNAME}${start ? `?start=${encodeURIComponent(start)}` : ''}`
