'use client'

import { create } from 'zustand'

interface UIStore {
  search: string
  showSearch: boolean
  setSearch: (search: string) => void
  setShowSearch: (show: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  search: '',
  showSearch: false,
  setSearch: (search) => set({ search }),
  setShowSearch: (showSearch) => set({ showSearch }),
}))
