// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs',
  },
  server: {
    proxy: {
      '/login': 'http://localhost:8000',
      '/publish': 'http://localhost:8000',
      '/fetch-url': 'http://localhost:8000',
      '/summary-content': 'http://localhost:8000',
    },
  },
})
