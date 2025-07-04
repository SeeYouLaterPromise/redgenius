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
      '/fetch': 'http://localhost:8000',
      '/summary': 'http://localhost:8000',
      "/hotspot": "http://localhost:8000",
      "/xhscontent": "http://localhost:8000",
      "/xhsimage": "http://localhost:8000",
      "/autopublish": "http://localhost:8000",
    }
  }
})
