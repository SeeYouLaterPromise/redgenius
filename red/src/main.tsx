import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- 1. 导入 BrowserRouter
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {' '}
      {/* <-- 2. 用 BrowserRouter 包裹 App 组件 */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
