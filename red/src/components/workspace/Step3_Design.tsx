import React, { useState, useEffect } from 'react'
import { useWorkflowStore } from '../../store/workflowStore'

// 模板类型定义
type Template = '简约白' | '杂志风' | '干货清单' | '复古画报'

// 模拟API调用函数保持不变
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
        杂志风: { bg: '2d3748', text: 'edf2f7' },
        干货清单: { bg: 'fefce8', text: '4b5563' },
        复古画报: { bg: 'eab308', text: '422006' },
      }
      const { bg, text } = templates[template]

      const urls = Array.from({ length: 4 }).map(
        (_, i) =>
          `${baseImageUrl}/${bg}/${text}?text=${encodeURIComponent(
            noteTitle
          )}\\n\\nPage ${i + 1}\\nTemplate: ${template}`
      )
      resolve(urls)
    }, 1000)
  })
}

function Step3_Design() {
  const { notes, setNoteImages, setSelectedNoteIdForReview } =
    useWorkflowStore()

  // --- 核心修正 #1：正确地初始化 selectedNoteId ---
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(
    notes.length > 0 ? notes[0].id : null
  )
  const [selectedTemplate, setSelectedTemplate] = useState<Template>('简约白')
  const [isLoading, setIsLoading] = useState(false)

  const selectedNote = notes.find((n) => n.id === selectedNoteId)

  // --- 核心改动：使用useEffect来同步全局状态 ---
  useEffect(() => {
    // 每当本地选中的ID变化时，就更新到全局store中
    setSelectedNoteIdForReview(selectedNoteId)
  }, [selectedNoteId, setSelectedNoteIdForReview])

  // --- 核心修正 #2：使用useEffect来处理副作用和自动加载 ---
  useEffect(() => {
    // 当组件首次加载或notes数组变化时，确保选中第一条笔记
    if (notes.length > 0 && selectedNoteId === null) {
      setSelectedNoteId(notes[0].id)
    }

    // 当选中的笔记或模板变化时，自动触发图片生成
    if (selectedNote) {
      // 只有在当前笔记还没有此模板的图片时，才重新生成
      if (
        selectedNote.imageUrls.length === 0 ||
        !selectedNote.imageUrls[0].includes(selectedTemplate)
      ) {
        setIsLoading(true)
        generateImages(selectedNote.title, selectedTemplate).then((urls) => {
          if (selectedNoteId !== null) {
            // 确保ID不为null
            setNoteImages(selectedNoteId, urls)
          }
          setIsLoading(false)
        })
      }
    }
  }, [selectedNoteId, selectedTemplate, notes, setNoteImages, selectedNote])

  return (
    <div className="grid grid-cols-12 gap-6 h-[70vh]">
      {/* 左侧：笔记列表 */}
      <div className="col-span-3 bg-gray-50 p-4 rounded-lg overflow-y-auto border">
        <h4 className="font-semibold mb-3 text-gray-800">选择笔记</h4>
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
              className={`block p-3 rounded-md cursor-pointer transition-all duration-200 ${
                selectedNoteId === note.id
                  ? 'bg-red-100 border-l-4 border-red-500 shadow-sm'
                  : 'hover:bg-gray-200'
              }`}>
              <p
                className={`font-semibold text-sm ${
                  selectedNoteId === note.id ? 'text-red-700' : 'text-gray-500'
                }`}>
                笔记 {notes.findIndex((n) => n.id === note.id) + 1}/
                {notes.length}
              </p>
              <p className="text-sm text-gray-800 truncate">
                {note.title || '(无标题)'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧：图片预览与模板选择 */}
      <div className="col-span-9 flex flex-col">
        {/* 模板选择器 */}
        <div className="flex-shrink-0 flex items-center space-x-2 mb-4">
          <span className="text-sm font-semibold text-gray-600">选择风格:</span>
          {(['简约白', '杂志风', '干货清单', '复古画报'] as Template[]).map(
            (template) => (
              <button
                key={template}
                onClick={() => setSelectedTemplate(template)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                  selectedTemplate === template
                    ? 'bg-red-500 text-white shadow-md scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}>
                {template}
              </button>
            )
          )}
        </div>

        {/* 图片预览区 */}
        <div className="flex-grow bg-gray-100 border p-4 rounded-lg h-full overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 animate-pulse">
                🎨 魔法绘图中，请稍候...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedNote?.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="aspect-[3/4] bg-gray-200 rounded-lg shadow-md overflow-hidden group">
                  <img
                    src={url}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step3_Design
