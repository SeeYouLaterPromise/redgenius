import { create } from 'zustand'

export interface Hotspot {
  id: number
  text: string
}

export interface Note {
  id: number
  hotspotText: string
  title: string
  content: string
  hashtags: string[]
  imageUrls: string[]
}

interface DashboardState {
  importedContent: string
  chatResult: string
  summary: string
  urlCrawlResult: string
  urlLoading: boolean
}

// 定义工作流中所有需要管理的数据类型
interface WorkflowState {
  currentStep: number
  sourceText: string
  hotspots: Hotspot[]
  notes: Note[]
  dashboardState: DashboardState
  selectedNoteIdForReview: number | null // <-- 新增：用于记录最终选中的笔记ID

  // Actions
  setSelectedNoteIdForReview: (id: number | null) => void // <-- 新增
  updateDashboardState: (newState: Partial<DashboardState>) => void
  resetDashboardState: () => void
  setSourceText: (text: string) => void
  setHotspots: (spots: string[]) => void
  addHotspot: () => void
  deleteHotspot: (id: number) => void
  updateHotspotText: (id: number, text: string) => void
  setNotes: (
    notesData: { title: string; content: string; topics: string[] }[]
  ) => void
  updateNote: (
    noteId: number,
    newContent: Partial<Pick<Note, 'title' | 'content' | 'hashtags'>>
  ) => void // <-- 恢复并明确其功能
  setNoteImages: (noteId: number, urls: string[]) => void // <-- 恢复
  nextStep: () => void
  prevStep: () => void
}

const initialDashboardState: DashboardState = {
  importedContent: '',
  chatResult: '',
  summary: '',
  urlCrawlResult: '',
  urlLoading: false,
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  // 初始状态
  currentStep: 1,
  sourceText: '',
  hotspots: [],
  notes: [],
  dashboardState: initialDashboardState,
  selectedNoteIdForReview: null, // <-- 初始化为null

  // 实现 Actions
  setSelectedNoteIdForReview: (id) => set({ selectedNoteIdForReview: id }),
  updateDashboardState: (newState) =>
    set((state) => ({
      dashboardState: { ...state.dashboardState, ...newState },
    })),
  resetDashboardState: () =>
    set({ dashboardState: initialDashboardState, sourceText: '' }),
  setSourceText: (text) => set({ sourceText: text }),

  setHotspots: (spots) => {
    const newHotspots = spots.map((spot, index) => ({
      id: Date.now() + index,
      text: spot,
    }))
    set({
      hotspots: newHotspots,
      notes: newHotspots.map((spot) => ({
        id: spot.id,
        hotspotText: spot.text,
        title: '',
        content: '',
        hashtags: [],
        imageUrls: [],
      })),
    })
  },

  addHotspot: () =>
    set((state) => {
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
        hashtags: [],
        imageUrls: [],
      }
      return {
        hotspots: [...state.hotspots, newHotspot],
        notes: [...state.notes, newNote],
      }
    }),

  deleteHotspot: (id) =>
    set((state) => ({
      hotspots: state.hotspots.filter((spot) => spot.id !== id),
      notes: state.notes.filter((note) => note.id !== id),
    })),

  updateHotspotText: (id, text) =>
    set((state) => ({
      hotspots: state.hotspots.map((spot) =>
        spot.id === id ? { ...spot, text } : spot
      ),
    })),

  setNotes: (notesData) =>
    set((state) => {
      const updatedNotes = state.hotspots.map((hotspot, index) => {
        const apiData = notesData[index]
        if (apiData) {
          return {
            id: hotspot.id,
            hotspotText: hotspot.text,
            title: apiData.title,
            content: apiData.content,
            hashtags: apiData.topics,
            imageUrls: [],
          }
        }
        // 如果API返回的数据少于爆点数，则保留空的note
        return {
          id: hotspot.id,
          hotspotText: hotspot.text,
          title: '',
          content: '',
          hashtags: [],
          imageUrls: [],
        }
      })
      return { notes: updatedNotes }
    }),

  // --- 恢复的函数 ---
  updateNote: (noteId, newContent) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId ? { ...note, ...newContent } : note
      ),
    })),

  setNoteImages: (noteId, urls) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId ? { ...note, imageUrls: urls } : note
      ),
    })),

  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
}))
