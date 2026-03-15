import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission) private permRepo: Repository<Permission>,
  ) {}

  async create(dto: Partial<Permission>): Promise<Permission> {
    const existing = await this.permRepo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Permission code already exists');
    const perm = this.permRepo.create(dto);
    return this.permRepo.save(perm);
  }

  async findAll(page = 1, limit = 100): Promise<Permission[]> {
    return this.permRepo.find({
      order: { module: 'ASC', code: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findOne(id: string): Promise<Permission> {
    const perm = await this.permRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException('Permission not found');
    return perm;
  }

  async findByModule(mod: string): Promise<Permission[]> {
    return this.permRepo.find({ where: { module: mod } });
  }

  async update(id: string, dto: Partial<Permission>): Promise<Permission> {
    const perm = await this.findOne(id);
    Object.assign(perm, dto);
    return this.permRepo.save(perm);
  }

  async remove(id: string): Promise<void> {
    const perm = await this.findOne(id);
    await this.permRepo.remove(perm);
  }
}
