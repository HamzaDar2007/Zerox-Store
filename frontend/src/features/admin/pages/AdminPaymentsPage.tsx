import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/common/components/PageHeader';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/format';
import { DollarSign, RefreshCw } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Payment, Refund } from '@/common/types';
import { RefundReason } from '@/common/types/enums';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import {
  useGetPaymentsQuery,
  useGetRefundsQuery,
  useCreateRefundMutation,
  useProcessRefundMutation,
  useRejectRefundMutation,
} from '@/store/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/common/components/ui/dialog';

type Tab = 'payments' | 'refunds';

export default function AdminPaymentsPage() {
  const [tab, setTab] = useState<Tab>('payments');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refundPage, setRefundPage] = useState(1);
  const [showCreateRefund, setShowCreateRefund] = useState(false);
  const [refundForm, setRefundForm] = useState({ paymentId: '', amount: 0, reason: RefundReason.OTHER as RefundReason });

  const { data: payData, isLoading } = useGetPaymentsQuery({ page, limit });
  const payments = payData?.data?.items ?? [];
  const total = payData?.data?.total ?? 0;
  const totalPages = payData?.data?.totalPages ?? 1;

  const { data: refundData } = useGetRefundsQuery({ page: refundPage, limit: 10 });
  const refunds = refundData?.data?.items ?? [];
  const refundsTotal = refundData?.data?.total ?? 0;
  const refundsTotalPages = refundData?.data?.totalPages ?? 1;

  const [createRefund] = useCreateRefundMutation();
  const [processRefund] = useProcessRefundMutation();
  const [rejectRefund] = useRejectRefundMutation();

  const paymentsCols: ColumnDef<Payment>[] = [
    { accessorKey: 'paymentNumber', header: 'Payment #' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
    { accessorKey: 'paymentMethod', header: 'Method', cell: ({ row }) => <StatusBadge status={row.original.paymentMethod} /> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'gatewayName', header: 'Gateway' },
    { accessorKey: 'paidAt', header: 'Paid', cell: ({ row }) => row.original.paidAt ? formatDate(row.original.paidAt) : '—' },
    { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => formatDate(row.original.createdAt) },
  ];

  const refundsCols: ColumnDef<Refund>[] = [
    { accessorKey: 'refundNumber', header: 'Refund #' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'reason', header: 'Reason' },
    { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const r = row.original;
        if (r.status !== 'pending') return null;
        return (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={async () => { try { await processRefund(r.id).unwrap(); toast.success('Refund approved'); } catch { toast.error('Failed to approve refund'); } }}>Approve</Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => { try { await rejectRefund({ id: r.id, reason: 'Rejected by admin' }).unwrap(); toast.success('Refund rejected'); } catch { toast.error('Failed to reject refund'); } }}>Reject</Button>
          </div>
        );
      },
    },
  ];

  const totalRevenue = payments.reduce((s, p) => s + (p.status === 'completed' ? p.amount : 0), 0);

  const handleCreateRefund = async () => {
    if (!refundForm.paymentId || !refundForm.amount) return;
    try {
      await createRefund(refundForm).unwrap();
      toast.success('Refund created');
      setShowCreateRefund(false);
      setRefundForm({ paymentId: '', amount: 0, reason: RefundReason.OTHER });
    } catch {
      toast.error('Failed to create refund');
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading payments..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Payments & Refunds" description="View payments and manage refunds">
        <Button variant="outline" onClick={() => setShowCreateRefund(true)}>
          <RefreshCw className="mr-2 h-4 w-4" /> Create Refund
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Payments</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Pending Refunds</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-orange-600">{refunds.filter((r) => r.status === 'pending').length}</p></CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b pb-2">
        <Button variant={tab === 'payments' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('payments')}>
          <DollarSign className="mr-1 h-4 w-4" /> Payments
        </Button>
        <Button variant={tab === 'refunds' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('refunds')}>
          <RefreshCw className="mr-1 h-4 w-4" /> Refunds
        </Button>
      </div>

      {tab === 'payments' && (
        payments.length === 0
          ? <EmptyState icon={<DollarSign className="h-12 w-12" />} title="No payments" description="No payment records found" />
          : <DataTable columns={paymentsCols} data={payments} pagination={{ page, limit, total, totalPages, onPageChange: setPage, onLimitChange: setLimit }} />
      )}

      {tab === 'refunds' && (
        refunds.length === 0
          ? <EmptyState icon={<RefreshCw className="h-12 w-12" />} title="No refunds" description="No refund requests" />
          : <DataTable columns={refundsCols} data={refunds} pagination={{ page: refundPage, limit: 10, total: refundsTotal, totalPages: refundsTotalPages, onPageChange: setRefundPage, onLimitChange: () => {} }} />
      )}

      <Dialog open={showCreateRefund} onOpenChange={setShowCreateRefund}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Refund</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Payment ID" value={refundForm.paymentId} onChange={(e) => setRefundForm((f) => ({ ...f, paymentId: e.target.value }))} />
            <Input type="number" placeholder="Amount" value={refundForm.amount} onChange={(e) => setRefundForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={refundForm.reason} onChange={(e) => setRefundForm((f) => ({ ...f, reason: e.target.value as RefundReason }))}>
              {Object.values(RefundReason).map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRefund(false)}>Cancel</Button>
            <Button onClick={handleCreateRefund}>Submit Refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
