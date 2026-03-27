/**
 * Subscriptions Management Page
 * Displays recurring order subscriptions with the ability to cancel.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { subscriptionsApi } from '@/services/api'
import type { Subscription } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Repeat, MoreHorizontal, Eye, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TableSkeleton, StatCardSkeleton } from '@/components/shared/skeletons'
import { StatCard } from '@/components/shared/stat-card'

export default function SubscriptionsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [detailSub, setDetailSub] = useState<Subscription | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ sub: Subscription; action: 'cancel' } | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['subscriptions', { page, limit: 10 }],
    queryFn: () => subscriptionsApi.list({ page, limit: 10 }),
  })

  const cancelM = useMutation({
    mutationFn: (id: string) => subscriptionsApi.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscriptions'] }); setConfirmAction(null); toast.success('Subscription cancelled') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading) return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="Manage recurring orders" />
      <StatCardSkeleton count={3} />
      <TableSkeleton />
    </div>
  )

  const subs = (data?.data ?? []) as Subscription[]
  const activeSubs = subs.filter((s) => s.status === 'active')
  const totalMrr = activeSubs.reduce((sum, s) => sum + s.amount, 0)

  const columns: ColumnDef<Subscription>[] = [
    { accessorKey: 'planName', header: ({ column }) => <SortHeader column={column}>Plan</SortHeader> },
    { accessorKey: 'interval', header: 'Interval' },
    { accessorKey: 'amount', header: ({ column }) => <SortHeader column={column}>Amount</SortHeader>, cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'currentPeriodEnd', header: 'Next Billing', cell: ({ row }) => formatDate(row.original.currentPeriodEnd) },
    {
      id: 'actions', cell: ({ row }) => {
        const s = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDetailSub(s)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
              {(s.status === 'active' || s.status === 'paused') && <DropdownMenuItem onClick={() => setConfirmAction({ sub: s, action: 'cancel' })} className="text-destructive"><XCircle className="mr-2 h-4 w-4" />Cancel</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const getConfirmMessage = () => {
    if (!confirmAction) return { title: '', desc: '', label: '' }
    const { sub } = confirmAction
    return { title: 'Cancel Subscription', desc: `Cancel "${sub.planName}"? This cannot be undone.`, label: 'Cancel Subscription' }
  }

  const handleConfirm = () => {
    if (!confirmAction) return
    cancelM.mutate(confirmAction.sub.id)
  }

  const cm = getConfirmMessage()

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="Manage recurring orders and subscriptions" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active Subscriptions" value={activeSubs.length} icon={Repeat} />
        <StatCard label="Monthly Recurring" value={formatCurrency(totalMrr)} icon={Repeat} />
        <StatCard label="Total Subscriptions" value={subs.length} icon={Repeat} />
      </div>

      {subs.length === 0 ? (
        <EmptyState icon={Repeat} title="No Subscriptions" description="Recurring orders from customers will appear here." />
      ) : (
        <DataTable
          columns={columns}
          data={subs}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          manualPagination
          page={page}
          pageCount={data?.totalPages ?? 1}
          onPageChange={setPage}
          searchPlaceholder="Search subscriptions..."
          exportFilename="subscriptions"
          getExportRow={(s) => ({ Plan: s.planName, Interval: s.interval, Amount: s.amount, Status: s.status, NextBilling: s.currentPeriodEnd })}
        />
      )}

      {/* Detail Sheet */}
      <Sheet open={!!detailSub} onOpenChange={() => setDetailSub(null)}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detailSub?.planName}</SheetTitle>
            <SheetDescription>Subscription Details</SheetDescription>
          </SheetHeader>
          {detailSub && (
            <div className="mt-4 space-y-4">
              <Card><CardContent className="pt-4 grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={detailSub.status} /></div>
                <div><span className="text-muted-foreground">Interval:</span> {detailSub.interval}</div>
                <div><span className="text-muted-foreground">Amount:</span> {formatCurrency(detailSub.amount, detailSub.currency)}</div>
                <div><span className="text-muted-foreground">Created:</span> {formatDate(detailSub.createdAt)}</div>
                <div><span className="text-muted-foreground">Period Start:</span> {formatDate(detailSub.currentPeriodStart)}</div>
                <div><span className="text-muted-foreground">Period End:</span> {formatDate(detailSub.currentPeriodEnd)}</div>
                {detailSub.cancelledAt && <div className="col-span-2"><span className="text-muted-foreground">Cancelled:</span> {formatDate(detailSub.cancelledAt)}</div>}
              </CardContent></Card>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
        title={cm.title}
        description={cm.desc}
        confirmLabel={cm.label}
        onConfirm={handleConfirm}
        loading={cancelM.isPending}
      />
    </div>
  )
}
