import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { paymentsApi } from '@/services/api'
import type { Payment } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function PaymentsPage() {
  const [page, setPage] = useState(1)
  const [statusDialog, setStatusDialog] = useState<Payment | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['payments', { page, limit: 10 }],
    queryFn: () => paymentsApi.list({ page, limit: 10 }),
  })

  const statusM = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => paymentsApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); setStatusDialog(null); toast.success('Updated') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed')),
  })

  const columns: ColumnDef<Payment>[] = [
    { accessorKey: 'id', header: 'Payment ID', cell: ({ row }) => `#${row.original.id.slice(0, 8)}` },
    { accessorKey: 'gateway', header: ({ column }) => <SortHeader column={column}>Gateway</SortHeader> },
    { accessorKey: 'method', header: 'Method', cell: ({ row }) => row.original.method || '—' },
    { accessorKey: 'amount', header: ({ column }) => <SortHeader column={column}>Amount</SortHeader>, cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Date</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setStatusDialog(row.original); setNewStatus(row.original.status) }}><RefreshCw className="mr-2 h-4 w-4" />Update Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="View and manage payments" />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} isError={isError} onRetry={refetch} manualPagination page={page} pageCount={data?.totalPages ?? 1} onPageChange={setPage} searchPlaceholder="Search payments..."
        enableRowSelection
        exportFilename="payments"
        getExportRow={(r) => ({ ID: r.id, Gateway: r.gateway, Method: r.method ?? '', Amount: r.amount, Currency: r.currency, Status: r.status, Date: r.createdAt })}
      />

      <Dialog open={!!statusDialog} onOpenChange={() => setStatusDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Payment Status</DialogTitle><DialogDescription>Payment #{statusDialog?.id.slice(0, 8)}</DialogDescription></DialogHeader>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['pending', 'paid', 'failed', 'refunded'].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(null)}>Cancel</Button>
            <Button onClick={() => statusDialog && statusM.mutate({ id: statusDialog.id, status: newStatus })} disabled={statusM.isPending}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
