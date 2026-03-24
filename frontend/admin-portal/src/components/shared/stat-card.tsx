import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  trend?: { value: number; label: string }
  isLoading?: boolean
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  trend,
  isLoading,
  className,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('animate-fade-in', className)}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-11 w-11 rounded-2xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('card-lift animate-fade-in group overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-bold tracking-tight tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {trend && (
              <p className={cn('text-[11px] font-semibold flex items-center gap-1', trend.value >= 0 ? 'text-success' : 'text-destructive')}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn(
            'flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg',
            iconColor.replace('text-', 'bg-').replace('-500', '-500/10'),
          )}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
