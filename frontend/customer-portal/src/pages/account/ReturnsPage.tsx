import { useEffect, useState } from 'react'
import { SEOHead } from '@/components/common/SEOHead'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { ReturnForm } from '@/components/order/ReturnForm'
import { returnsApi, ordersApi } from '@/services/api'
import { useSearchParams } from 'react-router-dom'
import { formatPrice, formatDate } from '@/lib/format'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Return, Order } from '@/types'
import { RotateCcw } from 'lucide-react'

export default function ReturnsPage() {
  const [searchParams] = useSearchParams()
  const [returns, setReturns] = useState<Return[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const orderId = searchParams.get('orderId')

  useEffect(() => {
    returnsApi.list({ limit: 50 }).then((res) => setReturns(res.data)).catch(() => {}).finally(() => setLoading(false))

    // Auto-open form if orderId is in URL
    if (orderId) {
      ordersApi.get(orderId).then((order) => {
        setSelectedOrder(order)
        setShowForm(true)
      }).catch(() => {})
    }
  }, [orderId])

  const handleReturnSuccess = () => {
    setShowForm(false)
    setSelectedOrder(null)
    returnsApi.list({ limit: 50 }).then((res) => setReturns(res.data)).catch(() => {})
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>

  return (
    <>
      <SEOHead title="Returns & Refunds" />
      <div>
        <h1 className="text-xl font-bold text-[#0F1111] mb-6">Returns & Refunds</h1>

        {returns.length === 0 && !showForm ? (
          <EmptyState icon={<RotateCcw className="h-16 w-16" />} title="No return requests" description="You haven't made any return requests." />
        ) : (
          <div className="space-y-4">
            {returns.map((ret) => (
              <div key={ret.id} className="bg-white rounded-[8px] border border-[#DDD] p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-[#0F1111]">Return #{ret.id.slice(-8).toUpperCase()}</p>
                  <span className="text-xs capitalize px-3 py-1 rounded-full bg-[#F0F2F2] font-medium">{ret.status}</span>
                </div>
                <p className="text-sm text-[#565959]">Reason: {ret.reason}</p>
                <p className="text-xs text-[#565959] mt-1">Submitted: {formatDate(ret.createdAt)}</p>
                {ret.refundAmount != null && ret.refundAmount > 0 && (
                  <p className="text-sm text-[#007600] font-medium mt-1">Refund: {formatPrice(ret.refundAmount)}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Request a Return</DialogTitle></DialogHeader>
            {selectedOrder && <ReturnForm order={selectedOrder} onSuccess={handleReturnSuccess} />}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
