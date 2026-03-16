import { z } from 'zod'

// Shared validation schemas for reuse across forms

const emailSchema = z.string().email('Invalid email address')

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')

const nameSchema = z.string().min(1, 'Required').max(100, 'Too long')

const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
  .or(z.literal(''))

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const profileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional(),
})
