import { z } from 'zod';

export const createPermissionSchema = z.object({
  roleId: z.string().min(1, 'Please select a role'),
  module: z.string().min(1, 'Module is required').max(50),
  action: z.string().min(1, 'Action is required').max(50),
});

export type CreatePermissionFormValues = z.infer<typeof createPermissionSchema>;
