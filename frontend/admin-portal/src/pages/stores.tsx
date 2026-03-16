import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { storesApi } from '@/services/api'
import type { Store } from '@/types'
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
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  slug: z.string().min(1, 'Required'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function StoresPage() {
  const [editing, setEditing] = useState<Store | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detail, setDetail] = useState<Store | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['stores'], queryFn: storesApi.list })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const updateM = useMutation({
    mutationFn: ({ id, ...d }: FormData & { id: string }) => storesApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); setDialogOpen(false); setEditing(null); toast.success('Store updated') },
    onError: () => toast.error('Failed to update'),
  })

  const deleteM = useMutation({
    mutationFn: (id: string) => storesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stores'] }); setDeleteTarget(null); toast.success('Store deleted') },
    onError: () => toast.error('Failed to delete'),
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
      <PageHeader title="Stores" description="View and manage seller stores" />
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} searchColumn="name" searchPlaceholder="Search stores..."
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
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span><p className="font-medium">{detail.name}</p></div>
              <div><span className="text-muted-foreground">Slug:</span><p className="font-medium">{detail.slug}</p></div>
              <div><span className="text-muted-foreground">Status:</span><p><StatusBadge status={detail.isActive ? 'active' : 'inactive'} /></p></div>
              <div><span className="text-muted-foreground">Created:</span><p className="font-medium">{formatDate(detail.createdAt)}</p></div>
              {detail.description && (
                <div className="col-span-2"><span className="text-muted-foreground">Description:</span><p>{detail.description}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Store" description={`Delete store "${deleteTarget?.name}"?`} confirmLabel="Delete" onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />
    </div>
  )
}
