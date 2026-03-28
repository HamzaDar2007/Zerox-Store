import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  itemCount: number
  setItems: (items: CartItem[]) => void
  setItemCount: (count: number) => void
  addItemOptimistic: (item: CartItem) => void
  updateItemOptimistic: (itemId: string, quantity: number) => void
  removeItemOptimistic: (itemId: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      setItems: (items) =>
        set({ items, itemCount: items.reduce((sum, i) => sum + i.quantity, 0) }),
      setItemCount: (count) => set({ itemCount: count }),
      addItemOptimistic: (item) => {
        const existing = get().items.find((i) => i.variantId === item.variantId)
        if (existing) {
          const updated = get().items.map((i) =>
            i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i,
          )
          set({ items: updated, itemCount: updated.reduce((sum, i) => sum + i.quantity, 0) })
        } else {
          const updated = [...get().items, item]
          set({ items: updated, itemCount: updated.reduce((sum, i) => sum + i.quantity, 0) })
        }
      },
      updateItemOptimistic: (itemId, quantity) => {
        const updated = get().items.map((i) => (i.id === itemId ? { ...i, quantity } : i))
        set({ items: updated, itemCount: updated.reduce((sum, i) => sum + i.quantity, 0) })
      },
      removeItemOptimistic: (itemId) => {
        const updated = get().items.filter((i) => i.id !== itemId)
        set({ items: updated, itemCount: updated.reduce((sum, i) => sum + i.quantity, 0) })
      },
      clearCart: () => set({ items: [], itemCount: 0 }),
    }),
    { name: 'customer-cart' },
  ),
)
