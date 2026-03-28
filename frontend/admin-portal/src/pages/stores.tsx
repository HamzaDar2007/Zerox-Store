import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { storesApi, sellersApi } from '@/services/api'
import type { Store, Seller } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { useForm, Controller } from 'react-hook-form'
import { formResolver } from '@/lib/form'
import { z } from 'zod'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUploader } from '@/components/shared/file-uploader'
import { Progress } from '@/components/ui/progress'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const createSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required'),
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  description: z.string().optional(),
})
type CreateFormData = z.infer<typeof createSchema>

export default function StoresPage() {
  const [editing, setEditing] = useState<Store | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [detail, setDetail] = useState<Store | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['stores'], queryFn: storesApi.list })
  const { data: sellersForDropdown } = useQuery({ queryKey: ['sellers'], queryFn: sellersApi.list })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: formResolver(schema) })
  const createForm = useForm<CreateFormData>({ resolver: formResolver(createSchema) })

  const createM = useMutation({
    mutationFn: storesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); setCreateOpen(false); createForm.reset(); toast.success('Store created') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to create')),
  })

  const updateM = useMutation({
    mutationFn: ({ id, ...d }: FormData & { id: string }) => storesApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); setDialogOpen(false); setEditing(null); toast.success('Store updated') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to update')),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => storesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); setDeleteTarget(null); toast.success('Store deleted') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to delete')),
  })

  const uploadLogoM = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData(); fd.append('file', file)
      return storesApi.uploadLogo(id, fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); toast.success('Logo uploaded') },
    onError: (e) => toast.error(getErrorMessage(e, 'Logo upload failed')),
  })

  const uploadBannerM = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData(); fd.append('file', file)
      return storesApi.uploadBanner(id, fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); toast.success('Banner uploaded') },
    onError: (e) => toast.error(getErrorMessage(e, 'Banner upload failed')),
  })

  const openEdit = (s: Store) => {
    setEditing(s)
    reset({ name: s.name, slug: s.slug, description: s.description ?? '' })
    setDialogOpen(true)
  }

  const columns: ColumnDef<Store>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Name</SortHeader> },
    { accessorKey: 'slug', header: ({ column }) => <SortHeader column={column}>Slug</SortHeader> },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Created</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetail(row.original)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteTarget(row.original)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Stores" description="View and manage seller stores" action={{ label: 'Add Store', onClick: () => { createForm.reset({ sellerId: '', name: '', slug: '', description: '' }); setCreateOpen(true) } }} />
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} isError={isError} onRetry={refetch} searchColumn="name" searchPlaceholder="Search stores..."
        enableRowSelection
        exportFilename="stores"
        getExportRow={(r) => ({ Name: r.name, Slug: r.slug, Active: r.isActive, Created: r.createdAt })}
      />

      {/* Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Store</DialogTitle><DialogDescription>Update store details</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit((d) => editing && updateM.mutate({ ...d, id: editing.id }))} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Slug</Label><Input {...register('slug')} />{errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}</div>
            <div className="space-y-2"><Label>Description</Label><Textarea {...register('description')} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={updateM.isPending}>Update</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Store Details</DialogTitle><DialogDescription>{detail?.name}</DialogDescription></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span><p className="font-medium">{detail.name}</p></div>
                <div><span className="text-muted-foreground">Slug:</span><p className="font-medium">{detail.slug}</p></div>
                <div><span className="text-muted-foreground">Status:</span><p><StatusBadge status={detail.isActive ? 'active' : 'inactive'} /></p></div>
                <div><span className="text-muted-foreground">Created:</span><p className="font-medium">{formatDate(detail.createdAt)}</p></div>
                {detail.description && (
                  <div className="col-span-2"><span className="text-muted-foreground">Description:</span><p>{detail.description}</p></div>
                )}
              </div>
              <div className="space-y-3 border-t pt-3">
                <div>
                  <Label className="text-sm font-medium">Logo</Label>
                  {detail.logoUrl && <img src={detail.logoUrl} alt="Logo" className="h-16 w-16 rounded-md object-cover mt-1 mb-2" />}
                  <FileUploader accept="image/*" maxSizeMB={2} preview={detail.logoUrl} onUpload={(files) => { if (files[0]) uploadLogoM.mutate({ id: detail.id, file: files[0] }) }} />
                  {uploadLogoM.isPending && <Progress value={undefined} className="h-1 mt-1" />}
                </div>
                <div>
                  <Label className="text-sm font-medium">Banner</Label>
                  {detail.bannerUrl && <img src={detail.bannerUrl} alt="Banner" className="h-20 w-full rounded-md object-cover mt-1 mb-2" />}
                  <FileUploader accept="image/*" maxSizeMB={5} preview={detail.bannerUrl} onUpload={(files) => { if (files[0]) uploadBannerM.mutate({ id: detail.id, file: files[0] }) }} />
                  {uploadBannerM.isPending && <Progress value={undefined} className="h-1 mt-1" />}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Store" description={`Delete store "${deleteTarget?.name}"?`} confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />

      {/* Create Store Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Store</DialogTitle><DialogDescription>Add a new store for a seller</DialogDescription></DialogHeader>
          <form onSubmit={createForm.handleSubmit((d) => createM.mutate(d))} className="space-y-4">
            <div className="space-y-2">
              <Label>Seller</Label>
              <Controller name="sellerId" control={createForm.control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select a seller" /></SelectTrigger>
                  <SelectContent>
                    {(sellersForDropdown ?? []).map((s: Seller) => (
                      <SelectItem key={s.id} value={s.id}>{s.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
              {createForm.formState.errors.sellerId && <p className="text-xs text-destructive">{createForm.formState.errors.sellerId.message}</p>}
            </div>
            <div className="space-y-2"><Label>Name</Label><Input {...createForm.register('name')} />{createForm.formState.errors.name && <p className="text-xs text-destructive">{createForm.formState.errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Slug</Label><Input {...createForm.register('slug')} />{createForm.formState.errors.slug && <p className="text-xs text-destructive">{createForm.formState.errors.slug.message}</p>}</div>
            <div className="space-y-2"><Label>Description</Label><Textarea {...createForm.register('description')} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" disabled={createM.isPending}>Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
