import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { brandsApi } from '@/services/api'
import type { Brand } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({ name: z.string().min(1), slug: z.string().min(1), websiteUrl: z.string().optional(), isActive: z.boolean().default(true) })
type FormData = z.infer<typeof schema>

export default function BrandsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['brands'], queryFn: brandsApi.list })
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const createM = useMutation({ mutationFn: brandsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['brands'] }); setDialogOpen(false); reset(); toast.success('Brand created') }, onError: () => toast.error('Failed') })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: FormData & { id: string }) => brandsApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['brands'] }); setDialogOpen(false); setEditing(null); toast.success('Updated') }, onError: () => toast.error('Failed') })
  const deleteM = useMutation({ mutationFn: (id: string) => brandsApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['brands'] }); setDeleteTarget(null); toast.success('Deleted') }, onError: () => toast.error('Failed') })

  const openCreate = () => { setEditing(null); reset({ name: '', slug: '', websiteUrl: '', isActive: true }); setDialogOpen(true) }
  const openEdit = (b: Brand) => { setEditing(b); reset({ name: b.name, slug: b.slug, websiteUrl: b.websiteUrl ?? '', isActive: b.isActive }); setDialogOpen(true) }
  const onSubmit = (d: FormData) => editing ? updateM.mutate({ ...d, id: editing.id }) : createM.mutate(d)

  const columns: ColumnDef<Brand>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Name</SortHeader> },
    { accessorKey: 'slug', header: ({ column }) => <SortHeader column={column}>Slug</SortHeader> },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
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
      <PageHeader title="Brands" description="Manage product brands" action={{ label: 'Add Brand', onClick: openCreate }} />
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} searchColumn="name" searchPlaceholder="Search brands..."
        enableRowSelection
        onBulkDelete={(rows) => { if (confirm(`Delete ${rows.length} brands?`)) rows.forEach((r) => deleteM.mutate(r.id)) }}
        exportFilename="brands"
        getExportRow={(r) => ({ Name: r.name, Slug: r.slug, Active: r.isActive, Created: r.createdAt })}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Brand' : 'Create Brand'}</DialogTitle><DialogDescription>{editing ? 'Update brand' : 'Add new brand'}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Slug</Label><Input {...register('slug')} />{errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}</div>
            <div className="space-y-2"><Label>Website URL</Label><Input {...register('websiteUrl')} /></div>
            <div className="flex items-center gap-2"><Controller name="isActive" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} /><Label>Active</Label></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={createM.isPending || updateM.isPending}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Brand" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />
    </div>
  )
}
