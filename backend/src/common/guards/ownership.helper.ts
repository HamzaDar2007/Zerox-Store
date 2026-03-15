import { ForbiddenException } from '@nestjs/common';

/**
 * Checks if the caller is an admin/super_admin or is the owner of the resource.
 * Throws ForbiddenException if neither.
 */
export function enforceOwnerOrAdmin(
  callerId: string,
  callerRole: string | null,
  resourceOwnerId: string,
): void {
  if (callerRole === 'admin' || callerRole === 'super_admin') return;
  if (callerId === resourceOwnerId) return;
  throw new ForbiddenException('You do not have access to this resource');
}

export function isAdmin(role: string | null): boolean {
  return role === 'admin' || role === 'super_admin';
}
