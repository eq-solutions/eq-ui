import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only kitchen-sink preview (`npm run dev`) — not part of the published
// package. The library itself ships raw source with no build step; this is
// purely a local visual-review harness for `demo/`.
export default defineConfig({
  root: 'demo',
  plugins: [react()],
})
