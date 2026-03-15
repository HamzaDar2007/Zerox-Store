import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { couponsApi } from '@/services/api'
import type { Coupon } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  code: z.string().min(1),
  description: z.string().optional(),
  discountType: z.string().min(1),
  discountValue: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().optional(),
  usageLimit: z.coerce.number().optional(),
  startsAt: z.string().min(1),
  expiresAt: z.string().min(1),
})
type FormData = z.infer<typeof schema>

export default function CouponsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['coupons'], queryFn: couponsApi.list })
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const createM = useMutation({ mutationFn: couponsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); setDialogOpen(false); reset(); toast.success('Coupon created') }, onError: () => toast.error('Failed') })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: FormData & { id: string }) => couponsApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); setDialogOpen(false); setEditing(null); toast.success('Updated') }, onError: () => toast.error('Failed') })
  const deleteM = useMutation({ mutationFn: (id: string) => couponsApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); setDeleteTarget(null); toast.success('Deleted') }, onError: () => toast.error('Failed') })

  const openCreate = () => { setEditing(null); reset({ code: '', description: '', discountType: 'percentage', discountValue: 0, startsAt: '', expiresAt: '' }); setDialogOpen(true) }
  const openEdit = (c: Coupon) => { setEditing(c); reset({ code: c.code, description: c.description ?? '', discountType: c.discountType, discountValue: c.discountValue, minOrderAmount: c.minOrderAmount ?? undefined, usageLimit: c.usageLimit ?? undefined, startsAt: c.startsAt?.slice(0, 16), expiresAt: c.expiresAt?.slice(0, 16) }); setDialogOpen(true) }
  const onSubmit = (d: FormData) => editing ? updateM.mutate({ ...d, id: editing.id }) : createM.mutate(d)

  const columns: ColumnDef<Coupon>[] = [
    { accessorKey: 'code', header: ({ column }) => <SortHeader column={column}>Code</SortHeader>, cell: ({ row }) => <Badge variant="outline" className="font-mono">{row.original.code}</Badge> },
    { accessorKey: 'discountType', header: 'Type', cell: ({ row }) => <Badge variant="secondary">{row.original.discountType}</Badge> },
    { accessorKey: 'discountValue', header: ({ column }) => <SortHeader column={column}>Value</SortHeader>, cell: ({ row }) => row.original.discountType === 'percentage' ? `${row.original.discountValue}%` : `$${row.original.discountValue}` },
    { accessorKey: 'usedCount', header: 'Used', cell: ({ row }) => `${row.original.usedCount}${row.original.usageLimit ? ` / ${row.original.usageLimit}` : ''}` },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    { accessorKey: 'expiresAt', header: ({ column }) => <SortHeader column={column}>Expires</SortHeader>, cell: ({ row }) => formatDate(row.original.expiresAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteTarget(row.original)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Coupons" description="Manage discount coupons" action={{ label: 'Add Coupon', onClick: openCreate }} />
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} searchColumn="code" searchPlaceholder="Search coupons..."
        enableRowSelection
        onBulkDelete={(rows) => { if (confirm(`Delete ${rows.length} coupons?`)) rows.forEach((r) => deleteM.mutate(r.id)) }}
        exportFilename="coupons"
        getExportRow={(r) => ({ Code: r.code, Type: r.discountType, Value: r.discountValue, Status: r.isActive ? 'Active' : 'Inactive', Expires: r.expiresAt })}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle><DialogDescription>{editing ? 'Update coupon' : 'Add new coupon'}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Code</Label><Input {...register('code')} />{errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}</div>
              <div className="space-y-2"><Label>Discount Type</Label>
                <Controller name="discountType" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem></SelectContent></Select>
                )} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Discount Value</Label><Input type="number" step="0.01" {...register('discountValue')} /></div>
              <div className="space-y-2"><Label>Min Order Amount</Label><Input type="number" step="0.01" {...register('minOrderAmount')} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Starts At</Label><Input type="datetime-local" {...register('startsAt')} /></div>
              <div className="space-y-2"><Label>Expires At</Label><Input type="datetime-local" {...register('expiresAt')} /></div>
            </div>
            <div className="space-y-2"><Label>Usage Limit</Label><Input type="number" {...register('usageLimit')} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={createM.isPending || updateM.isPending}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Coupon" description={`Delete coupon "${deleteTarget?.code}"?`} confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />
    </div>
  )
}
