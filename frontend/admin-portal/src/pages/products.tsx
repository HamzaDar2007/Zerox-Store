import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { productsApi } from '@/services/api'
import type { Product } from '@/types'
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
import { formatCurrency, formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0),
  storeId: z.string().min(1, 'Required'),
})
type FormData = z.infer<typeof schema>

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, limit: 10, search }],
    queryFn: () => productsApi.list({ page, limit: 10, search: search || undefined }),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const createM = useMutation({ mutationFn: productsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDialogOpen(false); reset(); toast.success('Product created') }, onError: () => toast.error('Failed') })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: FormData & { id: string }) => productsApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDialogOpen(false); setEditing(null); toast.success('Updated') }, onError: () => toast.error('Failed') })
  const deleteM = useMutation({ mutationFn: (id: string) => productsApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDeleteTarget(null); toast.success('Deleted') }, onError: () => toast.error('Failed') })

  const openCreate = () => { setEditing(null); reset({ name: '', slug: '', description: '', basePrice: 0, storeId: '' }); setDialogOpen(true) }
  const openEdit = (p: Product) => { setEditing(p); reset({ name: p.name, slug: p.slug, description: p.description ?? '', basePrice: p.basePrice, storeId: p.storeId }); setDialogOpen(true) }
  const onSubmit = (d: FormData) => editing ? updateM.mutate({ ...d, id: editing.id }) : createM.mutate(d)

  const columns: ColumnDef<Product>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Name</SortHeader> },
    { accessorKey: 'basePrice', header: ({ column }) => <SortHeader column={column}>Price</SortHeader>, cell: ({ row }) => formatCurrency(row.original.basePrice) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'isActive', header: 'Active', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Created</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
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
      <PageHeader title="Products" description="Manage products" action={{ label: 'Add Product', onClick: openCreate }} />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        manualPagination
        page={page}
        pageCount={data?.totalPages ?? 1}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search products..."
        enableRowSelection
        onBulkDelete={(rows) => {
          Promise.all(rows.map((r) => productsApi.delete(r.id))).then(() => {
            qc.invalidateQueries({ queryKey: ['products'] }); toast.success(`${rows.length} product(s) deleted`)
          }).catch(() => toast.error('Failed'))
        }}
        exportFilename="products"
        getExportRow={(p) => ({ Name: p.name, Price: p.basePrice, Status: p.status, Active: p.isActive ? 'Yes' : 'No', Created: p.createdAt })}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Create Product'}</DialogTitle><DialogDescription>{editing ? 'Update product' : 'Add new product'}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
              <div className="space-y-2"><Label>Slug</Label><Input {...register('slug')} />{errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}</div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea {...register('description')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Base Price</Label><Input type="number" step="0.01" {...register('basePrice')} />{errors.basePrice && <p className="text-xs text-destructive">{errors.basePrice.message}</p>}</div>
              <div className="space-y-2"><Label>Store ID</Label><Input {...register('storeId')} />{errors.storeId && <p className="text-xs text-destructive">{errors.storeId.message}</p>}</div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={createM.isPending || updateM.isPending}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Product" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />
    </div>
  )
}
