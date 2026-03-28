import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import { QuantitySelector } from '@/components/common/QuantitySelector'
import type { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  loading?: boolean
}

export function CartItemRow({ item, onUpdateQuantity, onRemove, loading }: CartItemProps) {
  const product = item.variant?.product
  const primaryImage = product?.images?.find((i) => i.isPrimary) || product?.images?.[0]
  const attrs = item.variant?.attributes ?? []

  return (
    <div className="flex gap-4 py-4 border-b border-[#E2E8F0] last:border-0">
      {/* Image */}
      <Link to={product ? `/products/${product.slug}` : '#'} className="shrink-0 w-[120px] h-[120px] bg-[#F8FAFC] rounded overflow-hidden">
        {primaryImage ? (
          <img src={primaryImage.url} alt={product?.name ?? 'Product'} className="h-full w-full object-contain" loading="lazy" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[#64748B] text-xs">No image</div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Link to={product ? `/products/${product.slug}` : '#'} className="text-sm font-medium text-[#0F172A] hover:text-[#4F46E5] line-clamp-2 mb-1">
          {product?.name ?? 'Product'}
        </Link>

        {/* Variant attributes */}
        {attrs.length > 0 && (
          <p className="text-xs text-[#64748B] mb-2">
            {attrs.map((a) => `${a.attributeKey?.name}: ${a.attributeValue?.displayValue ?? a.attributeValue?.value}`).join(' | ')}
          </p>
        )}

        {/* Price */}
        <div className="text-base font-bold text-[#EF4444] mb-2">
          {formatPrice(item.unitPrice)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-auto">
          <QuantitySelector
            value={item.quantity}
            onChange={(qty) => onUpdateQuantity(item.id, qty)}
            min={1}
            max={99}
            disabled={loading}
          />
          <button
            onClick={() => onRemove(item.id)}
            className="text-sm text-[#6366F1] hover:text-[#EF4444] hover:underline flex items-center gap-1 cursor-pointer"
            disabled={loading}
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="shrink-0 text-right">
        <span className="text-base font-bold text-[#0F172A]">{formatPrice(item.unitPrice * item.quantity)}</span>
      </div>
    </div>
  )
}
