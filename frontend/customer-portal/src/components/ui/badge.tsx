import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center font-bold uppercase tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]',
        sale: 'bg-[#EF4444] text-white',
        new: 'bg-[#10B981] text-white',
        hot: 'bg-[#6366F1] text-white',
        info: 'bg-[#6366F1] text-white',
        warning: 'bg-[#A78BFA] text-[#0F172A]',
        success: 'bg-[#10B981] text-white',
        danger: 'bg-[#EF4444] text-white',
      },
      size: {
        default: 'px-2 py-0.5 text-[11px] rounded-[3px]',
        sm: 'px-1.5 py-0.5 text-[10px] rounded-[2px]',
        lg: 'px-3 py-1 text-xs rounded-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
}

export { Badge, badgeVariants }
