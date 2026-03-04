import { useState } from 'react';
import { PageHeader } from '@/common/components/PageHeader';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/format';
import { RefreshCw, Calendar, Pause, Play, XCircle } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Subscription } from '@/common/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import {
  useGetSubscriptionsQuery,
  useGetDueSubscriptionsQuery,
  usePauseSubscriptionMutation,
  useResumeSubscriptionMutation,
  useCancelSubscriptionMutation,
  useProcessRenewalMutation,
} from '@/store/api';

type Tab = 'all' | 'due';

export default function SASubscriptionsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: allData, isLoading: loadingAll } = useGetSubscriptionsQuery({ page, limit });
  const subscriptions = allData?.data?.items ?? [];
  const total = allData?.data?.total ?? 0;
  const totalPages = allData?.data?.totalPages ?? 1;

  const { data: dueData, isLoading: loadingDue } = useGetDueSubscriptionsQuery();
  const dueSubscriptions = dueData?.data ?? [];

  const [pauseSubscription] = usePauseSubscriptionMutation();
  const [resumeSubscription] = useResumeSubscriptionMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();
  const [processRenewal] = useProcessRenewalMutation();

  const baseCols: ColumnDef<Subscription>[] = [
    { accessorKey: 'userId', header: 'User ID' },
    { accessorKey: 'productId', header: 'Product ID' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'frequency', header: 'Frequency', cell: ({ row }) => <StatusBadge status={row.original.frequency} /> },
    { accessorKey: 'unitPrice', header: 'Price', cell: ({ row }) => formatCurrency(row.original.unitPrice) },
    { accessorKey: 'quantity', header: 'Qty' },
    { accessorKey: 'nextDeliveryDate', header: 'Next Delivery', cell: ({ row }) => formatDate(row.original.nextDeliveryDate) },
    { accessorKey: 'totalOrders', header: 'Total Orders' },
    { accessorKey: 'totalSpent', header: 'Total Spent', cell: ({ row }) => formatCurrency(row.original.totalSpent) },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex gap-1">
            {s.status === 'active' && (
              <>
                <Button size="sm" variant="ghost" onClick={() => pauseSubscription(s.id)} title="Pause">
                  <Pause className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => cancelSubscription({ id: s.id, reason: 'Admin cancelled' })} title="Cancel">
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            {s.status === 'paused' && (
              <Button size="sm" variant="ghost" onClick={() => resumeSubscription(s.id)} title="Resume">
                <Play className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const dueCols: ColumnDef<Subscription>[] = [
    ...baseCols.slice(0, -1),
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" onClick={() => processRenewal(row.original.id)}>
          <RefreshCw className="mr-1 h-4 w-4" /> Renew
        </Button>
      ),
    },
  ];

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'paused').length;
  const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length;
  const isLoading = tab === 'all' ? loadingAll : loadingDue;

  if (isLoading) return <LoadingSpinner label="Loading subscriptions..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions Management" description="Manage all platform subscriptions" />

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Active</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{activeCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Paused</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-yellow-600">{pausedCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cancelled</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-muted-foreground">{cancelledCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Due for Renewal</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-orange-600">{dueSubscriptions.length}</p></CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b pb-2">
        <Button variant={tab === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('all')}>
          <Calendar className="mr-1 h-4 w-4" /> All Subscriptions
        </Button>
        <Button variant={tab === 'due' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('due')}>
          <RefreshCw className="mr-1 h-4 w-4" /> Due ({dueSubscriptions.length})
        </Button>
      </div>

      {tab === 'all' && (
        subscriptions.length === 0
          ? <EmptyState icon={<Calendar className="h-12 w-12" />} title="No subscriptions" description="No subscriptions on the platform" />
          : <DataTable columns={baseCols} data={subscriptions} pagination={{ page, limit, total, totalPages, onPageChange: setPage, onLimitChange: setLimit }} />
      )}

      {tab === 'due' && (
        dueSubscriptions.length === 0
          ? <EmptyState icon={<RefreshCw className="h-12 w-12" />} title="All current" description="No subscriptions due for renewal" />
          : <DataTable columns={dueCols} data={dueSubscriptions} />
      )}
    </div>
  );
}
