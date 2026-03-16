import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { sellersApi } from '@/services/api'
import type { Seller } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, CheckCircle, Trash2, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export default function SellersPage() {
  const [detail, setDetail] = useState<Seller | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Seller | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['sellers'], queryFn: sellersApi.list })

  const approveM = useMutation({
    mutationFn: (id: string) => sellersApi.update(id, { status: 'active' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sellers'] }); toast.success('Seller approved') },
    onError: () => toast.error('Failed to approve'),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => sellersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sellers'] }); setDeleteTarget(null); toast.success('Seller deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  const columns: ColumnDef<Seller>[] = [
    { accessorKey: 'displayName', header: ({ column }) => <SortHeader column={column}>Display Name</SortHeader> },
    { accessorKey: 'legalName', header: ({ column }) => <SortHeader column={column}>Legal Name</SortHeader>, cell: ({ row }) => row.original.legalName || '—' },
    { accessorKey: 'commissionRate', header: ({ column }) => <SortHeader column={column}>Commission %</SortHeader>, cell: ({ row }) => row.original.commissionRate != null ? `${row.original.commissionRate}%` : '—' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Joined</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetail(row.original)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
            {row.original.status === 'pending' && (
              <DropdownMenuItem onClick={() => approveM.mutate(row.original.id)}>
                <CheckCircle className="mr-2 h-4 w-4" />Approve
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setDeleteTarget(row.original)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Sellers" description="View and manage sellers" />
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} searchColumn="displayName" searchPlaceholder="Search sellers..."
        enableRowSelection
        onBulkDelete={(rows) => {
          Promise.all(rows.map((r) => sellersApi.delete(r.id))).then(() => {
            qc.invalidateQueries({ queryKey: ['sellers'] }); toast.success(`${rows.length} seller(s) deleted`)
          }).catch(() => toast.error('Failed'))
        }}
        bulkStatusOptions={['active', 'suspended']}
        onBulkStatusChange={(rows, status) => {
          Promise.all(rows.map((r) => sellersApi.update(r.id, { status }))).then(() => {
            qc.invalidateQueries({ queryKey: ['sellers'] }); toast.success(`${rows.length} seller(s) updated`)
          }).catch(() => toast.error('Failed'))
        }}
        exportFilename="sellers"
        getExportRow={(r) => ({ DisplayName: r.displayName, LegalName: r.legalName ?? '', Commission: r.commissionRate ?? '', Status: r.status, Joined: r.createdAt })}
      />

      {/* Seller Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
            <DialogDescription>{detail?.displayName}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Display Name:</span><p className="font-medium">{detail.displayName}</p></div>
                <div><span className="text-muted-foreground">Legal Name:</span><p className="font-medium">{detail.legalName || '—'}</p></div>
                <div><span className="text-muted-foreground">Tax ID:</span><p className="font-medium">{detail.taxId || '—'}</p></div>
                <div><span className="text-muted-foreground">Commission:</span><p className="font-medium">{detail.commissionRate != null ? `${detail.commissionRate}%` : '—'}</p></div>
                <div><span className="text-muted-foreground">Status:</span><p><Badge variant="outline">{detail.status}</Badge></p></div>
                <div><span className="text-muted-foreground">Joined:</span><p className="font-medium">{formatDate(detail.createdAt)}</p></div>
              </div>
              {detail.status === 'pending' && (
                <DialogFooter>
                  <Button onClick={() => { approveM.mutate(detail.id); setDetail(null) }}>
                    <CheckCircle className="mr-1 h-4 w-4" />Approve Seller
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Seller" description={`Delete seller "${deleteTarget?.displayName}"? This action cannot be undone.`} confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />
    </div>
  )
}
