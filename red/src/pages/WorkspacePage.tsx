import { useWorkflowStore } from '../store/workflowStore'
import { Link } from 'react-router-dom'
import Step1_HotspotExtraction from '../components/workspace/Step1_HotspotExtraction'
import Step2_CopyGeneration from '../components/workspace/Step2_CopyGeneration'
import Step3_Design from '../components/workspace/Step3_Design'

// 步骤一、二、三的组件引用保持不变
// ...

// 这是一个新的、更美观的步骤指示器组件
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
              // 已完成的步骤
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
              // 当前步骤
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
              // 未完成的步骤
              <>
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400"></div>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// 主页面组件
function WorkspacePage() {
  const { currentStep, nextStep, prevStep } = useWorkflowStore()

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
      {/* 简单的顶部导航，提供返回工作台的链接 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link
            to="/"
            className="text-sm font-semibold text-gray-600 hover:text-red-500">
            ← 返回工作台
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {/* 步骤指示器 */}
        <div className="mb-12 flex justify-center">
          <Stepper currentStep={currentStep - 1} />
        </div>

        {/* 渲染当前步骤的“舞台” */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg min-h-[500px]">
          {renderStep()}
        </div>

        {/* 底部导航按钮 */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-800 rounded-full font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            上一步
          </button>

          {currentStep === 3 ? (
            <Link
              to="/review/0" // 我们暂时硬编码跳转到第一篇笔记的预览页
              className="px-8 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
              完成并预览
            </Link>
          ) : (
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
              下一步
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

export default WorkspacePage
