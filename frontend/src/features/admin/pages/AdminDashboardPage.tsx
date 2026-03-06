import { Link } from 'react-router-dom';
import { useGetUsersQuery, useGetOrdersQuery, useGetSellersQuery } from '@/store/api';
import { StatCard } from '@/common/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { StatusBadge } from '@/common/components/StatusBadge';
import { ErrorState } from '@/common/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';
import { Users, Package, Store, DollarSign } from 'lucide-react';
import { Skeleton } from '@/common/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { data: usersData, isLoading: usersLoading, isError: usersError, refetch: refetchUsers } = useGetUsersQuery({ page: 1, limit: 1 });
  const { data: ordersData, isLoading: ordersLoading, isError: ordersError, refetch: refetchOrders } = useGetOrdersQuery({ page: 1, limit: 5 });
  const { data: sellersData, isLoading: sellersLoading, isError: sellersError, refetch: refetchSellers } = useGetSellersQuery();

  const isLoading = usersLoading || ordersLoading || sellersLoading;
  const isError = usersError || ordersError || sellersError;

  const totalUsers = usersData?.data?.total ?? 0;
  const orders = ordersData?.data?.items ?? [];
  const totalOrders = ordersData?.data?.total ?? 0;
  const sellers = sellersData?.data ?? [];
  const revenue = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview, key metrics, and recent activity.</p>
        </div>
        <ErrorState
          title="Failed to load dashboard"
          message="Could not fetch dashboard data. Please try again."
          onRetry={() => { refetchUsers(); refetchOrders(); refetchSellers(); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview, key metrics, and recent activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16" /></div>
          ))
        ) : (
          <>
            <StatCard title="Total Users" value={totalUsers} icon={Users} />
            <StatCard title="Total Orders" value={totalOrders} icon={Package} />
            <StatCard title="Active Sellers" value={sellers.length} icon={Store} />
            <StatCard title="Recent Revenue" value={formatCurrency(revenue)} icon={DollarSign} />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No orders</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Link key={order.id} to={`/admin/orders/${order.id}`} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            {sellers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No sellers</p>
            ) : (
              <div className="space-y-3">
                {sellers.slice(0, 5).map((seller) => (
                  <div key={seller.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium text-sm">{seller.businessName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(seller.createdAt)}</p>
                    </div>
                    <StatusBadge status={seller.verificationStatus} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
