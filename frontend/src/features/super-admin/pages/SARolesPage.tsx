import { useState } from 'react';
import {
  useGetRolesQuery, useDeleteRoleMutation, useCreateRoleMutation,
  useGetPermissionsQuery, useGetRolePermissionsQuery, useAssignRolePermissionsMutation,
  useGetUsersQuery,
} from '@/store/api';
import { PageHeader } from '@/common/components/PageHeader';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { RoleFormDialog } from '@/common/components/RoleFormDialog';
import { PermissionMatrix } from '@/common/components/PermissionMatrix';
import { EmptyState } from '@/common/components/EmptyState';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/common/components/ui/table';
import { Shield, Trash2, Pencil, Plus, Copy, ChevronRight, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { Role, Permission } from '@/common/types';

export default function SARolesPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [viewUsersRoleId, setViewUsersRoleId] = useState<string | null>(null);

  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
  const { data: permissionsData } = useGetPermissionsQuery();
  const { data: rolePermsData } = useGetRolePermissionsQuery(selectedRole!, { skip: !selectedRole });
  const { data: roleUsersData } = useGetUsersQuery(
    { page: 1, limit: 50, role: viewUsersRoleId } as Record<string, unknown> as { page: number; limit: number },
    { skip: !viewUsersRoleId },
  );
  const [deleteRole] = useDeleteRoleMutation();
  const [assignPermissions] = useAssignRolePermissionsMutation();
  const [createRole] = useCreateRoleMutation();

  const roles: Role[] = rolesData?.data ?? [];
  const allPermissions: Permission[] = permissionsData?.data ?? [];
  const rolePermissions: Permission[] = rolePermsData?.data ?? [];
  const rolePermissionIds = new Set(rolePermissions.map((p) => p.id));

  // Filter to only show permissions that belong to the selected role
  // (backend schema: permissions are created with a role_id and cannot be reassigned)
  const selectedRolePermissions = selectedRole
    ? allPermissions.filter((p) => p.roleId === selectedRole)
    : [];

  const handleTogglePermission = async (permissionId: string) => {
    if (!selectedRole) return;
    // Only send permissionIds that belong to this role
    const currentIds = rolePermissions.map((p) => p.id);
    const newIds = currentIds.includes(permissionId)
      ? currentIds.filter((id) => id !== permissionId)
      : [...currentIds, permissionId];
    try {
      await assignPermissions({ roleId: selectedRole, data: { permissionIds: newIds } }).unwrap();
      toast.success('Permissions updated');
    } catch {
      toast.error('Failed to update permissions');
    }
  };

  const handleBulkToggle = async (permissionIds: string[], checked: boolean) => {
    if (!selectedRole) return;
    const currentIds = new Set(rolePermissions.map((p) => p.id));
    if (checked) {
      permissionIds.forEach((id) => currentIds.add(id));
    } else {
      permissionIds.forEach((id) => currentIds.delete(id));
    }
    try {
      await assignPermissions({ roleId: selectedRole, data: { permissionIds: Array.from(currentIds) } }).unwrap();
      toast.success('Permissions updated');
    } catch {
      toast.error('Failed to update permissions');
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRole(deleteTarget).unwrap();
      toast.success('Role deleted');
      if (selectedRole === deleteTarget) setSelectedRole(null);
    } catch {
      toast.error('Failed to delete role');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleCloneRole = async (role: Role) => {
    try {
      const cloned = await createRole({
        name: `${role.name}_copy`,
        description: `Clone of ${role.displayName || role.name}`,
      }).unwrap();

      // Copy permissions
      if (selectedRole === role.id && rolePermissions.length > 0) {
        await assignPermissions({
          roleId: cloned.data.id,
          data: { permissionIds: rolePermissions.map((p) => p.id) },
        }).unwrap();
      }
      toast.success('Role cloned');
    } catch {
      toast.error('Failed to clone role');
    }
  };

  const targetRole = deleteTarget ? roles.find((r) => r.id === deleteTarget) : null;

  if (rolesLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Roles Management" description="Full control over roles, cloning, and permission matrix">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </PageHeader>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Roles</CardTitle>
          <CardDescription>{roles.length} roles configured</CardDescription>
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <EmptyState
              icon={<Shield className="h-12 w-12" />}
              title="No roles"
              description="Create roles to manage access control"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow
                    key={role.id}
                    className={`cursor-pointer ${selectedRole === role.id ? 'bg-muted' : ''}`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.displayName || role.name}</span>
                        {selectedRole === role.id && <ChevronRight className="h-4 w-4 text-primary" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{role.description || '—'}</TableCell>
                    <TableCell>
                      {role.isSystem ? (
                        <Badge variant="secondary">System</Badge>
                      ) : (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="icon"
                          onClick={(e) => { e.stopPropagation(); setViewUsersRoleId(viewUsersRoleId === role.id ? null : role.id); }}
                          title="View users"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          onClick={(e) => { e.stopPropagation(); handleCloneRole(role); }}
                          title="Clone role"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          onClick={(e) => { e.stopPropagation(); setEditRoleId(role.id); }}
                          title="Edit role"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!role.isSystem && (
                          <Button
                            variant="ghost" size="icon"
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(role.id); }}
                            title="Delete role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Users with selected role */}
      {viewUsersRoleId && roleUsersData?.data?.items && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Users with role: {roles.find((r) => r.id === viewUsersRoleId)?.displayName || roles.find((r) => r.id === viewUsersRoleId)?.name}
            </CardTitle>
            <CardDescription>{roleUsersData.data.items.length} users</CardDescription>
          </CardHeader>
          <CardContent>
            {roleUsersData.data.items.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No users with this role</p>
            ) : (
              <div className="space-y-2">
                {roleUsersData.data.items.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-md border p-2">
                    <span className="font-medium">{u.name}</span>
                    <span className="text-sm text-muted-foreground">{u.email}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Permission Matrix */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Permission Matrix — {roles.find((r) => r.id === selectedRole)?.displayName || roles.find((r) => r.id === selectedRole)?.name}
            </CardTitle>
            <CardDescription>
              {rolePermissionIds.size} of {selectedRolePermissions.length} permissions active
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionMatrix
              allPermissions={selectedRolePermissions}
              activePermissionIds={rolePermissionIds}
              onToggle={handleTogglePermission}
              onBulkToggle={handleBulkToggle}
            />
          </CardContent>
        </Card>
      )}

      <RoleFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <RoleFormDialog open={!!editRoleId} onOpenChange={(o) => !o && setEditRoleId(null)} roleId={editRoleId} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Role"
        description={
          targetRole?.isSystem
            ? 'System roles cannot be deleted.'
            : 'This will permanently delete the role and its permission assignments.'
        }
        onConfirm={handleDeleteRole}
        destructive
      />
    </div>
  );
}
