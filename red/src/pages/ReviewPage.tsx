import { useParams } from 'react-router-dom'
import { useWorkflowStore } from '../store/workflowStore'

function ReviewPage() {
  // 从URL中获取笔记的ID，例如 /review/0 -> noteId为'0'
  const { noteId } = useParams()
  const notes = useWorkflowStore((state) => state.notes)

  // 根据ID找到对应的笔记，注意类型转换
  const noteToReview = notes.find((n) => n.id === Number(noteId))

  if (!noteToReview) {
    return (
      <div className="p-8 text-center text-red-500">
        错误：找不到指定的笔记！
      </div>
    )
  }

  const handlePublish = () => {
    console.log('准备发布以下笔记到小红书:', noteToReview)
    alert('发布请求已发送！(这是模拟操作，请在浏览器控制台查看详情)')
    // 在真实项目中，这里会调用apiService来向后端发送发布请求
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm">
        <h1 className="text-xl font-bold text-center py-4">最终预览与发布</h1>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* 左侧：内容编辑区 */}
          <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-lg shadow space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                笔记标题
              </label>
              <input
                type="text"
                defaultValue={noteToReview.title}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                正文内容
              </label>
              <textarea
                rows={18}
                defaultValue={noteToReview.content}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-4 leading-relaxed text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                话题标签
              </label>
              <input
                type="text"
                defaultValue={noteToReview.hashtags}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>

          {/* 右侧：图片预览与发布操作 */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-4">
                配图预览 ({noteToReview.imageUrls.length}张)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {noteToReview.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Page ${index + 1}`}
                    className="rounded-lg shadow-md w-full"
                  />
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-4">发布操作</h4>
              <button
                onClick={handlePublish}
                className="w-full bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 flex items-center justify-center text-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                立即发布到小红书
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ReviewPage
