import { useParams, Link } from 'react-router-dom'
import { useWorkflowStore } from '../store/workflowStore'
import React, { useState, useEffect } from 'react'
// import { publishToXHSJson } from '../apiService'; // 导入真实的发布API

// 模拟发布API
const publishToXHSJson = async (payload: any): Promise<void> => {
  console.log('正在模拟调用 xhs-toolkit 发布...', payload)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 模拟50%的成功率
      if (Math.random() > 0.5) {
        console.log('模拟发布成功！')
        resolve()
      } else {
        console.log('模拟发布失败！')
        reject(new Error('网络超时或Cookie失效（模拟）'))
      }
    }, 2000)
  })
}

function ReviewPage() {
  const { noteId } = useParams<{ noteId: string }>()
  const { notes, updateNote } = useWorkflowStore()

  const originalNote = notes.find((n) => n.id === Number(noteId))

  // 使用本地state来管理编辑，避免每次输入都触发全局更新，提高性能
  const [editableNote, setEditableNote] = useState(originalNote)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // 当原始笔记数据变化时（例如从store加载完成），同步到本地可编辑状态
  useEffect(() => {
    setEditableNote(originalNote)
  }, [originalNote])

  if (!editableNote) {
    return (
      <div className="p-8 text-center text-red-500">
        错误：找不到指定的笔记！
      </div>
    )
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setEditableNote((prev) => (prev ? { ...prev, [name]: value } : undefined))
  }

  const handleHashtagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableNote((prev) =>
      prev ? { ...prev, hashtags: e.target.value.split(' ') } : undefined
    )
  }

  const handleSaveChanges = () => {
    if (editableNote) {
      updateNote(editableNote.id, {
        title: editableNote.title,
        content: editableNote.content,
        hashtags: editableNote.hashtags,
      })
      alert('修改已保存到全局状态！')
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      // 在发布前，先保存最后一次修改
      handleSaveChanges()
      // 等待一小会儿，确保状态已更新
      await new Promise((res) => setTimeout(res, 100))

      // 使用最新的note数据进行发布
      const noteToPublish = useWorkflowStore
        .getState()
        .notes.find((n) => n.id === Number(noteId))
      if (!noteToPublish) throw new Error('找不到最新的笔记数据！')

      await publishToXHSJson({
        title: noteToPublish.title,
        content: noteToPublish.content,
        topics: noteToPublish.hashtags,
        images: noteToPublish.imageUrls,
        location: '', // 未来可以增加地点输入框
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || '发布失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link
            to="/workspace"
            className="text-sm font-semibold text-gray-600 hover:text-red-500">
            ← 返回创作区
          </Link>
          <h1 className="text-xl font-bold">最终预览与发布</h1>
          <div style={{ width: '80px' }}></div> {/* 占位使标题居中 */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-lg shadow space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                笔记标题
              </label>
              <input
                type="text"
                name="title"
                value={editableNote.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-lg p-2 focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                正文内容
              </label>
              <textarea
                name="content"
                rows={18}
                value={editableNote.content}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 leading-relaxed text-base focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                话题标签 (用空格分隔)
              </label>
              <input
                type="text"
                name="hashtags"
                value={editableNote.hashtags.join(' ')}
                onChange={handleHashtagsChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-red-300"
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-4">
                配图预览 ({editableNote.imageUrls.length}张)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {editableNote.imageUrls.map((url, index) => (
                  <div
                    key={index}
                    className="aspect-[3/4] bg-gray-200 rounded-lg shadow-md overflow-hidden">
                    <img
                      src={url}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-4">发布操作</h4>
              <div className="space-y-4">
                <button
                  onClick={handleSaveChanges}
                  className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 flex items-center justify-center text-lg transition-all">
                  保存修改
                </button>
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="w-full bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 flex items-center justify-center text-lg transition-all disabled:opacity-50">
                  {loading ? '发布中...' : '🚀 立即发布到小红书'}
                </button>
              </div>
              {error && (
                <div className="mt-4 text-center text-red-500 bg-red-100 p-3 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 text-center text-green-500 bg-green-100 p-3 rounded-lg">
                  发布成功！
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ReviewPage
