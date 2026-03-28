import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { subscriptionsApi } from '@/services/api'
import type { SubscriptionPlan, Subscription } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Search, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { formResolver } from '@/lib/form'
import { z } from 'zod'

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

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['subscription-plans'], queryFn: subscriptionsApi.listPlans })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: formResolver(schema) })

  const createM = useMutation({ mutationFn: subscriptionsApi.createPlan, onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscription-plans'] }); setDialogOpen(false); reset(); toast.success('Plan created') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: FormData & { id: string }) => subscriptionsApi.updatePlan(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscription-plans'] }); setDialogOpen(false); setEditing(null); toast.success('Updated') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })
  const deleteM = useMutation({ mutationFn: (id: string) => subscriptionsApi.deletePlan(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscription-plans'] }); setDeleteTarget(null); toast.success('Deleted') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })

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
      <PageHeader title="Subscriptions" description="Manage subscription plans and active subscriptions" action={{ label: 'Add Plan', onClick: openCreate }} />

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="subscriptions">Active Subscriptions</TabsTrigger>
          <TabsTrigger value="lookup">Lookup</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <DataTable columns={columns} data={data ?? []} isLoading={isLoading} isError={isError} onRetry={refetch} searchColumn="name" searchPlaceholder="Search plans..."
        enableRowSelection
        onBulkDelete={(rows) => { if (confirm(`Delete ${rows.length} plans?`)) Promise.allSettled(rows.map((r) => subscriptionsApi.deletePlan(r.id))).then((results) => { qc.invalidateQueries({ queryKey: ['subscription-plans'] }); const failed = results.filter((r) => r.status === 'rejected').length; if (failed) toast.error(`${failed} of ${rows.length} failed`); else toast.success(`${rows.length} plan(s) deleted`) }) }}
        exportFilename="subscription-plans"
        getExportRow={(r) => ({ Name: r.name, Price: r.price, Currency: r.currency, Interval: r.interval, TrialDays: r.trialDays, Active: r.isActive })}
      />
        </TabsContent>

        <TabsContent value="subscriptions">
          <SubscriptionsList />
        </TabsContent>

        <TabsContent value="lookup">
          <SubscriptionLookup />
        </TabsContent>
      </Tabs>

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

/* ── Subscriptions List (Active) ── */
function SubscriptionsList() {
  const qc = useQueryClient()
  const { data: subs, isLoading } = useQuery({
    queryKey: ['subscriptions-list'],
    queryFn: subscriptionsApi.list,
  })

  const cancelM = useMutation({
    mutationFn: (id: string) => subscriptionsApi.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscriptions-list'] }); toast.success('Subscription cancelled') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to cancel')),
  })

  const subColumns: ColumnDef<Subscription>[] = [
    { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.id.slice(0, 8)}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'planId', header: 'Plan', cell: ({ row }) => row.original.plan?.name ?? row.original.planId.slice(0, 8) },
    { accessorKey: 'gateway', header: 'Gateway', cell: ({ row }) => row.original.gateway ?? '—' },
    { accessorKey: 'currentPeriodStart', header: 'Period Start', cell: ({ row }) => formatDate(row.original.currentPeriodStart) },
    { accessorKey: 'currentPeriodEnd', header: 'Period End', cell: ({ row }) => formatDate(row.original.currentPeriodEnd) },
    {
      id: 'actions', cell: ({ row }) => row.original.status !== 'cancelled' ? (
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => cancelM.mutate(row.original.id)} disabled={cancelM.isPending}>
          <XCircle className="mr-1 h-4 w-4" />Cancel
        </Button>
      ) : null,
    },
  ]

  return (
    <DataTable
      columns={subColumns}
      data={Array.isArray(subs) ? subs : []}
      isLoading={isLoading}
      searchPlaceholder="Search subscriptions..."
      enableRowSelection
      exportFilename="subscriptions"
      getExportRow={(r) => ({ ID: r.id, Status: r.status, Plan: r.plan?.name ?? r.planId, Gateway: r.gateway ?? '', PeriodStart: r.currentPeriodStart, PeriodEnd: r.currentPeriodEnd })}
    />
  )
}

/* ── Subscription Lookup & Management ── */
function SubscriptionLookup() {
  const [subId, setSubId] = useState('')
  const [queriedId, setQueriedId] = useState('')
  const qc = useQueryClient()

  const { data: sub, isLoading, isError } = useQuery({
    queryKey: ['subscription', queriedId],
    queryFn: () => subscriptionsApi.get(queriedId),
    enabled: !!queriedId,
  })

  const cancelM = useMutation({
    mutationFn: (id: string) => subscriptionsApi.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscription', queriedId] }); toast.success('Subscription cancelled') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to cancel')),
  })

  const handleSearch = () => { if (subId.trim()) setQueriedId(subId.trim()) }

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-4 w-4" />Subscription Lookup</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Enter subscription ID…" value={subId} onChange={(e) => setSubId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <Button onClick={handleSearch} disabled={!subId.trim()}>Lookup</Button>
        </div>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {isError && queriedId && <p className="text-sm text-destructive">Subscription not found.</p>}
        {sub && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div><span className="text-muted-foreground">ID:</span> <span className="font-mono text-xs">{sub.id}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={sub.status} /></div>
              <div><span className="text-muted-foreground">Plan:</span> {sub.plan?.name ?? sub.planId}</div>
              <div><span className="text-muted-foreground">Gateway:</span> {sub.gateway ?? '—'}</div>
              <div><span className="text-muted-foreground">Period:</span> {new Date(sub.currentPeriodStart).toLocaleDateString()} — {new Date(sub.currentPeriodEnd).toLocaleDateString()}</div>
              {sub.trialEnd && <div><span className="text-muted-foreground">Trial End:</span> {new Date(sub.trialEnd).toLocaleDateString()}</div>}
              {sub.cancelledAt && <div><span className="text-muted-foreground">Cancelled:</span> {new Date(sub.cancelledAt).toLocaleDateString()}</div>}
            </div>
            {sub.status !== 'cancelled' && (
              <Button variant="destructive" size="sm" onClick={() => cancelM.mutate(sub.id)} disabled={cancelM.isPending}><XCircle className="mr-1 h-4 w-4" />Cancel Subscription</Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
