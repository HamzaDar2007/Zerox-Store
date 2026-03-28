import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { returnsApi } from '@/services/api'
import { toast } from 'sonner'
import type { Order, CreateReturnPayload } from '@/types'

interface ReturnFormProps {
  order: Order
  onSuccess?: () => void
}

interface ReturnItemSelection {
  orderItemId: string
  selected: boolean
  quantity: number
  maxQuantity: number
  nameSnapshot: string
}

export function ReturnForm({ order, onSuccess }: ReturnFormProps) {
  const [items, setItems] = useState<ReturnItemSelection[]>(
    (order.items ?? []).map((item) => ({
      orderItemId: item.id,
      selected: false,
      quantity: item.quantity,
      maxQuantity: item.quantity,
      nameSnapshot: item.nameSnapshot,
    })),
  )
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<{ reason: string }>()

  const toggleItem = (orderItemId: string) => {
    setItems((prev) => prev.map((i) =>
      i.orderItemId === orderItemId ? { ...i, selected: !i.selected } : i,
    ))
  }

  const updateQuantity = (orderItemId: string, qty: number) => {
    setItems((prev) => prev.map((i) =>
      i.orderItemId === orderItemId ? { ...i, quantity: Math.min(Math.max(1, qty), i.maxQuantity) } : i,
    ))
  }

  const selectedItems = items.filter((i) => i.selected)

  const onSubmit = async (data: { reason: string }) => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to return')
      return
    }
    setSubmitting(true)
    try {
      const payload: CreateReturnPayload = {
        return: {
          orderId: order.id,
          reason: data.reason,
        },
        items: selectedItems.map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
        })),
      }
      await returnsApi.create(payload)
      toast.success('Return request submitted successfully')
      onSuccess?.()
    } catch {
      toast.error('Failed to submit return request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label className="mb-2 block font-bold text-sm">Select items to return</Label>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.orderItemId} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <Checkbox checked={item.selected} onCheckedChange={() => toggleItem(item.orderItemId)} />
              <span className="text-sm text-[#0F172A] flex-1">{item.nameSnapshot}</span>
              {item.selected && (
                <div className="flex items-center gap-1">
                  <Label className="text-xs text-[#64748B]">Qty:</Label>
                  <input
                    type="number"
                    min={1}
                    max={item.maxQuantity}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.orderItemId, parseInt(e.target.value) || 1)}
                    className="w-16 border border-[#E2E8F0] rounded px-2 py-1 text-sm text-center"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="return-reason" className="mb-1 block">Reason for return</Label>
        <Textarea
          id="return-reason"
          placeholder="Please describe why you want to return these items…"
          rows={3}
          {...register('reason', { required: 'Reason is required' })}
        />
        {errors.reason && <p className="text-xs text-[#EF4444] mt-1">{errors.reason.message}</p>}
      </div>

      <Button type="submit" disabled={submitting || selectedItems.length === 0}>
        {submitting ? 'Submitting…' : 'Submit Return Request'}
      </Button>
    </form>
  )
}
