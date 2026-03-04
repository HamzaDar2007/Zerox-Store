import { useState } from 'react';
import { PageHeader } from '@/common/components/PageHeader';
import { DataTable } from '@/common/components/DataTable';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Receipt, Plus, Globe, Tag } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { TaxZone, TaxRate, TaxClass } from '@/common/types';
import {
  useGetTaxZonesQuery,
  useCreateTaxZoneMutation,
  useDeleteTaxZoneMutation,
  useGetTaxRatesQuery,
  useCreateTaxRateMutation,
  useDeleteTaxRateMutation,
  useGetTaxClassesQuery,
  useCreateTaxClassMutation,
} from '@/store/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';

type Tab = 'zones' | 'rates' | 'classes';

export default function AdminTaxPage() {
  const [tab, setTab] = useState<Tab>('zones');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'zone' | 'rate'>('zone');

  const [zoneForm, setZoneForm] = useState({ name: '', countryCode: '', stateCode: '' });
  const [rateForm, setRateForm] = useState({ taxClassId: '', taxZoneId: '', name: '', rate: 0, priority: 0 });
  const [classForm, setClassForm] = useState({ name: '', description: '' });

  const { data: zonesData, isLoading } = useGetTaxZonesQuery();
  const zones = zonesData?.data ?? [];

  const { data: ratesData } = useGetTaxRatesQuery({});
  const rates = ratesData?.data ?? [];

  const { data: classesData } = useGetTaxClassesQuery();
  const classes = classesData?.data ?? [];

  const [createZone] = useCreateTaxZoneMutation();
  const [deleteZone] = useDeleteTaxZoneMutation();
  const [createRate] = useCreateTaxRateMutation();
  const [deleteRate] = useDeleteTaxRateMutation();
  const [createClass] = useCreateTaxClassMutation();

  const zoneCols: ColumnDef<TaxZone>[] = [
    { accessorKey: 'name', header: 'Zone Name' },
    { accessorKey: 'countryCode', header: 'Country' },
    { accessorKey: 'stateCode', header: 'State' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setDeleteId(row.original.id); setDeleteType('zone'); }}>Delete</Button>
      ),
    },
  ];

  const rateCols: ColumnDef<TaxRate>[] = [
    { accessorKey: 'name', header: 'Rate Name' },
    { accessorKey: 'rate', header: 'Rate (%)', cell: ({ row }) => `${row.original.rate}%` },
    { accessorKey: 'priority', header: 'Priority' },
    { accessorKey: 'isCompound', header: 'Compound', cell: ({ row }) => row.original.isCompound ? 'Yes' : 'No' },
    { accessorKey: 'isShipping', header: 'Applies to Shipping', cell: ({ row }) => row.original.isShipping ? 'Yes' : 'No' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setDeleteId(row.original.id); setDeleteType('rate'); }}>Delete</Button>
      ),
    },
  ];

  const classCols: ColumnDef<TaxClass>[] = [
    { accessorKey: 'name', header: 'Class Name' },
    { accessorKey: 'description', header: 'Description' },
  ];

  const handleCreateZone = async () => {
    if (!zoneForm.name || !zoneForm.countryCode) return;
    await createZone(zoneForm);
    setShowCreate(false);
    setZoneForm({ name: '', countryCode: '', stateCode: '' });
  };

  const handleCreateRate = async () => {
    if (!rateForm.name || !rateForm.taxZoneId || !rateForm.taxClassId) return;
    await createRate(rateForm);
    setShowCreate(false);
    setRateForm({ taxClassId: '', taxZoneId: '', name: '', rate: 0, priority: 0 });
  };

  const handleCreateClass = async () => {
    if (!classForm.name) return;
    await createClass(classForm);
    setShowCreate(false);
    setClassForm({ name: '', description: '' });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    if (deleteType === 'zone') deleteZone(deleteId);
    else deleteRate(deleteId);
    setDeleteId(null);
  };

  if (isLoading) return <LoadingSpinner label="Loading tax config..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Tax Configuration" description="Manage tax zones, rates, and classes">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create
        </Button>
      </PageHeader>

      <div className="flex gap-2 border-b pb-2">
        <Button variant={tab === 'zones' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('zones')}>
          <Globe className="mr-1 h-4 w-4" /> Zones ({zones.length})
        </Button>
        <Button variant={tab === 'rates' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('rates')}>
          <Receipt className="mr-1 h-4 w-4" /> Rates ({rates.length})
        </Button>
        <Button variant={tab === 'classes' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('classes')}>
          <Tag className="mr-1 h-4 w-4" /> Classes ({classes.length})
        </Button>
      </div>

      {tab === 'zones' && (zones.length === 0
        ? <EmptyState icon={<Globe className="h-12 w-12" />} title="No tax zones" description="Create tax zones to define regional tax rules" action={{ label: 'Create Zone', onClick: () => setShowCreate(true) }} />
        : <DataTable columns={zoneCols} data={zones} />)}

      {tab === 'rates' && (rates.length === 0
        ? <EmptyState icon={<Receipt className="h-12 w-12" />} title="No tax rates" description="Add tax rates to zones" />
        : <DataTable columns={rateCols} data={rates} />)}

      {tab === 'classes' && (classes.length === 0
        ? <EmptyState icon={<Tag className="h-12 w-12" />} title="No tax classes" description="Create tax classes for product categorization" />
        : <DataTable columns={classCols} data={classes} />)}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create {tab === 'zones' ? 'Tax Zone' : tab === 'rates' ? 'Tax Rate' : 'Tax Class'}</DialogTitle></DialogHeader>
          {tab === 'zones' && (
            <div className="space-y-3">
              <Input placeholder="Zone name" value={zoneForm.name} onChange={(e) => setZoneForm((f) => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Country code (e.g. US)" value={zoneForm.countryCode} onChange={(e) => setZoneForm((f) => ({ ...f, countryCode: e.target.value }))} />
              <Input placeholder="State code (optional)" value={zoneForm.stateCode} onChange={(e) => setZoneForm((f) => ({ ...f, stateCode: e.target.value }))} />
            </div>
          )}
          {tab === 'rates' && (
            <div className="space-y-3">
              <Input placeholder="Rate name" value={rateForm.name} onChange={(e) => setRateForm((f) => ({ ...f, name: e.target.value }))} />
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={rateForm.taxZoneId} onChange={(e) => setRateForm((f) => ({ ...f, taxZoneId: e.target.value }))}>
                <option value="">Select zone...</option>
                {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={rateForm.taxClassId} onChange={(e) => setRateForm((f) => ({ ...f, taxClassId: e.target.value }))}>
                <option value="">Select class...</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <Input type="number" placeholder="Rate (%)" value={rateForm.rate} onChange={(e) => setRateForm((f) => ({ ...f, rate: parseFloat(e.target.value) || 0 }))} />
              <Input type="number" placeholder="Priority" value={rateForm.priority} onChange={(e) => setRateForm((f) => ({ ...f, priority: parseInt(e.target.value) || 0 }))} />
            </div>
          )}
          {tab === 'classes' && (
            <div className="space-y-3">
              <Input placeholder="Class name" value={classForm.name} onChange={(e) => setClassForm((f) => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Description" value={classForm.description} onChange={(e) => setClassForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={tab === 'zones' ? handleCreateZone : tab === 'rates' ? handleCreateRate : handleCreateClass}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title={`Delete ${deleteType}`}
        description={`Permanently delete this tax ${deleteType}?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
