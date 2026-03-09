import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { Banner } from './entities/banner.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class CmsService {
  constructor(
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
  ) {}

  async createPage(dto: CreatePageDto): Promise<ServiceResponse<Page>> {
    const page = new Page();
    Object.assign(page, dto);
    const saved = await this.pageRepository.save(page);
    return { success: true, message: 'Page created', data: saved };
  }

  async findAllPages(options?: {
    isPublished?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<Page[]>> {
    const query = this.pageRepository
      .createQueryBuilder('page')
      .orderBy('page.createdAt', 'DESC');
    if (options?.isPublished !== undefined)
      query.andWhere('page.isPublished = :isPublished', {
        isPublished: options.isPublished,
      });
    const p = options?.page || 1;
    const l = options?.limit || 20;
    query.skip((p - 1) * l).take(l);
    const [pages, total] = await query.getManyAndCount();
    return {
      success: true,
      message: 'Pages retrieved',
      data: pages,
      meta: { total, page: p, limit: l },
    };
  }

  async findPage(id: string): Promise<ServiceResponse<Page>> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    return { success: true, message: 'Page retrieved', data: page };
  }

  async findPageBySlug(slug: string): Promise<ServiceResponse<Page>> {
    const page = await this.pageRepository.findOne({
      where: { slug, isPublished: true },
    });
    if (!page) throw new NotFoundException('Page not found');
    return { success: true, message: 'Page retrieved', data: page };
  }

  async updatePage(
    id: string,
    dto: UpdatePageDto,
  ): Promise<ServiceResponse<Page>> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    Object.assign(page, dto);
    const updated = await this.pageRepository.save(page);
    return { success: true, message: 'Page updated', data: updated };
  }

  async deletePage(id: string): Promise<ServiceResponse<void>> {
    const result = await this.pageRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Page not found');
    return { success: true, message: 'Page deleted', data: undefined };
  }

  async publishPage(id: string): Promise<ServiceResponse<Page>> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    page.isPublished = true;
    page.publishedAt = new Date();
    const updated = await this.pageRepository.save(page);
    return { success: true, message: 'Page published', data: updated };
  }

  async unpublishPage(id: string): Promise<ServiceResponse<Page>> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    page.isPublished = false;
    const updated = await this.pageRepository.save(page);
    return { success: true, message: 'Page unpublished', data: updated };
  }

  async createBanner(dto: CreateBannerDto): Promise<ServiceResponse<Banner>> {
    const banner = new Banner();
    Object.assign(banner, dto);
    const saved = await this.bannerRepository.save(banner);
    return { success: true, message: 'Banner created', data: saved };
  }

  async findAllBanners(options?: {
    isActive?: boolean;
    position?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<Banner[]>> {
    const query = this.bannerRepository
      .createQueryBuilder('banner')
      .orderBy('banner.sortOrder', 'ASC');
    if (options?.isActive !== undefined)
      query.andWhere('banner.isActive = :isActive', {
        isActive: options.isActive,
      });
    if (options?.position)
      query.andWhere('banner.position = :position', {
        position: options.position,
      });
    const p = options?.page || 1;
    const l = options?.limit || 50;
    query.skip((p - 1) * l).take(l);
    const [banners, total] = await query.getManyAndCount();
    return {
      success: true,
      message: 'Banners retrieved',
      data: banners,
      meta: { total, page: p, limit: l },
    };
  }

  async findBanner(id: string): Promise<ServiceResponse<Banner>> {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    return { success: true, message: 'Banner retrieved', data: banner };
  }

  async updateBanner(
    id: string,
    dto: UpdateBannerDto,
  ): Promise<ServiceResponse<Banner>> {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    Object.assign(banner, dto);
    const updated = await this.bannerRepository.save(banner);
    return { success: true, message: 'Banner updated', data: updated };
  }

  async deleteBanner(id: string): Promise<ServiceResponse<void>> {
    const result = await this.bannerRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Banner not found');
    return { success: true, message: 'Banner deleted', data: undefined };
  }

  async toggleBannerActive(id: string): Promise<ServiceResponse<Banner>> {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    banner.isActive = !banner.isActive;
    const updated = await this.bannerRepository.save(banner);
    return {
      success: true,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'}`,
      data: updated,
    };
  }

  async getActiveBannersByPosition(
    position: string,
  ): Promise<ServiceResponse<Banner[]>> {
    const now = new Date();
    const banners = await this.bannerRepository
      .createQueryBuilder('banner')
      .where('banner.isActive = true')
      .andWhere('banner.position = :position', { position })
      .andWhere('(banner.startsAt IS NULL OR banner.startsAt <= :now)', { now })
      .andWhere('(banner.endsAt IS NULL OR banner.endsAt >= :now)', { now })
      .orderBy('banner.sortOrder', 'ASC')
      .getMany();
    return {
      success: true,
      message: 'Active banners retrieved',
      data: banners,
    };
  }
}
