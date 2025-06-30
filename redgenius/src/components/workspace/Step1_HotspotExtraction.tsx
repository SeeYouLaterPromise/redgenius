import React, { useState } from 'react'
import { useWorkflowStore } from '../../store/workflowStore'

// 模拟API调用的函数保持不变
const fetchHotspotsFromAI = (text: string): Promise<string[]> => {
  console.log('正在模拟调用AI，分析文本:', text)
  return new Promise((resolve) => {
    setTimeout(() => {
      const simulatedHotspots = [
        '“新中式”不是复古，是年轻人的文化觉醒',
        '从盘扣到马面裙：被"魔改"的传统元素有多香？',
        '社交媒体如何让"新中式"从圈地自萌走向大众流行？',
        '设计密码：当东方美学遇上现代剪裁',
        '万元高定vs百元淘宝：普通人如何驾驭新中式',
        '穿上新中式，我被同事们追问了八百遍链接',
        '停止内耗：新中式给足了打工人的松弛感',
      ]
      console.log('模拟AI处理完成，返回爆点。')
      resolve(simulatedHotspots)
    }, 2000)
  })
}

function Step1_HotspotExtraction() {
  const { sourceText, hotspots, setHotspots, deleteHotspot, addHotspot } =
    useWorkflowStore()
  const [isLoading, setIsLoading] = useState(false)

  // 跳转到dashboardpage
  const handleBack = () => {
    window.location.href = '/dashboard';
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    const generatedHotspots = await fetchHotspotsFromAI(sourceText)
    setHotspots(generatedHotspots)
    setIsLoading(false)
  }

  return (
    <div>
      {/* 顶部返回按钮 */}
      <div className="mb-3">
        <button
          className="px-5 py-2 rounded-full bg-gradient-to-r from-[#FF2D5C] to-[#FF5C8A] text-white font-bold shadow hover:scale-105 transition-all"
          onClick={handleBack}
        >
          返回提交台
        </button>
      </div>
      {/* 主体内容 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
        {/* 左侧：原文素材，增加背景色和内边距 */}
        <div className="bg-gray-50 p-4 rounded-lg border h-full">
          <h3 className="text-lg font-semibold border-b pb-2 mb-2 text-gray-800">
            原文素材
          </h3>
          <div className="prose prose-sm max-w-none max-h-[60vh] overflow-y-auto text-gray-700">
            <h4>为什么现在的年轻人都爱上了"新中式"穿搭？</h4>
            <p>{sourceText}</p>
            <p>
              近年来，一股"新中式"美学风潮席卷了整个时尚圈。从明星红毯到日常街拍，随处可见将传统元素与现代剪裁巧妙融合的服饰。它不再是过去那种刻板、老气的印象，而是转化为一种更符合现代审美的、充满文化自信的表达方式。
            </p>
          </div>
        </div>
        {/* 右侧：AI提炼的爆点 */}
        <div className="p-4 h-full">
          <div className="flex justify-between items-center border-b pb-1 mb-1">
            <h3 className="text-lg font-semibold text-gray-800">
              AI提炼的爆点 ({hotspots.length})
            </h3>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-red-500 text-white text-sm px-4 py-2 rounded-full font-semibold hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed flex items-center transition-all duration-300">
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  生成中...
                </>
              ) : (
                '✨ 一键生成爆点'
              )}
            </button>
          </div>
          <div className="space-y-3">
            {hotspots.length > 0 ? (
              hotspots.map((spot) => (
                <div key={spot.id} className="flex items-center group">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 cursor-grab mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  <input
                    type="text"
                    defaultValue={spot.text}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-300 focus:border-red-500 transition text-base"
                  />
                  {/* 为删除按钮添加onClick事件 */}
                  <button
                    onClick={() => deleteHotspot(spot.id)}
                    className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                <p>点击右上方按钮，开始生成爆点</p>
              </div>
            )}
            {/* --- 新增的按钮 --- */}
            <button
              onClick={addHotspot}
              className="w-full text-center p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-400 hover:text-red-500 transition">
              + 添加新爆点
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step1_HotspotExtraction
