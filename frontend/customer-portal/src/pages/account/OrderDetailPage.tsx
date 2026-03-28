import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SEOHead } from '@/components/common/SEOHead'
import { TrackingTimeline } from '@/components/order/TrackingTimeline'
import { InvoiceButton } from '@/components/order/InvoiceButton'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ordersApi, shippingApi } from '@/services/api'
import { formatPrice, formatDate } from '@/lib/format'
import { ROUTES } from '@/constants/routes'
import type { Order, OrderItem, Shipment, ShipmentEvent } from '@/types'
import { ArrowLeft, Package, MapPin, Truck } from 'lucide-react'
import { toast } from 'sonner'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [events, setEvents] = useState<ShipmentEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([ordersApi.get(id), ordersApi.getItems(id)]).then(async ([o, its]) => {
      setOrder(o)
      setItems(its)

      // Load shipments
      try {
        const ships = await shippingApi.getOrderShipments(id)
        setShipments(ships)
        if (ships[0]) {
          const evts = await shippingApi.getShipmentEvents(ships[0].id)
          setEvents(evts)
        }
      } catch { /* no shipments */ }

      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!order || !confirm('Are you sure you want to cancel this order?')) return
    try {
      const updated = await ordersApi.cancel(order.id)
      setOrder(updated)
      toast.success('Order cancelled')
    } catch {
      toast.error('Failed to cancel order')
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-64" /></div>
  if (!order) return <div className="text-center py-16"><h2 className="text-xl font-bold">Order not found</h2></div>

  const canCancel = ['pending', 'confirmed'].includes(order.status.toLowerCase())

  return (
    <>
      <SEOHead title={`Order #${order.id.slice(-8).toUpperCase()}`} />
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to={ROUTES.ACCOUNT_ORDERS}><ArrowLeft className="h-5 w-5 text-[#64748B] hover:text-[#0F172A] cursor-pointer" /></Link>
            <h1 className="text-xl font-bold text-[#0F172A]">Order #{order.id.slice(-8).toUpperCase()}</h1>
            <span className="text-sm capitalize px-3 py-1 rounded-full bg-[#F1F5F9] text-[#0F172A] font-medium">{order.status}</span>
          </div>
          <div className="flex gap-2">
            <InvoiceButton order={order} />
            {canCancel && <Button variant="outline" size="sm" className="text-[#EF4444]" onClick={handleCancel}>Cancel Order</Button>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items + Tracking */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <h2 className="text-sm font-bold text-[#0F172A] mb-3">Order Items</h2>
              {items.map((item) => {
                const image = item.variant?.product?.images?.find((i) => i.isPrimary) ?? item.variant?.product?.images?.[0]
                return (
                  <div key={item.id} className="flex items-center gap-3 py-3 border-b border-[#E2E8F0] last:border-0">
                    <div className="h-16 w-16 bg-[#F8FAFC] rounded overflow-hidden shrink-0">
                      {image ? <img src={image.url} alt={item.nameSnapshot} className="h-full w-full object-contain" /> : <Package className="h-8 w-8 text-[#64748B] m-auto mt-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0F172A] font-medium line-clamp-1">{item.nameSnapshot}</p>
                      <p className="text-xs text-[#64748B]">SKU: {item.skuSnapshot} · Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-[#0F172A]">{formatPrice(item.totalAmount)}</p>
                  </div>
                )
              })}
            </div>

            {/* Tracking */}
            {shipments.length > 0 && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 text-[#6366F1]" />
                  <h2 className="text-sm font-bold text-[#0F172A]">Tracking</h2>
                </div>
                {shipments[0]?.trackingNumber && (
                  <p className="text-sm text-[#64748B] mb-4">Tracking #: <span className="font-medium text-[#0F172A]">{shipments[0].trackingNumber}</span></p>
                )}
                <TrackingTimeline events={events} currentStatus={shipments[0]?.status ?? ''} />
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-3">
              <h3 className="text-sm font-bold text-[#0F172A]">Order Summary</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-[#64748B]">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                {order.discountAmount > 0 && <div className="flex justify-between text-[#10B981]"><span>Discount</span><span>-{formatPrice(order.discountAmount)}</span></div>}
                <div className="flex justify-between"><span className="text-[#64748B]">Shipping</span><span>{formatPrice(order.shippingAmount)}</span></div>
                {order.taxAmount > 0 && <div className="flex justify-between"><span className="text-[#64748B]">Tax</span><span>{formatPrice(order.taxAmount)}</span></div>}
                <Separator />
                <div className="flex justify-between font-bold text-lg text-[#EF4444]"><span>Total</span><span>{formatPrice(order.totalAmount)}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <div className="flex items-center gap-2 mb-2"><MapPin className="h-4 w-4 text-[#6366F1]" /><h3 className="text-sm font-bold text-[#0F172A]">Shipping Address</h3></div>
              <p className="text-sm text-[#64748B]">
                {order.shippingLine1}{order.shippingLine2 ? `, ${order.shippingLine2}` : ''}<br />
                {order.shippingCity}{order.shippingState ? `, ${order.shippingState}` : ''} {order.shippingPostalCode}<br />
                {order.shippingCountry}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <p className="text-xs text-[#64748B]">Placed on {formatDate(order.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
