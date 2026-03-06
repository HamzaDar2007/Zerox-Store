import { useState } from 'react';
import { PageHeader } from '@/common/components/PageHeader';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Textarea } from '@/common/components/ui/textarea';
import { formatCurrency, formatDate } from '@/lib/format';
import { Megaphone, Plus, Tag, Zap } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Campaign, Voucher, FlashSale } from '@/common/types';
import { CampaignType, VoucherType, DiscountType } from '@/common/types/enums';
import {
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  useGetVouchersQuery,
  useCreateVoucherMutation,
  useGetActiveFlashSalesQuery,
  useCreateFlashSaleMutation,
} from '@/store/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';

type Tab = 'campaigns' | 'vouchers' | 'flash-sales';

export default function AdminMarketingPage() {
  const [tab, setTab] = useState<Tab>('campaigns');
  const [showCreate, setShowCreate] = useState(false);

  const [campaignForm, setCampaignForm] = useState({ name: '', description: '', type: CampaignType.SEASONAL as CampaignType, discountPercentage: 0, startsAt: '', endsAt: '' });
  const [voucherForm, setVoucherForm] = useState({ code: '', name: '', type: VoucherType.PERCENTAGE as VoucherType, discountType: DiscountType.PERCENTAGE as DiscountType, discountValue: 0, minOrderAmount: 0, usageLimit: 100, usageLimitPerUser: 1, startsAt: '', endsAt: '' });
  const [flashForm, setFlashForm] = useState({ name: '', discountPercentage: 0, startDate: '', endDate: '', maxQuantity: 100 });

  const { data: campaignsData, isLoading } = useGetCampaignsQuery({});
  const campaigns = campaignsData?.data?.items ?? [];

  const { data: vouchersData } = useGetVouchersQuery({});
  const vouchers = vouchersData?.data?.items ?? [];

  const { data: flashData } = useGetActiveFlashSalesQuery();
  const flashSales = flashData?.data ?? [];

  const [createCampaign] = useCreateCampaignMutation();
  const [createVoucher] = useCreateVoucherMutation();
  const [createFlashSale] = useCreateFlashSaleMutation();

  const campaignCols: ColumnDef<Campaign>[] = [
    { accessorKey: 'name', header: 'Campaign' },
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <StatusBadge status={row.original.type} /> },
    { accessorKey: 'discountPercentage', header: 'Discount', cell: ({ row }) => row.original.discountPercentage ? `${row.original.discountPercentage}%` : '—' },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    { accessorKey: 'startsAt', header: 'Start', cell: ({ row }) => formatDate(row.original.startsAt) },
    { accessorKey: 'endsAt', header: 'End', cell: ({ row }) => formatDate(row.original.endsAt) },
  ];

  const voucherCols: ColumnDef<Voucher>[] = [
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <StatusBadge status={row.original.type} /> },
    { accessorKey: 'discountValue', header: 'Value', cell: ({ row }) => row.original.type === 'percentage' ? `${row.original.discountValue}%` : formatCurrency(row.original.discountValue) },
    { accessorKey: 'minOrderAmount', header: 'Min Order', cell: ({ row }) => formatCurrency(row.original.minOrderAmount) },
    { accessorKey: 'usedCount', header: 'Used', cell: ({ row }) => `${row.original.usedCount}/${row.original.totalLimit ?? '∞'}` },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
  ];

  const flashCols: ColumnDef<FlashSale>[] = [
    { accessorKey: 'name', header: 'Sale' },
    { accessorKey: 'startsAt', header: 'Start', cell: ({ row }) => formatDate(row.original.startsAt) },
    { accessorKey: 'endsAt', header: 'End', cell: ({ row }) => formatDate(row.original.endsAt) },
    { accessorKey: 'isActive', header: 'Active', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
  ];

  const handleCreateCampaign = async () => {
    if (!campaignForm.name) return;
    await createCampaign(campaignForm);
    setShowCreate(false);
  };

  const handleCreateVoucher = async () => {
    if (!voucherForm.code) return;
    await createVoucher(voucherForm);
    setShowCreate(false);
  };

  const handleCreateFlash = async () => {
    if (!flashForm.name) return;
    await createFlashSale({ name: flashForm.name, startDate: flashForm.startDate, endDate: flashForm.endDate, discountPercentage: flashForm.discountPercentage });
    setShowCreate(false);
  };

  if (isLoading) return <LoadingSpinner label="Loading marketing..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Marketing" description="Manage campaigns, vouchers, and flash sales">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create
        </Button>
      </PageHeader>

      <div className="flex gap-2 border-b pb-2">
        <Button variant={tab === 'campaigns' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('campaigns')}>
          <Megaphone className="mr-1 h-4 w-4" /> Campaigns ({campaigns.length})
        </Button>
        <Button variant={tab === 'vouchers' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('vouchers')}>
          <Tag className="mr-1 h-4 w-4" /> Vouchers ({vouchers.length})
        </Button>
        <Button variant={tab === 'flash-sales' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('flash-sales')}>
          <Zap className="mr-1 h-4 w-4" /> Flash Sales ({flashSales.length})
        </Button>
      </div>

      {tab === 'campaigns' && (campaigns.length === 0
        ? <EmptyState icon={<Megaphone className="h-12 w-12" />} title="No campaigns" description="Create marketing campaigns" action={{ label: 'Create Campaign', onClick: () => setShowCreate(true) }} />
        : <DataTable columns={campaignCols} data={campaigns} />)}

      {tab === 'vouchers' && (vouchers.length === 0
        ? <EmptyState icon={<Tag className="h-12 w-12" />} title="No vouchers" description="Create discount vouchers" />
        : <DataTable columns={voucherCols} data={vouchers} />)}

      {tab === 'flash-sales' && (flashSales.length === 0
        ? <EmptyState icon={<Zap className="h-12 w-12" />} title="No flash sales" description="Create flash sale events" />
        : <DataTable columns={flashCols} data={flashSales} />)}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create {tab === 'campaigns' ? 'Campaign' : tab === 'vouchers' ? 'Voucher' : 'Flash Sale'}</DialogTitle></DialogHeader>
          {tab === 'campaigns' && (
            <div className="space-y-3">
              <Input placeholder="Campaign name" value={campaignForm.name} onChange={(e) => setCampaignForm((f) => ({ ...f, name: e.target.value }))} />
              <Textarea placeholder="Description" value={campaignForm.description} onChange={(e) => setCampaignForm((f) => ({ ...f, description: e.target.value }))} />
              <Input type="number" placeholder="Discount %" value={campaignForm.discountPercentage} onChange={(e) => setCampaignForm((f) => ({ ...f, discountPercentage: parseFloat(e.target.value) || 0 }))} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="datetime-local" value={campaignForm.startsAt} onChange={(e) => setCampaignForm((f) => ({ ...f, startsAt: e.target.value }))} />
                <Input type="datetime-local" value={campaignForm.endsAt} onChange={(e) => setCampaignForm((f) => ({ ...f, endsAt: e.target.value }))} />
              </div>
            </div>
          )}
          {tab === 'vouchers' && (
            <div className="space-y-3">
              <Input placeholder="Voucher code" value={voucherForm.code} onChange={(e) => setVoucherForm((f) => ({ ...f, code: e.target.value }))} />
              <Input placeholder="Name" value={voucherForm.name} onChange={(e) => setVoucherForm((f) => ({ ...f, name: e.target.value }))} />
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={voucherForm.type} onChange={(e) => setVoucherForm((f) => ({ ...f, type: e.target.value as VoucherType }))}>
                {Object.values(VoucherType).map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Discount value" value={voucherForm.discountValue} onChange={(e) => setVoucherForm((f) => ({ ...f, discountValue: parseFloat(e.target.value) || 0 }))} />
                <Input type="number" placeholder="Min order" value={voucherForm.minOrderAmount} onChange={(e) => setVoucherForm((f) => ({ ...f, minOrderAmount: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Usage limit" value={voucherForm.usageLimit} onChange={(e) => setVoucherForm((f) => ({ ...f, usageLimit: parseInt(e.target.value) || 0 }))} />
                <Input type="number" placeholder="Per user limit" value={voucherForm.usageLimitPerUser} onChange={(e) => setVoucherForm((f) => ({ ...f, usageLimitPerUser: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input type="datetime-local" value={voucherForm.startsAt} onChange={(e) => setVoucherForm((f) => ({ ...f, startsAt: e.target.value }))} />
                <Input type="datetime-local" value={voucherForm.endsAt} onChange={(e) => setVoucherForm((f) => ({ ...f, endsAt: e.target.value }))} />
              </div>
            </div>
          )}
          {tab === 'flash-sales' && (
            <div className="space-y-3">
              <Input placeholder="Sale name" value={flashForm.name} onChange={(e) => setFlashForm((f) => ({ ...f, name: e.target.value }))} />
              <Input type="number" placeholder="Discount %" value={flashForm.discountPercentage} onChange={(e) => setFlashForm((f) => ({ ...f, discountPercentage: parseFloat(e.target.value) || 0 }))} />
              <Input type="number" placeholder="Max quantity" value={flashForm.maxQuantity} onChange={(e) => setFlashForm((f) => ({ ...f, maxQuantity: parseInt(e.target.value) || 0 }))} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="datetime-local" value={flashForm.startDate} onChange={(e) => setFlashForm((f) => ({ ...f, startDate: e.target.value }))} />
                <Input type="datetime-local" value={flashForm.endDate} onChange={(e) => setFlashForm((f) => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={tab === 'campaigns' ? handleCreateCampaign : tab === 'vouchers' ? handleCreateVoucher : handleCreateFlash}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
