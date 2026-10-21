import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Absolute site URL for the social-preview tags in index.html (og:image must be
// a full URL). On Vercel it is filled in automatically from the project's
// production domain. Elsewhere, set SITE_URL when building, e.g.
//   SITE_URL=https://guide.example.com npm run build
// If neither is available the tags fall back to relative paths.
const siteUrl = (() => {
  const raw = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || ''
  if (!raw) return ''
  return (/^https?:\/\//.test(raw) ? raw : `https://${raw}`).replace(/\/+$/, '')
})()

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'costars-site-url',
      transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
    },
  ],
})
