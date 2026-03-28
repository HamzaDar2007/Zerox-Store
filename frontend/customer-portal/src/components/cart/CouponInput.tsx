import { useState } from 'react'
import { Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { couponsApi } from '@/services/api'
import { toast } from 'sonner'
import type { Coupon } from '@/types'

interface CouponInputProps {
  onApply: (coupon: Coupon) => void
  appliedCode?: string
  onRemove?: () => void
}

export function CouponInput({ onApply, appliedCode, onRemove }: CouponInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setLoading(true)
    try {
      const coupon = await couponsApi.getByCode(trimmed)
      onApply(coupon)
      toast.success(`Coupon "${trimmed}" applied!`)
      setCode('')
    } catch {
      toast.error('Invalid or expired coupon code')
    } finally {
      setLoading(false)
    }
  }

  if (appliedCode) {
    return (
      <div className="flex items-center gap-2 bg-[#F0FFF0] border border-[#007600]/30 rounded p-3">
        <Tag className="h-4 w-4 text-[#007600]" />
        <span className="text-sm text-[#007600] font-medium flex-1">
          Coupon <span className="font-bold">{appliedCode}</span> applied
        </span>
        <button onClick={onRemove} className="text-sm text-[#CC0C39] hover:underline cursor-pointer">
          Remove
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#565959]" />
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="pl-9"
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        />
      </div>
      <Button variant="outline" onClick={handleApply} disabled={loading || !code.trim()}>
        {loading ? 'Checking…' : 'Apply'}
      </Button>
    </div>
  )
}
