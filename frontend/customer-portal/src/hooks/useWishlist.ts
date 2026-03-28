import { useCallback, useEffect, useState } from 'react'
import { wishlistApi, cartApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import type { Wishlist, WishlistItem } from '@/types'
import { toast } from 'sonner'

export function useWishlist() {
  const { isAuthenticated } = useAuthStore()
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const lists = await wishlistApi.getMine()
      let wl = lists[0]
      if (!wl) {
        wl = await wishlistApi.create({ name: 'My Wishlist' })
      }
      setWishlist(wl)
      const wlItems = await wishlistApi.getItems(wl.id)
      setItems(wlItems)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [isAuthenticated])

  useEffect(() => { fetchWishlist() }, [fetchWishlist])

  const addItem = useCallback(async (variantId: string) => {
    if (!wishlist) return
    const newItem = await wishlistApi.addItem(wishlist.id, { variantId })
    setItems((prev) => [...prev, newItem])
    toast.success('Added to wishlist!')
  }, [wishlist])

  const removeItem = useCallback(async (itemId: string) => {
    await wishlistApi.removeItem(itemId)
    setItems((prev) => prev.filter((i) => i.id !== itemId))
    toast.success('Removed from wishlist')
  }, [])

  const isWishlisted = useCallback((variantId: string) =>
    items.some((i) => i.variantId === variantId),
  [items])

  const toggleWishlist = useCallback(async (variantId: string) => {
    const item = items.find((i) => i.variantId === variantId)
    if (item) {
      await removeItem(item.id)
    } else {
      await addItem(variantId)
    }
  }, [items, addItem, removeItem])

  const moveToCart = useCallback(async (item: WishlistItem) => {
    await cartApi.addItem({ variantId: item.variantId, quantity: 1 })
    await removeItem(item.id)
    toast.success('Moved to cart!')
  }, [removeItem])

  return { items, loading, addItem, removeItem, isWishlisted, toggleWishlist, moveToCart, fetchWishlist }
}
