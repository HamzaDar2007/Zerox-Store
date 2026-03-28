import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
  value: number
  onChange: (quantity: number) => void
  max?: number
  min?: number
  disabled?: boolean
  className?: string
}

export function QuantitySelector({
  value,
  onChange,
  max = 10,
  min = 1,
  disabled = false,
  className,
}: QuantitySelectorProps) {
  return (
    <div className={cn('flex items-center border border-[#DDD] rounded-[4px] overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className="h-9 w-9 flex items-center justify-center bg-[#F0F2F2] hover:bg-[#e3e6e6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="h-9 w-12 flex items-center justify-center text-sm font-semibold bg-white border-x border-[#DDD]">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className="h-9 w-9 flex items-center justify-center bg-[#F0F2F2] hover:bg-[#e3e6e6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
