/// <reference types="vite/client" />
export default defineConfig({
  server: {
    proxy: {
      '/login': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/publish': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/fetch-url': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },  
      '/summary-content': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  }
  });

// 新增：fetchUrlContent 返回类型声明（如有需要）
// declare module '../apiService' {
//   export function fetchUrlContent(url: string): Promise<{summary: string, highlight?: string, url?: string}>;
// }