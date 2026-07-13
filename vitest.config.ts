import { defineConfig } from 'vitest/config'

// Minimal jsdom harness for component regression tests. The library ships raw
// .tsx (no build step); Vitest's default (oxc) transform handles the automatic
// JSX runtime, so no @vitejs/plugin-react is needed.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
