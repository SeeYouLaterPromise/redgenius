import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import WorkspacePage from './pages/WorkspacePage'
import ReviewPage from './pages/ReviewPage'
import HomePage from './pages/HomePage' // 新增这一行

function App() {
  return (
    <div>
      {/* 这里可以放置全局共享的组件，比如网站的顶部导航栏 */}
      {/* <Header /> */}

      <Routes>
        {/* 首页路由，显示你设计的首页 */}
        <Route path="/" element={<HomePage />} />

        {/* 仪表盘页面改为 /dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* 创作区路径'/workspace'，显示创作区页面 */}
        <Route path="/workspace" element={<WorkspacePage />} />

        {/* 发布预览路径，例如'/review/123'，显示发布预览页面 */}
        <Route path="/review/:noteId" element={<ReviewPage />} />
      </Routes>
    </div>
  )
}

export default App