import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Strip password hash and sensitive fields from user objects */
export function sanitizeUser<T extends Record<string, unknown>>(user: T): T {
  const { password, passwordHash, resetToken, ...safe } = user;
  void password;
  void passwordHash;
  void resetToken;
  return safe as T;
}
