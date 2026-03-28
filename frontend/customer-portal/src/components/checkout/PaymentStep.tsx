import { useState } from 'react'
import { CreditCard, Banknote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PAYMENT_METHODS } from '@/constants/config'

interface PaymentStepProps {
  onNext: (method: string) => void
  onBack: () => void
  selectedMethod?: string
}

const METHOD_ICONS: Record<string, React.ReactNode> = {
  cod: <Banknote className="h-5 w-5" />,
  stripe: <CreditCard className="h-5 w-5" />,
  card: <CreditCard className="h-5 w-5" />,
}

export function PaymentStep({ onNext, onBack, selectedMethod }: PaymentStepProps) {
  const [selected, setSelected] = useState(selectedMethod ?? PAYMENT_METHODS[0]?.value ?? 'cod')

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[#0F1111] mb-2">Payment Method</h2>

      {PAYMENT_METHODS.map((method) => (
        <label
          key={method.value}
          className={cn(
            'flex items-center gap-3 p-4 rounded-[8px] border cursor-pointer transition-colors',
            selected === method.value ? 'border-[#F57224] bg-[#FFF3EC]' : 'border-[#DDD] hover:border-[#999]',
          )}
        >
          <input
            type="radio"
            name="payment"
            checked={selected === method.value}
            onChange={() => setSelected(method.value)}
            className="accent-[#F57224]"
          />
          <span className="text-[#565959] shrink-0">{METHOD_ICONS[method.value] ?? <CreditCard className="h-5 w-5" />}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#0F1111]">{method.label}</p>
          </div>
        </label>
      ))}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={() => onNext(selected)} className="flex-1 font-bold">Review Order</Button>
      </div>
    </div>
  )
}
