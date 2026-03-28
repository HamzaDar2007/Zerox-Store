import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice, calculateDiscount } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'

interface ProductListItemProps {
  product: Product
  onAddToCart?: () => void
  onToggleWishlist?: () => void
  isWishlisted?: boolean
}

export function ProductListItem({ product, onAddToCart, onToggleWishlist, isWishlisted }: ProductListItemProps) {
  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0]
  const displayPrice = product.variants?.[0]?.price ?? product.basePrice
  const discountPercent = displayPrice < product.basePrice ? calculateDiscount(product.basePrice, displayPrice) : null

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex gap-4 hover:shadow-card transition-shadow">
      {/* Image */}
      <Link to={`/products/${product.slug}`} className="shrink-0 w-[180px] h-[180px] bg-[#F8FAFC] rounded overflow-hidden">
        {primaryImage ? (
          <img src={primaryImage.url} alt={primaryImage.altText ?? product.name} className="h-full w-full object-contain" loading="lazy" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[#64748B] text-sm">No image</div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-base font-medium text-[#0F172A] hover:text-[#4F46E5] line-clamp-2 mb-1">
            {product.name}
          </h3>
        </Link>

        {product.store && (
          <Link to={`/stores/${product.store.slug}`} className="text-xs text-[#6366F1] hover:underline mb-1">
            by {product.store.name}
          </Link>
        )}

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-bold text-[#EF4444]">{formatPrice(displayPrice)}</span>
          {discountPercent && discountPercent > 0 && (
            <>
              <span className="text-sm text-[#64748B] line-through">{formatPrice(product.basePrice)}</span>
              <Badge variant="sale">-{discountPercent}%</Badge>
            </>
          )}
        </div>

        {product.shortDesc && (
          <p className="text-sm text-[#64748B] line-clamp-2 mb-3">{product.shortDesc}</p>
        )}

        <div className="mt-auto flex items-center gap-2">
          <Button size="sm" onClick={onAddToCart}>
            <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
          </Button>
          <button
            onClick={onToggleWishlist}
            className={cn(
              'h-9 w-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer',
              isWishlisted ? 'bg-red-50 border-red-200' : 'border-[#E2E8F0] hover:border-[#6366F1]',
            )}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={cn('h-4 w-4', isWishlisted ? 'fill-[#EF4444] text-[#EF4444]' : 'text-[#64748B]')} />
          </button>
        </div>
      </div>
    </div>
  )
}
