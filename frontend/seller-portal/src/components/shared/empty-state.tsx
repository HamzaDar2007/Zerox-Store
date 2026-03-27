import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center animate-fade-in', className)}>
      <div className="rounded-2xl bg-muted/40 p-5 mb-5">
        <Icon className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground/60">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5 rounded-xl shadow-md shadow-primary/15" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
