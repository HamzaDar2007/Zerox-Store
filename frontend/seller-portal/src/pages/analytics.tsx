/**
 * Analytics Page
 * Detailed insights: revenue trends, daily orders, status distribution,
 * customer segmentation (new vs repeat), review stats, with a date range filter.
 */
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ordersApi, productsApi, reviewsApi } from '@/services/api'
import { useSellerProfile } from '@/hooks/useSellerProfile'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, TrendingUp, ShoppingCart, Package, Star, DollarSign, Users } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts'
import type { Order, Product } from '@/types'
import { StatCardSkeleton, ChartSkeleton } from '@/components/shared/skeletons'

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function AnalyticsPage() {
  const { store, isLoading: profileLoading } = useSellerProfile()
  const storeId = store?.id

  // Date range state (defaults to last 30 days)
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = new Date(end.getTime() - 30 * 86400000)
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
  })

  const { data: ordersData } = useQuery({
    queryKey: ['analytics-orders', storeId],
    queryFn: () => ordersApi.list({ storeId: storeId ?? '', page: 1, limit: 1000 }),
    enabled: !!storeId,
  })

  const { data: productsData } = useQuery({
    queryKey: ['analytics-products', storeId],
    queryFn: () => productsApi.list({ storeId: storeId ?? '', page: 1, limit: 500 }),
    enabled: !!storeId,
  })

  const { data: reviewsListData } = useQuery({
    queryKey: ['analytics-reviews'],
    queryFn: () => reviewsApi.list({ page: 1, limit: 100 }),
    enabled: !!storeId,
  })
  const reviewsList = (reviewsListData?.data ?? []) as { rating: number }[]
  const summary = reviewsList.length
    ? { avg: reviewsList.reduce((s, r) => s + r.rating, 0) / reviewsList.length, count: reviewsList.length }
    : { avg: 0, count: 0 }

  const allOrders = useMemo(() => (ordersData?.data ?? ordersData ?? []) as Order[], [ordersData])
  const products = (productsData?.data ?? productsData ?? []) as Product[]

  // Filter orders by date range
  const orders = useMemo(() => {
    const startTs = new Date(dateRange.start).getTime()
    const endTs = new Date(dateRange.end).getTime() + 86400000
    return Array.isArray(allOrders) ? allOrders.filter((o) => {
      const t = new Date(o.createdAt).getTime()
      return t >= startTs && t < endTs
    }) : []
  }, [allOrders, dateRange])

  // Customer segmentation: new vs repeat
  const customerOrders = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of (Array.isArray(allOrders) ? allOrders : [])) {
      map.set(o.userId, (map.get(o.userId) ?? 0) + 1)
    }
    let newCustomers = 0
    let repeatCustomers = 0
    for (const count of map.values()) {
      if (count === 1) newCustomers++
      else repeatCustomers++
    }
    return { newCustomers, repeatCustomers, total: map.size }
  }, [allOrders])

  if (profileLoading) return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Detailed insights into your store performance" />
      <StatCardSkeleton />
      <ChartSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><ChartSkeleton /><ChartSkeleton /></div>
    </div>
  )
  if (!storeId) return <EmptyState icon={BarChart3} title="No Store" description="Complete onboarding first." />

  const validOrders = orders.filter((o) => o.status !== 'cancelled')
  const totalRevenue = validOrders.reduce((s, o) => s + Number(o.totalAmount ?? 0), 0)
  const avgOrderValue = validOrders.length ? totalRevenue / validOrders.length : 0

  // Daily orders trend using selected date range
  const dailyMap = new Map<string, { orders: number; revenue: number }>()
  const rangeStartTs = new Date(dateRange.start).getTime()
  const rangeEndTs = new Date(dateRange.end).getTime()
  const dayCount = Math.max(1, Math.round((rangeEndTs - rangeStartTs) / 86400000) + 1)
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(rangeEndTs - i * 86400000)
    const key = d.toISOString().slice(0, 10)
    dailyMap.set(key, { orders: 0, revenue: 0 })
  }
  for (const o of validOrders) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10)
    if (dailyMap.has(key)) {
      const entry = dailyMap.get(key)
      if (!entry) continue
      entry.orders += 1
      entry.revenue += Number(o.totalAmount ?? 0)
    }
  }
  const dailyData = [...dailyMap.entries()].map(([day, v]) => ({ day: day.slice(5), ...v }))

  // Order status distribution
  const statusMap = new Map<string, number>()
  if (Array.isArray(orders)) {
    for (const o of orders) {
      statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1)
    }
  }
  const statusData = [...statusMap.entries()].map(([name, value]) => ({ name, value }))

  // Product status distribution
  const productStatusMap = new Map<string, number>()
  if (Array.isArray(products)) {
    for (const p of products) {
      const status = p.isActive ? 'Active' : 'Inactive'
      productStatusMap.set(status, (productStatusMap.get(status) ?? 0) + 1)
    }
  }
  const productStatusData = [...productStatusMap.entries()].map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Detailed insights into your store performance" />

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Start Date</Label>
          <Input type="date" value={dateRange.start} onChange={(e) => setDateRange((r) => ({ ...r, start: e.target.value }))} className="w-full sm:w-40" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">End Date</Label>
          <Input type="date" value={dateRange.end} onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))} className="w-full sm:w-40" />
        </div>
        <div className="flex gap-1">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted/60 transition-colors"
              onClick={() => {
                const end = new Date()
                const start = new Date(end.getTime() - days * 86400000)
                setDateRange({ start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) })
              }}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} />
        <StatCard label="Total Orders" value={validOrders.length} icon={ShoppingCart} />
        <StatCard label="Avg Order Value" value={formatCurrency(avgOrderValue)} icon={TrendingUp} />
        <StatCard label="Products" value={Array.isArray(products) ? products.length : 0} icon={Package} />
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Revenue Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Orders trend & pie charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Daily Orders (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Order Status Distribution</h3>
            {statusData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No data yet</p> : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review & Product stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Review Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <Star className="mx-auto mb-2 h-6 w-6 text-amber-400" />
                <p className="text-2xl font-bold">{summary?.avg?.toFixed(1) ?? 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">{summary?.count ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Product Status</h3>
            {productStatusData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No products yet</p> : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={productStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {productStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Insights */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Customer Insights</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <Users className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold">{customerOrders.total}</p>
              <p className="text-xs text-muted-foreground">Total Customers</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{customerOrders.newCustomers}</p>
              <p className="text-xs text-muted-foreground">New Customers (1 order)</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-primary">{customerOrders.repeatCustomers}</p>
              <p className="text-xs text-muted-foreground">Repeat Customers (2+ orders)</p>
            </div>
          </div>
          {customerOrders.total > 0 && (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { type: 'New', count: customerOrders.newCustomers },
                  { type: 'Repeat', count: customerOrders.repeatCustomers },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="type" className="text-xs" />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
