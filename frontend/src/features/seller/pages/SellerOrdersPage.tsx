import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { PageHeader } from '@/common/components/PageHeader';
import { formatDate, formatCurrency } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { Button } from '@/common/components/ui/button';
import { Eye, Truck } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { toast } from 'sonner';
import { OrderStatus } from '@/common/types/enums';
import type { ColumnDef } from '@tanstack/react-table';
import type { Order } from '@/common/types';

export default function SellerOrdersPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const { data, isLoading } = useGetOrdersQuery({
    page,
    limit,
    ...(statusFilter !== 'all' && { status: statusFilter }),
  });
  const [updateStatus] = useUpdateOrderStatusMutation();

  const orders = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      await updateStatus({ id: orderId, status }).unwrap();
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const columns: ColumnDef<Order, unknown>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order #',
      cell: ({ row }) => (
        <Link to={`/seller/orders/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.orderNumber}
        </Link>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.createdAt),
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
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Link to={`/seller/orders/${row.original.id}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {row.original.status === OrderStatus.CONFIRMED && (
            <Button
              variant="ghost"
              size="icon"
              title="Mark as shipped"
              onClick={() => handleStatusUpdate(row.original.id, OrderStatus.SHIPPED)}
            >
              <Truck className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Manage customer orders">
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
        emptyTitle="No orders yet"
        emptyDescription="Orders from customers will appear here."
        pagination={{
          page,
          limit,
          total,
          totalPages,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
      />
    </div>
  );
}
