import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usersApi, ordersApi, productsApi, reviewsApi } from '@/services/api'
import { StatCard } from '@/components/shared/stat-card'
import { Users, Package, ShoppingCart, Star, DollarSign, Plus, FileText, FolderTree } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function DashboardPage() {
  const navigate = useNavigate()
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the Admin Portal</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate('/products')}><Plus className="mr-1 h-4 w-4" />Add Product</Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/categories')}><FolderTree className="mr-1 h-4 w-4" />Categories</Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/orders')}><FileText className="mr-1 h-4 w-4" />Orders</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} iconColor={stat.color} isLoading={isLoading} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} iconColor="text-green-500" isLoading={isLoading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(142.1, 76.2%, 36.3%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {orderStatusData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {orderStatusData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  {item.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ordersData?.data?.length ? (
                ordersData.data.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${order.total?.toFixed(2)}</p>
                      <p className="text-xs capitalize text-muted-foreground">{order.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
