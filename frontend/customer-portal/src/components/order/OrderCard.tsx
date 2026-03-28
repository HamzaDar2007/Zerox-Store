import { Link } from 'react-router-dom'
import { formatPrice, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import type { Order } from '@/types'
import { cn } from '@/lib/utils'
import { Package, ChevronRight } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
}

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const statusColor = STATUS_COLORS[order.status.toLowerCase()] ?? 'bg-gray-100 text-gray-800'

  return (
    <div className="bg-white rounded-[8px] border border-[#DDD] overflow-hidden">
      {/* Header */}
      <div className="bg-[#F0F2F2] px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm border-b border-[#DDD]">
        <div className="flex gap-6">
          <div>
            <span className="text-[#565959] text-xs uppercase">Order Placed</span>
            <p className="text-[#0F1111] font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <span className="text-[#565959] text-xs uppercase">Total</span>
            <p className="text-[#0F1111] font-bold">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('text-xs font-bold px-3 py-1 rounded-full', statusColor)}>
            {order.status}
          </span>
          <span className="text-xs text-[#565959]">Order #{order.id.slice(-8).toUpperCase()}</span>
        </div>
      </div>

      {/* Items Preview */}
      <div className="p-4">
        {order.items?.slice(0, 3).map((item) => {
          const image = item.variant?.product?.images?.find((i) => i.isPrimary) ?? item.variant?.product?.images?.[0]
          return (
            <div key={item.id} className="flex items-center gap-3 py-2 first:pt-0 border-b border-[#DDD] last:border-0">
              <div className="h-16 w-16 bg-[#F7F8F8] rounded overflow-hidden shrink-0">
                {image ? (
                  <img src={image.url} alt={item.nameSnapshot} className="h-full w-full object-contain" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center"><Package className="h-6 w-6 text-[#565959]" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#0F1111] line-clamp-1 font-medium">{item.nameSnapshot}</p>
                <p className="text-xs text-[#565959]">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
              </div>
              <p className="text-sm font-bold text-[#0F1111]">{formatPrice(item.totalAmount)}</p>
            </div>
          )
        })}
        {(order.items?.length ?? 0) > 3 && (
          <p className="text-xs text-[#565959] mt-2">+{(order.items?.length ?? 0) - 3} more items</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <Link to={ROUTES.ACCOUNT_ORDER_DETAIL.replace(':id', order.id)}>
            <Button variant="outline" size="sm">
              View Order Details <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          {order.status.toLowerCase() === 'delivered' && (
            <Link to={`${ROUTES.ACCOUNT_RETURNS}?orderId=${order.id}`}>
              <Button variant="ghost" size="sm" className="text-[#007185]">Return/Refund</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
