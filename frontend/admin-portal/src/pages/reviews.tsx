import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { reviewsApi } from '@/services/api'
import type { Review } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, RefreshCw, Trash2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatDate } from '@/lib/utils'

export default function ReviewsPage() {
  const [page, setPage] = useState(1)
  const [statusDialog, setStatusDialog] = useState<Review | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reviews', { page, limit: 10 }],
    queryFn: () => reviewsApi.list({ page, limit: 10 }),
  })

  const statusM = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => reviewsApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reviews'] }); setStatusDialog(null); toast.success('Updated') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed')),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reviews'] }); setDeleteTarget(null); toast.success('Deleted') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed')),
  })

  const columns: ColumnDef<Review>[] = [
    {
      accessorKey: 'rating', header: ({ column }) => <SortHeader column={column}>Rating</SortHeader>, cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < row.original.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
          ))}
        </div>
      ),
    },
    { accessorKey: 'title', header: ({ column }) => <SortHeader column={column}>Title</SortHeader>, cell: ({ row }) => row.original.title || '—' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'isVerified', header: 'Verified', cell: ({ row }) => row.original.isVerified ? '✓' : '—' },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Date</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setStatusDialog(row.original); setNewStatus(row.original.status) }}><RefreshCw className="mr-2 h-4 w-4" />Moderate</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteTarget(row.original)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="Moderate product reviews" />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} isError={isError} onRetry={refetch} manualPagination page={page} pageCount={data?.totalPages ?? 1} onPageChange={setPage} searchPlaceholder="Search reviews..."
        enableRowSelection
        onBulkDelete={(rows) => { if (confirm(`Delete ${rows.length} reviews?`)) Promise.allSettled(rows.map((r) => reviewsApi.delete(r.id))).then((results) => { qc.invalidateQueries({ queryKey: ['reviews'] }); const failed = results.filter((r) => r.status === 'rejected').length; if (failed) toast.error(`${failed} of ${rows.length} failed`); else toast.success(`${rows.length} review(s) deleted`) }) }}
        exportFilename="reviews"
        getExportRow={(r) => ({ Rating: r.rating, Title: r.title ?? '', Status: r.status, Verified: r.isVerified, Date: r.createdAt })}
      />

      <Dialog open={!!statusDialog} onOpenChange={() => setStatusDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Moderate Review</DialogTitle><DialogDescription>{statusDialog?.title || 'Review'}</DialogDescription></DialogHeader>
          {statusDialog?.body && <p className="text-sm text-muted-foreground border rounded p-3">{statusDialog.body}</p>}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['pending', 'approved', 'rejected'].map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(null)}>Cancel</Button>
            <Button onClick={() => statusDialog && statusM.mutate({ id: statusDialog.id, status: newStatus })} disabled={statusM.isPending}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Review" description="Delete this review permanently?" confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />
    </div>
  )
}
