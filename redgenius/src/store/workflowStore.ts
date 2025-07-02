import { create } from 'zustand'

// 为爆点也定义一个更清晰的类型
export interface Hotspot {
  id: number
  text: string
}

// 定义单篇笔记的数据结构
export interface Note {
  id: number
  hotspotText: string
  title: string
  content: string
  hashtags: string
  imageUrls: string[] // <--- 新增：存放为本篇笔记生成的图片URL
}

// 定义工作流中所有需要管理的数据类型
interface WorkflowState {
  currentStep: number
  sourceText: string
  hotspots: Hotspot[] // <-- 类型从 string[] 变为 Hotspot[]
  notes: Note[]

  setSourceText: (text: string) => void
  setHotspots: (spots: string[]) => void
  addHotspot: () => void // <-- 新增：添加新热点的方法
  deleteHotspot: (id: number) => void // <-- 新增：删除爆点的方法
  updateNote: (noteId: number, newContent: Partial<Note>) => void
  setNoteImages: (noteId: number, urls: string[]) => void // <--- 新增：设置图片URL的方法
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
}

// 使用 zustand 创建 store
export const useWorkflowStore = create<WorkflowState>((set) => ({
  // 初始状态
  currentStep: 1,
  sourceText: '这里是用户从Dashboard页面传过来的原始素材...',
  hotspots: [],
  notes: [], // <--- 新增

  // 实现 Actions
  setSourceText: (text) => set({ sourceText: text }),
  // 当设置爆点时，我们自动初始化笔记数组
  setHotspots: (spots) =>
    set({
      hotspots: spots.map((spot, index) => ({
        // <-- 修改：为每个爆点添加id
        id: Date.now() + index, // 使用时间戳+索引生成一个简单的唯一id
        text: spot,
      })),

      notes: spots.map((spot, index) => ({
        id: index,
        hotspotText: spot,
        title: '',
        content: '',
        hashtags: '#笔记灵感 #' + spot.split('：')[0].replace(/“|”/g, ''), // 自动生成简单hashtag
        imageUrls: [], // <--- 新增：初始化为空数组
      })),
    }),
  addHotspot: () =>
    set((state) => {
      // <-- 新增：实现添加逻辑
      const newId = Date.now()
      const newHotspot: Hotspot = {
        id: newId,
        text: '这是一个新的爆点，请编辑',
      }
      const newNote: Note = {
        id: newId,
        hotspotText: newHotspot.text,
        title: '',
        content: '',
        hashtags: '#笔记灵感',
        imageUrls: [],
      }
      return {
        hotspots: [...state.hotspots, newHotspot],
        notes: [...state.notes, newNote],
      }
    }),
  deleteHotspot: (id) =>
    set((state) => ({
      // <-- 新增：实现删除逻辑
      hotspots: state.hotspots.filter((spot) => spot.id !== id),
      notes: state.notes.filter((note) => note.id !== id), // 同时删除对应的笔记
    })),
  updateNote: (noteId, newContent) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId ? { ...note, ...newContent } : note
      ),
    })),
  setNoteImages: (noteId, urls) =>
    set((state) => ({
      // <--- 新增
      notes: state.notes.map((note) =>
        note.id === noteId ? { ...note, imageUrls: urls } : note
      ),
    })),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
  goToStep: (step) => set({ currentStep: step }),
}))
