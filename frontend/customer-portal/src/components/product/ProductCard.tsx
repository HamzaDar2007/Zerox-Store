import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice, calculateDiscount } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types'

interface ProductCardProps {
  product?: Product
  flashPrice?: number
  compact?: boolean
  className?: string
  onAddToCart?: () => void
  onToggleWishlist?: () => void
  isWishlisted?: boolean
}

export function ProductCard({
  product,
  flashPrice,
  compact,
  className,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}: ProductCardProps) {
  if (!product) return null

  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0]
  const secondaryImage = product.images?.find((i) => !i.isPrimary && i.id !== primaryImage?.id)
  const displayPrice = flashPrice ?? (product.variants?.[0]?.price ?? product.basePrice)
  const originalPrice = flashPrice ? product.basePrice : undefined
  const discountPercent = originalPrice ? calculateDiscount(originalPrice, displayPrice) : null

  const productLink = `/products/${product.slug}`

  return (
    <div className={cn('product-card group bg-white rounded-[8px] border border-[#DDD] overflow-hidden flex flex-col', className)}>
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <Link to={productLink} className="block aspect-square overflow-hidden bg-[#F7F8F8]">
          {primaryImage ? (
            <>
              <img
                src={primaryImage.url}
                alt={primaryImage.altText ?? product.name}
                className={cn(
                  'h-full w-full object-contain transition-opacity duration-300',
                  secondaryImage && 'group-hover:opacity-0',
                )}
                loading="lazy"
              />
              {secondaryImage && (
                <img
                  src={secondaryImage.url}
                  alt={secondaryImage.altText ?? product.name}
                  className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[#565959]">
              <Eye className="h-12 w-12" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {flashPrice && <Badge variant="sale">Flash Sale</Badge>}
          {discountPercent && discountPercent > 0 && (
            <Badge variant="sale">-{discountPercent}%</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => { e.preventDefault(); onToggleWishlist?.() }}
          className={cn(
            'absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:bg-white',
            isWishlisted && 'opacity-100',
          )}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-4 w-4', isWishlisted ? 'fill-[#CC0C39] text-[#CC0C39]' : 'text-[#565959]')} />
        </button>

        {/* Quick Add */}
        {!compact && (
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart?.() }}
            className="absolute bottom-0 inset-x-0 bg-[#F57224] text-white text-sm font-bold py-2 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" /> Add to Cart
          </button>
        )}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col flex-1 p-3', compact && 'p-2')}>
        {/* Store */}
        {product.store && !compact && (
          <Link
            to={`/stores/${product.store.slug}`}
            className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline mb-1 line-clamp-1"
          >
            {product.store.name}
          </Link>
        )}

        {/* Title */}
        <Link to={productLink} className="block mb-1">
          <h3 className={cn(
            'text-sm text-[#0F1111] hover:text-[#C7511F] line-clamp-2 font-medium',
            compact && 'text-xs',
          )}>
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={cn('font-bold text-[#B12704]', compact ? 'text-sm' : 'text-base')}>
              {formatPrice(displayPrice)}
            </span>
            {originalPrice && originalPrice > displayPrice && (
              <span className="text-xs text-[#565959] line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
