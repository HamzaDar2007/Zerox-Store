import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Get user role name
    let userRole: string | null = null;
    if (user.role) {
      if (typeof user.role === 'object' && user.role.name) {
        userRole = user.role.name;
      } else if (typeof user.role === 'string') {
        userRole = user.role;
      }
    }

    // Super Admin and Admin have full access - bypass permission checks
    if (userRole === 'super_admin' || userRole === 'admin') {
      return true;
    }

    try {
      // For other users, check their role-based permissions
      const userPermissions = await this.userRepository.manager.query(
        `
        SELECT DISTINCT p.module, p.action
        FROM permissions p
        JOIN role_permissions rp ON rp.permission_id = p.id
        JOIN user_roles ur ON ur.role_id = rp.role_id
        WHERE ur.user_id = $1
        `,
        [user.id],
      );

      const permissionSet = new Set(
        userPermissions.map((row: any) => `${row.module}.${row.action}`),
      );

      // Check if user has required permissions
      const hasPermission = requiredPermissions.some((permission) => {
        return permissionSet.has(permission);
      });

      if (!hasPermission) {
        throw new ForbiddenException(
          `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
        );
      }

      request.userPermissions = Array.from(permissionSet);

      return true;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new ForbiddenException('Permission validation failed');
    }
  }
}
