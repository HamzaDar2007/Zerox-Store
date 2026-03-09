import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { SecurityUtil } from 'src/common/utils/security.util';
import { ServiceResponse } from 'src/common/interfaces/service-response.interface';

/**
 * Note: This service manages permissions that belong to roles.
 * In the database schema, permissions have a role_id foreign key.
 * Each permission is created FOR a specific role, not assigned to it later.
 */
@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  /**
   * This method is being kept for backwards compatibility but its naming is misleading.
   * It doesn't "assign" existing permissions to a role. Instead, it validates that
   * specified permissions exist and belong to the role.
   * In the actual schema, permissions are created with a role_id from the start.
   */
  async assignPermissions(roleId: string, dto: AssignRolePermissionsDto) {
    // 1. Validate the role exists.
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // 2. Validate all permission IDs in the DTO exist.
    const permissions = await this.permissionRepo.find({
      where: { id: In(dto.permissionIds) },
    });
    if (permissions.length !== dto.permissionIds.length) {
      throw new NotFoundException(`Some permissions were not found`);
    }

    // 3. Check if these permissions belong to the specified role
    const nonMatchingPermissions = permissions.filter(
      (p) => p.roleId !== roleId,
    );
    if (nonMatchingPermissions.length > 0) {
      throw new BadRequestException(
        `Some permissions do not belong to role ${roleId}. ` +
          `In this schema, permissions are created with a role_id and cannot be reassigned.`,
      );
    }

    return {
      success: true,
      message: 'All specified permissions are valid and belong to this role',
      data: permissions,
    };
  }

  async getPermissionsByRole(
    roleId: string,
  ): Promise<ServiceResponse<Permission[]>> {
    const validRoleId = SecurityUtil.validateId(roleId);

    // Verify role exists
    const role = await this.roleRepo.findOne({ where: { id: validRoleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Get all permissions that belong to this role
    const permissions = await this.permissionRepo.find({
      where: { roleId: validRoleId },
      order: { module: 'ASC', action: 'ASC' },
    });

    return {
      success: true,
      message: 'Role permissions retrieved successfully',
      data: permissions,
    };
  }

  async removePermission(
    roleId: string,
    permissionId: string,
  ): Promise<ServiceResponse<void>> {
    const validRoleId = SecurityUtil.validateId(roleId);
    const validPermissionId = SecurityUtil.validateId(permissionId);

    // Find the permission
    const permission = await this.permissionRepo.findOne({
      where: { id: validPermissionId, roleId: validRoleId },
    });

    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permissionId} not found for role ${roleId}`,
      );
    }

    // Delete the permission
    await this.permissionRepo.remove(permission);

    return {
      success: true,
      message: 'Permission removed from role successfully',
      data: undefined,
    };
  }
}
