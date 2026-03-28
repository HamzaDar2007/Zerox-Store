import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'

/**
 * Typed zodResolver wrapper for Zod v4 + React Hook Form compatibility.
 * Zod v4 schema types are not fully compatible with RHF's Resolver type,
 * requiring a cast. This centralizes the workaround in one place.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formResolver = (schema: z.ZodType<any>) => zodResolver(schema) as any
