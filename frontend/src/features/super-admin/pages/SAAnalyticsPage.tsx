import { PageHeader } from '@/common/components/PageHeader';
import { StatCard } from '@/common/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';
import {
  useGetUsersQuery,
  useGetProductsQuery,
  useGetOrdersQuery,
  useGetSellersQuery,
} from '@/store/api';
import {
  Users,
  Package,
  ShoppingCart,
  Store,
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
} from 'lucide-react';

/** Extract count from either a flat array or paginated { items, total } response */
function getTotalCount(data: unknown): number {
  if (Array.isArray(data)) return data.length;
  if (data && typeof data === 'object' && 'total' in data) return (data as { total: number }).total;
  return 0;
}

export default function SAAnalyticsPage() {
  const { data: usersData, isLoading: loadingUsers } = useGetUsersQuery({ page: 1, limit: 1 });
  const { data: productsData, isLoading: loadingProducts } = useGetProductsQuery({ page: 1, limit: 1 });
  const { data: ordersData, isLoading: loadingOrders } = useGetOrdersQuery({ page: 1, limit: 1 });
  const { data: sellersData, isLoading: loadingSellers } = useGetSellersQuery();

  const totalUsers = getTotalCount(usersData?.data);
  const totalProducts = getTotalCount(productsData?.data);
  const totalOrders = getTotalCount(ordersData?.data);
  const totalSellers = getTotalCount(sellersData?.data);

  const isLoading = loadingUsers || loadingProducts || loadingOrders || loadingSellers;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics"
        description="System-wide metrics and performance overview"
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard title="Total Users" value={totalUsers} icon={Users} />
            <StatCard title="Total Products" value={totalProducts} icon={Package} />
            <StatCard title="Total Orders" value={totalOrders} icon={ShoppingCart} />
            <StatCard title="Active Sellers" value={totalSellers} icon={Store} />
          </>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Growth Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Users</span>
                </div>
                <span className="text-sm font-bold">{totalUsers}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sellers</span>
                </div>
                <span className="text-sm font-bold">{totalSellers}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Products</span>
                </div>
                <span className="text-sm font-bold">{totalProducts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Orders</span>
                </div>
                <span className="text-sm font-bold">{totalOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              Platform Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">System Status</span>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Revenue</span>
                </div>
                <span className="text-sm text-muted-foreground">Coming soon</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Conversion Rate</span>
                </div>
                <span className="text-sm text-muted-foreground">Coming soon</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Avg Order Value</span>
                </div>
                <span className="text-sm text-muted-foreground">Coming soon</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
