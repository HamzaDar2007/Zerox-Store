import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BulkOperation } from './entities/bulk-operation.entity';
import { ImportExportJob } from './entities/import-export-job.entity';
import { CreateBulkOperationDto } from './dto/create-bulk-operation.dto';
import { CreateImportExportJobDto } from './dto/create-import-export-job.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { JobStatus } from '@common/enums';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(BulkOperation)
    private bulkOperationRepository: Repository<BulkOperation>,
    @InjectRepository(ImportExportJob)
    private importExportJobRepository: Repository<ImportExportJob>,
  ) {}

  async createBulkOperation(
    userId: string,
    dto: CreateBulkOperationDto,
  ): Promise<ServiceResponse<BulkOperation>> {
    const operation = new BulkOperation();
    Object.assign(operation, dto);
    operation.userId = userId;
    operation.status = JobStatus.PENDING;
    operation.successCount = 0;
    operation.failureCount = 0;
    const saved = await this.bulkOperationRepository.save(operation);
    return { success: true, message: 'Bulk operation created', data: saved };
  }

  async findAllBulkOperations(options?: {
    userId?: string;
    status?: string;
    operationType?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<BulkOperation[]>> {
    const query = this.bulkOperationRepository
      .createQueryBuilder('op')
      .leftJoinAndSelect('op.user', 'user')
      .orderBy('op.createdAt', 'DESC');
    if (options?.userId)
      query.andWhere('op.userId = :userId', { userId: options.userId });
    if (options?.status)
      query.andWhere('op.status = :status', { status: options.status });
    if (options?.operationType)
      query.andWhere('op.operationType = :operationType', {
        operationType: options.operationType,
      });
    const p = options?.page || 1;
    const l = options?.limit || 20;
    query.skip((p - 1) * l).take(l);
    const [operations, total] = await query.getManyAndCount();
    return {
      success: true,
      message: 'Bulk operations retrieved',
      data: operations,
      meta: { total, page: p, limit: l },
    };
  }

  async findBulkOperation(id: string): Promise<ServiceResponse<BulkOperation>> {
    const operation = await this.bulkOperationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!operation) throw new NotFoundException('Bulk operation not found');
    return {
      success: true,
      message: 'Bulk operation retrieved',
      data: operation,
    };
  }

  async updateBulkOperationProgress(
    id: string,
    successCount: number,
    failureCount: number,
  ): Promise<ServiceResponse<BulkOperation>> {
    const operation = await this.bulkOperationRepository.findOne({
      where: { id },
    });
    if (!operation) throw new NotFoundException('Bulk operation not found');
    operation.successCount = successCount;
    operation.failureCount = failureCount;
    const processed = successCount + failureCount;
    if (processed >= operation.totalCount) {
      operation.status = JobStatus.COMPLETED;
      operation.completedAt = new Date();
    } else if (processed > 0 && operation.status === JobStatus.PENDING) {
      operation.status = JobStatus.PROCESSING;
      operation.startedAt = new Date();
    }
    const updated = await this.bulkOperationRepository.save(operation);
    return { success: true, message: 'Progress updated', data: updated };
  }

  async failBulkOperation(
    id: string,
    errorLog: Record<string, any>[],
  ): Promise<ServiceResponse<BulkOperation>> {
    const operation = await this.bulkOperationRepository.findOne({
      where: { id },
    });
    if (!operation) throw new NotFoundException('Bulk operation not found');
    operation.status = JobStatus.FAILED;
    operation.errorLog = errorLog;
    operation.completedAt = new Date();
    const updated = await this.bulkOperationRepository.save(operation);
    return {
      success: true,
      message: 'Operation marked as failed',
      data: updated,
    };
  }

  async cancelBulkOperation(
    id: string,
  ): Promise<ServiceResponse<BulkOperation>> {
    const operation = await this.bulkOperationRepository.findOne({
      where: { id },
    });
    if (!operation) throw new NotFoundException('Bulk operation not found');
    if (
      operation.status === JobStatus.COMPLETED ||
      operation.status === JobStatus.FAILED
    ) {
      throw new BadRequestException(
        'Cannot cancel completed or failed operation',
      );
    }
    operation.status = JobStatus.CANCELLED;
    operation.completedAt = new Date();
    const updated = await this.bulkOperationRepository.save(operation);
    return { success: true, message: 'Operation cancelled', data: updated };
  }

  async createImportExportJob(
    userId: string,
    dto: CreateImportExportJobDto,
  ): Promise<ServiceResponse<ImportExportJob>> {
    const job = new ImportExportJob();
    Object.assign(job, dto);
    job.userId = userId;
    job.status = JobStatus.PENDING;
    job.totalRows = dto.totalRows || 0;
    job.processedRows = 0;
    job.successRows = 0;
    job.failedRows = 0;
    const saved = await this.importExportJobRepository.save(job);
    return { success: true, message: 'Import/export job created', data: saved };
  }

  async findAllImportExportJobs(options?: {
    userId?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<ImportExportJob[]>> {
    const query = this.importExportJobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.user', 'user')
      .orderBy('job.createdAt', 'DESC');
    if (options?.userId)
      query.andWhere('job.userId = :userId', { userId: options.userId });
    if (options?.type)
      query.andWhere('job.type = :type', { type: options.type });
    if (options?.status)
      query.andWhere('job.status = :status', { status: options.status });
    const p = options?.page || 1;
    const l = options?.limit || 20;
    query.skip((p - 1) * l).take(l);
    const [jobs, total] = await query.getManyAndCount();
    return {
      success: true,
      message: 'Import/export jobs retrieved',
      data: jobs,
      meta: { total, page: p, limit: l },
    };
  }

  async findImportExportJob(
    id: string,
  ): Promise<ServiceResponse<ImportExportJob>> {
    const job = await this.importExportJobRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!job) throw new NotFoundException('Import/export job not found');
    return { success: true, message: 'Import/export job retrieved', data: job };
  }

  async updateJobProgress(
    id: string,
    processedRows: number,
    successRows: number,
    failedRows: number,
  ): Promise<ServiceResponse<ImportExportJob>> {
    const job = await this.importExportJobRepository.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Import/export job not found');
    job.processedRows = processedRows;
    job.successRows = successRows;
    job.failedRows = failedRows;
    if (job.totalRows > 0 && processedRows >= job.totalRows) {
      job.status = JobStatus.COMPLETED;
      job.completedAt = new Date();
    } else if (processedRows > 0 && job.status === JobStatus.PENDING) {
      job.status = JobStatus.PROCESSING;
      job.startedAt = new Date();
    }
    const updated = await this.importExportJobRepository.save(job);
    return { success: true, message: 'Progress updated', data: updated };
  }

  async failJob(
    id: string,
    errorSummary: string,
    errorLog?: Record<string, any>[],
  ): Promise<ServiceResponse<ImportExportJob>> {
    const job = await this.importExportJobRepository.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Import/export job not found');
    job.status = JobStatus.FAILED;
    job.errorSummary = errorSummary;
    job.errorLog = errorLog || null;
    job.completedAt = new Date();
    const updated = await this.importExportJobRepository.save(job);
    return { success: true, message: 'Job marked as failed', data: updated };
  }

  async completeJob(
    id: string,
    resultFileUrl?: string,
  ): Promise<ServiceResponse<ImportExportJob>> {
    const job = await this.importExportJobRepository.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Import/export job not found');
    job.status = JobStatus.COMPLETED;
    job.completedAt = new Date();
    if (resultFileUrl) job.resultFileUrl = resultFileUrl;
    const updated = await this.importExportJobRepository.save(job);
    return { success: true, message: 'Job completed', data: updated };
  }

  async getMyJobs(
    userId: string,
    type?: string,
  ): Promise<ServiceResponse<ImportExportJob[]>> {
    const where: any = { userId };
    if (type) where.type = type;
    const jobs = await this.importExportJobRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return { success: true, message: 'Jobs retrieved', data: jobs };
  }
}
