import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { SecurityUtil } from '../../common/utils/security.util';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(dto: CreatePermissionDto): Promise<ServiceResponse<Permission>> {
    try {
      SecurityUtil.validateObject(dto);

      // Check for existing permission with same role_id, module, and action
      const existingPermission = await this.permissionRepository.findOne({
        where: {
          roleId: dto.roleId,
          module: dto.module,
          action: dto.action,
        },
      });

      if (existingPermission) {
        throw new ConflictException(
          'Permission with this combination of role, module, and action already exists',
        );
      }

      const permission = this.permissionRepository.create(dto);
      const savedPermission = await this.permissionRepository.save(permission);

      return {
        success: true,
        message: 'Permission created successfully',
        data: savedPermission,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create permission: ${error.message}`);
    }
  }

  async findAll(): Promise<ServiceResponse<Permission[]>> {
    try {
      const permissions = await this.permissionRepository.find({
        relations: ['role'],
        order: { module: 'ASC', action: 'ASC' },
      });

      return {
        success: true,
        message: 'Permissions retrieved successfully',
        data: permissions,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve permissions: ${error.message}`);
    }
  }

  async findByModule(module: string): Promise<ServiceResponse<Permission[]>> {
    try {
      const sanitizedModule = SecurityUtil.sanitizeInput(module);

      const permissions = await this.permissionRepository.find({
        where: { module: sanitizedModule },
        relations: ['role'],
        order: { action: 'ASC' },
      });

      return {
        success: true,
        message: 'Permissions retrieved successfully',
        data: permissions,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve permissions for module: ${error.message}`,
      );
    }
  }

  async findByRole(roleId: string): Promise<ServiceResponse<Permission[]>> {
    try {
      const validRoleId = SecurityUtil.validateId(roleId);

      const permissions = await this.permissionRepository.find({
        where: { roleId: validRoleId },
        relations: ['role'],
        order: { module: 'ASC', action: 'ASC' },
      });

      return {
        success: true,
        message: 'Permissions retrieved successfully',
        data: permissions,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve permissions for role: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<ServiceResponse<Permission>> {
    try {
      const validId = SecurityUtil.validateId(id);

      const permission = await this.permissionRepository.findOne({
        where: { id: validId },
        relations: ['role'],
      });

      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      return {
        success: true,
        message: 'Permission retrieved successfully',
        data: permission,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to retrieve permission: ${error.message}`);
    }
  }

  async update(
    id: string,
    dto: UpdatePermissionDto,
  ): Promise<ServiceResponse<Permission>> {
    try {
      const validId = SecurityUtil.validateId(id);
      SecurityUtil.validateObject(dto);

      const permission = await this.permissionRepository.findOne({
        where: { id: validId },
      });

      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      // Check for duplicate if roleId, module, or action are being changed
      if (dto.roleId || dto.module || dto.action) {
        const checkDuplicate = await this.permissionRepository.findOne({
          where: {
            roleId: dto.roleId || permission.roleId,
            module: dto.module || permission.module,
            action: dto.action || permission.action,
          },
        });

        if (checkDuplicate && checkDuplicate.id !== validId) {
          throw new ConflictException(
            'Permission with this combination already exists',
          );
        }
      }

      await this.permissionRepository.update(validId, dto);

      const updatedPermission = await this.permissionRepository.findOne({
        where: { id: validId },
        relations: ['role'],
      });

      return {
        success: true,
        message: 'Permission updated successfully',
        data: updatedPermission,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to update permission: ${error.message}`);
    }
  }

  async remove(id: string): Promise<ServiceResponse<void>> {
    try {
      const validId = SecurityUtil.validateId(id);

      const permission = await this.permissionRepository.findOne({
        where: { id: validId },
      });

      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      await this.permissionRepository.remove(permission);

      return {
        success: true,
        message: 'Permission deleted successfully',
        data: undefined,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete permission: ${error.message}`);
    }
  }

  async getAllResources(): Promise<ServiceResponse<string[]>> {
    try {
      const result = await this.permissionRepository
        .createQueryBuilder('permission')
        .select('DISTINCT permission.module', 'module')
        .orderBy('permission.module', 'ASC')
        .getRawMany();

      const modules = result.map((r) => r.module);

      return {
        success: true,
        message: 'Modules retrieved successfully',
        data: modules,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve modules: ${error.message}`);
    }
  }

  async getAllActions(): Promise<ServiceResponse<string[]>> {
    try {
      const result = await this.permissionRepository
        .createQueryBuilder('permission')
        .select('DISTINCT permission.action', 'action')
        .orderBy('permission.action', 'ASC')
        .getRawMany();

      const actions = result.map((r) => r.action);

      return {
        success: true,
        message: 'Actions retrieved successfully',
        data: actions,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve actions: ${error.message}`);
    }
  }
}
