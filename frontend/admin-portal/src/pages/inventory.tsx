import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { warehousesApi, inventoryApi } from '@/services/api'
import type { Warehouse, Inventory } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, AlertTriangle, PackagePlus, ArrowUpDown, Lock, Unlock } from 'lucide-react'
import { toast } from 'sonner'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const whSchema = z.object({ code: z.string().min(1), name: z.string().min(1), address: z.string().optional(), city: z.string().optional(), country: z.string().optional(), isActive: z.boolean().default(true) })
type WHFormData = z.infer<typeof whSchema>

const setStockSchema = z.object({ warehouseId: z.string().min(1, 'Required'), variantId: z.string().min(1, 'Required'), qtyOnHand: z.coerce.number().int().min(0), lowStockThreshold: z.coerce.number().int().min(0).optional() })
const adjustStockSchema = z.object({ warehouseId: z.string().min(1, 'Required'), variantId: z.string().min(1, 'Required'), adjustment: z.coerce.number().int(), reason: z.string().optional() })
const reserveSchema = z.object({ warehouseId: z.string().min(1, 'Required'), variantId: z.string().min(1, 'Required'), quantity: z.coerce.number().int().min(1) })
const releaseSchema = z.object({ warehouseId: z.string().min(1, 'Required'), variantId: z.string().min(1, 'Required'), quantity: z.coerce.number().int().min(1) })

export default function InventoryPage() {
  const [whDialog, setWhDialog] = useState(false)
  const [editing, setEditing] = useState<Warehouse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null)
  const [setStockDialog, setSetStockDialog] = useState(false)
  const [adjustStockDialog, setAdjustStockDialog] = useState(false)
  const [reserveDialog, setReserveDialog] = useState(false)
  const [releaseDialog, setReleaseDialog] = useState(false)
  const qc = useQueryClient()

  const { data: warehouses, isLoading: loadingWH } = useQuery({ queryKey: ['warehouses'], queryFn: warehousesApi.list })
  const { data: inventory, isLoading: loadingInv } = useQuery({ queryKey: ['inventory'], queryFn: inventoryApi.list })
  const { data: lowStock, isLoading: loadingLow } = useQuery({ queryKey: ['inventory', 'low-stock'], queryFn: inventoryApi.lowStock })

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<WHFormData>({ resolver: zodResolver(whSchema) })

  const createM = useMutation({ mutationFn: warehousesApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['warehouses'] }); setWhDialog(false); reset(); toast.success('Warehouse created') }, onError: () => toast.error('Failed') })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: WHFormData & { id: string }) => warehousesApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['warehouses'] }); setWhDialog(false); setEditing(null); toast.success('Updated') }, onError: () => toast.error('Failed') })
  const deleteM = useMutation({ mutationFn: (id: string) => warehousesApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['warehouses'] }); setDeleteTarget(null); toast.success('Deleted') }, onError: () => toast.error('Failed') })

  const setStockForm = useForm<z.infer<typeof setStockSchema>>({ resolver: zodResolver(setStockSchema) as any })
  const adjustStockForm = useForm<z.infer<typeof adjustStockSchema>>({ resolver: zodResolver(adjustStockSchema) as any })
  const reserveForm = useForm<z.infer<typeof reserveSchema>>({ resolver: zodResolver(reserveSchema) as any })
  const releaseForm = useForm<z.infer<typeof releaseSchema>>({ resolver: zodResolver(releaseSchema) as any })

  const setStockM = useMutation({
    mutationFn: inventoryApi.set,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); qc.invalidateQueries({ queryKey: ['inventory', 'low-stock'] }); setSetStockDialog(false); setStockForm.reset(); toast.success('Stock set') },
    onError: () => toast.error('Failed to set stock'),
  })

  const adjustStockM = useMutation({
    mutationFn: inventoryApi.adjust,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); qc.invalidateQueries({ queryKey: ['inventory', 'low-stock'] }); setAdjustStockDialog(false); adjustStockForm.reset(); toast.success('Stock adjusted') },
    onError: () => toast.error('Failed to adjust stock'),
  })

  const reserveM = useMutation({
    mutationFn: inventoryApi.reserve,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); qc.invalidateQueries({ queryKey: ['inventory', 'low-stock'] }); setReserveDialog(false); reserveForm.reset(); toast.success('Stock reserved') },
    onError: () => toast.error('Failed to reserve stock'),
  })

  const releaseM = useMutation({
    mutationFn: inventoryApi.release,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); qc.invalidateQueries({ queryKey: ['inventory', 'low-stock'] }); setReleaseDialog(false); releaseForm.reset(); toast.success('Reservation released') },
    onError: () => toast.error('Failed to release reservation'),
  })

  const openCreate = () => { setEditing(null); reset({ code: '', name: '', address: '', city: '', country: '', isActive: true }); setWhDialog(true) }
  const openEdit = (w: Warehouse) => { setEditing(w); reset({ code: w.code, name: w.name, address: w.address ?? '', city: w.city ?? '', country: w.country ?? '', isActive: w.isActive }); setWhDialog(true) }
  const onSubmit = (d: WHFormData) => editing ? updateM.mutate({ ...d, id: editing.id }) : createM.mutate(d)

  const whColumns: ColumnDef<Warehouse>[] = [
    { accessorKey: 'code', header: ({ column }) => <SortHeader column={column}>Code</SortHeader> },
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Name</SortHeader> },
    { accessorKey: 'city', header: ({ column }) => <SortHeader column={column}>City</SortHeader>, cell: ({ row }) => row.original.city || '—' },
    { accessorKey: 'country', header: 'Country', cell: ({ row }) => row.original.country || '—' },
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

  const invColumns: ColumnDef<Inventory>[] = [
    { accessorKey: 'variantId', header: 'Variant ID', cell: ({ row }) => row.original.variantId?.slice(0, 8) },
    { accessorKey: 'qtyOnHand', header: ({ column }) => <SortHeader column={column}>On Hand</SortHeader> },
    { accessorKey: 'qtyReserved', header: ({ column }) => <SortHeader column={column}>Reserved</SortHeader> },
    { accessorKey: 'qtyAvailable', header: ({ column }) => <SortHeader column={column}>Available</SortHeader> },
    { accessorKey: 'lowStockThreshold', header: 'Threshold' },
    {
      id: 'alert', header: 'Alert', cell: ({ row }) =>
        row.original.qtyAvailable <= row.original.lowStockThreshold
          ? <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Low Stock</Badge>
          : <Badge variant="success">OK</Badge>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Manage warehouses and stock" action={{ label: 'Add Warehouse', onClick: openCreate }} />

      <Tabs defaultValue="warehouses">
        <TabsList>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock {(lowStock?.length ?? 0) > 0 && <Badge variant="destructive" className="ml-1">{lowStock!.length}</Badge>}</TabsTrigger>
        </TabsList>
        <TabsContent value="warehouses">
          <DataTable columns={whColumns} data={warehouses ?? []} isLoading={loadingWH} searchColumn="name" searchPlaceholder="Search warehouses..."
            enableRowSelection
            onBulkDelete={(rows) => { if (confirm(`Delete ${rows.length} warehouses?`)) rows.forEach((r) => deleteM.mutate(r.id)) }}
            exportFilename="warehouses"
            getExportRow={(r) => ({ Code: r.code, Name: r.name, City: r.city ?? '', Country: r.country ?? '', Active: r.isActive })}
          />
        </TabsContent>
        <TabsContent value="stock">
          <div className="mb-4 flex gap-2">
            <Button variant="outline" onClick={() => { setStockForm.reset({ warehouseId: '', variantId: '', qtyOnHand: 0, lowStockThreshold: 10 }); setSetStockDialog(true) }}>
              <PackagePlus className="mr-2 h-4 w-4" />Set Stock
            </Button>
            <Button variant="outline" onClick={() => { adjustStockForm.reset({ warehouseId: '', variantId: '', adjustment: 0, reason: '' }); setAdjustStockDialog(true) }}>
              <ArrowUpDown className="mr-2 h-4 w-4" />Adjust Stock
            </Button>
            <Button variant="outline" onClick={() => { reserveForm.reset({ warehouseId: '', variantId: '', quantity: 1 }); setReserveDialog(true) }}>
              <Lock className="mr-2 h-4 w-4" />Reserve Stock
            </Button>
            <Button variant="outline" onClick={() => { releaseForm.reset({ warehouseId: '', variantId: '', quantity: 1 }); setReleaseDialog(true) }}>
              <Unlock className="mr-2 h-4 w-4" />Release Reservation
            </Button>
          </div>
          <DataTable columns={invColumns} data={inventory ?? []} isLoading={loadingInv} searchPlaceholder="Search inventory..."
            enableRowSelection
            exportFilename="inventory"
            getExportRow={(r) => ({ VariantID: r.variantId, OnHand: r.qtyOnHand, Reserved: r.qtyReserved, Available: r.qtyAvailable, Threshold: r.lowStockThreshold })}
          />
        </TabsContent>
        <TabsContent value="low-stock">
          <DataTable columns={invColumns} data={lowStock ?? []} isLoading={loadingLow} searchPlaceholder="Search low stock..."
            enableRowSelection
            exportFilename="low-stock"
            getExportRow={(r) => ({ VariantID: r.variantId, OnHand: r.qtyOnHand, Reserved: r.qtyReserved, Available: r.qtyAvailable, Threshold: r.lowStockThreshold })}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={whDialog} onOpenChange={setWhDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Warehouse' : 'Create Warehouse'}</DialogTitle><DialogDescription>{editing ? 'Update warehouse' : 'Add new warehouse'}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Code</Label><Input {...register('code')} />{errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}</div>
              <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input {...register('address')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>City</Label><Input {...register('city')} /></div>
              <div className="space-y-2"><Label>Country</Label><Input {...register('country')} /></div>
            </div>
            <div className="flex items-center gap-2"><Controller name="isActive" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} /><Label>Active</Label></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setWhDialog(false)}>Cancel</Button><Button type="submit" disabled={createM.isPending || updateM.isPending}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Warehouse" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />

      {/* Set Stock Dialog */}
      <Dialog open={setStockDialog} onOpenChange={setSetStockDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set Stock</DialogTitle><DialogDescription>Set the stock level for a variant in a warehouse</DialogDescription></DialogHeader>
          <form onSubmit={setStockForm.handleSubmit((d) => setStockM.mutate(d))} className="space-y-4">
            <div className="space-y-2"><Label>Warehouse ID</Label><Input {...setStockForm.register('warehouseId')} />{setStockForm.formState.errors.warehouseId && <p className="text-xs text-destructive">{setStockForm.formState.errors.warehouseId.message}</p>}</div>
            <div className="space-y-2"><Label>Variant ID</Label><Input {...setStockForm.register('variantId')} />{setStockForm.formState.errors.variantId && <p className="text-xs text-destructive">{setStockForm.formState.errors.variantId.message}</p>}</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Quantity on Hand</Label><Input type="number" {...setStockForm.register('qtyOnHand')} /></div>
              <div className="space-y-2"><Label>Low Stock Threshold</Label><Input type="number" {...setStockForm.register('lowStockThreshold')} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setSetStockDialog(false)}>Cancel</Button><Button type="submit" loading={setStockM.isPending}>Set Stock</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustStockDialog} onOpenChange={setAdjustStockDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adjust Stock</DialogTitle><DialogDescription>Increase or decrease stock by a delta amount</DialogDescription></DialogHeader>
          <form onSubmit={adjustStockForm.handleSubmit((d) => adjustStockM.mutate(d))} className="space-y-4">
            <div className="space-y-2"><Label>Warehouse ID</Label><Input {...adjustStockForm.register('warehouseId')} />{adjustStockForm.formState.errors.warehouseId && <p className="text-xs text-destructive">{adjustStockForm.formState.errors.warehouseId.message}</p>}</div>
            <div className="space-y-2"><Label>Variant ID</Label><Input {...adjustStockForm.register('variantId')} />{adjustStockForm.formState.errors.variantId && <p className="text-xs text-destructive">{adjustStockForm.formState.errors.variantId.message}</p>}</div>
            <div className="space-y-2"><Label>Adjustment (positive to add, negative to remove)</Label><Input type="number" {...adjustStockForm.register('adjustment')} /></div>
            <div className="space-y-2"><Label>Reason (optional)</Label><Textarea {...adjustStockForm.register('reason')} placeholder="e.g., Damaged goods, Restock" /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setAdjustStockDialog(false)}>Cancel</Button><Button type="submit" loading={adjustStockM.isPending}>Adjust</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reserve Stock Dialog */}
      <Dialog open={reserveDialog} onOpenChange={setReserveDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reserve Stock</DialogTitle><DialogDescription>Reserve inventory for pending orders</DialogDescription></DialogHeader>
          <form onSubmit={reserveForm.handleSubmit((d) => reserveM.mutate(d))} className="space-y-4">
            <div className="space-y-2"><Label>Warehouse ID</Label><Input {...reserveForm.register('warehouseId')} />{reserveForm.formState.errors.warehouseId && <p className="text-xs text-destructive">{reserveForm.formState.errors.warehouseId.message}</p>}</div>
            <div className="space-y-2"><Label>Variant ID</Label><Input {...reserveForm.register('variantId')} />{reserveForm.formState.errors.variantId && <p className="text-xs text-destructive">{reserveForm.formState.errors.variantId.message}</p>}</div>
            <div className="space-y-2"><Label>Quantity</Label><Input type="number" {...reserveForm.register('quantity')} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setReserveDialog(false)}>Cancel</Button><Button type="submit" loading={reserveM.isPending}>Reserve</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Release Reservation Dialog */}
      <Dialog open={releaseDialog} onOpenChange={setReleaseDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Release Reservation</DialogTitle><DialogDescription>Release previously reserved stock</DialogDescription></DialogHeader>
          <form onSubmit={releaseForm.handleSubmit((d) => releaseM.mutate(d))} className="space-y-4">
            <div className="space-y-2"><Label>Warehouse ID</Label><Input {...releaseForm.register('warehouseId')} />{releaseForm.formState.errors.warehouseId && <p className="text-xs text-destructive">{releaseForm.formState.errors.warehouseId.message}</p>}</div>
            <div className="space-y-2"><Label>Variant ID</Label><Input {...releaseForm.register('variantId')} />{releaseForm.formState.errors.variantId && <p className="text-xs text-destructive">{releaseForm.formState.errors.variantId.message}</p>}</div>
            <div className="space-y-2"><Label>Quantity</Label><Input type="number" {...releaseForm.register('quantity')} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setReleaseDialog(false)}>Cancel</Button><Button type="submit" loading={releaseM.isPending}>Release</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
