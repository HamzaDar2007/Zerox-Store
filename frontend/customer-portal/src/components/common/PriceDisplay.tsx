import { cn } from '@/lib/utils'
import { formatPrice, calculateDiscount } from '@/lib/format'

interface PriceDisplayProps {
  currentPrice: number
  originalPrice?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PriceDisplay({ currentPrice, originalPrice, size = 'md', className }: PriceDisplayProps) {
  const discount = originalPrice ? calculateDiscount(originalPrice, currentPrice) : 0
  const hasDiscount = discount > 0

  const priceSize = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-[28px]',
  }[size]

  const originalSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm',
  }[size]

  return (
    <div className={cn('flex flex-wrap items-baseline gap-1.5', className)}>
      <span className={cn('font-bold text-[#B12704]', priceSize)}>
        {formatPrice(currentPrice)}
      </span>
      {hasDiscount && originalPrice && (
        <>
          <span className={cn('text-[#565959] line-through', originalSize)}>
            {formatPrice(originalPrice)}
          </span>
          <span className={cn('text-[#007600] font-medium', originalSize)}>
            -{discount}%
          </span>
        </>
      )}
    </div>
  )
}
