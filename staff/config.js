/**
 * Address of the CoStars bot (Google Apps Script web app, ends with /exec): it checks staff
 * logins against the Staff tab of the bot's Google Sheet and checks tickets in. The same address
 * as API_URL in public/ticketing/config.js.
 *
 * This address is not a secret: the bot only answers requests that carry a valid staff login.
 * VITE_CHECKIN_API_URL in Vercel can point the page somewhere else.
 */
export const CHECKIN_API_URL =
  import.meta.env.VITE_CHECKIN_API_URL ||
  'https://script.google.com/macros/s/AKfycbxDjlZVrm8ES8CAyFfK9L_XqEbMP5ijyTeGxhsYZRyy4pEJFIYb5qu68gtQXIRRGxQe/exec'
