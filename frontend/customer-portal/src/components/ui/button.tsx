import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[#F57224] text-white rounded-[4px] hover:bg-[#e0651d] focus-visible:ring-[#F57224] shadow-sm',
        secondary: 'bg-[#FFD814] text-[#0F1111] rounded-[4px] hover:bg-[#f0c800] border border-[#FCD200] focus-visible:ring-[#FFD814] shadow-sm',
        outline: 'border border-[#D5D9D9] bg-white text-[#0F1111] rounded-[4px] hover:bg-[#F7FAFA] focus-visible:ring-[#007185]',
        danger: 'bg-[#B12704] text-white rounded-[4px] hover:bg-[#971f03] focus-visible:ring-[#B12704]',
        ghost: 'text-[#0F1111] hover:bg-gray-100 rounded-[4px]',
        link: 'text-[#007185] underline-offset-4 hover:underline hover:text-[#C7511F] p-0 h-auto',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? children : <>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{children}</>}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
