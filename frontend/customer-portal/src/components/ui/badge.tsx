import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center font-bold uppercase tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-[#F3F3F3] text-[#565959] border border-[#DDD]',
        sale: 'bg-[#CC0C39] text-white',
        new: 'bg-[#007600] text-white',
        hot: 'bg-[#F57224] text-white',
        info: 'bg-[#007185] text-white',
        warning: 'bg-[#FEBD69] text-[#0F1111]',
        success: 'bg-[#007600] text-white',
        danger: 'bg-[#B12704] text-white',
      },
      size: {
        default: 'px-2 py-0.5 text-[11px] rounded-[3px]',
        sm: 'px-1.5 py-0.5 text-[10px] rounded-[2px]',
        lg: 'px-3 py-1 text-xs rounded-[4px]',
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
