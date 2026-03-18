import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { ordersApi } from '@/services/api'
import type { Order } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, RefreshCw, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatCurrency, formatDate } from '@/lib/utils'

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [statusDialog, setStatusDialog] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [detailDialog, setDetailDialog] = useState<Order | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders', { page, limit: 10 }],
    queryFn: () => ordersApi.list({ page, limit: 10 }),
  })

  const { data: orderItems } = useQuery({
    queryKey: ['order-items', detailDialog?.id],
    queryFn: () => ordersApi.getItems(detailDialog!.id),
    enabled: !!detailDialog,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); setStatusDialog(null); toast.success('Status updated') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed')),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => ordersApi.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order cancelled') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to cancel order')),
  })

  const columns: ColumnDef<Order>[] = [
    { accessorKey: 'id', header: 'Order ID', cell: ({ row }) => `#${row.original.id.slice(0, 8)}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'subtotal', header: ({ column }) => <SortHeader column={column}>Subtotal</SortHeader>, cell: ({ row }) => formatCurrency(row.original.subtotal) },
    { accessorKey: 'total', header: ({ column }) => <SortHeader column={column}>Total</SortHeader>, cell: ({ row }) => formatCurrency(row.original.total) },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Date</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailDialog(row.original)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setStatusDialog(row.original); setNewStatus(row.original.status) }}><RefreshCw className="mr-2 h-4 w-4" />Update Status</DropdownMenuItem>
            {row.original.status !== 'cancelled' && row.original.status !== 'delivered' && (
              <DropdownMenuItem onClick={() => cancelMutation.mutate(row.original.id)} className="text-destructive"><XCircle className="mr-2 h-4 w-4" />Cancel Order</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Manage customer orders" />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        manualPagination
        page={page}
        pageCount={data?.totalPages ?? 1}
        onPageChange={setPage}
        searchPlaceholder="Search orders..."
        enableRowSelection
        onBulkStatusChange={(rows, status) => {
          Promise.allSettled(rows.map((r) => ordersApi.updateStatus(r.id, status))).then((results) => {
            qc.invalidateQueries({ queryKey: ['orders'] })
            const failed = results.filter((r) => r.status === 'rejected').length
            if (failed) toast.error(`${failed} of ${rows.length} failed to update`)
            else toast.success(`${rows.length} order(s) updated`)
          })
        }}
        bulkStatusOptions={ORDER_STATUSES}
        exportFilename="orders"
        getExportRow={(o) => ({ OrderID: o.id.slice(0, 8), Status: o.status, Subtotal: o.subtotal, Total: o.total, Date: o.createdAt })}
      />

      {/* Status Dialog */}
      <Dialog open={!!statusDialog} onOpenChange={() => setStatusDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Order Status</DialogTitle><DialogDescription>Order #{statusDialog?.id.slice(0, 8)}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(null)}>Cancel</Button>
            <Button onClick={() => statusDialog && statusMutation.mutate({ id: statusDialog.id, status: newStatus })} disabled={statusMutation.isPending}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Order Details</DialogTitle><DialogDescription>Order #{detailDialog?.id.slice(0, 8)}</DialogDescription></DialogHeader>
          {detailDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={detailDialog.status} /></div>
                <div><span className="text-muted-foreground">Date:</span> {formatDate(detailDialog.createdAt)}</div>
                <div><span className="text-muted-foreground">Subtotal:</span> {formatCurrency(detailDialog.subtotal)}</div>
                <div><span className="text-muted-foreground">Shipping:</span> {formatCurrency(detailDialog.shippingAmount)}</div>
                <div><span className="text-muted-foreground">Tax:</span> {formatCurrency(detailDialog.taxAmount)}</div>
                <div><span className="text-muted-foreground font-semibold">Total:</span> <strong>{formatCurrency(detailDialog.total)}</strong></div>
              </div>
              {detailDialog.shippingCity && (
                <div className="text-sm">
                  <p className="font-medium mb-1">Shipping Address</p>
                  <p className="text-muted-foreground">{detailDialog.shippingLine1}{detailDialog.shippingLine2 ? `, ${detailDialog.shippingLine2}` : ''}</p>
                  <p className="text-muted-foreground">{detailDialog.shippingCity}, {detailDialog.shippingState} {detailDialog.shippingPostalCode}</p>
                </div>
              )}
              {Array.isArray(orderItems) && orderItems.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">Items</p>
                  <div className="space-y-2">
                    {orderItems.map((item: { id: string; nameSnapshot: string; quantity: number; unitPrice: number; total: number }) => (
                      <div key={item.id} className="flex justify-between rounded border p-2 text-sm">
                        <span>{item.nameSnapshot} x{item.quantity}</span>
                        <span>{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
