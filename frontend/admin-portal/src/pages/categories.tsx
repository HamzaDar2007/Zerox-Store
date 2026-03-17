import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { categoriesApi } from '@/services/api'
import type { Category } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileUploader } from '@/components/shared/file-uploader'
import { Progress } from '@/components/ui/progress'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  description: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
})
type FormData = z.infer<typeof schema>

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list })
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const createM = useMutation({ mutationFn: categoriesApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDialogOpen(false); reset(); toast.success('Category created') }, onError: () => toast.error('Failed') })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: FormData & { id: string }) => categoriesApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDialogOpen(false); setEditing(null); toast.success('Updated') }, onError: () => toast.error('Failed') })
  const deleteM = useMutation({ mutationFn: (id: string) => categoriesApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDeleteTarget(null); toast.success('Deleted') }, onError: () => toast.error('Failed') })

  const uploadImageM = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData(); fd.append('file', file)
      return categoriesApi.uploadImage(id, fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Image uploaded') },
    onError: () => toast.error('Image upload failed'),
  })

  const openCreate = () => { setEditing(null); reset({ name: '', slug: '', description: '', sortOrder: 0, isActive: true }); setDialogOpen(true) }
  const openEdit = (c: Category) => { setEditing(c); reset({ name: c.name, slug: c.slug, description: c.description ?? '', sortOrder: c.sortOrder, isActive: c.isActive }); setDialogOpen(true) }
  const onSubmit = (d: FormData) => editing ? updateM.mutate({ ...d, id: editing.id }) : createM.mutate(d)

  const columns: ColumnDef<Category>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Name</SortHeader> },
    { accessorKey: 'slug', header: 'Slug' },
    { accessorKey: 'sortOrder', header: ({ column }) => <SortHeader column={column}>Order</SortHeader> },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Created</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteTarget(row.original)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setEditing(row.original); setDialogOpen(false) }}><ImageIcon className="mr-2 h-4 w-4" />Upload Image</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Manage product categories" action={{ label: 'Add Category', onClick: openCreate }} />
      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        searchColumn="name"
        searchPlaceholder="Search categories..."
        enableRowSelection
        onBulkDelete={(rows) => {
          Promise.all(rows.map((r) => categoriesApi.delete(r.id))).then(() => {
            qc.invalidateQueries({ queryKey: ['categories'] }); toast.success(`${rows.length} category(ies) deleted`)
          }).catch(() => toast.error('Failed'))
        }}
        exportFilename="categories"
        getExportRow={(c) => ({ Name: c.name, Slug: c.slug, Order: c.sortOrder, Active: c.isActive ? 'Yes' : 'No', Created: c.createdAt })}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Create Category'}</DialogTitle><DialogDescription>{editing ? 'Update category' : 'Add new category'}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Slug</Label><Input {...register('slug')} />{errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}</div>
            <div className="space-y-2"><Label>Description</Label><Textarea {...register('description')} /></div>
            <div className="space-y-2"><Label>Sort Order</Label><Input type="number" {...register('sortOrder')} /></div>
            <div className="flex items-center gap-2">
              <Controller name="isActive" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
              <Label>Active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createM.isPending || updateM.isPending}>{editing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Category"
        description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />

      {/* Image Upload Dialog */}
      {editing && !dialogOpen && (
        <Dialog open={!!editing && !dialogOpen} onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Category Image</DialogTitle><DialogDescription>{editing.name}</DialogDescription></DialogHeader>
            <div className="space-y-4">
              {editing.imageUrl && <img src={editing.imageUrl} alt={editing.name} className="h-32 w-full rounded-md object-cover" />}
              <FileUploader accept="image/*" maxSizeMB={5} preview={editing.imageUrl} onUpload={(files) => { if (files[0]) uploadImageM.mutate({ id: editing.id, file: files[0] }) }} />
              {uploadImageM.isPending && <Progress value={undefined} className="h-1" />}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
