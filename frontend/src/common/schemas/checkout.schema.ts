import { z } from 'zod';

export const shippingSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?\d{10,15}$/, 'Please enter a valid phone number'),
  streetAddress: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Pakistan'),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;

export const checkoutSchema = z.object({
  shipping: shippingSchema,
  paymentMethod: z.enum(['cod', 'card', 'bank_transfer'], {
    required_error: 'Please select a payment method',
  }),
  customerNotes: z.string().max(1000).optional(),
  isGift: z.boolean().optional(),
  giftMessage: z.string().max(500, 'Gift message is too long').optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
