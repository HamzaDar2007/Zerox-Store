import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { usersApi } from '@/services/api'
import type { User } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().optional(),
})

type UserFormData = z.infer<typeof userSchema>

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, limit: 10, search }],
    queryFn: () => usersApi.list({ page, limit: 10, search: search || undefined }),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  const createMutation = useMutation({
    mutationFn: (d: UserFormData) => usersApi.create({ ...d, password: d.password! }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setDialogOpen(false); reset(); toast.success('User created') },
    onError: () => toast.error('Failed to create user'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: UserFormData & { id: string }) => usersApi.update(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setDialogOpen(false); setEditing(null); reset(); toast.success('User updated') },
    onError: () => toast.error('Failed to update user'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setDeleteTarget(null); toast.success('User deleted') },
    onError: () => toast.error('Failed to delete user'),
  })

  const openCreate = () => { setEditing(null); reset({ email: '', firstName: '', lastName: '', phone: '', password: '' }); setDialogOpen(true) }
  const openEdit = (user: User) => { setEditing(user); reset({ email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' }); setDialogOpen(true) }

  const onSubmit = (d: UserFormData) => {
    if (editing) updateMutation.mutate({ ...d, id: editing.id })
    else createMutation.mutate(d)
  }

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'firstName', header: ({ column }) => <SortHeader column={column}>Name</SortHeader>, cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
    { accessorKey: 'email', header: ({ column }) => <SortHeader column={column}>Email</SortHeader> },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} /> },
    { accessorKey: 'isEmailVerified', header: 'Verified', cell: ({ row }) => <Badge variant={row.original.isEmailVerified ? 'success' : 'secondary'}>{row.original.isEmailVerified ? 'Yes' : 'No'}</Badge> },
    { accessorKey: 'createdAt', header: ({ column }) => <SortHeader column={column}>Created</SortHeader>, cell: ({ row }) => formatDate(row.original.createdAt) },
    {
      id: 'actions',
      cell: ({ row }) => (
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

  const handleBulkDelete = (rows: User[]) => {
    Promise.all(rows.map((r) => usersApi.delete(r.id))).then(() => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(`${rows.length} user(s) deleted`)
    }).catch(() => toast.error('Failed to delete some users'))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage user accounts" action={{ label: 'Add User', onClick: openCreate }} />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        manualPagination
        page={page}
        pageCount={data?.totalPages ?? 1}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search users..."
        enableRowSelection
        onBulkDelete={handleBulkDelete}
        exportFilename="users"
        getExportRow={(u) => ({ Name: `${u.firstName} ${u.lastName}`, Email: u.email, Status: u.isActive ? 'Active' : 'Inactive', Created: u.createdAt })}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit User' : 'Create User'}</DialogTitle>
            <DialogDescription>{editing ? 'Update user information' : 'Add a new user account'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input {...register('firstName')} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input {...register('lastName')} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            {!editing && (
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" {...register('password')} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
            )}
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register('phone')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
