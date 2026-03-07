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
import { formatNumber } from '@/lib/format';
import { Trophy, Plus, Trash2 } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { LoyaltyTier } from '@/common/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import {
  useGetLoyaltyTiersQuery,
  useCreateLoyaltyTierMutation,
  useDeleteLoyaltyTierMutation,
} from '@/store/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';

export default function SALoyaltyPage() {
  const [showCreateTier, setShowCreateTier] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tierForm, setTierForm] = useState({ name: '', requiredPoints: 0, multiplier: 1, benefits: '', sortOrder: 0 });

  const { data: tiersData, isLoading } = useGetLoyaltyTiersQuery();
  const tiers = tiersData?.data ?? [];

  const [createTier] = useCreateLoyaltyTierMutation();
  const [deleteTier] = useDeleteLoyaltyTierMutation();

  const tierCols: ColumnDef<LoyaltyTier>[] = [
    { accessorKey: 'name', header: 'Tier' },
    { accessorKey: 'minPoints', header: 'Min Points', cell: ({ row }) => formatNumber(row.original.minPoints) },
    { accessorKey: 'maxPoints', header: 'Max Points', cell: ({ row }) => row.original.maxPoints ? formatNumber(row.original.maxPoints) : '∞' },
    { accessorKey: 'earnMultiplier', header: 'Multiplier', cell: ({ row }) => `${row.original.earnMultiplier}x` },
    { accessorKey: 'sortOrder', header: 'Order' },
    { accessorKey: 'isActive', header: 'Active', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(row.original.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const handleCreateTier = async () => {
    if (!tierForm.name) return;
    try {
      await createTier({
        name: tierForm.name,
        requiredPoints: tierForm.requiredPoints,
        multiplier: tierForm.multiplier,
        benefits: tierForm.benefits.split(',').map((b) => b.trim()).filter(Boolean),
        sortOrder: tierForm.sortOrder,
      }).unwrap();
      toast.success('Tier created');
      setShowCreateTier(false);
      setTierForm({ name: '', requiredPoints: 0, multiplier: 1, benefits: '', sortOrder: 0 });
    } catch { toast.error('Failed to create tier'); }
  };

  if (isLoading) return <LoadingSpinner label="Loading loyalty tiers..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Loyalty Program" description="Manage loyalty tiers and rewards">
        <Button onClick={() => setShowCreateTier(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Tier
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Tiers</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{tiers.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Active Tiers</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{tiers.filter((t) => t.isActive).length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Highest Multiplier</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{tiers.length > 0 ? `${Math.max(...tiers.map((t) => t.earnMultiplier))}x` : '—'}</p></CardContent>
        </Card>
      </div>

      {tiers.length === 0 ? (
        <EmptyState icon={<Trophy className="h-12 w-12" />} title="No tiers" description="Create loyalty tiers to reward customers" action={{ label: 'Create Tier', onClick: () => setShowCreateTier(true) }} />
      ) : (
        <DataTable columns={tierCols} data={tiers} />
      )}

      <Dialog open={showCreateTier} onOpenChange={setShowCreateTier}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Loyalty Tier</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Tier name (e.g. Gold)" value={tierForm.name} onChange={(e) => setTierForm((f) => ({ ...f, name: e.target.value }))} />
            <Input type="number" placeholder="Required points" value={tierForm.requiredPoints} onChange={(e) => setTierForm((f) => ({ ...f, requiredPoints: parseInt(e.target.value) || 0 }))} />
            <Input type="number" placeholder="Earn multiplier" step="0.1" value={tierForm.multiplier} onChange={(e) => setTierForm((f) => ({ ...f, multiplier: parseFloat(e.target.value) || 1 }))} />
            <Input type="number" placeholder="Sort order" value={tierForm.sortOrder} onChange={(e) => setTierForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
            <Textarea placeholder="Benefits (comma separated)" value={tierForm.benefits} onChange={(e) => setTierForm((f) => ({ ...f, benefits: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTier(false)}>Cancel</Button>
            <Button onClick={handleCreateTier}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Tier"
        description="Permanently remove this loyalty tier?"
        onConfirm={async () => { if (deleteId) { try { await deleteTier(deleteId).unwrap(); toast.success('Tier deleted'); } catch { toast.error('Failed to delete tier'); } finally { setDeleteId(null); } } }}
      />
    </div>
  );
}
