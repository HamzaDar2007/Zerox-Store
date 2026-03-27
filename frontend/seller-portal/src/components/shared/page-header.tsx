import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  children?: ReactNode
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{title}</h1>
        {description && <p className="text-[13px] text-muted-foreground/60">{description}</p>}
      </div>
      <div className="flex items-center gap-2.5">
        {children}
        {action && (
          <Button onClick={action.onClick} className="shadow-md shadow-primary/15 h-9 rounded-xl px-4 gap-2">
            {action.icon ?? <Plus className="h-4 w-4" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
