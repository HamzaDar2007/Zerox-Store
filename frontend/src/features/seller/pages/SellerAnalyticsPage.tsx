import { PageHeader } from '@/common/components/PageHeader';
import { StatCard } from '@/common/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';
import { useGetProductsQuery, useGetOrdersQuery } from '@/store/api';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export default function SellerAnalyticsPage() {
  const { data: productsData, isLoading: loadingProducts } = useGetProductsQuery({
    page: 1,
    limit: 1,
  });
  const { data: ordersData, isLoading: loadingOrders } = useGetOrdersQuery({
    page: 1,
    limit: 1,
  });

  const totalProducts = productsData?.data?.total ?? 0;
  const totalOrders = ordersData?.data?.total ?? 0;

  const isLoading = loadingProducts || loadingOrders;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Overview of your store performance" />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard
              title="Total Products"
              value={totalProducts}
              icon={Package}
            />
            <StatCard
              title="Total Orders"
              value={totalOrders}
              icon={ShoppingCart}
            />
            <StatCard
              title="Revenue"
              value="—"
              icon={DollarSign}
              description="Coming soon"
            />
            <StatCard
              title="Conversion Rate"
              value="—"
              icon={TrendingUp}
              description="Coming soon"
            />
          </>
        )}
      </div>

      {/* Chart placeholders */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Chart coming soon — integrate with Recharts
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Chart coming soon — integrate with Recharts
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Product ranking coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
