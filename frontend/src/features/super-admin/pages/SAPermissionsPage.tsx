import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useDeletePermissionMutation,
  useGetRolesQuery,
} from '@/store/api';
import {
  createPermissionSchema,
  type CreatePermissionFormValues,
} from '@/common/schemas/permission.schema';
import { PageHeader } from '@/common/components/PageHeader';
import { ConfirmDialog } from '@/common/components/ConfirmDialog';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/common/components/ui/dialog';
import { Loader2, Plus, Trash2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import type { Permission } from '@/common/types';

const CRUD_ACTIONS = ['create', 'read', 'update', 'delete', 'manage', 'export'];

export default function SAPermissionsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkModule, setBulkModule] = useState('');
  const [bulkRoleId, setBulkRoleId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: permData, isLoading } = useGetPermissionsQuery();
  const { data: rolesData } = useGetRolesQuery();
  const [createPermission, { isLoading: creating }] = useCreatePermissionMutation();
  const [deletePermission] = useDeletePermissionMutation();

  const allPermissions: Permission[] = permData?.data ?? [];
  const roles = rolesData?.data ?? [];

  const byModule = useMemo(() => {
    const map: Record<string, Permission[]> = {};
    for (const p of allPermissions) {
      const mod = p.module || 'General';
      if (!map[mod]) map[mod] = [];
      map[mod].push(p);
    }
    return map;
  }, [allPermissions]);

  const modules = Object.keys(byModule).sort();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePermissionFormValues>({
    resolver: zodResolver(createPermissionSchema),
    defaultValues: { roleId: '', module: '', action: '' },
  });

  const selectedAction = watch('action');
  const selectedRoleId = watch('roleId');

  const onSubmitPermission = async (data: CreatePermissionFormValues) => {
    try {
      await createPermission({
        roleId: data.roleId,
        module: data.module,
        action: data.action,
      }).unwrap();
      toast.success('Permission created');
      reset();
      setCreateOpen(false);
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message || 'Failed to create permission';
      toast.error(message);
    }
  };

  const handleBulkCreate = async () => {
    if (!bulkModule.trim() || !bulkRoleId) {
      toast.error('Enter a module name and select a role');
      return;
    }
    const mod = bulkModule.trim().toLowerCase();
    let created = 0;
    for (const action of CRUD_ACTIONS) {
      // Skip if already exists
      const exists = allPermissions.some(
        (p) => p.module?.toLowerCase() === mod && p.action?.toLowerCase() === action,
      );
      if (exists) continue;
      try {
        await createPermission({
          roleId: bulkRoleId,
          module: mod,
          action,
        }).unwrap();
        created++;
      } catch {
        // ignore individual failures
      }
    }
    toast.success(`Created ${created} permissions for "${mod}"`);
    setBulkModule('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePermission(deleteTarget).unwrap();
      toast.success('Permission deleted');
    } catch {
      toast.error('Failed to delete permission');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Permissions" description={`${allPermissions.length} permissions across ${modules.length} modules`}>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Permission
        </Button>
      </PageHeader>

      {/* Bulk Create */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bulk Create CRUD Permissions</CardTitle>
          <CardDescription>
            Instantly add create, read, update, delete, manage, and export permissions for a module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="bulkModule">Module Name</Label>
              <Input
                id="bulkModule"
                placeholder="e.g. products, orders, reviews"
                value={bulkModule}
                onChange={(e) => setBulkModule(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Role</Label>
              <Select value={bulkRoleId} onValueChange={setBulkRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.displayName || r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleBulkCreate} disabled={!bulkModule.trim() || !bulkRoleId}>
              Add CRUD Permissions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Permissions grouped by module */}
      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <KeyRound className="h-12 w-12" />
              <p className="font-medium">No permissions defined</p>
              <p className="text-sm">Create permissions to control access across modules.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        modules.map((mod) => (
          <Card key={mod}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base capitalize">{mod}</CardTitle>
                  <Badge variant="outline">{byModule[mod].length}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {byModule[mod].map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{perm.action}</p>
                      <p className="text-xs text-muted-foreground">{`${perm.module}:${perm.action}`}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(perm.id)}
                      title="Delete permission"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Create Permission Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Permission</DialogTitle>
            <DialogDescription>Define a new permission for a specific module and action.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitPermission)} className="space-y-4">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={selectedRoleId} onValueChange={(v) => setValue('roleId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.displayName || r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && <p className="text-xs text-destructive">{errors.roleId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="perm-module">Module *</Label>
              <Input id="perm-module" placeholder="e.g. products" {...register('module')} />
              {errors.module && <p className="text-xs text-destructive">{errors.module.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Action *</Label>
              <Select value={selectedAction} onValueChange={(v) => setValue('action', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {CRUD_ACTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.action && <p className="text-xs text-destructive">{errors.action.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Permission"
        description="This will remove the permission from all roles that have it assigned. Continue?"
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
