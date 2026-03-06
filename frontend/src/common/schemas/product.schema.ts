import { z } from 'zod';

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Name must be at most 255 characters'),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(500, 'Short description is too long').optional(),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than 0'),
  compareAtPrice: z.number().positive('Must be greater than 0').optional(),
  costPrice: z.number().nonnegative('Cost price cannot be negative').optional(),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  weight: z.number().nonnegative('Weight cannot be negative').optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isDigital: z.boolean().optional(),
  requiresShipping: z.boolean().optional(),
  isTaxable: z.boolean().optional(),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().max(500).optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
