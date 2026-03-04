import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useGetRoleByIdQuery,
} from '@/store/api';
import {
  createRoleSchema,
  type CreateRoleFormValues,
} from '@/common/schemas/role.schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId?: string | null;
  onSuccess?: () => void;
}

export function RoleFormDialog({ open, onOpenChange, roleId, onSuccess }: RoleFormDialogProps) {
  const isEdit = !!roleId;
  const { data: roleData, isLoading: roleLoading } = useGetRoleByIdQuery(roleId!, { skip: !roleId });
  const [createRole, { isLoading: creating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();

  const saving = creating || updating;
  const role = roleData?.data;
  const isSystem = isEdit && role?.isSystem;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: '', displayName: '', description: '' },
  });

  useEffect(() => {
    if (isEdit && role) {
      reset({
        name: role.name ?? '',
        displayName: role.displayName ?? '',
        description: role.description ?? '',
      });
    } else if (!isEdit && open) {
      reset({ name: '', displayName: '', description: '' });
    }
  }, [isEdit, role, open, reset]);

  const onSubmit = async (data: CreateRoleFormValues) => {
    try {
      const cleaned: Record<string, string> = { name: data.name };
      if (data.displayName) cleaned.displayName = data.displayName;
      if (data.description) cleaned.description = data.description;

      if (isEdit) {
        await updateRole({ id: roleId!, data: cleaned }).unwrap();
        toast.success('Role updated');
      } else {
        await createRole(cleaned as { name: string; description?: string }).unwrap();
        toast.success('Role created');
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message || 'Operation failed';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Role' : 'Create Role'}</DialogTitle>
          <DialogDescription>
            {isSystem
              ? 'System roles can only update display name and description.'
              : isEdit
                ? 'Update the role details below.'
                : 'Fill in the details to create a new role.'}
          </DialogDescription>
        </DialogHeader>

        {isEdit && roleLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Name *</Label>
              <Input
                id="role-name"
                placeholder="e.g. moderator"
                disabled={!!isSystem}
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-displayName">Display Name</Label>
              <Input
                id="role-displayName"
                placeholder="e.g. Content Moderator"
                {...register('displayName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Input
                id="role-description"
                placeholder="Brief description of role"
                {...register('description')}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
