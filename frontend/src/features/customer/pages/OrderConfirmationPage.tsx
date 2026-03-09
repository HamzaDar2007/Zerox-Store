import { useParams, Link } from 'react-router-dom';
import { useGetOrderByIdQuery } from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { Card, CardContent } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { Skeleton } from '@/common/components/ui/skeleton';
import { Separator } from '@/common/components/ui/separator';
import { PriceDisplay } from '@/common/components/PriceDisplay';
import { formatCurrency } from '@/lib/format';
import { CheckCircle2, Package, ArrowRight, Printer } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data, isLoading } = useGetOrderByIdQuery(orderId!, { skip: !orderId });
  const order = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Order Confirmation" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6 text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Order not found</h2>
        <Button asChild><Link to="/products">Continue Shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="text-center space-y-3">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold">Thank you for your order!</h1>
        <p className="text-muted-foreground">
          Order <span className="font-mono font-medium">{order.orderNumber}</span> has been placed successfully.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order Number</span>
            <span className="font-mono font-medium">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="capitalize rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {order.status}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="capitalize">{order.paymentMethod?.replace('_', ' ')}</span>
          </div>

          <Separator />

          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs">
                {item.product?.name?.slice(0, 2)?.toUpperCase() ?? 'PR'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.product?.name ?? 'Product'}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <PriceDisplay price={item.unitPrice * item.quantity} />
            </div>
          ))}

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-brand-600">{formatCurrency(order.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Print Receipt
        </Button>
        <Button asChild className="bg-brand-500 text-navy hover:bg-brand-600">
          <Link to="/account/orders">
            View My Orders <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
