/// <reference types="vite/client" />
export default defineConfig({
    server: {
      proxy: {
        '/login': 'http://localhost:8000'
      }
    }
  });