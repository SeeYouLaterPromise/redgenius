import React, { useState, useEffect } from 'react'
import { useWorkflowStore } from '../../store/workflowStore'

// 模板类型定义
type Template = '简约白' | '杂志风' | '干货清单'

// 模拟根据笔记内容和模板生成图片URL的函数
const generateImages = (
  noteTitle: string,
  template: Template
): Promise<string[]> => {
  console.log(`模拟为【${noteTitle}】使用【${template}】模板生成图片...`)
  return new Promise((resolve) => {
    setTimeout(() => {
      const baseImageUrl = 'https://placehold.co/400x560'
      const templates = {
        简约白: { bg: 'F3F4F6', text: '333333' },
        杂志风: { bg: '333333', text: 'FFFFFF' },
        干货清单: { bg: 'FEFCE8', text: '4B5563' },
      }
      const { bg, text } = templates[template]

      // 根据标题和模板动态生成图片链接
      const urls = Array.from({ length: 4 }).map(
        (_, i) =>
          `${baseImageUrl}/${bg}/${text}?text=${encodeURIComponent(
            noteTitle
          )}\\n\\nPage ${i + 1}\\nTemplate: ${template}`
      )
      resolve(urls)
    }, 1000) // 模拟1秒生成时间
  })
}

function Step3_Design() {
  const { notes, setNoteImages } = useWorkflowStore()
  const [selectedNoteId, setSelectedNoteId] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<Template>('简约白')
  const [isLoading, setIsLoading] = useState(false)

  const selectedNote = notes.find((n) => n.id === selectedNoteId)

  // 当选中的笔记或模板变化时，自动触发图片生成
  useEffect(() => {
    if (selectedNote) {
      setIsLoading(true)
      generateImages(selectedNote.title, selectedTemplate).then((urls) => {
        setNoteImages(selectedNoteId, urls)
        setIsLoading(false)
      })
    }
  }, [selectedNoteId, selectedTemplate, selectedNote, setNoteImages])

  return (
    <div className="grid grid-cols-12 gap-6 h-[70vh]">
      {/* 左侧：笔记列表 */}
      <div className="col-span-3 bg-gray-50 p-4 rounded-lg overflow-y-auto">
        <h4 className="font-semibold mb-3 text-gray-800">选择笔记</h4>
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
              className={`block p-3 rounded-md cursor-pointer ${
                selectedNoteId === note.id
                  ? 'bg-red-100 border-l-4 border-red-500'
                  : 'hover:bg-gray-200'
              }`}>
              <p
                className={`font-semibold text-sm ${
                  selectedNoteId === note.id ? 'text-red-700' : 'text-gray-500'
                }`}>
                笔记 {note.id + 1}
              </p>
              <p className="text-sm text-gray-800 truncate">{note.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧：图片预览与模板选择 */}
      <div className="col-span-9">
        {/* 模板选择器 */}
        <div className="flex space-x-2 mb-4">
          {(['简约白', '杂志风', '干货清单'] as Template[]).map((template) => (
            <button
              key={template}
              onClick={() => setSelectedTemplate(template)}
              className={`px-4 py-2 text-sm font-semibold rounded-full ${
                selectedTemplate === template
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
              {template}
            </button>
          ))}
        </div>

        {/* 图片预览区 */}
        <div className="bg-gray-100 p-4 rounded-lg h-[calc(100%-40px)] overflow-y-auto">
          {isLoading && (
            <p className="text-center text-gray-500">图片生成中...</p>
          )}
          {!isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedNote?.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Page ${index + 1}`}
                  className="rounded-lg shadow-md w-full"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step3_Design
