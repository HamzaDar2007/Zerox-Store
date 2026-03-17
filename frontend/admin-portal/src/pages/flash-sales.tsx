import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { flashSalesApi } from '@/services/api'
import type { FlashSale, FlashSaleItem } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Eye, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({ name: z.string().min(1), description: z.string().optional(), startsAt: z.string().min(1), endsAt: z.string().min(1) })
type FormData = z.infer<typeof schema>

const addItemSchema = z.object({ variantId: z.string().min(1, 'Variant ID required'), salePrice: z.coerce.number().min(0), qtyLimit: z.coerce.number().int().optional() })
type AddItemFormData = z.infer<typeof addItemSchema>

export default function FlashSalesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<FlashSale | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FlashSale | null>(null)
  const [detailSale, setDetailSale] = useState<FlashSale | null>(null)
  const [addItemOpen, setAddItemOpen] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['flash-sales'], queryFn: flashSalesApi.list })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const createM = useMutation({ mutationFn: flashSalesApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['flash-sales'] }); setDialogOpen(false); reset(); toast.success('Flash sale created') }, onError: () => toast.error('Failed') })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: FormData & { id: string }) => flashSalesApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['flash-sales'] }); setDialogOpen(false); setEditing(null); toast.success('Updated') }, onError: () => toast.error('Failed') })
  const deleteM = useMutation({ mutationFn: (id: string) => flashSalesApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['flash-sales'] }); setDeleteTarget(null); toast.success('Deleted') }, onError: () => toast.error('Failed') })

  const addItemForm = useForm<AddItemFormData>({ resolver: zodResolver(addItemSchema) as any })

  const { data: detailItems, refetch: refetchItems } = useQuery({
    queryKey: ['flash-sale-items', detailSale?.id],
    queryFn: () => flashSalesApi.getItems(detailSale!.id),
    enabled: !!detailSale,
  })

  const addItemM = useMutation({
    mutationFn: (d: AddItemFormData) => flashSalesApi.addItem(detailSale!.id, d),
    onSuccess: () => { refetchItems(); setAddItemOpen(false); addItemForm.reset(); toast.success('Item added') },
    onError: () => toast.error('Failed to add item'),
  })

  const removeItemM = useMutation({
    mutationFn: (itemId: string) => flashSalesApi.removeItem(itemId),
    onSuccess: () => { refetchItems(); toast.success('Item removed') },
    onError: () => toast.error('Failed to remove item'),
  })

  const openCreate = () => { setEditing(null); reset({ name: '', description: '', startsAt: '', endsAt: '' }); setDialogOpen(true) }
  const openEdit = (f: FlashSale) => { setEditing(f); reset({ name: f.name, description: f.description ?? '', startsAt: f.startsAt?.slice(0, 16), endsAt: f.endsAt?.slice(0, 16) }); setDialogOpen(true) }
  const onSubmit = (d: FormData) => editing ? updateM.mutate({ ...d, id: editing.id }) : createM.mutate(d)

  const columns: ColumnDef<FlashSale>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Name</SortHeader> },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    { accessorKey: 'startsAt', header: ({ column }) => <SortHeader column={column}>Start</SortHeader>, cell: ({ row }) => formatDate(row.original.startsAt) },
    { accessorKey: 'endsAt', header: ({ column }) => <SortHeader column={column}>End</SortHeader>, cell: ({ row }) => formatDate(row.original.endsAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailSale(row.original)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteTarget(row.original)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Flash Sales" description="Manage flash sale campaigns" action={{ label: 'Add Flash Sale', onClick: openCreate }} />
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} searchColumn="name" searchPlaceholder="Search flash sales..."
        enableRowSelection
        onBulkDelete={(rows) => { if (confirm(`Delete ${rows.length} flash sales?`)) rows.forEach((r) => deleteM.mutate(r.id)) }}
        exportFilename="flash-sales"
        getExportRow={(r) => ({ Name: r.name, Active: r.isActive, Start: r.startsAt, End: r.endsAt })}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Flash Sale' : 'Create Flash Sale'}</DialogTitle><DialogDescription>{editing ? 'Update flash sale' : 'Add new flash sale'}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Description</Label><Textarea {...register('description')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Starts At</Label><Input type="datetime-local" {...register('startsAt')} /></div>
              <div className="space-y-2"><Label>Ends At</Label><Input type="datetime-local" {...register('endsAt')} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={createM.isPending || updateM.isPending}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Flash Sale" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />

      {/* Flash Sale Detail Dialog */}
      <Dialog open={!!detailSale} onOpenChange={() => setDetailSale(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detailSale?.name}</DialogTitle>
            <DialogDescription>{detailSale?.description || 'Flash sale details'}</DialogDescription>
          </DialogHeader>
          {detailSale && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={detailSale.isActive ? 'active' : 'inactive'} /></div>
                    <div><span className="text-muted-foreground">Starts:</span> {formatDate(detailSale.startsAt)}</div>
                    <div><span className="text-muted-foreground">Ends:</span> {formatDate(detailSale.endsAt)}</div>
                    <div><span className="text-muted-foreground">Items:</span> {detailSale.items?.length ?? 0}</div>
                  </div>
                </CardContent>
              </Card>
              {detailSale.items?.length || (detailItems as FlashSaleItem[] | undefined)?.length ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Sale Items</h3>
                    <Button size="sm" onClick={() => { addItemForm.reset({ variantId: '', salePrice: 0, qtyLimit: undefined }); setAddItemOpen(true) }}><Plus className="mr-1 h-3 w-3" />Add Item</Button>
                  </div>
                  {((detailItems as FlashSaleItem[] | undefined) ?? detailSale.items ?? []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium font-mono">{item.variantId.slice(0, 8)}…</p>
                        <p className="text-xs text-muted-foreground">Sale Price: ${item.salePrice.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          <p>Sold: {item.qtySold}{item.qtyLimit ? ` / ${item.qtyLimit}` : ''}</p>
                          {item.qtyLimit && <Badge variant={item.qtySold >= item.qtyLimit ? 'destructive' : 'secondary'} className="text-xs">{item.qtySold >= item.qtyLimit ? 'Sold Out' : 'Available'}</Badge>}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeItemM.mutate(item.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">No items in this flash sale.</p>
                  <Button size="sm" onClick={() => { addItemForm.reset({ variantId: '', salePrice: 0, qtyLimit: undefined }); setAddItemOpen(true) }}><Plus className="mr-1 h-3 w-3" />Add Item</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Flash Sale Item Dialog */}
      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Sale Item</DialogTitle><DialogDescription>Add a product variant to this flash sale</DialogDescription></DialogHeader>
          <form onSubmit={addItemForm.handleSubmit((d) => addItemM.mutate(d))} className="space-y-4">
            <div className="space-y-2"><Label>Variant ID</Label><Input {...addItemForm.register('variantId')} />{addItemForm.formState.errors.variantId && <p className="text-xs text-destructive">{addItemForm.formState.errors.variantId.message}</p>}</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Sale Price</Label><Input type="number" step="0.01" {...addItemForm.register('salePrice')} /></div>
              <div className="space-y-2"><Label>Qty Limit (optional)</Label><Input type="number" {...addItemForm.register('qtyLimit')} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setAddItemOpen(false)}>Cancel</Button><Button type="submit" disabled={addItemM.isPending}>Add Item</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
