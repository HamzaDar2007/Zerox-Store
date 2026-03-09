import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import { PageHeader } from '@/common/components/PageHeader';
import { StatCard } from '@/common/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';
import { useGetProductsQuery, useGetOrdersQuery } from '@/store/api';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#22c55e',
  CANCELLED: '#ef4444',
};

export default function SellerAnalyticsPage() {
  const { data: productsData, isLoading: loadingProducts } = useGetProductsQuery({
    page: 1,
    limit: 1,
  });
  const { data: ordersData, isLoading: loadingOrders } = useGetOrdersQuery({
    page: 1,
    limit: 100,
  });

  const totalProducts = productsData?.data?.total ?? 0;
  const orders = ordersData?.data?.items ?? [];
  const totalOrders = ordersData?.data?.total ?? orders.length;

  const isLoading = loadingProducts || loadingOrders;

  // Compute revenue
  const totalRevenue = useMemo(
    () => orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount ?? 0), 0),
    [orders],
  );

  // Orders by status for pie chart
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o: any) => {
      const s = o.status ?? 'UNKNOWN';
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Revenue over last 7 days for line chart
  const revenueByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      map[d.toISOString().slice(0, 10)] = 0;
    }
    orders.forEach((o: any) => {
      const day = (o.createdAt ?? '').slice(0, 10);
      if (day in map) map[day] += Number(o.totalAmount ?? 0);
    });
    return Object.entries(map).map(([date, revenue]) => ({
      date: date.slice(5), // MM-DD
      revenue: Math.round(revenue * 100) / 100,
    }));
  }, [orders]);

  // Orders per day for bar chart
  const ordersPerDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      map[d.toISOString().slice(0, 10)] = 0;
    }
    orders.forEach((o: any) => {
      const day = (o.createdAt ?? '').slice(0, 10);
      if (day in map) map[day]++;
    });
    return Object.entries(map).map(([date, count]) => ({
      date: date.slice(5),
      orders: count,
    }));
  }, [orders]);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Overview of your store performance" />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard title="Total Products" value={totalProducts} icon={Package} />
            <StatCard title="Total Orders" value={totalOrders} icon={ShoppingCart} />
            <StatCard
              title="Revenue"
              value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={DollarSign}
            />
            <StatCard
              title="Avg Order Value"
              value={totalOrders > 0 ? `$${(totalRevenue / totalOrders).toFixed(2)}` : '—'}
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : statusData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">No orders yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Orders per Day Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orders Per Day (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ordersPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
