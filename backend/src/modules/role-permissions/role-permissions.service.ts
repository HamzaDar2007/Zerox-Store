import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from './entities/role-permission.entity';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private rpRepo: Repository<RolePermission>,
  ) {}

  async assign(
    roleId: string,
    permissionIds: string[],
  ): Promise<RolePermission[]> {
    const entities = permissionIds.map((pid) =>
      this.rpRepo.create({ roleId, permissionId: pid }),
    );
    return this.rpRepo.save(entities);
  }

  async findByRole(roleId: string): Promise<RolePermission[]> {
    return this.rpRepo.find({ where: { roleId }, relations: ['permission'] });
  }

  async remove(roleId: string, permissionId: string): Promise<void> {
    await this.rpRepo.delete({ roleId, permissionId });
  }

  async removeAllForRole(roleId: string): Promise<void> {
    await this.rpRepo.delete({ roleId });
  }
}
