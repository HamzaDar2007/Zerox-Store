import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { subscriptionsApi } from '@/services/api'
import type { SubscriptionPlan } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  currency: z.string().default('USD'),
  interval: z.string().min(1),
  intervalCount: z.coerce.number().min(1).default(1),
  trialDays: z.coerce.number().default(0),
})
type FormData = z.infer<typeof schema>

export default function SubscriptionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionPlan | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['subscription-plans'], queryFn: subscriptionsApi.listPlans })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const createM = useMutation({ mutationFn: subscriptionsApi.createPlan, onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscription-plans'] }); setDialogOpen(false); reset(); toast.success('Plan created') }, onError: () => toast.error('Failed') })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: FormData & { id: string }) => subscriptionsApi.updatePlan(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscription-plans'] }); setDialogOpen(false); setEditing(null); toast.success('Updated') }, onError: () => toast.error('Failed') })
  const deleteM = useMutation({ mutationFn: (id: string) => subscriptionsApi.deletePlan(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscription-plans'] }); setDeleteTarget(null); toast.success('Deleted') }, onError: () => toast.error('Failed') })

  const openCreate = () => { setEditing(null); reset({ name: '', description: '', price: 0, currency: 'USD', interval: 'month', intervalCount: 1, trialDays: 0 }); setDialogOpen(true) }
  const openEdit = (p: SubscriptionPlan) => { setEditing(p); reset({ name: p.name, description: p.description ?? '', price: p.price, currency: p.currency, interval: p.interval, intervalCount: p.intervalCount, trialDays: p.trialDays }); setDialogOpen(true) }
  const onSubmit = (d: FormData) => editing ? updateM.mutate({ ...d, id: editing.id }) : createM.mutate(d)

  const columns: ColumnDef<SubscriptionPlan>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Plan</SortHeader> },
    { accessorKey: 'price', header: ({ column }) => <SortHeader column={column}>Price</SortHeader>, cell: ({ row }) => formatCurrency(row.original.price, row.original.currency) },
    { accessorKey: 'interval', header: 'Interval', cell: ({ row }) => `Every ${row.original.intervalCount} ${row.original.interval}(s)` },
    { accessorKey: 'trialDays', header: ({ column }) => <SortHeader column={column}>Trial Days</SortHeader> },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
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
      <PageHeader title="Subscriptions" description="Manage subscription plans" action={{ label: 'Add Plan', onClick: openCreate }} />
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} searchColumn="name" searchPlaceholder="Search plans..."
        enableRowSelection
        onBulkDelete={(rows) => { if (confirm(`Delete ${rows.length} plans?`)) rows.forEach((r) => deleteM.mutate(r.id)) }}
        exportFilename="subscription-plans"
        getExportRow={(r) => ({ Name: r.name, Price: r.price, Currency: r.currency, Interval: r.interval, TrialDays: r.trialDays, Active: r.isActive })}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Plan' : 'Create Plan'}</DialogTitle><DialogDescription>{editing ? 'Update plan' : 'Add new plan'}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Description</Label><Textarea {...register('description')} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Price</Label><Input type="number" step="0.01" {...register('price')} /></div>
              <div className="space-y-2"><Label>Currency</Label><Input {...register('currency')} /></div>
              <div className="space-y-2"><Label>Interval</Label><Input {...register('interval')} placeholder="month" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Interval Count</Label><Input type="number" {...register('intervalCount')} /></div>
              <div className="space-y-2"><Label>Trial Days</Label><Input type="number" {...register('trialDays')} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={createM.isPending || updateM.isPending}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Plan" description={`Delete plan "${deleteTarget?.name}"?`} confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />
    </div>
  )
}
