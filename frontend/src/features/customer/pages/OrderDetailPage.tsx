import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetOrderByIdQuery, useCancelOrderMutation } from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { StatusBadge } from '@/common/components/StatusBadge';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { formatDate, formatCurrency } from '@/lib/format';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Separator } from '@/common/components/ui/separator';
import { Skeleton } from '@/common/components/ui/skeleton';
import { ArrowLeft, Package, Truck, MapPin, CreditCard, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { OrderStatus } from '@/common/types/enums';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data, isLoading, isError } = useGetOrderByIdQuery(orderId!, { skip: !orderId });
  const [cancelOrder] = useCancelOrderMutation();
  const [showCancel, setShowCancel] = useState(false);

  const order = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/account/orders">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddress as Record<string, string> | null;
  const canCancel = [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status as OrderStatus);

  const handleCancel = async () => {
    try {
      await cancelOrder({ id: order.id, reason: 'Cancelled by customer' }).unwrap();
      toast.success('Order cancelled successfully');
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setShowCancel(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/account/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={`Order #${order.orderNumber}`}
          description={`Placed on ${formatDate(order.createdAt)}`}
        >
          {canCancel && (
            <Button variant="destructive" onClick={() => setShowCancel(true)}>
              <XCircle className="mr-2 h-4 w-4" /> Cancel Order
            </Button>
          )}
        </PageHeader>
      </div>

      {/* Status */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={order.status} />
            </div>
          </div>
          {order.estimatedDeliveryDate && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Estimated Delivery</p>
              <p className="font-medium">{formatDate(order.estimatedDeliveryDate)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Shipping Address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" /> Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {addr ? (
              <div className="space-y-1">
                <p className="font-medium">{addr.fullName ?? '—'}</p>
                <p>{addr.streetAddress}</p>
                <p>
                  {addr.city}, {addr.province} {addr.postalCode}
                </p>
                <p>{addr.country}</p>
                {addr.phone && <p className="text-muted-foreground">{addr.phone}</p>}
              </div>
            ) : (
              <p className="text-muted-foreground">No address provided</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" /> Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="capitalize">{order.paymentMethod ?? '—'}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatCurrency(order.shippingAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {order.items?.map((item) => {
              const snap = item.productSnapshot as Record<string, unknown> | null;
              return (
                <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                    {(snap?.name as string)?.slice(0, 2)?.toUpperCase() ?? 'PR'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{(snap?.name as string) ?? 'Product'}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="font-medium">{formatCurrency(item.totalAmount)}</p>
                </div>
              );
            })}
            {(!order.items || order.items.length === 0) && (
              <p className="py-4 text-sm text-muted-foreground">No items</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipments */}
      {order.shipments && order.shipments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-4 w-4" /> Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.shipments.map((shipment) => (
                <div key={shipment.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{shipment.shipmentNumber}</p>
                    <StatusBadge status={shipment.status} />
                  </div>
                  {shipment.carrierName && (
                    <p className="text-sm text-muted-foreground">
                      Carrier: {shipment.carrierName}
                    </p>
                  )}
                  {shipment.trackingNumber && (
                    <p className="text-sm">
                      Tracking:{' '}
                      {shipment.trackingUrl ? (
                        <a
                          href={shipment.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {shipment.trackingNumber}
                        </a>
                      ) : (
                        shipment.trackingNumber
                      )}
                    </p>
                  )}
                  {shipment.shippedAt && (
                    <p className="text-sm text-muted-foreground">
                      Shipped: {formatDate(shipment.shippedAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.statusHistory.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={entry.newStatus} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="mt-1 text-sm text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Notes */}
      {order.customerNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{order.customerNotes}</p>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        onConfirm={handleCancel}
        destructive
      />
    </div>
  );
}
