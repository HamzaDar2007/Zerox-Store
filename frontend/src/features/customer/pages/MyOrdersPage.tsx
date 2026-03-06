import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetMyOrdersQuery } from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { PageHeader } from '@/common/components/PageHeader';
import { formatDate, formatCurrency } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { Button } from '@/common/components/ui/button';
import { Eye } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Order } from '@/common/types';

const columns: ColumnDef<Order, unknown>[] = [
  {
    accessorKey: 'orderNumber',
    header: 'Order #',
    cell: ({ row }) => (
      <Link
        to={`/account/orders/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
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
      <Link to={`/account/orders/${row.original.id}`}>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];

export default function MyOrdersPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const { data, isLoading, isError, refetch } = useGetMyOrdersQuery({ page, limit });

  const orders = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader title="My Orders" description="Track your order history" />

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No orders yet"
        emptyDescription="When you place an order, it will appear here."
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
