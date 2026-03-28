import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react'
import type { ShipmentEvent } from '@/types'

interface TrackingTimelineProps {
  events: ShipmentEvent[]
  currentStatus: string
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  picked_up: Package,
  in_transit: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle,
  failed: XCircle,
  returned: XCircle,
}

export function TrackingTimeline({ events, currentStatus: _currentStatus }: TrackingTimelineProps) {
  const sorted = [...events].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())

  if (sorted.length === 0) {
    return (
      <div className="text-sm text-[#565959] py-4 text-center">
        No tracking information available yet.
      </div>
    )
  }

  return (
    <div className="relative">
      {sorted.map((event, index) => {
        const Icon = STATUS_ICONS[event.status.toLowerCase()] ?? MapPin
        const isFirst = index === 0
        const isLast = index === sorted.length - 1

        return (
          <div key={event.id} className="flex gap-4 pb-6 last:pb-0">
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center">
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                isFirst ? 'bg-[#F57224] text-white' : 'bg-[#F0F2F2] text-[#565959]',
              )}>
                <Icon className="h-4 w-4" />
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-[#DDD] mt-1" />}
            </div>

            {/* Content */}
            <div className="pb-2">
              <p className={cn('text-sm font-medium', isFirst ? 'text-[#0F1111]' : 'text-[#565959]')}>
                {event.description ?? event.status.replace(/_/g, ' ')}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <time className="text-xs text-[#565959]">{formatDate(event.occurredAt)}</time>
                {event.location && (
                  <span className="text-xs text-[#565959] flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
