import { useState } from 'react';
import { useGetProductsQuery, useUpdateProductStatusMutation, useDeleteProductMutation } from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { PageHeader } from '@/common/components/PageHeader';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { Button } from '@/common/components/ui/button';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ProductStatus } from '@/common/types/enums';
import type { ColumnDef } from '@tanstack/react-table';
import type { Product } from '@/common/types';

export default function AdminProductsPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGetProductsQuery({ page, limit });
  const [updateStatus] = useUpdateProductStatusMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const products = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleStatusToggle = async (id: string, current: ProductStatus) => {
    const newStatus = current === ProductStatus.ACTIVE ? ProductStatus.INACTIVE : ProductStatus.ACTIVE;
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      toast.success(`Product ${newStatus === ProductStatus.ACTIVE ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId).unwrap();
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<Product, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => (
        <div>
          <p className="font-medium line-clamp-1">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.sku ?? '—'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => formatCurrency(row.original.price),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'totalSales',
      header: 'Sales',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            title={row.original.status === ProductStatus.ACTIVE ? 'Deactivate' : 'Activate'}
            onClick={() => handleStatusToggle(row.original.id, row.original.status)}
          >
            {row.original.status === ProductStatus.ACTIVE ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage all platform products" />

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyTitle="No products"
        pagination={{
          page, limit, total, totalPages,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Product"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
