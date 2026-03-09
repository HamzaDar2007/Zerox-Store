import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductBundle } from './entities/product-bundle.entity';
import { BundleItem } from './entities/bundle-item.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { CreateProductBundleDto } from './dto/create-product-bundle.dto';
import { UpdateProductBundleDto } from './dto/update-product-bundle.dto';

@Injectable()
export class BundlesService {
  constructor(
    @InjectRepository(ProductBundle)
    private bundleRepository: Repository<ProductBundle>,
    @InjectRepository(BundleItem)
    private itemRepository: Repository<BundleItem>,
  ) {}

  async create(
    dto: CreateProductBundleDto,
  ): Promise<ServiceResponse<ProductBundle>> {
    const bundle = new ProductBundle();
    Object.assign(bundle, dto);
    const saved = await this.bundleRepository.save(bundle);
    return { success: true, message: 'Bundle created', data: saved };
  }

  async findAll(options?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<ProductBundle[]>> {
    const query = this.bundleRepository
      .createQueryBuilder('bundle')
      .leftJoinAndSelect('bundle.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .orderBy('bundle.createdAt', 'DESC');
    if (options?.isActive !== undefined)
      query.andWhere('bundle.isActive = :isActive', {
        isActive: options.isActive,
      });
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);
    const [bundles, total] = await query.getManyAndCount();
    return {
      success: true,
      message: 'Bundles retrieved',
      data: bundles,
      meta: { total, page, limit },
    };
  }

  async findOne(id: string): Promise<ServiceResponse<ProductBundle>> {
    const bundle = await this.bundleRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'items.variant'],
    });
    if (!bundle) throw new NotFoundException('Bundle not found');
    return { success: true, message: 'Bundle retrieved', data: bundle };
  }

  async findBySlug(slug: string): Promise<ServiceResponse<ProductBundle>> {
    const bundle = await this.bundleRepository.findOne({
      where: { slug },
      relations: ['items', 'items.product', 'items.variant'],
    });
    if (!bundle) throw new NotFoundException('Bundle not found');
    return { success: true, message: 'Bundle retrieved', data: bundle };
  }

  async update(
    id: string,
    dto: UpdateProductBundleDto,
  ): Promise<ServiceResponse<ProductBundle>> {
    const bundle = await this.bundleRepository.findOne({ where: { id } });
    if (!bundle) throw new NotFoundException('Bundle not found');
    Object.assign(bundle, dto);
    const updated = await this.bundleRepository.save(bundle);
    return { success: true, message: 'Bundle updated', data: updated };
  }

  async delete(id: string): Promise<ServiceResponse<void>> {
    const result = await this.bundleRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Bundle not found');
    return { success: true, message: 'Bundle deleted', data: undefined };
  }

  async addItem(
    bundleId: string,
    dto: { productId: string; variantId?: string; quantity?: number },
  ): Promise<ServiceResponse<BundleItem>> {
    const bundle = await this.bundleRepository.findOne({
      where: { id: bundleId },
    });
    if (!bundle) throw new NotFoundException('Bundle not found');
    const item = new BundleItem();
    item.bundleId = bundleId;
    item.productId = dto.productId;
    item.variantId = dto.variantId || null;
    item.quantity = dto.quantity || 1;
    const saved = await this.itemRepository.save(item);
    await this.recalculateBundlePrice(bundleId);
    return { success: true, message: 'Item added to bundle', data: saved };
  }

  async updateItem(
    bundleId: string,
    itemId: string,
    dto: Partial<{
      productId: string;
      variantId: string;
      quantity: number;
      sortOrder: number;
    }>,
  ): Promise<ServiceResponse<BundleItem>> {
    const item = await this.itemRepository.findOne({
      where: { id: itemId, bundleId },
    });
    if (!item) throw new NotFoundException('Bundle item not found');
    Object.assign(item, dto);
    const updated = await this.itemRepository.save(item);
    await this.recalculateBundlePrice(bundleId);
    return { success: true, message: 'Bundle item updated', data: updated };
  }

  async removeItem(
    bundleId: string,
    itemId: string,
  ): Promise<ServiceResponse<void>> {
    const result = await this.itemRepository.delete({ id: itemId, bundleId });
    if (!result.affected) throw new NotFoundException('Bundle item not found');
    await this.recalculateBundlePrice(bundleId);
    return {
      success: true,
      message: 'Item removed from bundle',
      data: undefined,
    };
  }

  async getItems(bundleId: string): Promise<ServiceResponse<BundleItem[]>> {
    const items = await this.itemRepository.find({
      where: { bundleId },
      relations: ['product', 'variant'],
    });
    return { success: true, message: 'Bundle items retrieved', data: items };
  }

  async calculateBundlePrice(bundleId: string): Promise<
    ServiceResponse<{
      originalPrice: number;
      bundlePrice: number;
      savings: number;
    }>
  > {
    const bundle = await this.bundleRepository.findOne({
      where: { id: bundleId },
      relations: ['items', 'items.product'],
    });
    if (!bundle) throw new NotFoundException('Bundle not found');
    const originalPrice = bundle.items.reduce(
      (sum, item) => sum + Number(item.product?.price || 0) * item.quantity,
      0,
    );
    const bundlePrice =
      Number(bundle.bundlePrice) ||
      originalPrice - (originalPrice * Number(bundle.discountValue || 0)) / 100;
    return {
      success: true,
      message: 'Price calculated',
      data: {
        originalPrice,
        bundlePrice,
        savings: originalPrice - bundlePrice,
      },
    };
  }

  private async recalculateBundlePrice(bundleId: string): Promise<void> {
    const bundle = await this.bundleRepository.findOne({
      where: { id: bundleId },
      relations: ['items', 'items.product'],
    });
    if (!bundle) return;
    const originalPrice = bundle.items.reduce(
      (sum, item) => sum + Number(item.product?.price || 0) * item.quantity,
      0,
    );
    bundle.originalTotalPrice = originalPrice;
    if (bundle.discountValue && !bundle.bundlePrice) {
      bundle.bundlePrice =
        originalPrice - (originalPrice * Number(bundle.discountValue)) / 100;
    }
    await this.bundleRepository.save(bundle);
  }

  async toggleActive(id: string): Promise<ServiceResponse<ProductBundle>> {
    const bundle = await this.bundleRepository.findOne({ where: { id } });
    if (!bundle) throw new NotFoundException('Bundle not found');
    bundle.isActive = !bundle.isActive;
    const updated = await this.bundleRepository.save(bundle);
    return {
      success: true,
      message: `Bundle ${bundle.isActive ? 'activated' : 'deactivated'}`,
      data: updated,
    };
  }
}
