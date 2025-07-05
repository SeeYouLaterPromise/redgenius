import { Link, useNavigate } from 'react-router-dom'
import React, { useState } from 'react'
import type { ChangeEvent } from 'react' // 引入ChangeEvent来为事件提供类型
import { useWorkflowStore } from '../store/workflowStore'

// 模拟API调用函数保持不变
const fetchUrlContent = async (url: string): Promise<{ summary: string }> => {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          summary: `---已成功提取URL: ${url} 的核心内容---\n这是智能提取后的结果...`,
        }),
      1500
    )
  )
}
const fetchSummaryContent = async (
  content1: string,
  content2: string
): Promise<{ summary: string }> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      const result =
        content1 && content2
          ? `---AI智能整合---\n热点素材：${content1.substring(
              0,
              50
            )}...\n---\n我的素材：${content2.substring(
              0,
              50
            )}...\n---整合完毕---`
          : content1 || content2
      resolve({ summary: result })
    }, 1000)
  )
}

// Header组件与之前一致
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
  const { dashboardState, updateDashboardState, setSourceText } =
    useWorkflowStore()
  const { importedContent, urlCrawlResult, urlLoading, chatResult, summary } =
    dashboardState

  const [summaryLoading, setSummaryLoading] = useState(false)
  const navigate = useNavigate()

  const trendingTopics = [
    {
      id: 1,
      category: '社会热点',
      title: '为什么现在的年轻人都爱上了"新中式"穿搭？',
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

  const handleImportUrl = async () => {
    if (!importedContent.trim()) return
    updateDashboardState({ urlLoading: true, urlCrawlResult: '' })
    try {
      const res = await fetchUrlContent(importedContent.trim())
      updateDashboardState({ urlCrawlResult: res.summary || '未提取到内容' })
    } catch (e: any) {
      updateDashboardState({
        urlCrawlResult: '提取失败: ' + (e.message || '未知错误'),
      })
    } finally {
      updateDashboardState({ urlLoading: false })
    }
  }

  const handleUseTopic = (topicContent: string) => {
    updateDashboardState({
      chatResult: `关于“${topicContent}”的AI初步分析结果：这是一个极具潜力的话题...`,
    })
  }

  const handleSummary = async () => {
    const content1 = chatResult
    const content2 = urlCrawlResult || importedContent
    // ...汇总逻辑不变...
    if (!content1.trim() && !content2.trim()) {
      updateDashboardState({ summary: '暂无可汇总内容' })
      return
    }
    setSummaryLoading(true)
    try {
      const res = await fetchSummaryContent(content1, content2)
      updateDashboardState({ summary: res.summary || '未生成汇总' })
    } catch (e: any) {
      updateDashboardState({
        summary: '汇总失败: ' + (e.message || '未知错误'),
      })
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleGoToWorkspace = () => {
    const finalContent = useWorkflowStore.getState().dashboardState.summary
    if (!finalContent.trim()) {
      alert('请先汇总并确认最终素材！')
      return
    }
    setSourceText(finalContent)
    navigate('/workspace')
  }

  // --- 新增：处理文件上传的函数 ---
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    // 检查文件类型
    if (file.type !== 'text/plain') {
      alert('请上传 .txt 格式的文本文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      // 将读取到的内容更新到importedContent和urlCrawlResult中
      // updateDashboardState({ importedContent: text, urlCrawlResult: text })
      updateDashboardState({ urlCrawlResult: text })
    }
    reader.onerror = (e) => {
      console.error('文件读取失败:', e)
      alert('文件读取失败！')
    }
    reader.readAsText(file)
  }

  return (
    // --- 核心改动：严格使用原型中的浅灰色背景 ---
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">开始新的内容创作</h2>
          <p className="text-gray-500 mt-2">
            选择一个热点话题获取灵感，或导入您自己的素材开始创作。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ① 发现热点选题 */}
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
                    <button
                      onClick={() => handleUseTopic(topic.title)}
                      className="bg-red-500 text-white text-sm px-3 py-1 rounded-full hover:bg-red-600 whitespace-nowrap">
                      用此选题
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ② 导入我的素材 */}
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
                    value={importedContent}
                    onChange={(e) =>
                      updateDashboardState({ importedContent: e.target.value })
                    }
                  />
                  <button
                    onClick={handleImportUrl}
                    disabled={urlLoading}
                    className="cursor-pointer inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm hover:bg-gray-200 disabled:opacity-50">
                    {urlLoading ? '提取中...' : '智能提取'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  或上传本地文档
                </label>
                {/* --- 新增：文件上传的UI和逻辑 --- */}
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
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
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                        <span>点击上传</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".txt"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="pl-1">或拖拽文件到此处</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      仅支持 .txt 格式文件
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ③ 素材整合与预览 (与原型保持一致，不再有单独的“汇总”容器) */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold border-b pb-3 mb-4 text-center">
            ③ 素材整合与预览
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                热点/AI生成素材预览
              </label>
              <textarea
                className="w-full h-40 border rounded-md bg-gray-100 p-3"
                value={chatResult}
                onChange={(e) =>
                  updateDashboardState({ chatResult: e.target.value })
                }
                // readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                我的素材预览
              </label>
              <textarea
                className="w-full h-40 border rounded-md bg-gray-100 p-3"
                // value={urlCrawlResult || importedContent}
                value={urlCrawlResult}
                onChange={(e) =>
                  updateDashboardState({ urlCrawlResult: e.target.value })
                }
                // readOnly
              />
            </div>
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={handleSummary}
              disabled={summaryLoading}
              className="mb-2 px-8 py-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-base font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100">
              {summaryLoading ? 'AI汇总中...' : 'AI智能汇总'}
            </button>
            <textarea
              className="w-full min-h-[180px] mt-2 border-2 border-dashed rounded-lg bg-green-50 p-4 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="这里将展示AI对以上所有内容的最终汇总结果，您可以直接在此编辑..."
              value={summary}
              onChange={(e) =>
                updateDashboardState({ summary: e.target.value })
              }
            />
          </div>
        </div>

        {/* --- 进入创作空间按钮 --- */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleGoToWorkspace}
            className="w-full max-w-7xl px-4 py-3 rounded-xl bg-gray-800 text-white text-lg font-bold shadow-lg hover:bg-black hover:scale-[1.01] transition-all">
            ✅ 素材准备就绪，开启AI创作之旅 →
          </button>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
