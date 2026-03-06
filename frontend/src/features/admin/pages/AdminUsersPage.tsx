import { useState } from 'react';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from '@/store/api';
import { DataTable } from '@/common/components/DataTable';
import { StatusBadge } from '@/common/components/StatusBadge';
import { PageHeader } from '@/common/components/PageHeader';
import { UserAvatar } from '@/common/components/UserAvatar';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { UserFormDialog } from '@/common/components/UserFormDialog';
import { RoleBadge } from '@/common/components/RoleSelect';
import { formatDate } from '@/lib/format';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { Button } from '@/common/components/ui/button';
import { Switch } from '@/common/components/ui/switch';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import type { User } from '@/common/types';

export default function AdminUsersPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetUsersQuery({ page, limit });
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const users = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser(deleteId).unwrap();
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (userId: string, currentlyActive: boolean) => {
    if (currentlyActive) {
      setDeactivateId(userId);
      return;
    }
    try {
      await updateUser({ id: userId, data: { isActive: true } as Partial<User> }).unwrap();
      toast.success('User activated');
    } catch {
      toast.error('Failed to activate user');
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateId) return;
    try {
      await updateUser({ id: deactivateId, data: { isActive: false } as Partial<User> }).unwrap();
      toast.success('User deactivated');
    } catch {
      toast.error('Failed to deactivate user');
    } finally {
      setDeactivateId(null);
    }
  };

  const columns: ColumnDef<User, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.original.name} image={row.original.profileImage} size="sm" />
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.original.isActive}
            onCheckedChange={() => handleToggleActive(row.original.id, row.original.isActive)}
          />
          <StatusBadge status={row.original.isActive ? 'active' : 'inactive'} />
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditUserId(row.original.id)} title="Edit user">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)} title="Delete user">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description={`Manage all platform users (${total})`}>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No users found"
        pagination={{
          page, limit, total, totalPages,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
      />

      <UserFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <UserFormDialog
        open={!!editUserId}
        onOpenChange={(open) => !open && setEditUserId(null)}
        userId={editUserId}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete User"
        description="This will permanently remove the user. Are you sure?"
        onConfirm={handleDelete}
        destructive
      />

      <ConfirmDialog
        open={!!deactivateId}
        onOpenChange={(o) => !o && setDeactivateId(null)}
        title="Deactivate User"
        description="This will deactivate the user account. They will not be able to log in. Continue?"
        onConfirm={handleConfirmDeactivate}
        destructive
      />
    </div>
  );
}
