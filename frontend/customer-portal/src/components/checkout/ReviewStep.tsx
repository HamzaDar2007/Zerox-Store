import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/format'
import { MapPin, Truck, CreditCard } from 'lucide-react'
import type { UserAddress, ShippingMethod, CartItem } from '@/types'

interface ReviewStepProps {
  address: UserAddress
  shippingMethod: ShippingMethod
  paymentMethod: string
  items: CartItem[]
  subtotal: number
  discount: number
  shippingCost: number
  onConfirm: () => void
  onBack: () => void
  loading?: boolean
}

export function ReviewStep({
  address,
  shippingMethod,
  paymentMethod,
  items,
  subtotal,
  discount,
  shippingCost,
  onConfirm,
  onBack,
  loading,
}: ReviewStepProps) {
  const total = subtotal - discount + shippingCost

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-[#0F172A]">Review Your Order</h2>

      {/* Address */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-[#6366F1]" />
          <h3 className="text-sm font-bold text-[#0F172A]">Shipping Address</h3>
        </div>
        <p className="text-sm text-[#64748B]">
          {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
          {address.city}{address.state ? `, ${address.state}` : ''} {address.postalCode}<br />
          {address.country}
        </p>
      </div>

      {/* Shipping */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="h-4 w-4 text-[#6366F1]" />
          <h3 className="text-sm font-bold text-[#0F172A]">Shipping Method</h3>
        </div>
        <p className="text-sm text-[#64748B]">{shippingMethod.name} — {shippingCost > 0 ? formatPrice(shippingCost) : 'Free'}</p>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-4 w-4 text-[#6366F1]" />
          <h3 className="text-sm font-bold text-[#0F172A]">Payment</h3>
        </div>
        <p className="text-sm text-[#64748B] capitalize">{paymentMethod.replace('_', ' ')}</p>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
        <h3 className="text-sm font-bold text-[#0F172A] mb-3">Order Items ({items.length})</h3>
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-2 border-b border-[#E2E8F0] last:border-0">
            <div className="h-12 w-12 bg-[#F8FAFC] rounded overflow-hidden shrink-0">
              {item.variant?.product?.images?.[0] && (
                <img src={item.variant.product.images[0].url} alt="" className="h-full w-full object-contain" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#0F172A] line-clamp-1">{item.variant?.product?.name ?? 'Product'}</p>
              <p className="text-xs text-[#64748B]">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-[#0F172A]">{formatPrice(item.unitPrice * item.quantity)}</p>
          </div>
        ))}

        <Separator className="my-3" />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-[#64748B]">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-[#10B981]"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
          <div className="flex justify-between"><span className="text-[#64748B]">Shipping</span><span>{shippingCost > 0 ? formatPrice(shippingCost) : 'Free'}</span></div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-bold text-[#EF4444]"><span>Total</span><span>{formatPrice(total)}</span></div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button size="lg" onClick={onConfirm} disabled={loading} className="flex-1 md:flex-none">
          {loading ? 'Placing Order…' : 'Place Order'}
        </Button>
      </div>
    </div>
  )
}
