import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/common/components/PageHeader';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/format';
import { RefreshCw, Pause, Play, XCircle } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Subscription } from '@/common/types';
import {
  useGetMySubscriptionsQuery,
  useCancelSubscriptionMutation,
  usePauseSubscriptionMutation,
  useResumeSubscriptionMutation,
} from '@/store/api';

export default function CustomerSubscriptionsPage() {
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { data, isLoading } = useGetMySubscriptionsQuery();
  const subscriptions = (data?.data ?? []) as Subscription[];

  const [cancelSub] = useCancelSubscriptionMutation();
  const [pauseSub] = usePauseSubscriptionMutation();
  const [resumeSub] = useResumeSubscriptionMutation();

  const columns: ColumnDef<Subscription, unknown>[] = [
    {
      accessorKey: 'productId',
      header: 'Product',
      cell: ({ getValue }) => <span className="font-medium">{(getValue() as string).slice(0, 8)}…</span>,
    },
    {
      accessorKey: 'frequency',
      header: 'Frequency',
      cell: ({ getValue }) => <Badge variant="outline">{getValue() as string}</Badge>,
    },
    {
      accessorKey: 'unitPrice',
      header: 'Price',
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      accessorKey: 'nextDeliveryDate',
      header: 'Next Delivery',
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    },
    {
      accessorKey: 'totalOrders',
      header: 'Orders',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex gap-1">
            {s.status === ('active' as never) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => { try { await pauseSub(s.id).unwrap(); toast.success('Subscription paused'); } catch { toast.error('Failed to pause subscription'); } }}
                title="Pause"
              >
                <Pause className="h-4 w-4" />
              </Button>
            )}
            {s.status === ('paused' as never) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => { try { await resumeSub(s.id).unwrap(); toast.success('Subscription resumed'); } catch { toast.error('Failed to resume subscription'); } }}
                title="Resume"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            {s.status !== ('cancelled' as never) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCancelId(s.id)}
                title="Cancel"
              >
                <XCircle className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner label="Loading subscriptions..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="My Subscriptions" description="Manage your recurring orders" />

      {subscriptions.length === 0 ? (
        <EmptyState
          icon={<RefreshCw className="h-10 w-10" />}
          title="No subscriptions"
          description="You don't have any active subscriptions."
        />
      ) : (
        <DataTable columns={columns} data={subscriptions} />
      )}

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={() => setCancelId(null)}
        title="Cancel Subscription"
        description="Are you sure you want to cancel this subscription? This cannot be undone."
        onConfirm={async () => {
          if (cancelId) { try { await cancelSub({ id: cancelId }).unwrap(); toast.success('Subscription cancelled'); } catch { toast.error('Failed to cancel subscription'); } }
          setCancelId(null);
        }}
      />
    </div>
  );
}
