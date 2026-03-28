import { useEffect, useState } from 'react'
import { shippingApi } from '@/services/api'
import type { ShippingMethod } from '@/types'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Truck } from 'lucide-react'

interface ShippingStepProps {
  onNext: (method: ShippingMethod) => void
  onBack: () => void
  selectedMethodId?: string
}

export function ShippingStep({ onNext, onBack, selectedMethodId }: ShippingStepProps) {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [selected, setSelected] = useState<string | undefined>(selectedMethodId)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    shippingApi.listMethods().then((m) => {
      if (cancelled) return
      const active = m.filter((s) => s.isActive)
      setMethods(active)
      if (active.length > 0 && !selectedMethodId) setSelected(active[0].id)
      setLoading(false)
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [selectedMethodId])

  const handleContinue = () => {
    const method = methods.find((m) => m.id === selected)
    if (method) onNext(method)
  }

  if (loading) return <div className="animate-pulse space-y-3"><div className="h-20 bg-[#F0F2F2] rounded" /><div className="h-20 bg-[#F0F2F2] rounded" /></div>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[#0F1111] mb-2">Shipping Method</h2>

      {methods.length === 0 ? (
        <p className="text-sm text-[#565959]">No shipping methods available for your location.</p>
      ) : (
        methods.map((method) => (
          <label
            key={method.id}
            className={cn(
              'flex items-center gap-3 p-4 rounded-[8px] border cursor-pointer transition-colors',
              selected === method.id ? 'border-[#F57224] bg-[#FFF3EC]' : 'border-[#DDD] hover:border-[#999]',
            )}
          >
            <input
              type="radio"
              name="shipping"
              checked={selected === method.id}
              onChange={() => setSelected(method.id)}
              className="accent-[#F57224]"
            />
            <Truck className="h-5 w-5 text-[#565959] shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#0F1111]">{method.name}</p>
              {method.estimatedDaysMin != null && (
                <p className="text-xs text-[#565959]">
                  {method.estimatedDaysMin}–{method.estimatedDaysMax ?? method.estimatedDaysMin} business days
                  {method.carrier && ` via ${method.carrier}`}
                </p>
              )}
            </div>
            <div className="text-sm font-bold text-[#0F1111] shrink-0">
              {method.baseRate === 0 ? <span className="text-[#007600]">FREE</span> : formatPrice(method.baseRate)}
            </div>
          </label>
        ))
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={handleContinue} disabled={!selected} className="flex-1 font-bold">Continue to Payment</Button>
      </div>
    </div>
  )
}
