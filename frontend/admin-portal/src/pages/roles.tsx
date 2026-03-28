import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { rolesApi } from '@/services/api'
import type { Role } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/api-error'
import { formatDate } from '@/lib/utils'
import { useForm, Controller } from 'react-hook-form'
import { formResolver } from '@/lib/form'
import { z } from 'zod'

const roleSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  isSystem: z.boolean().default(false),
})
type RoleFormData = z.infer<typeof roleSchema>

export default function RolesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const qc = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list })

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<RoleFormData>({
    resolver: formResolver(roleSchema),
  })

  const createMutation = useMutation({
    mutationFn: rolesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); setDialogOpen(false); reset(); toast.success('Role created') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to create role')),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: RoleFormData & { id: string }) => {
      const { isSystem: _ignore, ...payload } = d
      return rolesApi.update(id, payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); setDialogOpen(false); setEditing(null); reset(); toast.success('Role updated') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to update role')),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); setDeleteTarget(null); toast.success('Role deleted') },
    onError: (e) => toast.error(getErrorMessage(e, 'Failed to delete role')),
  })

  const openCreate = () => { setEditing(null); reset({ name: '', description: '', isSystem: false }); setDialogOpen(true) }
  const openEdit = (r: Role) => { setEditing(r); reset({ name: r.name, description: r.description ?? '', isSystem: r.isSystem }); setDialogOpen(true) }
  const onSubmit = (d: RoleFormData) => editing ? updateMutation.mutate({ ...d, id: editing.id }) : createMutation.mutate(d)

  const columns: ColumnDef<Role>[] = [
    { accessorKey: 'name', header: ({ column }) => <SortHeader column={column}>Name</SortHeader> },
    { accessorKey: 'description', header: 'Description', cell: ({ row }) => row.original.description || '—' },
    { accessorKey: 'isSystem', header: 'System', cell: ({ row }) => <Badge variant={row.original.isSystem ? 'default' : 'secondary'}>{row.original.isSystem ? 'Yes' : 'No'}</Badge> },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Created</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(row.original)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
            {!row.original.isSystem && <DropdownMenuItem onClick={() => setDeleteTarget(row.original)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Roles" description="Manage user roles" action={{ label: 'Add Role', onClick: openCreate }} />
      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        searchColumn="name"
        searchPlaceholder="Search roles..."
        enableRowSelection
        onBulkDelete={(rows) => {
          const nonSystem = rows.filter((r) => !r.isSystem)
          Promise.allSettled(nonSystem.map((r) => rolesApi.delete(r.id))).then((results) => {
            qc.invalidateQueries({ queryKey: ['roles'] })
            const failed = results.filter((r) => r.status === 'rejected').length
            if (failed) toast.error(`${failed} role(s) failed to delete`)
            else toast.success(`${nonSystem.length} role(s) deleted`)
          })
        }}
        exportFilename="roles"
        getExportRow={(r) => ({ Name: r.name, Description: r.description ?? '', System: r.isSystem ? 'Yes' : 'No', Created: r.createdAt })}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Role' : 'Create Role'}</DialogTitle>
            <DialogDescription>{editing ? 'Update role details' : 'Add a new role'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
            <div className="space-y-2"><Label>Description</Label><Textarea {...register('description')} /></div>
            <div className="flex items-center gap-2">
              <Controller name="isSystem" control={control} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />} />
              <Label>System Role</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Role"
        description={`Delete role "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete" onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending} />
    </div>
  )
}
