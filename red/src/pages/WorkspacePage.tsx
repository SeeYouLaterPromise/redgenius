import React, { useState } from 'react'
import { useWorkflowStore } from '../store/workflowStore'
import { Link, useNavigate } from 'react-router-dom'

// 1. 从正确的路径导入所有步骤组件
import Step1_HotspotExtraction from '../components/workspace/Step1_HotspotExtraction'
import Step2_CopyGeneration from '../components/workspace/Step2_CopyGeneration'
import Step3_Design from '../components/workspace/Step3_Design'

// 模拟后端/xhs-content-generator接口
const generateXHSContent = async (
  hotspots: string[]
): Promise<{ title: string; content: string; topics: string[] }[]> => {
  console.log('正在调用/xhs-content-generator接口，hotspots:', hotspots)
  return new Promise((resolve) =>
    setTimeout(() => {
      const results = hotspots.map((h) => ({
        title: `AI为“${h.substring(0, 8)}...”生成的标题`,
        content: `这是关于“${h}”的详细小红书文案内容... \n\n它应该包含丰富的细节和吸引人的表达方式。`,
        topics: ['#AI创作', '#小红书爆款', '#内容神器'],
      }))
      console.log('API返回的文案数据:', results)
      resolve(results)
    }, 2000)
  )
}

function Stepper({ currentStep }: { currentStep: number }) {
  const steps = ['爆点提炼', '文案生成', '图文设计']
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((stepName, stepIdx) => (
          <li
            key={stepName}
            className={`relative ${
              stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
            }`}>
            {stepIdx < currentStep ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true">
                  <div className="h-0.5 w-full bg-red-500" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-red-500 hover:bg-red-600">
                  <svg
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </>
            ) : stepIdx === currentStep ? (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 bg-white">
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-red-500"
                    aria-hidden="true"
                  />
                </div>
                <span className="absolute top-10 text-sm font-semibold text-red-500">
                  {stepName}
                </span>
              </>
            ) : (
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400" />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

function WorkspacePage() {
  const {
    currentStep,
    hotspots,
    setNotes,
    nextStep,
    prevStep,
    selectedNoteIdForReview,
  } = useWorkflowStore()
  const [isStepLoading, setIsStepLoading] = useState(false)
  const navigate = useNavigate()

  const handleNextStep = async () => {
    if (currentStep === 1) {
      setIsStepLoading(true)
      try {
        const hotspotTexts = hotspots.map((h) => h.text)
        if (hotspotTexts.length === 0) {
          alert('请至少生成或添加一个爆点！')
          setIsStepLoading(false)
          return
        }
        const notesData = await generateXHSContent(hotspotTexts)
        setNotes(notesData)
        nextStep()
      } catch (error) {
        console.error('生成小红书文案失败:', error)
        alert(`生成文案时出错，请稍后重试。`)
      } finally {
        setIsStepLoading(false)
      }
    } else {
      nextStep()
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_HotspotExtraction />
      case 2:
        return <Step2_CopyGeneration />
      case 3:
        return <Step3_Design />
      default:
        return <Step1_HotspotExtraction />
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-gray-600 hover:text-red-500">
            ← 返回工作台
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="mb-12 flex justify-center">
          <Stepper currentStep={currentStep - 1} />
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg min-h-[500px] flex items-center justify-center">
          {isStepLoading ? (
            <div className="text-center text-gray-500">
              <p className="text-lg font-semibold">
                🚀 正在调用AI为您生成所有爆点的文案...
              </p>
              <p className="text-sm mt-2">这个过程可能需要一点时间，请稍候。</p>
            </div>
          ) : (
            renderStep()
          )}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isStepLoading}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-800 rounded-full font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            上一步
          </button>

          {currentStep === 3 ? (
            <button
              onClick={() => {
                if (selectedNoteIdForReview !== null) {
                  // 跳转到当前选中的那篇笔记的预览页
                  navigate(`/review/${selectedNoteIdForReview}`)
                } else {
                  alert('请先在左侧选择一篇需要预览的笔记！')
                }
              }}
              className="px-8 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
              完成并预览当前笔记
            </button>
          ) : (
            <button
              onClick={handleNextStep}
              disabled={isStepLoading}
              className="px-8 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:scale-100">
              {isStepLoading ? 'AI处理中...' : '下一步'}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

export default WorkspacePage
