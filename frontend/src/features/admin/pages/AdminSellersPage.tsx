import { useState } from 'react';
import { useGetSellersQuery, useUpdateSellerMutation, useDeleteSellerMutation } from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { PageHeader } from '@/common/components/PageHeader';
import { formatDate, formatCurrency } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { Button } from '@/common/components/ui/button';
import { Trash2, CheckCircle } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Seller } from '@/common/types';
import { VerificationStatus } from '@/common/types/enums';
import { toast } from 'sonner';

export default function AdminSellersPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const { data, isLoading } = useGetSellersQuery();
  const [updateSeller] = useUpdateSellerMutation();
  const [deleteSeller] = useDeleteSellerMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const allSellers = data?.data ?? [];
  // Client-side pagination since getSellers returns full array
  const total = allSellers.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const sellers = allSellers.slice((page - 1) * limit, page * limit);

  const columns: ColumnDef<Seller, unknown>[] = [
    {
      accessorKey: 'businessName',
      header: 'Business',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.businessName}</p>
          {row.original.businessNameAr && (
            <p className="text-xs text-muted-foreground" dir="rtl">{row.original.businessNameAr}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'verificationStatus',
      header: 'Verification',
      cell: ({ row }) => <StatusBadge status={row.original.verificationStatus} />,
    },
    {
      accessorKey: 'totalProducts',
      header: 'Products',
    },
    {
      accessorKey: 'totalOrders',
      header: 'Orders',
    },
    {
      accessorKey: 'totalRevenue',
      header: 'Revenue',
      cell: ({ row }) => formatCurrency(row.original.totalRevenue),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.verificationStatus !== VerificationStatus.APPROVED && (
            <Button variant="ghost" size="icon" title="Approve" onClick={async () => {
              try {
                await updateSeller({ id: row.original.id, data: {} }).unwrap();
                toast.success('Seller updated');
              } catch { toast.error('Failed'); }
            }}>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Sellers" description="Manage seller accounts and verification" />

      <DataTable
        columns={columns}
        data={sellers}
        isLoading={isLoading}
        emptyTitle="No sellers found"
        pagination={{
          page, limit, total, totalPages,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Seller"
        description="This will permanently delete the seller account. Continue?"
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await deleteSeller(deleteId).unwrap();
            toast.success('Seller deleted');
          } catch { toast.error('Failed to delete seller'); }
          finally { setDeleteId(null); }
        }}
        destructive
      />
    </div>
  );
}
