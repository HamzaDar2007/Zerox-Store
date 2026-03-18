import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { permissionsApi } from '@/services/api'
import type { Permission } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  code: z.string().min(1, 'Required'),
  module: z.string().min(1, 'Required'),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function PermissionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Permission | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['permissions'], queryFn: permissionsApi.list })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) as any })

  const createM = useMutation({ mutationFn: permissionsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['permissions'] }); setDialogOpen(false); reset(); toast.success('Permission created') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: FormData & { id: string }) => permissionsApi.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['permissions'] }); setDialogOpen(false); setEditing(null); reset(); toast.success('Permission updated') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })
  const deleteM = useMutation({ mutationFn: (id: string) => permissionsApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['permissions'] }); setDeleteTarget(null); toast.success('Deleted') }, onError: (e) => toast.error(getErrorMessage(e, 'Failed')) })

  const openCreate = () => { setEditing(null); reset({ code: '', module: '', description: '' }); setDialogOpen(true) }
  const openEdit = (p: Permission) => { setEditing(p); reset({ code: p.code, module: p.module, description: p.description ?? '' }); setDialogOpen(true) }
  const onSubmit = (d: FormData) => editing ? updateM.mutate({ ...d, id: editing.id }) : createM.mutate(d)

  const columns: ColumnDef<Permission>[] = [
    { accessorKey: 'code', header: ({ column }) => <SortHeader column={column}>Code</SortHeader> },
    { accessorKey: 'module', header: ({ column }) => <SortHeader column={column}>Module</SortHeader>, cell: ({ row }) => <Badge variant="outline">{row.original.module}</Badge> },
    { accessorKey: 'description', header: 'Description', cell: ({ row }) => row.original.description || '—' },
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
      <PageHeader title="Permissions" description="Manage access permissions" action={{ label: 'Add Permission', onClick: openCreate }} />
      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} isError={isError} onRetry={refetch} searchColumn="code" searchPlaceholder="Search permissions..."
        enableRowSelection
        onBulkDelete={(rows) => { if (confirm(`Delete ${rows.length} permissions?`)) Promise.allSettled(rows.map((r) => permissionsApi.delete(r.id))).then((results) => { qc.invalidateQueries({ queryKey: ['permissions'] }); const failed = results.filter((r) => r.status === 'rejected').length; if (failed) toast.error(`${failed} of ${rows.length} failed`); else toast.success(`${rows.length} permission(s) deleted`) }) }}
        exportFilename="permissions"
        getExportRow={(r) => ({ Code: r.code, Module: r.module, Description: r.description ?? '', Created: r.createdAt })}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Permission' : 'Create Permission'}</DialogTitle><DialogDescription>{editing ? 'Update permission' : 'Add a new permission'}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2"><Label>Code</Label><Input {...register('code')} placeholder="e.g. users.create" />{errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}</div>
            <div className="space-y-2"><Label>Module</Label><Input {...register('module')} placeholder="e.g. users" />{errors.module && <p className="text-xs text-destructive">{errors.module.message}</p>}</div>
            <div className="space-y-2"><Label>Description</Label><Textarea {...register('description')} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createM.isPending || updateM.isPending}>{editing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Permission"
        description={`Delete permission "${deleteTarget?.code}"?`} confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteM.mutate(deleteTarget.id)} loading={deleteM.isPending} />
    </div>
  )
}
