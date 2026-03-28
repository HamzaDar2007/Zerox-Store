import { Star, StarHalf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  count?: number
  interactive?: boolean
  onRate?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  count,
  interactive = false,
  onRate,
  className,
}: StarRatingProps) {
  const sizeClass = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' }[size]
  const stars = []

  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= Math.floor(rating)
    const isHalf = !isFilled && i === Math.ceil(rating) && rating % 1 >= 0.25

    stars.push(
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => onRate?.(i)}
        className={cn(
          interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default',
          'focus:outline-none',
        )}
        aria-label={`${i} star${i > 1 ? 's' : ''}`}
      >
        {isFilled ? (
          <Star className={cn(sizeClass, 'fill-[#FFA41C] text-[#FFA41C]')} />
        ) : isHalf ? (
          <StarHalf className={cn(sizeClass, 'fill-[#FFA41C] text-[#FFA41C]')} />
        ) : (
          <Star className={cn(sizeClass, 'text-[#e0e0e0]')} />
        )}
      </button>,
    )
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)} role="img" aria-label={`${rating} out of ${maxRating} stars`}>
      {stars}
      {showValue && <span className="ml-1 text-sm text-[#565959]">{rating.toFixed(1)}</span>}
      {count !== undefined && <span className="ml-1 text-sm text-[#007185]">({count.toLocaleString()})</span>}
    </div>
  )
}
