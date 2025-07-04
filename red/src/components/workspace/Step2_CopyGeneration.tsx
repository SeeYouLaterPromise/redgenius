import React, { useState, useEffect } from 'react'
import { useWorkflowStore } from '../../store/workflowStore'
import type { Note } from '../../store/workflowStore'

// 模拟AI生成文案的API调用
const fetchCopyFromAI = (hotspotText: string): Promise<Partial<Note>> => {
  console.log('模拟AI为爆点生成文案:', hotspotText)
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = {
        title: `听我的‼️“${hotspotText.slice(0, 10)}”才是流量密码`,
        content: `🏮家人们谁懂啊！今天聊的这个话题真的杀疯了！\n\n✨核心观点就是：${hotspotText}✨\n\n这一点真的说到了我的心坎里，原因有三：\n1️⃣ xxxxx\n2️⃣ yyyyy\n3️⃣ zzzzz\n\n姐妹们，你们怎么看？快来评论区聊聊！👇`,
      }
      console.log('AI文案生成完毕')
      resolve(result)
    }, 1500) // 模拟1.5秒处理时间
  })
}

function Step2_CopyGeneration() {
  const { hotspots, notes, updateNote } = useWorkflowStore()
  const [selectedNoteId, setSelectedNoteId] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // 当选中的笔记变化时，自动触发AI生成（如果内容为空）
  useEffect(() => {
    const currentNote = notes.find((n) => n.id === selectedNoteId)
    if (currentNote && !currentNote.content) {
      setIsLoading(true)
      fetchCopyFromAI(currentNote.hotspotText).then((generatedCopy) => {
        updateNote(selectedNoteId, generatedCopy)
        setIsLoading(false)
      })
    }
  }, [selectedNoteId, notes, updateNote])

  const handleNoteChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    updateNote(selectedNoteId, { [name]: value })
  }

  const selectedNote = notes.find((n) => n.id === selectedNoteId)

  return (
    <div className="grid grid-cols-12 gap-6 h-[70vh]">
      {/* 左侧：爆点大纲 */}
      <div className="col-span-4 bg-gray-50 p-4 rounded-lg overflow-y-auto">
        <h4 className="font-semibold mb-3 text-gray-800">笔记大纲</h4>
        <div className="space-y-2">
          {hotspots.map((spot, index) => (
            <div
              key={index}
              onClick={() => setSelectedNoteId(index)}
              className={`block p-3 rounded-md cursor-pointer ${
                selectedNoteId === index
                  ? 'bg-red-100 border-l-4 border-red-500'
                  : 'hover:bg-gray-200'
              }`}>
              <p
                className={`font-semibold text-sm ${
                  selectedNoteId === index ? 'text-red-700' : 'text-gray-500'
                }`}>
                笔记 {index + 1}/{hotspots.length}
              </p>
              <p className="text-sm text-gray-800">{spot.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧：文案编辑器 */}
      <div className="col-span-8">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">✨ AI文案生成中...</p>
          </div>
        )}
        {!isLoading && selectedNote && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">标题</label>
              <input
                type="text"
                name="title"
                value={selectedNote.title}
                onChange={handleNoteChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">正文</label>
              <textarea
                name="content"
                rows={12}
                value={selectedNote.content}
                onChange={handleNoteChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 p-4 leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">话题标签</label>
              <input
                type="text"
                name="hashtags"
                value={selectedNote.hashtags}
                onChange={handleNoteChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Step2_CopyGeneration
