import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email')
    .max(150),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Must contain uppercase, lowercase, and number',
    ),
  phone: z.string().max(20).optional().or(z.literal('')),
  role: z.enum(['customer', 'seller', 'admin', 'super_admin']).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  phone: z.string().max(20).optional().or(z.literal('')),
  role: z.enum(['customer', 'seller', 'admin', 'super_admin']).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
