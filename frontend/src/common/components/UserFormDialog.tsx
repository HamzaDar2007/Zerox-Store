import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetUserByIdQuery,
} from '@/store/api';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from '@/common/schemas/user.schema';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string | null;
  onSuccess?: () => void;
}

const ROLES = [
  { value: 'customer', label: 'Customer' },
  { value: 'seller', label: 'Seller' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
] as const;

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export function UserFormDialog({ open, onOpenChange, userId, onSuccess }: UserFormDialogProps) {
  const isEdit = !!userId;
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(userId!, { skip: !userId });
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  const saving = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: undefined,
      dateOfBirth: '',
      gender: undefined,
    },
  });

  // Populate form with user data for edit
  useEffect(() => {
    if (isEdit && userData?.data) {
      const u = userData.data;
      reset({
        name: u.name ?? '',
        email: u.email ?? '',
        password: '',
        phone: u.phone ?? '',
        role: (u.role as CreateUserFormValues['role']) ?? undefined,
        dateOfBirth: u.dateOfBirth ? u.dateOfBirth.split('T')[0] : '',
        gender: (u.gender as CreateUserFormValues['gender']) ?? undefined,
      });
    } else if (!isEdit && open) {
      reset({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: undefined,
        dateOfBirth: '',
        gender: undefined,
      });
    }
  }, [isEdit, userData, open, reset]);

  const onSubmit = async (formData: CreateUserFormValues | UpdateUserFormValues) => {
    try {
      // Clean up empty strings
      const cleaned: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(formData)) {
        if (val !== '' && val !== undefined) cleaned[key] = val;
      }

      if (isEdit) {
        // Don't send email/password in update
        delete cleaned.email;
        delete cleaned.password;
        await updateUser({ id: userId!, data: cleaned }).unwrap();
        toast.success('User updated');
      } else {
        await createUser(cleaned as { name: string; email: string; password: string; role?: string }).unwrap();
        toast.success('User created');
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message || 'Operation failed';
      toast.error(message);
    }
  };

  const selectedRole = watch('role');
  const selectedGender = watch('gender');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update user details below.' : 'Fill in the details to create a new user.'}
          </DialogDescription>
        </DialogHeader>

        {isEdit && userLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" placeholder="Full name" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="user@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            )}

            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" placeholder="Min 8 chars" {...register('password')} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+92..." {...register('phone')} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={selectedRole ?? ''}
                onValueChange={(v) => setValue('role', v as CreateUserFormValues['role'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={selectedGender ?? ''}
                  onValueChange={(v) => setValue('gender', v as CreateUserFormValues['gender'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
