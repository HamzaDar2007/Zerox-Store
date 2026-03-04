import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(50, 'Name must be at most 50 characters'),
  displayName: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(255).optional().or(z.literal('')),
});

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = createRoleSchema;
export type UpdateRoleFormValues = CreateRoleFormValues;
