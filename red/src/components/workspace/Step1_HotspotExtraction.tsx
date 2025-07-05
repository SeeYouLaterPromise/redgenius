import React, { useState } from 'react'
import { useWorkflowStore } from '../../store/workflowStore'
import { fetchHotspots } from '../../services/contentService'

// 模拟API调用
const fetchHotspots_fake = async (
  content: string
): Promise<{ hotspots: string[] }> => {
  console.log('正在模拟调用AI，分析文本:', content)
  return new Promise((resolve) =>
    setTimeout(() => {
      const simulatedHotspots = [
        '“新中式”不是复古，是年轻人的文化觉醒',
        '从盘扣到马面裙：被“魔改”的传统元素有多香？',
        '社交媒体如何让“新中式”从圈地自萌走向大众流行？',
        '设计密码：当东方美学遇上现代剪裁',
        '万元高定vs百元淘宝：普通人如何驾驭新中式',
        '穿上新中式，我被同事们追问了八百遍链接',
        '停止内耗：新中式给足了打工人的松弛感',
      ]
      resolve({ hotspots: simulatedHotspots })
    }, 2000)
  )
}

function Step1_HotspotExtraction() {
  const {
    sourceText,
    hotspots,
    setHotspots,
    addHotspot,
    deleteHotspot,
    updateHotspotText,
  } = useWorkflowStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const response = await fetchHotspots(sourceText)
      setHotspots(response.hotspots)
    } catch (error) {
      console.error('提炼爆点失败:', error)
      alert(`提炼失败: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-gray-50 p-6 rounded-lg border h-full">
        <h3 className="text-lg font-semibold border-b pb-2 mb-2 text-gray-800">
          原文素材
        </h3>
        <div className="prose prose-sm max-w-none max-h-[60vh] overflow-y-auto text-gray-700">
          <p>{sourceText}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center border-b pb-1 mb-4">
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
                  value={spot.text}
                  onChange={(e) => updateHotspotText(spot.id, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-300 focus:border-red-500 transition text-base"
                />
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
          <button
            onClick={addHotspot}
            className="w-full text-center p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-400 hover:text-red-500 transition">
            + 添加新爆点
          </button>
        </div>
      </div>
    </div>
  )
}

export default Step1_HotspotExtraction
