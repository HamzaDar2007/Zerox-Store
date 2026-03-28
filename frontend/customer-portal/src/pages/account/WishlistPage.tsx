import { useEffect, useState } from 'react'
import { SEOHead } from '@/components/common/SEOHead'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { wishlistApi, cartApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import type { WishlistItem } from '@/types'
import { formatPrice } from '@/lib/format'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    wishlistApi.getMine().then(async (lists) => {
      if (cancelled) return
      const wl = lists[0]
      if (wl) {
        const wlItems = await wishlistApi.getItems(wl.id)
        if (!cancelled) setItems(wlItems)
      }
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [isAuthenticated])

  const handleRemove = async (itemId: string) => {
    try {
      await wishlistApi.removeItem(itemId)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
      toast.success('Removed from wishlist')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      await cartApi.addItem({ variantId: item.variantId, quantity: 1 })
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>

  return (
    <>
      <SEOHead title="My Wishlist" />
      <div>
        <h1 className="text-xl font-bold text-[#0F172A] mb-6">My Wishlist</h1>

        {items.length === 0 ? (
          <EmptyState icon={<Heart className="h-16 w-16" />} title="Your wishlist is empty" description="Save items you love to your wishlist." />
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const product = item.variant?.product
              const image = product?.images?.find((i) => i.isPrimary) ?? product?.images?.[0]
              const price = item.variant?.price ?? product?.basePrice ?? 0

              return (
                <div key={item.id} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex gap-4">
                  <Link
                    to={product ? `/products/${product.slug}` : '#'}
                    className="h-24 w-24 bg-[#F8FAFC] rounded overflow-hidden shrink-0"
                  >
                    {image ? <img src={image.url} alt={product?.name} className="h-full w-full object-contain" /> : null}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={product ? `/products/${product.slug}` : '#'} className="text-sm font-medium text-[#0F172A] hover:text-[#4F46E5] line-clamp-2">
                      {product?.name ?? 'Product'}
                    </Link>
                    <p className="text-base font-bold text-[#EF4444] mt-1">{formatPrice(price)}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handleAddToCart(item)}>
                        <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add to Cart
                      </Button>
                      <Button size="sm" variant="ghost" className="text-[#EF4444]" onClick={() => handleRemove(item.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
