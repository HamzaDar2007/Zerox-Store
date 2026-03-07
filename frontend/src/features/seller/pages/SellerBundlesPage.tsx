import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/common/components/PageHeader';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Textarea } from '@/common/components/ui/textarea';
import { formatCurrency, formatDate } from '@/lib/format';
import { Package, Plus, ToggleRight } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { ProductBundle } from '@/common/types';
import { VoucherType } from '@/common/types/enums';
import {
  useGetBundlesQuery,
  useCreateBundleMutation,
  useDeleteBundleMutation,
  useToggleBundleActiveMutation,
} from '@/store/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';

export default function SellerBundlesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', discountType: VoucherType.PERCENTAGE as VoucherType, discountValue: 0 });

  const { data, isLoading } = useGetBundlesQuery({ page, limit });
  const bundles = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const [createBundle] = useCreateBundleMutation();
  const [deleteBundle] = useDeleteBundleMutation();
  const [toggleActive] = useToggleBundleActiveMutation();

  const cols: ColumnDef<ProductBundle>[] = [
    { accessorKey: 'name', header: 'Bundle Name' },
    { accessorKey: 'slug', header: 'Slug' },
    {
      accessorKey: 'discountType',
      header: 'Discount',
      cell: ({ row }) => {
        const b = row.original;
        return b.discountType === 'percentage' ? `${b.discountValue}%` : formatCurrency(b.discountValue);
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} />,
    },
    { accessorKey: 'startsAt', header: 'Start', cell: ({ row }) => row.original.startsAt ? formatDate(row.original.startsAt) : '—' },
    { accessorKey: 'endsAt', header: 'End', cell: ({ row }) => row.original.endsAt ? formatDate(row.original.endsAt) : '—' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={async () => { try { await toggleActive(row.original.id).unwrap(); } catch { toast.error('Failed to toggle bundle'); } }}>
            <ToggleRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(row.original.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleCreate = async () => {
    if (!form.name || !form.slug) return;
    try {
      await createBundle({ ...form, items: [] }).unwrap();
      toast.success('Bundle created');
      setShowCreate(false);
      setForm({ name: '', slug: '', description: '', discountType: VoucherType.PERCENTAGE, discountValue: 0 });
    } catch { toast.error('Failed to create bundle'); }
  };

  if (isLoading) return <LoadingSpinner label="Loading bundles..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Product Bundles" description="Create and manage product bundles">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Bundle
        </Button>
      </PageHeader>

      {bundles.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No bundles"
          description="Group products together for discounted bundles"
          action={{ label: 'Create Bundle', onClick: () => setShowCreate(true) }}
        />
      ) : (
        <DataTable
          columns={cols}
          data={bundles}
          pagination={{ page, limit, total, totalPages, onPageChange: setPage, onLimitChange: setLimit }}
        />
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Bundle</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.discountType}
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as VoucherType }))}
              >
              <option value={VoucherType.PERCENTAGE}>Percentage</option>
                <option value={VoucherType.FIXED_AMOUNT}>Fixed Amount</option>
              </select>
              <Input type="number" placeholder="Discount value" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Bundle"
        description="This will permanently delete the bundle. Continue?"
        onConfirm={async () => { if (deleteId) { try { await deleteBundle(deleteId).unwrap(); toast.success('Bundle deleted'); } catch { toast.error('Failed to delete bundle'); } finally { setDeleteId(null); } } }}
      />
    </div>
  );
}
