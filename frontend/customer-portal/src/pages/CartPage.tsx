import { useEffect, useState } from 'react'
import { SEOHead } from '@/components/common/SEOHead'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { CartItemRow } from '@/components/cart/CartItemRow'
import { CartSummary } from '@/components/cart/CartSummary'
import { CouponInput } from '@/components/cart/CouponInput'
import { EmptyCart } from '@/components/cart/EmptyCart'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { cartApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import type { CartItem, Coupon } from '@/types'
import { toast } from 'sonner'

export default function CartPage() {
  const { isAuthenticated } = useAuthStore()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [coupon, setCoupon] = useState<Coupon | null>(null)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    cartApi.getItems()
      .then((cartItems) => {
        setItems(cartItems)
        useCartStore.getState().setItems(cartItems)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const updateQuantity = async (itemId: string, quantity: number) => {
    setUpdating(true)
    try {
      await cartApi.updateItem(itemId, { quantity })
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)))
      useCartStore.getState().updateItemOptimistic(itemId, quantity)
    } catch { toast.error('Failed to update quantity') }
    finally { setUpdating(false) }
  }

  const removeItem = async (itemId: string) => {
    setUpdating(true)
    try {
      await cartApi.removeItem(itemId)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
      useCartStore.getState().removeItemOptimistic(itemId)
      toast.success('Item removed')
    } catch { toast.error('Failed to remove item') }
    finally { setUpdating(false) }
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const discount = coupon ? (coupon.discountType === 'percentage' ? Math.min(subtotal * coupon.discountValue / 100, coupon.maxDiscount ?? Infinity) : coupon.discountValue) : 0

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>

  return (
    <>
      <SEOHead title="Shopping Cart" />
      <div className="container-main py-4">
        <Breadcrumb items={[{ label: 'Shopping Cart' }]} />

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <h1 className="text-xl font-bold text-[#0F172A] mb-4">Shopping Cart ({items.length} items)</h1>
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    loading={updating}
                  />
                ))}
              </div>

              {/* Coupon */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mt-4">
                <CouponInput
                  onApply={setCoupon}
                  appliedCode={coupon?.code}
                  onRemove={() => setCoupon(null)}
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <CartSummary
                subtotal={subtotal}
                itemCount={items.length}
                discount={discount}
                couponCode={coupon?.code}
                couponId={coupon?.id}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
