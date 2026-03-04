import { useState } from 'react';
import {
  useGetUsersQuery,
  useGetRolesQuery,
  useUpdateUserMutation,
} from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { DataTable } from '@/common/components/DataTable';
import { UserAvatar } from '@/common/components/UserAvatar';
import { RoleBadge, RoleSelect } from '@/common/components/RoleSelect';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { Button } from '@/common/components/ui/button';
import { Checkbox } from '@/common/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/common/components/ui/dialog';
import { Label } from '@/common/components/ui/label';
import { Loader2, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import type { User } from '@/common/types';

export default function SARoleAssignmentsPage() {
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRoleOpen, setBulkRoleOpen] = useState(false);
  const [bulkRole, setBulkRole] = useState('');

  const { data, isLoading } = useGetUsersQuery({ page, limit });
  const { data: _rolesData } = useGetRolesQuery();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  const users = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkRole || selectedIds.size === 0) return;
    let success = 0;
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      try {
        await updateUser({ id, data: { role: bulkRole } as Partial<User> }).unwrap();
        success++;
      } catch {
        // continue
      }
    }
    toast.success(`Updated role for ${success} of ${ids.length} users`);
    setSelectedIds(new Set());
    setBulkRoleOpen(false);
    setBulkRole('');
  };

  const columns: ColumnDef<User, unknown>[] = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={users.length > 0 && selectedIds.size === users.length}
          onCheckedChange={toggleAll}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(row.original.id)}
          onCheckedChange={() => toggleSelect(row.original.id)}
        />
      ),
    },
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
      header: 'Current Role',
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Login',
      cell: ({ row }) => row.original.lastLoginAt ? formatDate(row.original.lastLoginAt) : '—',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Role Assignments" description="View and bulk-assign roles to users">
        <Button
          disabled={selectedIds.size === 0}
          onClick={() => setBulkRoleOpen(true)}
        >
          <UserCog className="mr-2 h-4 w-4" />
          Assign Role ({selectedIds.size})
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyTitle="No users found"
        pagination={{
          page, limit, total, totalPages,
          onPageChange: setPage,
          onLimitChange: setLimit,
        }}
      />

      {/* Bulk Role Assignment Dialog */}
      <Dialog open={bulkRoleOpen} onOpenChange={setBulkRoleOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Bulk Role Assignment</DialogTitle>
            <DialogDescription>
              Assign a role to {selectedIds.size} selected user{selectedIds.size > 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Role</Label>
              <RoleSelect value={bulkRole} onChange={setBulkRole} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAssign} disabled={!bulkRole || updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
