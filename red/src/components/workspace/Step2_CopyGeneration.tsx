import React, { useState, useEffect } from 'react'
import { useWorkflowStore } from '../../store/workflowStore'
import type { Note } from '../../store/workflowStore'

// 主组件
function Step2_CopyGeneration() {
  // 从全局store中获取所需的状态和action
  const { hotspots, notes, updateNote } = useWorkflowStore()

  // --- 核心修正 #1：正确地初始化 selectedNoteId ---
  // 我们不再使用简单的索引0，而是使用笔记列表中的第一个笔记的真实ID。
  // 如果笔记列表为空，则为null。
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(
    notes.length > 0 ? notes[0].id : null
  )

  // 当notes数据从API加载进来后，确保我们选中了第一条
  useEffect(() => {
    if (notes.length > 0 && selectedNoteId === null) {
      setSelectedNoteId(notes[0].id)
    }
  }, [notes, selectedNoteId])

  // 根据选中的ID，从笔记数组中找到对应的笔记对象
  const selectedNote = notes.find((n) => n.id === selectedNoteId)

  // 处理输入框和文本域变化的通用函数
  const handleNoteChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (selectedNoteId === null) return
    const { name, value } = e.target

    // --- 核心修正 #2：正确处理hashtags ---
    // 如果是hashtags输入框，我们将字符串转换回数组
    if (name === 'hashtags') {
      updateNote(selectedNoteId, { [name]: value.split(' ') })
    } else {
      updateNote(selectedNoteId, { [name]: value })
    }
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-[70vh]">
      {/* 左侧：爆点大纲/笔记导航 */}
      <div className="col-span-4 bg-gray-50 p-4 rounded-lg overflow-y-auto border">
        <h4 className="font-semibold mb-3 text-gray-800">笔记大纲</h4>
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              // --- 核心修正 #3：使用note.id来设置选中的ID ---
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
                {note.hotspotText}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧：文案编辑器 */}
      <div className="col-span-8">
        {!selectedNote ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-400">正在加载文案...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                标题
              </label>
              <input
                type="text"
                name="title"
                value={selectedNote.title}
                onChange={handleNoteChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-300 focus:border-red-500 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                正文
              </label>
              <textarea
                name="content"
                rows={12}
                value={selectedNote.content}
                onChange={handleNoteChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-300 focus:border-red-500 p-3 leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                话题标签 (用空格分隔)
              </label>
              <input
                type="text"
                name="hashtags"
                // --- 核心修正 #4：将hashtags数组用空格连接成字符串来显示 ---
                value={
                  Array.isArray(selectedNote.hashtags)
                    ? selectedNote.hashtags.join(' ')
                    : ''
                }
                onChange={handleNoteChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-300 focus:border-red-500 p-2"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Step2_CopyGeneration
