import { useCallback, useEffect, useState } from 'react'
import { cartApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import type { CartItem } from '@/types'
import { toast } from 'sonner'

export function useCart() {
  const { isAuthenticated } = useAuthStore()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const cartItems = await cartApi.getItems()
      setItems(cartItems)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [isAuthenticated])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addItem = useCallback(async (variantId: string, quantity: number = 1) => {
    const newItem = await cartApi.addItem({ variantId, quantity })
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === variantId)
      if (existing) {
        return prev.map((i) => i.variantId === variantId ? { ...i, quantity: i.quantity + quantity } : i)
      }
      return [...prev, newItem]
    })
    toast.success('Added to cart!')
  }, [])

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    await cartApi.updateItem(itemId, { quantity })
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, quantity } : i))
  }, [])

  const removeItem = useCallback(async (itemId: string) => {
    await cartApi.removeItem(itemId)
    setItems((prev) => prev.filter((i) => i.id !== itemId))
    toast.success('Item removed')
  }, [])

  const clearCart = useCallback(async () => {
    await cartApi.clear()
    setItems([])
  }, [])

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return { items, loading, addItem, updateQuantity, removeItem, clearCart, fetchCart, subtotal, itemCount }
}
