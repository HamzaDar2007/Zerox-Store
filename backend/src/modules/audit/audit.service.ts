import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { UserActivityLog } from './entities/user-activity-log.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { AuditAction } from '@common/enums';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(UserActivityLog)
    private activityLogRepository: Repository<UserActivityLog>,
  ) {}

  async createAuditLog(dto: any): Promise<ServiceResponse<AuditLog>> {
    const log = new AuditLog();
    Object.assign(log, dto);
    const saved = await this.auditLogRepository.save(log);
    return { success: true, message: 'Audit log created', data: saved };
  }

  async logAction(
    userId: string,
    action: AuditAction,
    entityType: string,
    entityId: string,
    details?: any,
  ): Promise<AuditLog> {
    const log = new AuditLog();
    log.userId = userId;
    log.action = action;
    log.entityType = entityType;
    log.entityId = entityId;
    log.oldValues = details?.oldValues || null;
    log.newValues = details?.newValues || null;
    log.ipAddress = details?.ipAddress || null;
    log.userAgent = details?.userAgent || null;
    return this.auditLogRepository.save(log);
  }

  async findAllAuditLogs(options?: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<AuditLog[]>> {
    const query = this.auditLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.createdAt', 'DESC');
    if (options?.userId)
      query.andWhere('log.userId = :userId', { userId: options.userId });
    if (options?.action)
      query.andWhere('log.action = :action', { action: options.action });
    if (options?.entityType)
      query.andWhere('log.entityType = :entityType', {
        entityType: options.entityType,
      });
    if (options?.entityId)
      query.andWhere('log.entityId = :entityId', {
        entityId: options.entityId,
      });
    if (options?.startDate)
      query.andWhere('log.createdAt >= :startDate', {
        startDate: options.startDate,
      });
    if (options?.endDate)
      query.andWhere('log.createdAt <= :endDate', { endDate: options.endDate });
    const p = options?.page || 1;
    const l = options?.limit || 50;
    query.skip((p - 1) * l).take(l);
    const [logs, total] = await query.getManyAndCount();
    return {
      success: true,
      message: 'Audit logs retrieved',
      data: logs,
      meta: { total, page: p, limit: l },
    };
  }

  async findAuditLog(id: string): Promise<ServiceResponse<AuditLog>> {
    const log = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!log) throw new NotFoundException('Audit log not found');
    return { success: true, message: 'Audit log retrieved', data: log };
  }

  async getEntityHistory(
    entityType: string,
    entityId: string,
  ): Promise<ServiceResponse<AuditLog[]>> {
    const logs = await this.auditLogRepository.find({
      where: { entityType, entityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return { success: true, message: 'Entity history retrieved', data: logs };
  }

  async getUserActivity(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ServiceResponse<AuditLog[]>> {
    const where: any = { userId };
    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(endDate);
    }
    const logs = await this.auditLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
    return { success: true, message: 'User activity retrieved', data: logs };
  }

  async createActivityLog(dto: any): Promise<ServiceResponse<UserActivityLog>> {
    const log = new UserActivityLog();
    Object.assign(log, dto);
    const saved = await this.activityLogRepository.save(log);
    return { success: true, message: 'Activity log created', data: saved };
  }

  async logUserActivity(
    userId: string,
    activityType: string,
    details?: any,
  ): Promise<UserActivityLog> {
    const log = new UserActivityLog();
    log.userId = userId;
    log.activityType = activityType;
    log.metadata = details?.metadata || null;
    log.ipAddress = details?.ipAddress || null;
    log.userAgent = details?.userAgent || null;
    log.sessionId = details?.sessionId || null;
    return this.activityLogRepository.save(log);
  }

  async findAllActivityLogs(options?: {
    userId?: string;
    activityType?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<UserActivityLog[]>> {
    const query = this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.createdAt', 'DESC');
    if (options?.userId)
      query.andWhere('log.userId = :userId', { userId: options.userId });
    if (options?.activityType)
      query.andWhere('log.activityType = :activityType', {
        activityType: options.activityType,
      });
    if (options?.startDate)
      query.andWhere('log.createdAt >= :startDate', {
        startDate: options.startDate,
      });
    if (options?.endDate)
      query.andWhere('log.createdAt <= :endDate', { endDate: options.endDate });
    const p = options?.page || 1;
    const l = options?.limit || 50;
    query.skip((p - 1) * l).take(l);
    const [logs, total] = await query.getManyAndCount();
    return {
      success: true,
      message: 'Activity logs retrieved',
      data: logs,
      meta: { total, page: p, limit: l },
    };
  }

  async getActivitySummary(
    userId: string,
    days = 30,
  ): Promise<ServiceResponse<Record<string, number>>> {
    if (!Number.isFinite(days) || days < 1) days = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const logs = await this.activityLogRepository.find({
      where: { userId, createdAt: MoreThanOrEqual(startDate) },
    });
    const summary: Record<string, number> = {};
    logs.forEach((log) => {
      summary[log.activityType] = (summary[log.activityType] || 0) + 1;
    });
    return {
      success: true,
      message: 'Activity summary retrieved',
      data: summary,
    };
  }

  async cleanupOldLogs(
    daysToKeep = 90,
  ): Promise<
    ServiceResponse<{ auditDeleted: number; activityDeleted: number }>
  > {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const auditResult = await this.auditLogRepository.delete({
      createdAt: LessThanOrEqual(cutoffDate),
    });
    const activityResult = await this.activityLogRepository.delete({
      createdAt: LessThanOrEqual(cutoffDate),
    });
    return {
      success: true,
      message: 'Old logs cleaned up',
      data: {
        auditDeleted: auditResult.affected || 0,
        activityDeleted: activityResult.affected || 0,
      },
    };
  }
}
