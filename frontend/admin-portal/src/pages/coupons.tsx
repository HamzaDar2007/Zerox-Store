import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { couponsApi } from '@/services/api'
import type { Coupon, CouponScope } from '@/types'
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
import { MoreHorizontal, Pencil, Trash2, Eye, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatDate } from '@/lib/utils'
import { useForm, Controller } from 'react-hook-form'
import { formResolver } from '@/lib/form'
import { z } from 'zod'

const schema = z.object({
  code: z.string().min(1),
  discountType: z.string().min(1),
  discountValue: z.coerce.number().min(0),
  minOrderValue: z.coerce.number().optional(),
  maxDiscount: z.coerce.number().optional(),
  usageLimit: z.coerce.number().optional(),
  perUserLimit: z.coerce.number().optional(),
  startsAt: z.string().min(1),
  expiresAt: z.string().min(1),
})
type FormData = z.infer<typeof schema>

export default function CouponsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)
  const [scopeCoupon, setScopeCoupon] = useState<Coupon | null>(null)
  const [addScopeOpen, setAddScopeOpen] = useState(false)
  const [newScopeType, setNewScopeType] = useState('product')
  const [newScopeId, setNewScopeId] = useState('')
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['coupons'], queryFn: couponsApi.list })
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({ resolver: formResolver(schema) })

  const createM = useMutation({ mutationFn: couponsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); setDialogOpen(false); reset(); toast.success('Coupon created') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: FormData & { id: string }) => couponsApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); setDialogOpen(false); setEditing(null); toast.success('Updated') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })
  const deleteM = useMutation({ mutationFn: (id: string) => couponsApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); setDeleteTarget(null); toast.success('Deleted') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })

  const { data: scopes, refetch: refetchScopes } = useQuery({
    queryKey: ['coupon-scopes', scopeCoupon?.id],
    queryFn: () => couponsApi.getScopes(scopeCoupon?.id ?? ''),
    enabled: !!scopeCoupon,
  })

  const addScopeM = useMutation({
    mutationFn: () => {
      if (!scopeCoupon) return Promise.reject(new Error('No coupon selected'))
      const payload: Record<string, string> = { scopeType: newScopeType };
      if (newScopeType === 'product') payload.productId = newScopeId;
      else if (newScopeType === 'category') payload.categoryId = newScopeId;
      else if (newScopeType === 'user') payload.userId = newScopeId;
      return couponsApi.addScope(scopeCoupon.id, payload);
    },
    onSuccess: () => { refetchScopes(); setAddScopeOpen(false); setNewScopeId(''); setNewScopeType('product'); toast.success('Scope added') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to add scope')),
  })

  const removeScopeM = useMutation({
    mutationFn: (scopeId: string) => couponsApi.removeScope(scopeId),
    onSuccess: () => { refetchScopes(); toast.success('Scope removed') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to remove scope')),
  })

  const openCreate = () => { setEditing(null); reset({ code: '', discountType: 'percentage', discountValue: 0, startsAt: '', expiresAt: '' }); setDialogOpen(true) }
  const openEdit = (c: Coupon) => { setEditing(c); reset({ code: c.code, discountType: c.discountType, discountValue: c.discountValue, minOrderValue: c.minOrderValue ?? undefined, maxDiscount: c.maxDiscount ?? undefined, usageLimit: c.usageLimit ?? undefined, perUserLimit: c.perUserLimit ?? undefined, startsAt: c.startsAt?.slice(0, 16), expiresAt: c.expiresAt?.slice(0, 16) }); setDialogOpen(true) }
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
            <DropdownMenuItem onClick={() => setScopeCoupon(row.original)}><Eye className="mr-2 h-4 w-4" />Scopes</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteTarget(row.original)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Coupons" description="Manage discount coupons" action={{ label: 'Add Coupon', onClick: openCreate }} />
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} isError={isError} onRetry={refetch} searchColumn="code" searchPlaceholder="Search coupons..."
        enableRowSelection
        onBulkDelete={(rows) => { if (confirm(`Delete ${rows.length} coupons?`)) Promise.allSettled(rows.map((r) => couponsApi.delete(r.id))).then((results) => { qc.invalidateQueries({ queryKey: ['coupons'] }); const failed = results.filter((r) => r.status === 'rejected').length; if (failed) toast.error(`${failed} of ${rows.length} failed`); else toast.success(`${rows.length} coupon(s) deleted`) }) }}
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
              <div className="space-y-2"><Label>Min Order Value</Label><Input type="number" step="0.01" {...register('minOrderValue')} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Max Discount</Label><Input type="number" step="0.01" {...register('maxDiscount')} /></div>
              <div className="space-y-2"><Label>Per-User Limit</Label><Input type="number" {...register('perUserLimit')} /></div>
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

      {/* Coupon Scopes Dialog */}
      <Dialog open={!!scopeCoupon} onOpenChange={() => setScopeCoupon(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Coupon Scopes</DialogTitle><DialogDescription>Manage scopes for coupon "{scopeCoupon?.code}"</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Scopes ({(scopes as CouponScope[] | undefined)?.length ?? 0})</h4>
              <Button size="sm" onClick={() => setAddScopeOpen(true)}><Plus className="mr-1 h-3 w-3" />Add Scope</Button>
            </div>
            {(scopes as CouponScope[] | undefined)?.length ? (
              <div className="space-y-2">
                {(scopes as CouponScope[]).map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="text-sm"><Badge variant="outline" className="mr-2">{s.scopeType}</Badge><span className="font-mono">{(s.productId || s.categoryId || s.userId || '').slice(0, 12)}</span></div>
                    <Button variant="ghost" size="icon" onClick={() => removeScopeM.mutate(s.id)}><X className="h-3 w-3 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No scopes defined.</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Scope Dialog */}
      <Dialog open={addScopeOpen} onOpenChange={(open) => { setAddScopeOpen(open); if (!open) { setNewScopeId(''); setNewScopeType('product') } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Scope</DialogTitle><DialogDescription>Restrict this coupon to specific entities</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Scope Type</Label>
              <Select value={newScopeType} onValueChange={setNewScopeType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="product">Product</SelectItem><SelectItem value="category">Category</SelectItem><SelectItem value="user">User</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>Scope ID</Label><Input value={newScopeId} onChange={(e) => setNewScopeId(e.target.value)} placeholder="Entity ID" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddScopeOpen(false)}>Cancel</Button><Button onClick={() => addScopeM.mutate()} disabled={!newScopeId || addScopeM.isPending}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
