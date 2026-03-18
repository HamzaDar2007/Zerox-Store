import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { returnsApi } from '@/services/api'
import type { Return } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, RefreshCw, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ReturnsPage() {
  const [page, setPage] = useState(1)
  const [statusDialog, setStatusDialog] = useState<Return | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [detailDialog, setDetailDialog] = useState<Return | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['returns', { page, limit: 10 }],
    queryFn: () => returnsApi.list({ page, limit: 10 }),
  })

  const { data: items } = useQuery({
    queryKey: ['return-items', detailDialog?.id],
    queryFn: () => returnsApi.getItems(detailDialog!.id),
    enabled: !!detailDialog,
  })

  const statusM = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => returnsApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['returns'] }); setStatusDialog(null); toast.success('Updated') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed')),
  })

  const columns: ColumnDef<Return>[] = [
    { accessorKey: 'id', header: 'Return ID', cell: ({ row }) => `#${row.original.id.slice(0, 8)}` },
    { accessorKey: 'reason', header: ({ column }) => <SortHeader column={column}>Reason</SortHeader> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'refundAmount', header: ({ column }) => <SortHeader column={column}>Refund</SortHeader>, cell: ({ row }) => row.original.refundAmount != null ? formatCurrency(row.original.refundAmount) : '—' },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Date</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailDialog(row.original)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setStatusDialog(row.original); setNewStatus(row.original.status) }}><RefreshCw className="mr-2 h-4 w-4" />Update Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Returns" description="Manage return requests" />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} isError={isError} onRetry={refetch} manualPagination page={page} pageCount={data?.totalPages ?? 1} onPageChange={setPage} searchPlaceholder="Search returns..."
        enableRowSelection
        exportFilename="returns"
        getExportRow={(r) => ({ ID: r.id, Reason: r.reason, Status: r.status, Refund: r.refundAmount ?? '', Date: r.createdAt })}
      />

      <Dialog open={!!statusDialog} onOpenChange={() => setStatusDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Return Status</DialogTitle><DialogDescription>Return #{statusDialog?.id.slice(0, 8)}</DialogDescription></DialogHeader>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['pending', 'approved', 'rejected', 'completed'].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(null)}>Cancel</Button>
            <Button onClick={() => statusDialog && statusM.mutate({ id: statusDialog.id, status: newStatus })} disabled={statusM.isPending}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Return Details</DialogTitle><DialogDescription>Return #{detailDialog?.id.slice(0, 8)}</DialogDescription></DialogHeader>
          {detailDialog && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Reason:</span> {detailDialog.reason}</div>
              <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={detailDialog.status} /></div>
              {detailDialog.refundAmount != null && <div><span className="text-muted-foreground">Refund:</span> {formatCurrency(detailDialog.refundAmount)}</div>}
              {Array.isArray(items) && items.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Items</p>
                  {items.map((item: { id: string; quantity: number; condition?: string; notes?: string }) => (
                    <div key={item.id} className="rounded border p-2 mb-1">
                      <p>Qty: {item.quantity} {item.condition && `| Condition: ${item.condition}`}</p>
                      {item.notes && <p className="text-muted-foreground">{item.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
