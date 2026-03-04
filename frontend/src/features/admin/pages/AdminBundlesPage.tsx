import { useState } from 'react';
import { PageHeader } from '@/common/components/PageHeader';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { formatDate } from '@/lib/format';
import { Package, ToggleRight, Trash2 } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { ProductBundle } from '@/common/types';
import {
  useGetBundlesQuery,
  useDeleteBundleMutation,
  useToggleBundleActiveMutation,
} from '@/store/api';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';

export default function AdminBundlesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGetBundlesQuery({ page, limit });
  const bundles = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const [deleteBundle] = useDeleteBundleMutation();
  const [toggleActive] = useToggleBundleActiveMutation();

  const cols: ColumnDef<ProductBundle>[] = [
    { accessorKey: 'name', header: 'Bundle Name' },
    { accessorKey: 'slug', header: 'Slug' },
    { accessorKey: 'sellerId', header: 'Seller ID' },
    { accessorKey: 'discountType', header: 'Discount Type', cell: ({ row }) => <StatusBadge status={row.original.discountType} /> },
    { accessorKey: 'discountValue', header: 'Discount' },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    { accessorKey: 'startsAt', header: 'Start', cell: ({ row }) => row.original.startsAt ? formatDate(row.original.startsAt) : '—' },
    { accessorKey: 'endsAt', header: 'End', cell: ({ row }) => row.original.endsAt ? formatDate(row.original.endsAt) : '—' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => toggleActive(row.original.id)} title="Toggle active">
            <ToggleRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner label="Loading bundles..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="All Bundles" description="View and manage product bundles across all sellers" />

      {bundles.length === 0 ? (
        <EmptyState icon={<Package className="h-12 w-12" />} title="No bundles" description="No product bundles have been created" />
      ) : (
        <DataTable
          columns={cols}
          data={bundles}
          pagination={{ page, limit, total, totalPages, onPageChange: setPage, onLimitChange: setLimit }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Bundle"
        description="Permanently delete this bundle?"
        onConfirm={() => { if (deleteId) { deleteBundle(deleteId); setDeleteId(null); } }}
      />
    </div>
  );
}
