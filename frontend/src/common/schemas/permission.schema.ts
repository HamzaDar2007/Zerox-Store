import { z } from 'zod';

export const createPermissionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  module: z.string().min(1, 'Module is required').max(50),
  action: z.string().min(1, 'Action is required').max(50),
  description: z.string().max(255).optional().or(z.literal('')),
});

export type CreatePermissionFormValues = z.infer<typeof createPermissionSchema>;
