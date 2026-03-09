import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeoMetadata } from './entities/seo-metadata.entity';
import { UrlRedirect } from './entities/url-redirect.entity';
import { CreateSeoMetadataDto } from './dto/create-seo-metadata.dto';
import { UpdateSeoMetadataDto } from './dto/update-seo-metadata.dto';
import { CreateUrlRedirectDto } from './dto/create-url-redirect.dto';
import { UpdateUrlRedirectDto } from './dto/update-url-redirect.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';

@Injectable()
export class SeoService {
  constructor(
    @InjectRepository(SeoMetadata)
    private seoMetadataRepository: Repository<SeoMetadata>,
    @InjectRepository(UrlRedirect)
    private urlRedirectRepository: Repository<UrlRedirect>,
  ) {}

  async createMetadata(
    dto: CreateSeoMetadataDto,
  ): Promise<ServiceResponse<SeoMetadata>> {
    const metadata = new SeoMetadata();
    Object.assign(metadata, dto);
    const saved = await this.seoMetadataRepository.save(metadata);
    return { success: true, message: 'SEO metadata created', data: saved };
  }

  async findAllMetadata(options?: {
    entityType?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<SeoMetadata[]>> {
    const query = this.seoMetadataRepository
      .createQueryBuilder('seo')
      .orderBy('seo.createdAt', 'DESC');
    if (options?.entityType)
      query.andWhere('seo.entityType = :entityType', {
        entityType: options.entityType,
      });
    const p = options?.page || 1;
    const l = options?.limit || 20;
    query.skip((p - 1) * l).take(l);
    const [metadata, total] = await query.getManyAndCount();
    return {
      success: true,
      message: 'SEO metadata retrieved',
      data: metadata,
      meta: { total, page: p, limit: l },
    };
  }

  async findMetadata(id: string): Promise<ServiceResponse<SeoMetadata>> {
    const metadata = await this.seoMetadataRepository.findOne({
      where: { id },
    });
    if (!metadata) throw new NotFoundException('SEO metadata not found');
    return { success: true, message: 'SEO metadata retrieved', data: metadata };
  }

  async findMetadataByEntity(
    entityType: string,
    entityId: string,
  ): Promise<ServiceResponse<SeoMetadata>> {
    const metadata = await this.seoMetadataRepository.findOne({
      where: { entityType, entityId },
    });
    if (!metadata) throw new NotFoundException('SEO metadata not found');
    return { success: true, message: 'SEO metadata retrieved', data: metadata };
  }

  async findMetadataByUrl(
    canonicalUrl: string,
  ): Promise<ServiceResponse<SeoMetadata>> {
    const metadata = await this.seoMetadataRepository.findOne({
      where: { canonicalUrl },
    });
    if (!metadata) throw new NotFoundException('SEO metadata not found');
    return { success: true, message: 'SEO metadata retrieved', data: metadata };
  }

  async updateMetadata(
    id: string,
    dto: UpdateSeoMetadataDto,
  ): Promise<ServiceResponse<SeoMetadata>> {
    const metadata = await this.seoMetadataRepository.findOne({
      where: { id },
    });
    if (!metadata) throw new NotFoundException('SEO metadata not found');
    Object.assign(metadata, dto);
    const updated = await this.seoMetadataRepository.save(metadata);
    return { success: true, message: 'SEO metadata updated', data: updated };
  }

  async deleteMetadata(id: string): Promise<ServiceResponse<void>> {
    const result = await this.seoMetadataRepository.delete(id);
    if (!result.affected) throw new NotFoundException('SEO metadata not found');
    return { success: true, message: 'SEO metadata deleted', data: undefined };
  }

  async upsertMetadata(
    entityType: string,
    entityId: string,
    dto: UpdateSeoMetadataDto,
  ): Promise<ServiceResponse<SeoMetadata>> {
    let metadata = await this.seoMetadataRepository.findOne({
      where: { entityType, entityId },
    });
    if (metadata) {
      Object.assign(metadata, dto);
    } else {
      metadata = new SeoMetadata();
      Object.assign(metadata, { ...dto, entityType, entityId });
    }
    const saved = await this.seoMetadataRepository.save(metadata);
    return { success: true, message: 'SEO metadata saved', data: saved };
  }

  async createRedirect(
    dto: CreateUrlRedirectDto,
  ): Promise<ServiceResponse<UrlRedirect>> {
    const redirect = new UrlRedirect();
    Object.assign(redirect, dto);
    const saved = await this.urlRedirectRepository.save(redirect);
    return { success: true, message: 'URL redirect created', data: saved };
  }

  async findAllRedirects(options?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<UrlRedirect[]>> {
    const query = this.urlRedirectRepository
      .createQueryBuilder('redirect')
      .orderBy('redirect.createdAt', 'DESC');
    if (options?.isActive !== undefined)
      query.andWhere('redirect.isActive = :isActive', {
        isActive: options.isActive,
      });
    const p = options?.page || 1;
    const l = options?.limit || 50;
    query.skip((p - 1) * l).take(l);
    const [redirects, total] = await query.getManyAndCount();
    return {
      success: true,
      message: 'URL redirects retrieved',
      data: redirects,
      meta: { total, page: p, limit: l },
    };
  }

  async findRedirect(id: string): Promise<ServiceResponse<UrlRedirect>> {
    const redirect = await this.urlRedirectRepository.findOne({
      where: { id },
    });
    if (!redirect) throw new NotFoundException('URL redirect not found');
    return { success: true, message: 'URL redirect retrieved', data: redirect };
  }

  async findRedirectBySource(
    sourceUrl: string,
  ): Promise<ServiceResponse<UrlRedirect>> {
    const redirect = await this.urlRedirectRepository.findOne({
      where: { sourceUrl, isActive: true },
    });
    if (!redirect) throw new NotFoundException('URL redirect not found');
    redirect.hitCount = (redirect.hitCount || 0) + 1;
    redirect.lastHitAt = new Date();
    await this.urlRedirectRepository.save(redirect);
    return { success: true, message: 'URL redirect found', data: redirect };
  }

  async updateRedirect(
    id: string,
    dto: UpdateUrlRedirectDto,
  ): Promise<ServiceResponse<UrlRedirect>> {
    const redirect = await this.urlRedirectRepository.findOne({
      where: { id },
    });
    if (!redirect) throw new NotFoundException('URL redirect not found');
    Object.assign(redirect, dto);
    const updated = await this.urlRedirectRepository.save(redirect);
    return { success: true, message: 'URL redirect updated', data: updated };
  }

  async deleteRedirect(id: string): Promise<ServiceResponse<void>> {
    const result = await this.urlRedirectRepository.delete(id);
    if (!result.affected) throw new NotFoundException('URL redirect not found');
    return { success: true, message: 'URL redirect deleted', data: undefined };
  }

  async toggleRedirectActive(
    id: string,
  ): Promise<ServiceResponse<UrlRedirect>> {
    const redirect = await this.urlRedirectRepository.findOne({
      where: { id },
    });
    if (!redirect) throw new NotFoundException('URL redirect not found');
    redirect.isActive = !redirect.isActive;
    const updated = await this.urlRedirectRepository.save(redirect);
    return {
      success: true,
      message: `Redirect ${redirect.isActive ? 'activated' : 'deactivated'}`,
      data: updated,
    };
  }

  async bulkCreateRedirects(
    redirects: CreateUrlRedirectDto[],
  ): Promise<ServiceResponse<UrlRedirect[]>> {
    const entities = redirects.map((r) => {
      const redirect = new UrlRedirect();
      Object.assign(redirect, r);
      return redirect;
    });
    const saved = await this.urlRedirectRepository.save(entities);
    return {
      success: true,
      message: `${saved.length} redirects created`,
      data: saved,
    };
  }
}
