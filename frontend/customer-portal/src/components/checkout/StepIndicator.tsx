import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  label: string
  description?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Checkout steps" className="mb-8">
      <ol className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const stepNum = index + 1

          return (
            <li key={step.label} className="flex-1 flex items-center">
              <div className="flex flex-col items-center text-center w-full">
                <div className={cn(
                  'checkout-step flex items-center justify-center h-10 w-10 rounded-full text-sm font-bold border-2 mb-2 transition-colors',
                  isCompleted && 'bg-[#10B981] border-[#10B981] text-white completed',
                  isCurrent && 'bg-[#6366F1] border-[#6366F1] text-white active',
                  !isCompleted && !isCurrent && 'bg-white border-[#E2E8F0] text-[#64748B]',
                )}>
                  {isCompleted ? <Check className="h-5 w-5" /> : stepNum}
                </div>
                <span className={cn(
                  'text-xs font-medium',
                  isCurrent ? 'text-[#6366F1]' : isCompleted ? 'text-[#10B981]' : 'text-[#64748B]',
                )}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2 mt-[-20px]',
                  isCompleted ? 'bg-[#10B981]' : 'bg-[#E2E8F0]',
                )} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
