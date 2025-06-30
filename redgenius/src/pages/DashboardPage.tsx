import { Link } from 'react-router-dom'
import React, { useState } from 'react';

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

  // 新增：用户导入素材和聊天相关状态
  const [importedContent, setImportedContent] = useState(''); // 用户导入素材
  const [chatInput, setChatInput] = useState(''); // 聊天框输入
  const [chatResult, setChatResult] = useState(''); // AI返回内容
  const [selectedTopic, setSelectedTopic] = useState(''); // 当前选中的热点选题
  const [summary, setSummary] = useState(''); // 汇总内容
  type Topic = {
    id: string | number;
    category: string;
    title: string;
    source: string;
    color: string;
  };
  const [customTopic, setCustomTopic] = useState<Topic | null>(null);

  // 模拟API调用（可替换为真实后端API）
  const callAIApi = async (input: string): Promise<string> => {
    // 这里用setTimeout模拟异步API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`【AI大模型返回】关于"${input}"的内容生成结果。`);
      }, 1000);
    });
  };

  // 用此选题按钮点击
  const handleUseTopic = async (topicTitle: string) => {
    setSelectedTopic(topicTitle);
    setChatInput(topicTitle);
    setChatResult('');
    // 自动调用AI
    const aiRes = await callAIApi(topicTitle);
    setChatResult(aiRes);
  };

  // 聊天框发送
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    setChatResult('');
    const aiRes = await callAIApi(chatInput);
    setChatResult(aiRes);
  };

  // 汇总按钮点击
  const handleSummary = () => {
    const parts = [];
    if (selectedTopic) parts.push(`【热点选题】${selectedTopic}`);
    if (importedContent) parts.push(`【导入素材】${importedContent}`);
    if (chatResult) parts.push(`【AI结果】${chatResult}`);
    setSummary(parts.length ? parts.join('\n\n') : '暂无可汇总内容');
  };

  // 新增自定义热点
  const handleAddCustomTopic = async () => {
    const title = window.prompt('请输入自定义热点标题：');
    if (title && title.trim()) {
      setCustomTopic({
        id: 'custom',
        category: '自定义',
        title: title.trim(),
        source: '自定义',
        color: 'bg-purple-100 text-purple-600',
      });
    }
  };

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
          <div className="bg-white p-6 rounded-lg shadow relative">
            <div className="flex items-center justify-between border-b pb-3 mb-2">
              <h3 className="text-lg font-semibold flex items-center">
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
              <button
                className="px-3 py-1 rounded-full bg-gradient-to-r from-[#FF2D5C] to-[#FF5C8A] text-white text-sm font-bold shadow hover:scale-105 transition-all"
                onClick={handleAddCustomTopic}
              >
                + 自定义热点
              </button>
            </div>
            <div className="mt-2 space-y-4 max-h-96 overflow-y-auto pr-2">
              {/* 自定义热点优先展示 */}
              {customTopic && (
                <div
                  key={customTopic.id}
                  className="border p-4 rounded-md hover:shadow-md transition-shadow bg-purple-50 flex flex-col gap-2 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span
                        className={`text-xs ${customTopic.color} px-2 py-1 rounded-full`}>
                        {customTopic.category}
                      </span>
                      <p className="font-bold mt-2">{customTopic.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        来源: {customTopic.source}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        className="bg-red-500 text-white text-sm px-3 py-1 rounded-full hover:bg-red-600 whitespace-nowrap mb-1"
                        onClick={() => handleUseTopic(customTopic.title)}
                      >
                        用此选题
                      </button>
                      <button
                        className="text-xs text-gray-400 hover:text-red-500 px-2"
                        title="删除"
                        onClick={() => setCustomTopic(null)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* 推荐热点 */}
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
                      className="bg-red-500 text-white text-sm px-3 py-1 rounded-full hover:bg-red-600 whitespace-nowrap"
                      onClick={() => handleUseTopic(topic.title)}
                    >
                      用此选题
                    </button>
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
                    value={importedContent}
                    onChange={e => setImportedContent(e.target.value)}
                  />
                  <button
                    className="cursor-pointer inline-flex items-center px-4 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 text-sm"
                    onClick={() => setImportedContent(importedContent)}
                  >
                    导入
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  或上传本地文档
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 focus:ring-red-500 focus:border-red-500"
                  placeholder="粘贴文档内容或描述..."
                  value={importedContent}
                  onChange={e => setImportedContent(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        {/* 汇总大容器 */}
        <div className="mt-12 flex flex-col items-center max-w-7xl mx-auto w-full">
          <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch">
            {/* 左侧：AI汇总 */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center">
              <h3 className="text-xl font-bold text-gray-800 mb-3">AI汇总</h3>
              <textarea
                className="w-full min-h-[120px] h-[140px] border border-gray-200 rounded-xl bg-gray-50 p-3 text-gray-700 focus:ring-2 focus:ring-red-100 focus:border-red-300 transition resize-none"
                placeholder="AI助手内容或结果..."
                value={chatResult}
                readOnly
              />
            </div>
            {/* 右侧：总汇总区 */}
            <div className="flex-[2] bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center">
              <button
                className="mb-2 px-6 py-1.5 rounded-full bg-gradient-to-r from-[#FF2D5C] to-[#FF5C8A] text-white text-base font-bold shadow hover:scale-105 transition-all mx-auto"
                onClick={handleSummary}
              >
                汇总
              </button>
              <textarea
                className="w-full min-h-[140px] h-[160px] border border-gray-200 rounded-xl bg-gray-50 p-4 text-lg text-gray-700 focus:ring-2 focus:ring-red-100 focus:border-red-300 transition resize-none"
                placeholder="这里会自动汇总上方输入的内容..."
                readOnly
                value={summary}
              />
            </div>
          </div>
        </div>
        {/* 进入创作空间按钮，宽度与上面对齐，整体居中 */}
        <div className="flex justify-center mt-10" style={{width:'100%'}}>
          <button
            className="w-full max-w-4xl px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2D5C] to-[#FF5C8A] text-white text-lg font-bold shadow hover:scale-105 transition-all"
            onClick={() => window.location.href = '/workspace'}
          >
            进入创作空间
          </button>
        </div>
        {/* 背景色优化 */}
        <style>{`body { background: #f7f8fa; }`}</style>
      </main>
    </div>
  )
}

export default DashboardPage
