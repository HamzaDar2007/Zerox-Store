import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { AttributeKey } from './entities/attribute-key.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { VariantAttributeValue } from './entities/variant-attribute-value.entity';
import { ProductCategory } from './entities/product-category.entity';
import { enforceOwnerOrAdmin } from '../../common/guards/ownership.helper';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductImage) private imageRepo: Repository<ProductImage>,
    @InjectRepository(AttributeKey)
    private attrKeyRepo: Repository<AttributeKey>,
    @InjectRepository(AttributeValue)
    private attrValueRepo: Repository<AttributeValue>,
    @InjectRepository(VariantAttributeValue)
    private variantAttrRepo: Repository<VariantAttributeValue>,
    @InjectRepository(ProductCategory)
    private prodCatRepo: Repository<ProductCategory>,
  ) {}

  async create(
    dto: Partial<Product>,
    callerId?: string,
    callerRole?: string,
  ): Promise<Product> {
    if (callerId && dto.storeId) {
      const store = (await this.productRepo.manager.findOne('Store', {
        where: { id: dto.storeId },
        relations: ['seller'],
      })) as any;
      if (!store) throw new NotFoundException('Store not found');
      if (store.seller)
        enforceOwnerOrAdmin(callerId, callerRole, store.seller.userId);
    }
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    storeId?: string;
    categoryId?: string;
    search?: string;
  }): Promise<{ data: Product[]; total: number }> {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.store', 'store')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.brand', 'brand');
    if (options?.storeId)
      qb.andWhere('p.storeId = :storeId', { storeId: options.storeId });
    if (options?.categoryId)
      qb.andWhere('p.categoryId = :categoryId', {
        categoryId: options.categoryId,
      });
    if (options?.search)
      qb.andWhere('p.name ILIKE :s OR p.slug ILIKE :s', {
        s: `%${options.search}%`,
      });
    const pg = options?.page || 1;
    const lm = options?.limit || 20;
    qb.skip((pg - 1) * lm)
      .take(lm)
      .orderBy('p.name', 'ASC');
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Product> {
    const p = await this.productRepo.findOne({
      where: { id },
      relations: ['store', 'category', 'brand'],
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async findBySlug(slug: string): Promise<Product> {
    const p = await this.productRepo.findOne({
      where: { slug },
      relations: ['store', 'category', 'brand'],
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async update(
    id: string,
    dto: Partial<Product>,
    callerId?: string,
    callerRole?: string,
  ): Promise<Product> {
    const p = await this.productRepo.findOne({
      where: { id },
      relations: ['store', 'store.seller'],
    });
    if (!p) throw new NotFoundException('Product not found');
    if (callerId && p.store?.seller)
      enforceOwnerOrAdmin(callerId, callerRole, (p.store.seller as any).userId);
    Object.assign(p, dto);
    return this.productRepo.save(p);
  }

  async remove(
    id: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<void> {
    const p = await this.productRepo.findOne({
      where: { id },
      relations: ['store', 'store.seller'],
    });
    if (!p) throw new NotFoundException('Product not found');
    if (callerId && p.store?.seller)
      enforceOwnerOrAdmin(callerId, callerRole, (p.store.seller as any).userId);
    await this.productRepo.remove(p);
  }

  async createVariant(
    dto: Partial<ProductVariant>,
    callerId?: string,
    callerRole?: string,
  ): Promise<ProductVariant> {
    if (callerId && dto.productId) {
      const p = await this.productRepo.findOne({
        where: { id: dto.productId },
        relations: ['store', 'store.seller'],
      });
      if (p?.store?.seller)
        enforceOwnerOrAdmin(
          callerId,
          callerRole,
          (p.store.seller as any).userId,
        );
    }
    const v = this.variantRepo.create(dto);
    return this.variantRepo.save(v);
  }

  async findVariants(productId: string): Promise<ProductVariant[]> {
    return this.variantRepo.find({ where: { productId } });
  }

  async updateVariant(
    id: string,
    dto: Partial<ProductVariant>,
    callerId?: string,
    callerRole?: string,
  ): Promise<ProductVariant> {
    const v = await this.variantRepo.findOne({
      where: { id },
      relations: ['product', 'product.store', 'product.store.seller'],
    });
    if (!v) throw new NotFoundException('Variant not found');
    if (callerId && v.product?.store?.seller)
      enforceOwnerOrAdmin(
        callerId,
        callerRole,
        (v.product.store.seller as any).userId,
      );
    Object.assign(v, dto);
    return this.variantRepo.save(v);
  }

  async removeVariant(
    id: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<void> {
    const v = await this.variantRepo.findOne({
      where: { id },
      relations: ['product', 'product.store', 'product.store.seller'],
    });
    if (!v) throw new NotFoundException('Variant not found');
    if (callerId && v.product?.store?.seller)
      enforceOwnerOrAdmin(
        callerId,
        callerRole,
        (v.product.store.seller as any).userId,
      );
    await this.variantRepo.remove(v);
  }

  async createImage(
    dto: Partial<ProductImage>,
    callerId?: string,
    callerRole?: string,
  ): Promise<ProductImage> {
    if (callerId && dto.productId) {
      const p = await this.productRepo.findOne({
        where: { id: dto.productId },
        relations: ['store', 'store.seller'],
      });
      if (p?.store?.seller)
        enforceOwnerOrAdmin(
          callerId,
          callerRole,
          (p.store.seller as any).userId,
        );
    }
    const img = this.imageRepo.create(dto);
    return this.imageRepo.save(img);
  }

  async findImages(productId: string): Promise<ProductImage[]> {
    return this.imageRepo.find({
      where: { productId },
      order: { sortOrder: 'ASC' },
    });
  }

  async removeImage(
    id: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<void> {
    const img = await this.imageRepo.findOne({
      where: { id },
      relations: ['product', 'product.store', 'product.store.seller'],
    });
    if (!img) throw new NotFoundException('Image not found');
    if (callerId && img.product?.store?.seller)
      enforceOwnerOrAdmin(
        callerId,
        callerRole,
        (img.product.store.seller as any).userId,
      );
    await this.imageRepo.remove(img);
  }

  async updateImage(
    id: string,
    dto: Partial<ProductImage>,
    callerId?: string,
    callerRole?: string,
  ): Promise<ProductImage> {
    const img = await this.imageRepo.findOne({
      where: { id },
      relations: ['product', 'product.store', 'product.store.seller'],
    });
    if (!img) throw new NotFoundException('Image not found');
    if (callerId && img.product?.store?.seller)
      enforceOwnerOrAdmin(
        callerId,
        callerRole,
        (img.product.store.seller as any).userId,
      );
    Object.assign(img, dto);
    return this.imageRepo.save(img);
  }

  // ─── Attribute Keys ────────────────────────────────────────────────────

  async createAttributeKey(dto: Partial<AttributeKey>): Promise<AttributeKey> {
    const key = this.attrKeyRepo.create(dto);
    return this.attrKeyRepo.save(key);
  }

  async findAllAttributeKeys(): Promise<AttributeKey[]> {
    return this.attrKeyRepo.find({ order: { name: 'ASC' } });
  }

  async findAttributeKey(id: string): Promise<AttributeKey> {
    const k = await this.attrKeyRepo.findOne({ where: { id } });
    if (!k) throw new NotFoundException('Attribute key not found');
    return k;
  }

  async updateAttributeKey(
    id: string,
    dto: Partial<AttributeKey>,
  ): Promise<AttributeKey> {
    const k = await this.findAttributeKey(id);
    Object.assign(k, dto);
    return this.attrKeyRepo.save(k);
  }

  async removeAttributeKey(id: string): Promise<void> {
    const k = await this.findAttributeKey(id);
    await this.attrKeyRepo.remove(k);
  }

  // ─── Attribute Values ──────────────────────────────────────────────────

  async createAttributeValue(
    dto: Partial<AttributeValue>,
  ): Promise<AttributeValue> {
    const v = this.attrValueRepo.create(dto);
    return this.attrValueRepo.save(v);
  }

  async findAttributeValues(attributeKeyId: string): Promise<AttributeValue[]> {
    return this.attrValueRepo.find({
      where: { attributeKeyId },
      order: { sortOrder: 'ASC' },
    });
  }

  async removeAttributeValue(id: string): Promise<void> {
    const v = await this.attrValueRepo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Attribute value not found');
    await this.attrValueRepo.remove(v);
  }

  // ─── Variant Attribute Values ──────────────────────────────────────────

  async assignVariantAttribute(
    dto: Partial<VariantAttributeValue>,
  ): Promise<VariantAttributeValue> {
    const va = this.variantAttrRepo.create(dto);
    return this.variantAttrRepo.save(va);
  }

  async findVariantAttributes(
    variantId: string,
  ): Promise<VariantAttributeValue[]> {
    return this.variantAttrRepo.find({
      where: { variantId },
      relations: ['attributeKey', 'attributeValue'],
    });
  }

  async removeVariantAttribute(
    variantId: string,
    attributeKeyId: string,
  ): Promise<void> {
    await this.variantAttrRepo.delete({ variantId, attributeKeyId });
  }

  // ─── Product Categories ────────────────────────────────────────────────

  async addProductCategory(
    productId: string,
    categoryId: string,
  ): Promise<ProductCategory> {
    const pc = this.prodCatRepo.create({ productId, categoryId });
    return this.prodCatRepo.save(pc);
  }

  async findProductCategories(productId: string): Promise<ProductCategory[]> {
    return this.prodCatRepo.find({
      where: { productId },
      relations: ['category'],
    });
  }

  async removeProductCategory(
    productId: string,
    categoryId: string,
  ): Promise<void> {
    await this.prodCatRepo.delete({ productId, categoryId });
  }
}
