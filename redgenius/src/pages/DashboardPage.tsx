import { Link } from 'react-router-dom'

// 我们可以将Header保持为页面内部组件，因为它只在这里使用
function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-red-500">红书智作 (RedGenius)</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm">欢迎您, 小美</span>
          <img
            className="h-8 w-8 rounded-full"
            src="https://placehold.co/100x100/E91E63/white?text=M"
            alt="用户头像"
          />
        </div>
      </div>
    </header>
  )
}

function DashboardPage() {
  // 模拟从API获取的热点话题数据
  const trendingTopics = [
    {
      id: 1,
      category: '社会热点',
      title: '为什么现在的年轻人都爱上了“新中式”穿搭？',
      source: '知乎热榜',
      color: 'bg-red-100 text-red-600',
    },
    {
      id: 2,
      category: '科技风向',
      title: 'AI Agent将如何改变我们的工作流？',
      source: '36氪',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 3,
      category: '生活方式',
      title: '周末逃离城市：盘点5个小众宝藏露营地',
      source: '什么值得买',
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 4,
      category: '美食探店',
      title: '人均50元，探索城市角落的深夜食堂',
      source: '大众点评',
      color: 'bg-yellow-100 text-yellow-600',
    },
  ]

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <Header />

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">开始新的内容创作</h2>
          <p className="text-gray-500 mt-2">
            选择一个热点话题获取灵感，或导入您自己的素材开始创作。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：发现热点选题 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold border-b pb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              ① 发现热点选题
            </h3>
            <div className="mt-4 space-y-4 max-h-96 overflow-y-auto pr-2">
              {/* 我们在这里使用.map动态渲染热点话题卡片 */}
              {trendingTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="border p-4 rounded-md hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <span
                        className={`text-xs ${topic.color} px-2 py-1 rounded-full`}>
                        {topic.category}
                      </span>
                      <p className="font-bold mt-2">{topic.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        来源: {topic.source}
                      </p>
                    </div>
                    <Link
                      to="/workspace"
                      className="bg-red-500 text-white text-sm px-3 py-1 rounded-full hover:bg-red-600 whitespace-nowrap">
                      用此选题
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：导入我的素材 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold border-b pb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              ② 导入我的素材
            </h3>
            <div className="mt-4 space-y-6">
              <div>
                <label
                  htmlFor="url-input"
                  className="block text-sm font-medium text-gray-700">
                  通过URL导入
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="url-input"
                    className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 focus:ring-red-500 focus:border-red-500"
                    placeholder="https://example.com/your-story"
                  />
                  <Link
                    to="/workspace"
                    className="cursor-pointer inline-flex items-center px-4 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 text-sm">
                    导入
                  </Link>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  或上传本地文档
                </label>
                <Link
                  to="/workspace"
                  className="cursor-pointer mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-red-400">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true">
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <span className="relative bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                        <span>点击上传</span>
                      </span>
                      <p className="pl-1">或拖拽文件到此处</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      支持 .txt, .md, .docx, .pdf
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
