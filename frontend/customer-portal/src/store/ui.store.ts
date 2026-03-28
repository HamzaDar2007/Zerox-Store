import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types'

interface UIState {
  isMobileMenuOpen: boolean
  isMegaMenuOpen: boolean
  activeMegaMenuCategory: string | null
  isSearchOpen: boolean
  recentlyViewed: Product[]
  setMobileMenuOpen: (open: boolean) => void
  setMegaMenuOpen: (open: boolean) => void
  setActiveMegaMenuCategory: (categoryId: string | null) => void
  setSearchOpen: (open: boolean) => void
  addRecentlyViewed: (product: Product) => void
}

const MAX_RECENTLY_VIEWED = 20

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isMobileMenuOpen: false,
      isMegaMenuOpen: false,
      activeMegaMenuCategory: null,
      isSearchOpen: false,
      recentlyViewed: [],
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setMegaMenuOpen: (open) => set({ isMegaMenuOpen: open }),
      setActiveMegaMenuCategory: (categoryId) => set({ activeMegaMenuCategory: categoryId }),
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      addRecentlyViewed: (product) => {
        const existing = get().recentlyViewed.filter((p) => p.id !== product.id)
        set({ recentlyViewed: [product, ...existing].slice(0, MAX_RECENTLY_VIEWED) })
      },
    }),
    {
      name: 'customer-ui',
      partialize: (state) => ({ recentlyViewed: state.recentlyViewed }),
    },
  ),
)
