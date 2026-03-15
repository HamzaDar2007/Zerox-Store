import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditLogRepo: Repository<AuditLog>,
  ) {}

  async create(dto: Partial<AuditLog>): Promise<AuditLog> {
    const log = this.auditLogRepo.create(dto);
    return this.auditLogRepo.save(log);
  }

  async findAll(options?: {
    actorId?: string;
    action?: string;
    tableName?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AuditLog[]; total: number }> {
    const qb = this.auditLogRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.actor', 'actor')
      .orderBy('log.occurredAt', 'DESC');
    if (options?.actorId)
      qb.andWhere('log.actorId = :actorId', { actorId: options.actorId });
    if (options?.action)
      qb.andWhere('log.action = :action', { action: options.action });
    if (options?.tableName)
      qb.andWhere('log.tableName = :tableName', {
        tableName: options.tableName,
      });
    const pg = options?.page || 1;
    const lm = options?.limit || 50;
    qb.skip((pg - 1) * lm).take(lm);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<AuditLog> {
    const log = await this.auditLogRepo.findOne({
      where: { id },
      relations: ['actor'],
    });
    if (!log) throw new NotFoundException('Audit log not found');
    return log;
  }

  async findByEntity(tableName: string, recordId: string): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: { tableName, recordId },
      relations: ['actor'],
      order: { occurredAt: 'DESC' },
    });
  }
}
