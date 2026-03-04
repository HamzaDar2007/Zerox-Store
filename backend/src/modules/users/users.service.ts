import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserWithPermissionsDto } from './dto/create-user-with-permissions.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  AssignmentActionEnum,
  AssignPermissionsDto,
} from './dto/assign-permissions.dto';
import { SecurityUtil } from '../../common/utils/security.util';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async create(dto: CreateUserDto): Promise<ServiceResponse<User>> {
    try {
      SecurityUtil.validateObject(dto);

      const existingUser = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException(
          'A user with this email address already exists',
        );
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = this.userRepository.create({
        ...dto,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(user);
      return {
        success: true,
        message: 'User created successfully',
        data: savedUser as User,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async findByEmail(
    email: string,
    options?: { includePassword?: boolean },
  ): Promise<User | null> {
    try {
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email: email.toLowerCase().trim() });

      if (options?.includePassword) {
        queryBuilder.addSelect('user.password');
      }

      const user = await queryBuilder.getOne();
      return user || null;
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      const validUserId = SecurityUtil.validateId(userId);

      const result = await this.userRepository.update(
        { id: validUserId },
        { password: hashedPassword },
      );

      if (result.affected === 0) {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update password: ${error.message}`);
    }
  }

  async createWithPermissions(
    dto: CreateUserWithPermissionsDto,
  ): Promise<ServiceResponse<User>> {
    try {
      SecurityUtil.validateObject(dto);

      const existingUser = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException(
          'A user with this email address already exists',
        );
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = this.userRepository.create({
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role,
      });

      const savedUser = await this.userRepository.save(user);

      // Note: User permissions logic removed - permissions now belong to roles directly
      // If you need user-specific permissions, use the user_roles table

      return {
        success: true,
        message: 'User created successfully',
        data: savedUser,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error(
        `Failed to create user with permissions: ${error.message}`,
      );
    }
  }

  /**
   * Get all users that have a specific role assigned
   */
  async getUsersWithRole(roleId: string): Promise<ServiceResponse<User[]>> {
    try {
      const validRoleId = SecurityUtil.validateId(roleId);

      const role = await this.roleRepository.findOne({
        where: { id: validRoleId },
      });
      if (!role) {
        throw new NotFoundException('Role not found');
      }

      const userRoles = await this.userRoleRepository.find({
        where: { roleId: validRoleId },
        relations: ['user'],
      });

      const users = userRoles.map((ur) => ur.user);

      return {
        success: true,
        message: 'Users with role retrieved successfully',
        data: users,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve users with role: ${error.message}`);
    }
  }

  // ==================== DEPRECATED METHODS ====================
  // The following methods reference the user_permissions table which doesn't exist in the migration
  // These are kept for backwards compatibility but should not be used

  /**
   * @deprecated This method uses the deprecated assignPermissions flow.
   * Permissions are now managed through roles, not directly assigned to users.
   */
  async assignPermissions(
    userId: string,
    dto: AssignPermissionsDto,
  ): Promise<ServiceResponse<User>> {
    throw new Error(
      'Direct user permission assignment is deprecated. ' +
      'Use role-based permissions instead. Assign roles to users via assignRoleToUser.'
    );
  }

  private async addUserPermissions(
    userId: string,
    permissionIds: string[],
  ): Promise<void> {
    // Deprecated - user_permissions table doesn't exist
    throw new Error('user_permissions table does not exist in the current schema');
  }

  private async removeUserPermissions(
    userId: string,
    permissionIds: string[],
  ): Promise<void> {
    // Deprecated - user_permissions table doesn't exist
    throw new Error('user_permissions table does not exist in the current schema');
  }

  private async replaceUserFeaturePermissions(
    userId: string,
    feature: string,
    newPermissionIds: string[],
  ): Promise<void> {
    // Deprecated - user_permissions table doesn't exist  
    throw new Error('user_permissions table does not exist in the current schema');
  }

  async getAvailableActionsForFeature(module: string): Promise<string[]> {
    try {
      const actions = await this.userRepository.manager.query(
        `SELECT DISTINCT action FROM permissions WHERE module = $1 ORDER BY action`,
        [module],
      );

      return actions.map((row) => row.action);
    } catch (error) {
      throw new Error(
        `Failed to get available actions for module ${module}: ${error.message}`,
      );
    }
  }

  async getAvailableFeatures(): Promise<
    ServiceResponse<{ module: string; actions: string[] }[]>
  > {
    try {
      const modules = await this.userRepository.manager.query(`
        SELECT
          module,
          array_agg(DISTINCT action ORDER BY action) as actions,
          count(*) as permission_count
        FROM permissions
        GROUP BY module
        ORDER BY module
      `);

      const result = modules.map((row) => ({
        module: row.module,
        actions: row.actions,
        permissionCount: parseInt(row.permission_count),
      }));

      return {
        success: true,
        message: 'Available modules retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new Error(`Failed to get available modules: ${error.message}`);
    }
  }

  async findOneWithPermissions(id: string): Promise<User> {
    try {
      const validId = SecurityUtil.validateId(id);

      // Get the user (role is now an enum field, not a relation)
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id: validId })
        .getOne();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      let allPermissions = [];

      // Note: Role is now an enum string, not an object with id.
      // To get role-based permissions:
      // 1. Query roles table: SELECT id FROM roles WHERE name = user.role
      // 2. Query permissions: SELECT * FROM permissions WHERE role_id = roleId
      if (user.role) {
        // Get role record
        const roleRecord = await this.roleRepository.findOne({
          where: { name: user.role as any },
        });
        
        if (roleRecord) {
          // Get role permissions using the new schema
          const rolePermissions = await this.userRepository.manager.query(
            `
            SELECT DISTINCT
              p.id,
              p.role_id,
              p.module,
              p.action,
              p.created_at,
              'role' as source
            FROM permissions p
            WHERE p.role_id = $1
            ORDER BY p.module, p.action
            `,
            [roleRecord.id],
          );
          allPermissions = rolePermissions;
        }
      }

      // Note: User entity no longer has permissions property
      // Return user with permissions as separate field if needed
      return Object.assign(user, { userPermissions: allPermissions || [] });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to find user with permissions: ${error.message}`);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const validId = SecurityUtil.validateId(id);

      const user = await this.userRepository.findOne({
        where: { id: validId },
      });

      return user || null;
    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  async getUserPermissions(
    userId: string,
  ): Promise<ServiceResponse<Permission[]>> {
    try {
      const validUserId = SecurityUtil.validateId(userId);

      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id: validUserId })
        .getOne();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const allPermissions = new Map<string, Permission>();

      // Role is now an enum string - need to query role table first
      if (user.role) {
        const roleRecord = await this.roleRepository.findOne({
          where: { name: user.role as any },
        });

        if (roleRecord) {
          // Get permissions for this role using the new schema (role_id in permissions)
          const rolePermissions = await this.permissionRepository
            .createQueryBuilder('permission')
            .where('permission.roleId = :roleId', { roleId: roleRecord.id })
            .getMany();

          rolePermissions.forEach((permission) => {
            allPermissions.set(permission.id, permission);
          });
        }
      }

      // Note: In the new schema, users don't have direct permissions
      // All permissions come from the user's role(s)
      // The user_permissions table is deprecated

      const permissions = Array.from(allPermissions.values()).sort((a, b) =>
        `${a.module}_${a.action}`.localeCompare(`${b.module}_${b.action}`),
      );

      return {
        success: true,
        message: 'User permissions retrieved successfully',
        data: permissions,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve user permissions: ${error.message}`);
    }
  }

  async findAll(): Promise<ServiceResponse<User[]>> {
    try {
      const users = await this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.email',
          'user.name',
          'user.role',
          'user.createdAt',
          'user.updatedAt',
        ])
        .orderBy('user.createdAt', 'DESC')
        .getMany();

      return {
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve users: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<ServiceResponse<User>> {
    const user = await this.findOneWithPermissions(id);
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  async update(id: string, dto: UpdateUserDto): Promise<ServiceResponse<User>> {
    try {
      const validId = SecurityUtil.validateId(id);
      SecurityUtil.validateObject(dto);

      const user = await this.userRepository.findOne({
        where: { id: validId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (dto.email && dto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: dto.email },
        });
        if (existingUser) {
          throw new ConflictException('Email already exists');
        }
      }

      // Note: dto.role is now an enum value, not a roleId
      // The enum value will be set directly on the user entity

      const updateData: any = { ...dto };
      if (dto.password) {
        updateData.password = await bcrypt.hash(dto.password, 10);
      }

      await this.userRepository.update(validId, updateData);

      const updatedUser = await this.findOneWithPermissions(validId);
      return {
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  async remove(id: string): Promise<ServiceResponse<void>> {
    try {
      const validId = SecurityUtil.validateId(id);

      const user = await this.userRepository.findOne({
        where: { id: validId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.userRepository.softRemove(user);
      return {
        success: true,
        message: 'User deleted successfully',
        data: undefined,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}
