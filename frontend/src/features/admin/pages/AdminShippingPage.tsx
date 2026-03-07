import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/common/components/PageHeader';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { formatCurrency } from '@/lib/format';
import { Truck, Plus, MapPin, Navigation } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { ShippingZone, ShippingRate, ShippingMethod, ShippingCarrier } from '@/common/types';
import { ShippingRateType } from '@/common/types/enums';
import {
  useGetShippingZonesQuery,
  useCreateShippingZoneMutation,
  useDeleteShippingZoneMutation,
  useGetShippingMethodsQuery,
  useCreateShippingMethodMutation,
  useGetShippingCarriersQuery,
  useCreateShippingCarrierMutation,
  useGetShippingRatesQuery,
  useCreateShippingRateMutation,
} from '@/store/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';

type Tab = 'zones' | 'methods' | 'carriers' | 'rates';

export default function AdminShippingPage() {
  const [tab, setTab] = useState<Tab>('zones');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [zoneForm, setZoneForm] = useState({ name: '', description: '', countries: '' });
  const [methodForm, setMethodForm] = useState({ name: '', code: '', description: '' });
  const [carrierForm, setCarrierForm] = useState({ name: '', code: '', trackingUrl: '' });
  const [rateForm, setRateForm] = useState({ shippingMethodId: '', shippingZoneId: '', rateType: ShippingRateType.FLAT as ShippingRateType, baseRate: 0 });

  const { data: zonesData, isLoading } = useGetShippingZonesQuery();
  const zones = zonesData?.data ?? [];

  const { data: methodsData } = useGetShippingMethodsQuery({});
  const methods = methodsData?.data ?? [];

  const { data: carriersData } = useGetShippingCarriersQuery({});
  const carriers = carriersData?.data ?? [];

  const { data: ratesData } = useGetShippingRatesQuery({});
  const rates = ratesData?.data ?? [];

  const [createZone] = useCreateShippingZoneMutation();
  const [deleteZone] = useDeleteShippingZoneMutation();
  const [createMethod] = useCreateShippingMethodMutation();
  const [createCarrier] = useCreateShippingCarrierMutation();
  const [createRate] = useCreateShippingRateMutation();

  const zoneCols: ColumnDef<ShippingZone>[] = [
    { accessorKey: 'name', header: 'Zone Name' },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'countries', header: 'Countries', cell: ({ row }) => (row.original.countries ?? []).join(', ') || '—' },
    { accessorKey: 'isDefault', header: 'Default', cell: ({ row }) => row.original.isDefault ? 'Yes' : 'No' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(row.original.id)}>Delete</Button>
      ),
    },
  ];

  const methodCols: ColumnDef<ShippingMethod>[] = [
    { accessorKey: 'name', header: 'Method' },
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'isActive', header: 'Active', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
  ];

  const carrierCols: ColumnDef<ShippingCarrier>[] = [
    { accessorKey: 'name', header: 'Carrier' },
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'isActive', header: 'Active', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
  ];

  const rateCols: ColumnDef<ShippingRate>[] = [
    { accessorKey: 'shippingZoneId', header: 'Zone' },
    { accessorKey: 'shippingMethodId', header: 'Method' },
    { accessorKey: 'rateType', header: 'Type', cell: ({ row }) => <StatusBadge status={row.original.rateType} /> },
    { accessorKey: 'baseRate', header: 'Base Rate', cell: ({ row }) => formatCurrency(row.original.baseRate) },
    { accessorKey: 'freeShippingThreshold', header: 'Free Above', cell: ({ row }) => row.original.freeShippingThreshold ? formatCurrency(row.original.freeShippingThreshold) : '—' },
  ];

  const handleCreateZone = async () => {
    if (!zoneForm.name) return;
    try {
      await createZone({ name: zoneForm.name, description: zoneForm.description, countries: zoneForm.countries.split(',').map((c) => c.trim()).filter(Boolean) }).unwrap();
      toast.success('Shipping zone created');
      setShowCreate(false);
      setZoneForm({ name: '', description: '', countries: '' });
    } catch { toast.error('Failed to create shipping zone'); }
  };

  const handleCreateMethod = async () => {
    if (!methodForm.name || !methodForm.code) return;
    try {
      await createMethod(methodForm).unwrap();
      toast.success('Shipping method created');
      setShowCreate(false);
      setMethodForm({ name: '', code: '', description: '' });
    } catch { toast.error('Failed to create shipping method'); }
  };

  const handleCreateCarrier = async () => {
    if (!carrierForm.name || !carrierForm.code) return;
    try {
      await createCarrier(carrierForm).unwrap();
      toast.success('Carrier created');
      setShowCreate(false);
      setCarrierForm({ name: '', code: '', trackingUrl: '' });
    } catch { toast.error('Failed to create carrier'); }
  };

  const handleCreateRate = async () => {
    if (!rateForm.shippingMethodId || !rateForm.shippingZoneId) return;
    try {
      await createRate(rateForm).unwrap();
      toast.success('Shipping rate created');
      setShowCreate(false);
      setRateForm({ shippingMethodId: '', shippingZoneId: '', rateType: ShippingRateType.FLAT, baseRate: 0 });
    } catch { toast.error('Failed to create shipping rate'); }
  };

  if (isLoading) return <LoadingSpinner label="Loading shipping..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Shipping Management" description="Manage zones, methods, carriers, and rates">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create {tab.slice(0, -1)}
        </Button>
      </PageHeader>

      <div className="flex gap-2 border-b pb-2">
        {([
          { key: 'zones', icon: MapPin, label: `Zones (${zones.length})` },
          { key: 'methods', icon: Truck, label: `Methods (${methods.length})` },
          { key: 'carriers', icon: Navigation, label: `Carriers (${carriers.length})` },
          { key: 'rates', icon: Truck, label: `Rates (${rates.length})` },
        ] as const).map(({ key, icon: Icon, label }) => (
          <Button key={key} variant={tab === key ? 'default' : 'ghost'} size="sm" onClick={() => setTab(key)}>
            <Icon className="mr-1 h-4 w-4" /> {label}
          </Button>
        ))}
      </div>

      {tab === 'zones' && (zones.length === 0
        ? <EmptyState icon={<MapPin className="h-12 w-12" />} title="No zones" description="Create shipping zones" action={{ label: 'Create Zone', onClick: () => setShowCreate(true) }} />
        : <DataTable columns={zoneCols} data={zones} />)}

      {tab === 'methods' && (methods.length === 0
        ? <EmptyState icon={<Truck className="h-12 w-12" />} title="No methods" description="Create shipping methods" />
        : <DataTable columns={methodCols} data={methods} />)}

      {tab === 'carriers' && (carriers.length === 0
        ? <EmptyState icon={<Navigation className="h-12 w-12" />} title="No carriers" description="Create shipping carriers" />
        : <DataTable columns={carrierCols} data={carriers} />)}

      {tab === 'rates' && (rates.length === 0
        ? <EmptyState icon={<Truck className="h-12 w-12" />} title="No rates" description="Create shipping rates" />
        : <DataTable columns={rateCols} data={rates} />)}

      {/* Create Dialog - renders different form based on tab */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create {tab.slice(0, -1)}</DialogTitle></DialogHeader>
          {tab === 'zones' && (
            <div className="space-y-3">
              <Input placeholder="Zone name" value={zoneForm.name} onChange={(e) => setZoneForm((f) => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Description" value={zoneForm.description} onChange={(e) => setZoneForm((f) => ({ ...f, description: e.target.value }))} />
              <Input placeholder="Countries (comma separated)" value={zoneForm.countries} onChange={(e) => setZoneForm((f) => ({ ...f, countries: e.target.value }))} />
            </div>
          )}
          {tab === 'methods' && (
            <div className="space-y-3">
              <Input placeholder="Method name" value={methodForm.name} onChange={(e) => setMethodForm((f) => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Code" value={methodForm.code} onChange={(e) => setMethodForm((f) => ({ ...f, code: e.target.value }))} />
              <Input placeholder="Description" value={methodForm.description} onChange={(e) => setMethodForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          )}
          {tab === 'carriers' && (
            <div className="space-y-3">
              <Input placeholder="Carrier name" value={carrierForm.name} onChange={(e) => setCarrierForm((f) => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Code" value={carrierForm.code} onChange={(e) => setCarrierForm((f) => ({ ...f, code: e.target.value }))} />
              <Input placeholder="Tracking URL template" value={carrierForm.trackingUrl} onChange={(e) => setCarrierForm((f) => ({ ...f, trackingUrl: e.target.value }))} />
            </div>
          )}
          {tab === 'rates' && (
            <div className="space-y-3">
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={rateForm.shippingZoneId} onChange={(e) => setRateForm((f) => ({ ...f, shippingZoneId: e.target.value }))}>
                <option value="">Select zone...</option>
                {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={rateForm.shippingMethodId} onChange={(e) => setRateForm((f) => ({ ...f, shippingMethodId: e.target.value }))}>
                <option value="">Select method...</option>
                {methods.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <Input type="number" placeholder="Base rate" value={rateForm.baseRate} onChange={(e) => setRateForm((f) => ({ ...f, baseRate: parseFloat(e.target.value) || 0 }))} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={tab === 'zones' ? handleCreateZone : tab === 'methods' ? handleCreateMethod : tab === 'carriers' ? handleCreateCarrier : handleCreateRate}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Zone"
        description="Permanently delete this shipping zone?"
        onConfirm={async () => { if (deleteId) { try { await deleteZone(deleteId).unwrap(); toast.success('Zone deleted'); } catch { toast.error('Failed to delete zone'); } finally { setDeleteId(null); } } }}
      />
    </div>
  );
}
