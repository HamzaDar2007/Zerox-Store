import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { SEOHead } from '@/components/common/SEOHead'
import { ordersApi } from '@/services/api'
import { formatPrice, formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import type { Order } from '@/types'
import { CheckCircle, Package } from 'lucide-react'

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (orderId) {
      ordersApi.get(orderId).then(setOrder).catch(() => {})
    }
  }, [orderId])

  return (
    <>
      <SEOHead title="Order Confirmed" />
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-[#10B981] h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Order Confirmed!</h1>
        <p className="text-[#64748B] mb-6">
          Thank you for your purchase. Your order has been placed and is being processed.
        </p>

        {order && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 text-left mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[#64748B] text-xs uppercase">Order Number</span>
                <p className="font-bold text-[#0F172A]">#{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <span className="text-[#64748B] text-xs uppercase">Date</span>
                <p className="font-medium text-[#0F172A]">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <span className="text-[#64748B] text-xs uppercase">Total</span>
                <p className="font-bold text-[#EF4444]">{formatPrice(order.totalAmount)}</p>
              </div>
              <div>
                <span className="text-[#64748B] text-xs uppercase">Status</span>
                <p className="font-medium text-[#10B981] capitalize">{order.status}</p>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2">
                    <Package className="h-5 w-5 text-[#64748B]" />
                    <span className="text-sm text-[#0F172A] flex-1">{item.nameSnapshot}</span>
                    <span className="text-sm text-[#64748B]">×{item.quantity}</span>
                    <span className="text-sm font-bold text-[#0F172A]">{formatPrice(item.totalAmount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={ROUTES.ACCOUNT_ORDERS}>
            <Button variant="outline" size="lg">View My Orders</Button>
          </Link>
          <Link to={ROUTES.HOME}>
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </>
  )
}
