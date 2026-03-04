import { useState } from 'react';
import {
  useGetRolesQuery, useDeleteRoleMutation,
  useGetPermissionsQuery, useGetRolePermissionsQuery, useAssignRolePermissionsMutation,
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
import { Shield, Trash2, Pencil, Plus, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Role, Permission } from '@/common/types';

export default function AdminRolesPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);

  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
  const { data: permissionsData } = useGetPermissionsQuery();
  const { data: rolePermsData } = useGetRolePermissionsQuery(selectedRole!, { skip: !selectedRole });
  const [deleteRole] = useDeleteRoleMutation();
  const [assignPermissions] = useAssignRolePermissionsMutation();

  const roles: Role[] = rolesData?.data ?? [];
  const allPermissions: Permission[] = permissionsData?.data ?? [];
  const rolePermissions: Permission[] = rolePermsData?.data ?? [];

  const rolePermissionIds = new Set(rolePermissions.map((p) => p.id));

  const handleTogglePermission = async (permissionId: string) => {
    if (!selectedRole) return;
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
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete role');
    }
  };

  const targetRole = deleteTarget ? roles.find((r) => r.id === deleteTarget) : null;

  if (rolesLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Roles & Permissions" description="Manage roles and their permissions">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Roles list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roles</CardTitle>
            <CardDescription>{roles.length} roles</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {roles.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<Shield className="h-12 w-12" />}
                  title="No roles"
                  description="No roles have been created"
                />
              </div>
            ) : (
              <div className="divide-y">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50 ${
                      selectedRole === role.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{role.displayName || role.name}</p>
                        {role.isSystem && <Badge variant="secondary">System</Badge>}
                      </div>
                      {role.description && (
                        <p className="text-xs text-muted-foreground truncate">{role.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditRoleId(role.id);
                        }}
                        title="Edit role"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(role.id);
                          }}
                          title="Delete role"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {selectedRole
                ? `Permissions for ${roles.find((r) => r.id === selectedRole)?.displayName || roles.find((r) => r.id === selectedRole)?.name}`
                : 'Permissions'}
            </CardTitle>
            <CardDescription>
              {selectedRole
                ? `${rolePermissionIds.size} of ${allPermissions.length} permissions assigned. Use column/row checkboxes for bulk actions.`
                : 'Select a role to manage permissions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedRole ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                Select a role from the list to manage its permissions
              </div>
            ) : (
              <PermissionMatrix
                allPermissions={allPermissions}
                activePermissionIds={rolePermissionIds}
                onToggle={handleTogglePermission}
                onBulkToggle={handleBulkToggle}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Role Dialog */}
      <RoleFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Edit Role Dialog */}
      <RoleFormDialog
        open={!!editRoleId}
        onOpenChange={(open) => !open && setEditRoleId(null)}
        roleId={editRoleId}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Role"
        description={
          targetRole?.isSystem
            ? 'System roles cannot be deleted.'
            : 'This will permanently remove the role and its permission assignments. Are you sure?'
        }
        onConfirm={handleDeleteRole}
        destructive
      />
    </div>
  );
}
