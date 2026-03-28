import { useUIStore } from '@/store/ui.store'
import type { Product } from '@/types'

export function useRecentlyViewed() {
  const { recentlyViewed, addRecentlyViewed } = useUIStore()

  const trackView = (product: Product) => {
    addRecentlyViewed(product)
  }

  return { recentlyViewed, trackView }
}
