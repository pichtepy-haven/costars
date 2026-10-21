/**
 * Show dashed “To supply: …” labels for content that hasn't been provided yet.
 * On by default in development (npm run dev) and off on the live site, where
 * missing optional content is simply hidden.
 * To preview placeholders on a deployed copy (e.g. a Vercel preview), set the
 * environment variable VITE_SHOW_PLACEHOLDERS=true for that deployment.
 */
export const SHOW_PLACEHOLDERS =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_PLACEHOLDERS === 'true'

/** Agenda item that is open when the guide first loads (unless an item is live). */
export const DEFAULT_EXPANDED_ID = 'welcome'

/**
 * Google Sheet the guide reads its text from (see src/lib/sheetContent.js).
 * The ID is the long code in the sheet's address:
 *   https://docs.google.com/spreadsheets/d/<THIS PART>/edit
 * Sheet: “CoStars Event Guide - Live Content” (Google Drive of pichtepynov@gmail.com).
 * Set VITE_CONTENT_SHEET_ID to an empty value to use only src/data.js.
 */
export const CONTENT_SHEET_ID =
  import.meta.env.VITE_CONTENT_SHEET_ID ?? '1I2r3_1y2eZtx3FM-kw-_2IcoXnlMXibo6SOTXR8VYXU'
