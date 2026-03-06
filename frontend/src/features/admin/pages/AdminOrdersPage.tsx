import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetOrdersQuery, useUpdateOrderStatusMutation, useCancelOrderMutation } from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { PageHeader } from '@/common/components/PageHeader';
import { formatDate, formatCurrency } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { Button } from '@/common/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { Eye, XCircle } from 'lucide-react';
import { OrderStatus } from '@/common/types/enums';
import type { ColumnDef } from '@tanstack/react-table';
import type { Order } from '@/common/types';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetOrdersQuery({
    page,
    limit,
    ...(statusFilter !== 'all' && { status: statusFilter }),
  });
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [cancelOrder] = useCancelOrderMutation();

  const orders = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const columns: ColumnDef<Order, unknown>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order #',
      cell: ({ row }) => (
        <Link to={`/admin/orders/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.orderNumber}
        </Link>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => formatCurrency(row.original.totalAmount),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment',
      cell: ({ row }) => <span className="capitalize">{row.original.paymentMethod ?? '—'}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const o = row.original;
        const canCancel = [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(o.status as OrderStatus);
        return (
          <div className="flex gap-1">
            <Select
              value={o.status}
              onValueChange={async (v) => {
                try {
                  await updateStatus({ id: o.id, status: v as OrderStatus }).unwrap();
                  toast.success('Status updated');
                } catch {
                  toast.error('Failed to update status');
                }
              }}
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OrderStatus).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link to={`/admin/orders/${o.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            {canCancel && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setCancelId(o.id)}>
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Manage all platform orders">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={OrderStatus.CONFIRMED}>Confirmed</SelectItem>
            <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
            <SelectItem value={OrderStatus.SHIPPED}>Shipped</SelectItem>
            <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
            <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No orders found"
        pagination={{
          page, limit, total, totalPages,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
      />

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={() => setCancelId(null)}
        title="Cancel Order"
        description="Are you sure you want to cancel this order?"
        onConfirm={async () => {
          if (!cancelId) return;
          try {
            await cancelOrder({ id: cancelId, reason: 'Cancelled by admin' }).unwrap();
            toast.success('Order cancelled');
          } catch {
            toast.error('Failed to cancel order');
          } finally {
            setCancelId(null);
          }
        }}
        destructive
      />
    </div>
  );
}
