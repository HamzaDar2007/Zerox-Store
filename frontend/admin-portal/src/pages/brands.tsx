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
import { MoreHorizontal, Pencil, Trash2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatDate } from '@/lib/utils'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileUploader } from '@/components/shared/file-uploader'
import { UrlFileField } from '@/components/shared/url-file-field'
import { Progress } from '@/components/ui/progress'

const schema = z.object({ name: z.string().min(1), slug: z.string().min(1), logoUrl: z.string().optional(), websiteUrl: z.string().optional(), isActive: z.boolean().default(true) })
type FormData = z.infer<typeof schema>

export default function BrandsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null)
  const [uploadTarget, setUploadTarget] = useState<Brand | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['brands'], queryFn: brandsApi.list })
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) as any })

  const createM = useMutation({ mutationFn: brandsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['brands'] }); setDialogOpen(false); reset(); toast.success('Brand created') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed to create brand')) })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: FormData & { id: string }) => brandsApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['brands'] }); setDialogOpen(false); setEditing(null); toast.success('Updated') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed to update brand')) })
  const deleteM = useMutation({ mutationFn: (id: string) => brandsApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['brands'] }); setDeleteTarget(null); toast.success('Deleted') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed to delete brand')) })

  const uploadLogoM = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData(); fd.append('file', file)
      return brandsApi.uploadLogo(id, fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['brands'] }); toast.success('Logo uploaded') },
    onError: (e) => toast.error(getErrorMessage(e, 'Logo upload failed')),
  })

  const openCreate = () => { setEditing(null); reset({ name: '', slug: '', logoUrl: '', websiteUrl: '', isActive: true }); setDialogOpen(true) }
  const openEdit = (b: Brand) => { setEditing(b); reset({ name: b.name, slug: b.slug, logoUrl: b.logoUrl ?? '', websiteUrl: b.websiteUrl ?? '', isActive: b.isActive }); setDialogOpen(true) }
  const onSubmit = (d: FormData) => editing ? updateM.mutate({ ...d, id: editing.id }) : createM.mutate(d)

  const columns: ColumnDef<Brand>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Name</SortHeader>, cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.logoUrl && <img src={row.original.logoUrl} alt={row.original.name} className="h-8 w-8 rounded object-cover" />}
        <span>{row.original.name}</span>
      </div>
    ) },
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
            <DropdownMenuItem onClick={() => setUploadTarget(row.original)}><ImageIcon className="mr-2 h-4 w-4" />Upload Logo</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Brands" description="Manage product brands" action={{ label: 'Add Brand', onClick: openCreate }} />
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} isError={isError} onRetry={refetch} searchColumn="name" searchPlaceholder="Search brands..."
        enableRowSelection
        onBulkDelete={(rows) => { if (confirm(`Delete ${rows.length} brands?`)) Promise.allSettled(rows.map((r) => brandsApi.delete(r.id))).then((results) => { qc.invalidateQueries({ queryKey: ['brands'] }); const failed = results.filter((r) => r.status === 'rejected').length; if (failed) toast.error(`${failed} of ${rows.length} failed`); else toast.success(`${rows.length} brand(s) deleted`) }) }}
        exportFilename="brands"
        getExportRow={(r) => ({ Name: r.name, Slug: r.slug, Active: r.isActive, Created: r.createdAt })}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Brand' : 'Create Brand'}</DialogTitle><DialogDescription>{editing ? 'Update brand' : 'Add new brand'}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Slug</Label><Input {...register('slug')} />{errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}</div>
            <div className="space-y-2"><Label>Logo</Label><Controller name="logoUrl" control={control} render={({ field }) => <UrlFileField value={field.value ?? ''} onChange={field.onChange} />} /></div>
            <div className="space-y-2"><Label>Website URL</Label><Input {...register('websiteUrl')} /></div>
            <div className="flex items-center gap-2"><Controller name="isActive" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} /><Label>Active</Label></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={createM.isPending || updateM.isPending}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Brand" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />

      {/* Logo Upload Dialog */}
      <Dialog open={!!uploadTarget} onOpenChange={() => setUploadTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Brand Logo</DialogTitle><DialogDescription>{uploadTarget?.name}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            {uploadTarget?.logoUrl && <img src={uploadTarget.logoUrl} alt={uploadTarget.name} className="h-24 w-24 rounded-md object-cover" />}
            <FileUploader accept="image/*" maxSizeMB={2} preview={uploadTarget?.logoUrl} onUpload={(files) => { if (files[0] && uploadTarget) uploadLogoM.mutate({ id: uploadTarget.id, file: files[0] }) }} />
            {uploadLogoM.isPending && <Progress value={undefined} className="h-1" />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
