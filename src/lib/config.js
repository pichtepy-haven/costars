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
