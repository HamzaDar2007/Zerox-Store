import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { usersApi, rolesApi } from '@/services/api'
import type { User, Role, Address } from '@/types'
import { DataTable, SortHeader } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Eye, Plus, X, MapPin, Shield } from 'lucide-react'
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

const addressSchema = z.object({
  label: z.string().optional(), line1: z.string().min(1), line2: z.string().optional(),
  city: z.string().min(1), state: z.string().min(1), postalCode: z.string().min(1), country: z.string().min(1),
})
type AddressFormData = z.infer<typeof addressSchema>

/* ── Roles sub-panel ── */
function UserRolesPanel({ userId }: { userId: string }) {
  const qc = useQueryClient()
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const { data: userRoles = [], isLoading } = useQuery({ queryKey: ['user-roles', userId], queryFn: () => usersApi.getRoles(userId) })
  const { data: allRoles = [] } = useQuery({ queryKey: ['roles'], queryFn: rolesApi.list })
  const assignM = useMutation({ mutationFn: (roleId: string) => usersApi.assignRole(userId, roleId), onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-roles', userId] }); setSelectedRoleId(''); toast.success('Role assigned') }, onError: () => toast.error('Failed') })
  const removeM = useMutation({ mutationFn: (roleId: string) => usersApi.removeRole(userId, roleId), onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-roles', userId] }); toast.success('Role removed') }, onError: () => toast.error('Failed') })

  const rolesArr = Array.isArray(userRoles) ? userRoles : []
  const allRolesArr = Array.isArray(allRoles) ? allRoles : []
  const assignedIds = new Set(rolesArr.map((r: { roleId?: string; id?: string }) => r.roleId ?? r.id))
  const available = allRolesArr.filter((r: Role) => !assignedIds.has(r.id))

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-1.5"><Shield className="h-4 w-4" />Assigned Roles</h3>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div className="flex flex-wrap gap-2">
          {rolesArr.map((ur: { id: string; roleId?: string; role?: Role }) => (
            <Badge key={ur.id} variant="outline" className="gap-1.5 pr-1">
              {ur.role?.name ?? ur.roleId ?? ur.id}
              <button onClick={() => removeM.mutate(ur.roleId ?? ur.id)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
          {!rolesArr.length && <p className="text-sm text-muted-foreground">No roles assigned.</p>}
        </div>
      )}
      {available.length > 0 && (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label className="text-xs">Add Role</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger><SelectValue placeholder="Select role…" /></SelectTrigger>
              <SelectContent>{available.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button size="sm" disabled={!selectedRoleId || assignM.isPending} onClick={() => selectedRoleId && assignM.mutate(selectedRoleId)}><Plus className="mr-1 h-3 w-3" />Assign</Button>
        </div>
      )}
    </div>
  )
}

/* ── Addresses sub-panel ── */
function UserAddressesPanel({ userId }: { userId: string }) {
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddr, setEditingAddr] = useState<Address | null>(null)
  const { data: addresses = [], isLoading } = useQuery({ queryKey: ['user-addresses', userId], queryFn: () => usersApi.getAddresses(userId) })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressFormData>({ resolver: zodResolver(addressSchema) })
  const createM = useMutation({ mutationFn: (d: AddressFormData) => usersApi.createAddress(userId, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-addresses', userId] }); setDialogOpen(false); reset(); toast.success('Address added') }, onError: () => toast.error('Failed') })
  const updateM = useMutation({ mutationFn: ({ id, ...d }: AddressFormData & { id: string }) => usersApi.updateAddress(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-addresses', userId] }); setDialogOpen(false); setEditingAddr(null); toast.success('Updated') }, onError: () => toast.error('Failed') })
  const deleteM = useMutation({ mutationFn: (id: string) => usersApi.deleteAddress(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-addresses', userId] }); toast.success('Deleted') }, onError: () => toast.error('Failed') })

  const openCreate = () => { setEditingAddr(null); reset({ label: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '' }); setDialogOpen(true) }
  const openEdit = (a: Address) => { setEditingAddr(a); reset({ label: a.label ?? '', line1: a.line1, line2: a.line2 ?? '', city: a.city, state: a.state, postalCode: a.postalCode, country: a.country }); setDialogOpen(true) }
  const onSubmit = (d: AddressFormData) => editingAddr ? updateM.mutate({ ...d, id: editingAddr.id }) : createM.mutate(d)

  const addrsArr = Array.isArray(addresses) ? addresses : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5"><MapPin className="h-4 w-4" />Addresses</h3>
        <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-3 w-3" />Add Address</Button>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !addrsArr.length ? <p className="text-sm text-muted-foreground">No addresses.</p> : (
        <div className="space-y-2">
          {addrsArr.map((a) => (
            <div key={a.id} className="flex items-start justify-between rounded-lg border p-3">
              <div>
                {a.label && <p className="text-sm font-medium">{a.label}{a.isDefault && <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>}</p>}
                <p className="text-xs text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                <p className="text-xs text-muted-foreground">{a.city}, {a.state} {a.postalCode}, {a.country}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteM.mutate(a.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingAddr ? 'Edit Address' : 'Add Address'}</DialogTitle><DialogDescription>Manage user address</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2"><Label>Label</Label><Input {...register('label')} placeholder="Home, Work…" /></div>
            <div className="space-y-2"><Label>Line 1</Label><Input {...register('line1')} />{errors.line1 && <p className="text-xs text-destructive">{errors.line1.message}</p>}</div>
            <div className="space-y-2"><Label>Line 2</Label><Input {...register('line2')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>City</Label><Input {...register('city')} />{errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}</div>
              <div className="space-y-2"><Label>State</Label><Input {...register('state')} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Postal Code</Label><Input {...register('postalCode')} /></div>
              <div className="space-y-2"><Label>Country</Label><Input {...register('country')} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">{editingAddr ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [detailUser, setDetailUser] = useState<User | null>(null)
  const [detailTab, setDetailTab] = useState<'info' | 'roles' | 'addresses'>('info')
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
            <DropdownMenuItem onClick={() => { setDetailUser(row.original); setDetailTab('info') }}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
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

      {/* User Detail Dialog */}
      <Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailUser?.firstName} {detailUser?.lastName}</DialogTitle>
            <DialogDescription>{detailUser?.email}</DialogDescription>
          </DialogHeader>

          <div className="flex gap-1 border-b">
            {([['info', 'Info'], ['roles', 'Roles'], ['addresses', 'Addresses']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setDetailTab(key)} className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${detailTab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {label}
              </button>
            ))}
          </div>

          {detailUser && detailTab === 'info' && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div><span className="text-muted-foreground">Email:</span> {detailUser.email}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {detailUser.phone || '—'}</div>
                  <div><span className="text-muted-foreground">Active:</span> <StatusBadge status={detailUser.isActive ? 'active' : 'inactive'} /></div>
                  <div><span className="text-muted-foreground">Verified:</span> <Badge variant={detailUser.isEmailVerified ? 'success' : 'secondary'}>{detailUser.isEmailVerified ? 'Yes' : 'No'}</Badge></div>
                  <div><span className="text-muted-foreground">Created:</span> {formatDate(detailUser.createdAt)}</div>
                  <div><span className="text-muted-foreground">Updated:</span> {formatDate(detailUser.updatedAt)}</div>
                </div>
              </CardContent>
            </Card>
          )}
          {detailUser && detailTab === 'roles' && <UserRolesPanel userId={detailUser.id} />}
          {detailUser && detailTab === 'addresses' && <UserAddressesPanel userId={detailUser.id} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
