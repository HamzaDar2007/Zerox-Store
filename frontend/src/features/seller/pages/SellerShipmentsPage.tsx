import { useGetOrdersQuery } from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Badge } from '@/common/components/ui/badge';
import { Truck, Package, MapPin, Clock } from 'lucide-react';
import { OrderStatus } from '@/common/types/enums';

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  returned: 'bg-red-100 text-red-700',
};

export default function SellerShipmentsPage() {
  const { data, isLoading } = useGetOrdersQuery({ status: OrderStatus.SHIPPED, limit: 50 });
  const shipments = data?.data?.items ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Shipments" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Shipments" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Truck className="mx-auto h-6 w-6 text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{shipments.length}</p>
            <p className="text-xs text-muted-foreground">Total Shipments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="mx-auto h-6 w-6 text-yellow-500 mb-1" />
            <p className="text-2xl font-bold">{shipments.filter((s: any) => s.status === 'pending' || s.status === 'processing').length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="mx-auto h-6 w-6 text-green-500 mb-1" />
            <p className="text-2xl font-bold">{shipments.filter((s: any) => s.status === 'delivered').length}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipment List</CardTitle>
        </CardHeader>
        <CardContent>
          {shipments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No shipments yet</p>
          ) : (
            <div className="divide-y">
              {shipments.map((ship: any) => (
                <div key={ship.id} className="flex items-center gap-4 py-3">
                  <Truck className="h-8 w-8 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Order #{ship.orderNumber ?? ship.id?.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(ship.shippedAt ?? ship.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={statusColor[ship.status] ?? 'bg-gray-100 text-gray-700'}>
                    {ship.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
