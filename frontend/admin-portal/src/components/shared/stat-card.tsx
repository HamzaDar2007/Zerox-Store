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
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('card-lift animate-fade-in group', className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-bold tracking-tight tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {trend && (
              <p className={cn('text-[11px] font-semibold flex items-center gap-1', trend.value >= 0 ? 'text-success' : 'text-destructive')}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
            iconColor.replace('text-', 'bg-').replace('-500', '-500/10'),
          )}>
            <Icon className={cn('h-[18px] w-[18px]', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
