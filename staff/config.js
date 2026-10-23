/**
 * Address of the check-in service the staff page talks to (for example the
 * ticket bot's Apps Script web app, ending in /exec). See README section 6c for
 * the actions it must answer.
 *
 * This address is not a secret: the service only answers requests that carry a
 * valid staff login. Set it here or as VITE_CHECKIN_API_URL in Vercel.
 */
export const CHECKIN_API_URL = import.meta.env.VITE_CHECKIN_API_URL ?? ''

/**
 * Until CHECKIN_API_URL is set, the page runs in preview mode: sample tickets,
 * a demo login, and nothing is sent to or saved in the ticket database.
 */
export const DEMO_MODE = !CHECKIN_API_URL
