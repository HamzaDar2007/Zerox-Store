import { useState } from 'react';
import { PageHeader } from '@/common/components/PageHeader';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/format';
import { RefreshCw, Calendar } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Subscription } from '@/common/types';
import {
  useGetSubscriptionsQuery,
  useGetDueSubscriptionsQuery,
  useProcessRenewalMutation,
} from '@/store/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';

type Tab = 'all' | 'due';

export default function SellerSubscriptionsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: allData, isLoading: loadingAll } = useGetSubscriptionsQuery({ page, limit });
  const subscriptions = allData?.data?.items ?? [];
  const total = allData?.data?.total ?? 0;
  const totalPages = allData?.data?.totalPages ?? 1;

  const { data: dueData, isLoading: loadingDue } = useGetDueSubscriptionsQuery();
  const dueSubscriptions = dueData?.data ?? [];

  const [processRenewal] = useProcessRenewalMutation();

  const cols: ColumnDef<Subscription>[] = [
    { accessorKey: 'planName', header: 'Plan' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      accessorKey: 'unitPrice',
      header: 'Price',
      cell: ({ row }) => `${formatCurrency(row.original.unitPrice)}/${row.original.frequency}`,
    },
    { accessorKey: 'lastOrderDate', header: 'Last Order', cell: ({ row }) => row.original.lastOrderDate ? formatDate(row.original.lastOrderDate) : '—' },
    { accessorKey: 'nextDeliveryDate', header: 'Next Delivery', cell: ({ row }) => formatDate(row.original.nextDeliveryDate) },
  ];

  const dueCols: ColumnDef<Subscription>[] = [
    ...cols,
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button size="sm" onClick={() => processRenewal(row.original.id)}>
          <RefreshCw className="mr-1 h-4 w-4" /> Process Renewal
        </Button>
      ),
    },
  ];

  const isLoading = tab === 'all' ? loadingAll : loadingDue;
  if (isLoading) return <LoadingSpinner label="Loading subscriptions..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="View and manage customer subscriptions" />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Active</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{subscriptions.filter((s) => s.status === 'active').length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Due for Renewal</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-orange-600">{dueSubscriptions.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cancelled</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-muted-foreground">{subscriptions.filter((s) => s.status === 'cancelled').length}</p></CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button variant={tab === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('all')}>
          <Calendar className="mr-1 h-4 w-4" /> All Subscriptions
        </Button>
        <Button variant={tab === 'due' ? 'default' : 'ghost'} size="sm" onClick={() => setTab('due')}>
          <RefreshCw className="mr-1 h-4 w-4" /> Due for Renewal ({dueSubscriptions.length})
        </Button>
      </div>

      {tab === 'all' && (
        subscriptions.length === 0
          ? <EmptyState icon={<Calendar className="h-12 w-12" />} title="No subscriptions" description="No subscription plans found" />
          : (
            <DataTable
              columns={cols}
              data={subscriptions}
              pagination={{ page, limit, total, totalPages, onPageChange: setPage, onLimitChange: setLimit }}
            />
          )
      )}

      {tab === 'due' && (
        dueSubscriptions.length === 0
          ? <EmptyState icon={<RefreshCw className="h-12 w-12" />} title="No renewals due" description="All subscriptions are up to date" />
          : <DataTable columns={dueCols} data={dueSubscriptions} />
      )}
    </div>
  );
}
