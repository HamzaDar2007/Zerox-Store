import { Link } from 'react-router-dom';
import { useGetUsersQuery, useGetOrdersQuery, useGetSellersQuery } from '@/store/api';
import { StatCard } from '@/common/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { StatusBadge } from '@/common/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/format';
import { Users, Package, Store, DollarSign } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: usersData } = useGetUsersQuery({ page: 1, limit: 1 });
  const { data: ordersData } = useGetOrdersQuery({ page: 1, limit: 5 });
  const { data: sellersData } = useGetSellersQuery();

  const totalUsers = usersData?.data?.total ?? 0;
  const orders = ordersData?.data?.items ?? [];
  const totalOrders = ordersData?.data?.total ?? 0;
  const sellers = sellersData?.data ?? [];
  const revenue = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview, key metrics, and recent activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={totalUsers} icon={Users} />
        <StatCard title="Total Orders" value={totalOrders} icon={Package} />
        <StatCard title="Active Sellers" value={sellers.length} icon={Store} />
        <StatCard title="Recent Revenue" value={formatCurrency(revenue)} icon={DollarSign} />
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
