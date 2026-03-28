import { useQuery } from '@tanstack/react-query'
import { ordersApi, paymentsApi } from '@/services/api'
import { useSellerProfile } from '@/hooks/useSellerProfile'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, TrendingUp, Receipt, Clock } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import type { Order, Payment } from '@/types'
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/shared/skeletons'

/**
 * Earnings Page
 * Revenue stats, monthly bar chart, and payment history.
 */
export default function EarningsPage() {
  const { store, isLoading: profileLoading } = useSellerProfile()
  const storeId = store?.id

  const { data: ordersData } = useQuery({
    queryKey: ['earnings-orders', storeId],
    queryFn: () => ordersApi.list({ storeId: storeId ?? '', page: 1, limit: 500 }),
    enabled: !!storeId,
  })

  const { data: paymentsData } = useQuery({
    queryKey: ['earnings-payments'],
    queryFn: () => paymentsApi.list({ page: 1, limit: 500 }),
    enabled: !!storeId,
  })

  if (profileLoading) return (
    <div className="space-y-6">
      <PageHeader title="Earnings" description="Track your revenue and payouts" />
      <StatCardSkeleton />
      <ChartSkeleton />
      <TableSkeleton rows={5} />
    </div>
  )
  if (!storeId) return <EmptyState icon={DollarSign} title="No Store" description="Complete onboarding first." />

  const orders = (ordersData?.data ?? ordersData ?? []) as Order[]
  const payments = (paymentsData?.data ?? paymentsData ?? []) as Payment[]

  const completedOrders = Array.isArray(orders) ? orders.filter((o) => o.status !== 'cancelled') : []
  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount ?? 0), 0)
  const pendingOrders = Array.isArray(orders) ? orders.filter((o) => o.status === 'pending') : []
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + Number(o.totalAmount ?? 0), 0)
  const totalPayments = Array.isArray(payments) ? payments.reduce((sum, p) => sum + Number(p.amount ?? 0), 0) : 0

  // Monthly revenue breakdown
  const monthMap = new Map<string, number>()
  for (const o of completedOrders) {
    const d = new Date(o.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, (monthMap.get(key) ?? 0) + Number(o.totalAmount ?? 0))
  }
  const monthlyData = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, revenue]) => ({ month, revenue }))

  // Recent payments
  const recentPayments = (Array.isArray(payments) ? payments : []).slice(0, 10)

  return (
    <div className="space-y-6">
      <PageHeader title="Earnings" description="Track your revenue and payouts" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} />
        <StatCard label="Pending Revenue" value={formatCurrency(pendingRevenue)} icon={Clock} />
        <StatCard label="Total Paid Out" value={formatCurrency(totalPayments)} icon={TrendingUp} />
        <StatCard label="Completed Orders" value={completedOrders.length} icon={Receipt} />
      </div>

      {monthlyData.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Payments */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="mb-3 font-medium">Recent Payments</h3>
          {recentPayments.length === 0 ? <p className="text-sm text-muted-foreground">No payments yet</p> : (
            <div className="divide-y">
              {recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(Number(p.amount ?? 0))}</p>
                    <p className="text-xs text-muted-foreground">{p.paymentMethod ?? p.method ?? 'N/A'} · {formatDate(p.createdAt)}</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
