import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usersApi, ordersApi, productsApi, reviewsApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { StatCard } from '@/components/shared/stat-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { Users, Package, ShoppingCart, Star, DollarSign, Plus, FileText, TrendingUp, ArrowRight } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['users', { page: 1, limit: 1 }],
    queryFn: () => usersApi.list({ page: 1, limit: 1 }),
  })
  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders', { page: 1, limit: 5 }],
    queryFn: () => ordersApi.list({ page: 1, limit: 5 }),
  })
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', { page: 1, limit: 1 }],
    queryFn: () => productsApi.list({ page: 1, limit: 1 }),
  })
  const { data: reviewsData, isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews', { page: 1, limit: 1 }],
    queryFn: () => reviewsApi.list({ page: 1, limit: 1 }),
  })

  const isLoading = loadingUsers || loadingOrders || loadingProducts || loadingReviews

  const { data: recentOrdersData } = useQuery({
    queryKey: ['orders', { page: 1, limit: 50 }],
    queryFn: () => ordersApi.list({ page: 1, limit: 50 }),
  })

  const totalRevenue = ordersData?.data?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0

  const monthlyData = useMemo(() => {
    const orders = recentOrdersData?.data ?? []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const grouped: Record<string, { orders: number; revenue: number }> = {}
    for (const o of orders) {
      const d = new Date(o.createdAt)
      const key = months[d.getMonth()]
      if (!grouped[key]) grouped[key] = { orders: 0, revenue: 0 }
      grouped[key].orders++
      grouped[key].revenue += o.total ?? 0
    }
    return Object.entries(grouped).map(([month, v]) => ({ month, ...v }))
  }, [recentOrdersData])

  const orderStatusData = useMemo(() => {
    const orders = recentOrdersData?.data ?? []
    const counts: Record<string, number> = {}
    for (const o of orders) {
      const s = o.status ?? 'unknown'
      counts[s] = (counts[s] ?? 0) + 1
    }
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
  }, [recentOrdersData])

  const stats = [
    { label: 'Total Users', value: usersData?.total ?? 0, icon: Users, color: 'text-blue-500' },
    { label: 'Total Products', value: productsData?.total ?? 0, icon: Package, color: 'text-green-500' },
    { label: 'Total Orders', value: ordersData?.total ?? 0, icon: ShoppingCart, color: 'text-orange-500' },
    { label: 'Total Reviews', value: reviewsData?.total ?? 0, icon: Star, color: 'text-purple-500' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="welcome-gradient rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {getGreeting()}, {user?.firstName ?? 'Admin'} 👋
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

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} iconColor={stat.color} isLoading={isLoading} />
        ))}
        <StatCard label="Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} iconColor="text-emerald-500" isLoading={isLoading} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="chart-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Monthly Orders</CardTitle>
              <p className="text-xs text-muted-foreground/50">Order volume over time</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
                <XAxis dataKey="month" className="text-[11px]" axisLine={false} tickLine={false} dy={8} />
                <YAxis className="text-[11px]" axisLine={false} tickLine={false} dx={-4} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border) / 0.4)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  cursor={{ fill: 'hsl(var(--muted) / 0.25)' }}
                />
                <Bar dataKey="orders" fill="hsl(221.2, 83.2%, 53.3%)" radius={[8, 8, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="chart-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Revenue Trend</CardTitle>
              <p className="text-xs text-muted-foreground/50">Revenue performance over time</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142.1, 76.2%, 36.3%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142.1, 76.2%, 36.3%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
                <XAxis dataKey="month" className="text-[11px]" axisLine={false} tickLine={false} dy={8} />
                <YAxis className="text-[11px]" axisLine={false} tickLine={false} dx={-4} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border) / 0.4)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  cursor={{ stroke: 'hsl(var(--muted-foreground) / 0.15)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(142.1, 76.2%, 36.3%)" strokeWidth={2.5} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="chart-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Order Status</CardTitle>
            <p className="text-xs text-muted-foreground/50">Distribution by status</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={58} outerRadius={82} paddingAngle={3} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))">
                  {orderStatusData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border) / 0.4)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
              {orderStatusData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-xs text-muted-foreground/70">
                  <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground/40">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 chart-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Recent Orders</CardTitle>
              <p className="text-xs text-muted-foreground/50">Latest 5 orders placed</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/orders')} className="text-xs text-primary/70 hover:text-primary h-8 px-3 rounded-lg">
              View all <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ordersData?.data?.length ? (
                ordersData.data.map((order) => (
                  <div key={order.id} className="order-row-hover flex items-center justify-between rounded-xl border border-border/30 p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-[11px] text-muted-foreground/50">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <p className="text-[13px] font-bold min-w-[60px] text-right tabular-nums">${order.total?.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
                    <ShoppingCart className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground/60">No recent orders</p>
                  <p className="text-xs text-muted-foreground/40">Orders will appear here once placed</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
