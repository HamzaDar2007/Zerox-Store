import { useQuery } from '@tanstack/react-query'
import { useSellerProfile } from '@/hooks/useSellerProfile'
import { ordersApi, productsApi, reviewsApi } from '@/services/api'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Package, ShoppingCart, Star, DollarSign, AlertTriangle, TrendingUp, ArrowRight, Plus, Boxes, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import type { Order, Product } from '@/types'
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/shared/skeletons'
import { useAuthStore } from '@/store/auth.store'

/**
 * Dashboard Page
 * Overview with stat cards, revenue chart, recent orders, and low stock alerts.
 */
export default function DashboardPage() {
  const navigate = useNavigate()
  const { store, isLoading: profileLoading } = useSellerProfile()
  const user = useAuthStore((s) => s.user)
  const storeId = store?.id

  const { data: products } = useQuery({
    queryKey: ['products', storeId],
    queryFn: () => productsApi.list({ storeId: storeId ?? '', page: 1, limit: 100 }),
    enabled: !!storeId,
  })

  const { data: orders } = useQuery({
    queryKey: ['orders', storeId],
    queryFn: () => ordersApi.list({ storeId: storeId ?? '', page: 1, limit: 100 }),
    enabled: !!storeId,
  })

  const { data: reviewsData } = useQuery({
    queryKey: ['store-reviews', storeId],
    queryFn: () => reviewsApi.list({ page: 1, limit: 100 }),
    enabled: !!storeId,
  })

  if (profileLoading) return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your store performance" />
      <StatCardSkeleton />
      <ChartSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><TableSkeleton rows={3} /><TableSkeleton rows={3} /></div>
    </div>
  )

  if (!storeId) {
    return (
      <EmptyState
        icon={Package}
        title="No Store Found"
        description="Complete your onboarding to set up your store."
        actionLabel="Set Up Store"
        onAction={() => navigate('/onboarding')}
      />
    )
  }

  const productList = (products?.data ?? products ?? []) as Product[]
  const orderList = (orders?.data ?? orders ?? []) as Order[]
  const totalProducts = Array.isArray(productList) ? productList.length : 0
  const totalOrders = Array.isArray(orderList) ? orderList.length : 0
  const totalRevenue = Array.isArray(orderList)
    ? orderList.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.totalAmount ?? 0), 0)
    : 0
  const reviewList = (reviewsData?.data ?? []) as { rating: number }[]
  const avgRating = reviewList.length ? reviewList.reduce((s, r) => s + r.rating, 0) / reviewList.length : 0

  const lowStockProducts = Array.isArray(productList) ? productList.filter((p) => (p.stockQuantity ?? 0) <= 5 && (p.stockQuantity ?? 0) > 0) : []
  const recentOrders = Array.isArray(orderList) ? orderList.slice(0, 5) : []

  // Simple monthly chart data from orders
  const chartMap = new Map<string, number>()
  if (Array.isArray(orderList)) {
    for (const o of orderList) {
      if (o.status === 'cancelled') continue
      const d = new Date(o.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      chartMap.set(key, (chartMap.get(key) ?? 0) + Number(o.totalAmount ?? 0))
    }
  }
  const chartData = [...chartMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, revenue]) => ({ month, revenue }))

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="welcome-gradient rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Welcome back, {user?.firstName ?? 'Seller'} 👋
            </h1>
            <p className="text-sm text-muted-foreground/70">Here&apos;s what&apos;s happening with your store today.</p>
          </div>
          <div className="flex gap-2.5">
            <Button size="sm" onClick={() => navigate('/products')} className="shadow-md shadow-primary/15 h-9 rounded-xl px-4">
              <Plus className="mr-1.5 h-3.5 w-3.5" />Add Product
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/orders')} className="h-9 rounded-xl px-4 border-border/50">
              <FileText className="mr-1.5 h-3.5 w-3.5" />Orders
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Products" value={totalProducts} icon={Package} iconColor="text-blue-500" />
        <StatCard label="Total Orders" value={totalOrders} icon={ShoppingCart} iconColor="text-emerald-500" />
        <StatCard label="Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} iconColor="text-amber-500" />
        <StatCard label="Avg. Rating" value={avgRating ? avgRating.toFixed(1) : 'N/A'} icon={Star} iconColor="text-purple-500" />
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <div className="chart-card-modern p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Monthly revenue overview</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px hsl(var(--foreground) / 0.08)',
                  fontSize: '13px',
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revenueGradient)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--background))' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="chart-card-modern">
          <div className="flex items-center justify-between border-b border-border/40 p-4 px-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <ShoppingCart className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Recent Orders</h3>
                <p className="text-xs text-muted-foreground">{totalOrders} total orders</p>
              </div>
            </div>
            <button onClick={() => navigate('/orders')} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="divide-y divide-border/30">
              {recentOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="text-[13px] font-medium">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-semibold tabular-nums">{formatCurrency(Number(order.totalAmount ?? 0))}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="chart-card-modern">
          <div className="flex items-center justify-between border-b border-border/40 p-4 px-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Low Stock Alerts</h3>
                <p className="text-xs text-muted-foreground">{lowStockProducts.length} items need attention</p>
              </div>
            </div>
            <button onClick={() => navigate('/inventory')} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View inventory <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                <Boxes className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">All stocked up!</p>
              <p className="text-xs text-muted-foreground/60">No low stock items to worry about</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku ?? 'N/A'}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">{product.stockQuantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
