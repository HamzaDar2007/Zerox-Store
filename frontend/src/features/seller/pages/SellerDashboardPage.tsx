import { Link } from 'react-router-dom';
import { useGetOrdersQuery, useGetProductsQuery } from '@/store/api';
import { StatCard } from '@/common/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { StatusBadge } from '@/common/components/StatusBadge';
import { ErrorState } from '@/common/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';
import { ShoppingBag, Package, DollarSign, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/common/components/ui/skeleton';

export default function SellerDashboardPage() {
  const { data: ordersData, isLoading: ordersLoading, isError: ordersError, refetch: refetchOrders } = useGetOrdersQuery({ page: 1, limit: 5 });
  const { data: productsData, isLoading: productsLoading, isError: productsError, refetch: refetchProducts } = useGetProductsQuery({ page: 1, limit: 100 });

  const isLoading = ordersLoading || productsLoading;
  const isError = ordersError || productsError;

  const orders = ordersData?.data?.items ?? [];
  const totalOrders = ordersData?.data?.total ?? 0;
  const products = productsData?.data?.items ?? [];
  const totalProducts = productsData?.data?.total ?? 0;
  const revenue = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
          <p className="text-muted-foreground">Overview of your store performance and recent activity.</p>
        </div>
        <ErrorState
          title="Failed to load dashboard"
          message="Could not fetch your dashboard data. Please try again."
          onRetry={() => { refetchOrders(); refetchProducts(); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your store performance and recent activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16" /></div>
          ))
        ) : (
          <>
            <StatCard title="Total Orders" value={totalOrders} icon={Package} />
            <StatCard title="Total Products" value={totalProducts} icon={ShoppingBag} />
            <StatCard title="Recent Revenue" value={formatCurrency(revenue)} icon={DollarSign} />
            <StatCard title="Active Products" value={products.filter((p) => p.status === 'active').length} icon={TrendingUp} />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <Link key={order.id} to={`/seller/orders/${order.id}`} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(order.totalAmount)}</span>
                      <StatusBadge status={order.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No products yet</p>
            ) : (
              <div className="space-y-3">
                {products.slice(0, 5).map((product) => (
                  <Link key={product.id} to={`/seller/products/${product.id}`} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs">
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover rounded" />
                        ) : (
                          product.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(product.price)}</p>
                      </div>
                    </div>
                    <StatusBadge status={product.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
