import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductQuestion } from './entities/product-question.entity';
import { ProductAnswer } from './entities/product-answer.entity';
import { PriceHistory } from './entities/price-history.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { Seller } from '../sellers/entities/seller.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { ProductStatus } from '@common/enums';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private imageRepository: Repository<ProductImage>,
    @InjectRepository(ProductAttribute)
    private attributeRepository: Repository<ProductAttribute>,
    @InjectRepository(ProductQuestion)
    private questionRepository: Repository<ProductQuestion>,
    @InjectRepository(ProductAnswer)
    private answerRepository: Repository<ProductAnswer>,
    @InjectRepository(PriceHistory)
    private priceHistoryRepository: Repository<PriceHistory>,
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
  ) {}

  // ==================== PRODUCT CRUD ====================

  async create(dto: CreateProductDto, userId: string): Promise<ServiceResponse<Product>> {
    const existingProduct = await this.productRepository.findOne({
      where: { slug: dto.slug },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this slug already exists');
    }

    const product = new Product();
    Object.assign(product, {
      ...dto,
      status: ProductStatus.DRAFT,
    });

    // Use sellerId from DTO if provided (admin flow), otherwise lookup seller by auth userId
    if (!product.sellerId) {
      const seller = await this.sellerRepository.findOne({ where: { userId } });
      if (!seller) {
        throw new BadRequestException('No seller profile found for this user. Please create a seller profile first.');
      }
      product.sellerId = seller.id;
    }

    const savedProduct = await this.productRepository.save(product);

    // Record initial price in history
    if (dto.price) {
      const priceHistory = new PriceHistory();
      Object.assign(priceHistory, {
        productId: savedProduct.id,
        oldPrice: 0,
        newPrice: dto.price,
        changedBy: userId,
      });
      await this.priceHistoryRepository.save(priceHistory);
    }

    return {
      success: true,
      message: 'Product created successfully',
      data: savedProduct,
    };
  }

  async findAll(options?: {
    categoryId?: string;
    brandId?: string;
    sellerId?: string;
    status?: ProductStatus;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<Product[]>> {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.images', 'images');

    if (options?.search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.shortDescription ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options?.categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId: options.categoryId });
    }

    if (options?.brandId) {
      query.andWhere('product.brandId = :brandId', { brandId: options.brandId });
    }

    if (options?.sellerId) {
      query.andWhere('product.sellerId = :sellerId', { sellerId: options.sellerId });
    }

    if (options?.status) {
      query.andWhere('product.status = :status', { status: options.status });
    }

    // Sorting
    const allowedSortFields: Record<string, string> = {
      name: 'product.name',
      price: 'product.price',
      createdAt: 'product.createdAt',
      avgRating: 'product.avgRating',
      totalSold: 'product.totalSold',
    };
    const sortField = allowedSortFields[options?.sortBy || ''] || 'product.createdAt';
    const sortOrder = options?.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    query.orderBy(sortField, sortOrder);

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    const [products, total] = await query.getManyAndCount();

    return {
      success: true,
      message: 'Products retrieved successfully',
      data: products,
      meta: { total, page, limit },
    };
  }

  async findOne(id: string): Promise<ServiceResponse<Product>> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'brand', 'seller', 'images', 'variants', 'attributes'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      success: true,
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  async findBySlug(slug: string): Promise<ServiceResponse<Product>> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['category', 'brand', 'seller', 'images', 'variants'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productRepository.increment({ id: product.id }, 'viewCount', 1);

    return {
      success: true,
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  async update(id: string, dto: UpdateProductDto): Promise<ServiceResponse<Product>> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if price changed for history tracking
    if (dto.price && dto.price !== product.price) {
      const priceHistory = new PriceHistory();
      Object.assign(priceHistory, {
        productId: product.id,
        oldPrice: product.price,
        newPrice: dto.price,
      });
      await this.priceHistoryRepository.save(priceHistory);
    }

    Object.assign(product, dto);
    const updatedProduct = await this.productRepository.save(product);

    return {
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    };
  }

  async remove(id: string): Promise<ServiceResponse<void>> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.softRemove(product);

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }

  async updateStatus(id: string, status: ProductStatus): Promise<ServiceResponse<Product>> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.status = status;

    const updatedProduct = await this.productRepository.save(product);

    return {
      success: true,
      message: `Product ${status.toLowerCase()} successfully`,
      data: updatedProduct,
    };
  }

  // ==================== VARIANTS ====================

  async createVariant(productId: string, dto: CreateProductVariantDto): Promise<ServiceResponse<ProductVariant>> {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const variant = new ProductVariant();
    Object.assign(variant, {
      ...dto,
      productId,
    });

    const savedVariant = await this.variantRepository.save(variant);

    return {
      success: true,
      message: 'Variant created successfully',
      data: savedVariant,
    };
  }

  async findAllVariants(productId: string): Promise<ServiceResponse<ProductVariant[]>> {
    const variants = await this.variantRepository.find({
      where: { productId },
      order: { sortOrder: 'ASC' },
    });

    return {
      success: true,
      message: 'Variants retrieved successfully',
      data: variants,
    };
  }

  async updateVariant(id: string, dto: UpdateProductVariantDto): Promise<ServiceResponse<ProductVariant>> {
    const variant = await this.variantRepository.findOne({ where: { id } });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    Object.assign(variant, dto);
    const updatedVariant = await this.variantRepository.save(variant);

    return {
      success: true,
      message: 'Variant updated successfully',
      data: updatedVariant,
    };
  }

  async removeVariant(id: string): Promise<ServiceResponse<void>> {
    const variant = await this.variantRepository.findOne({ where: { id } });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    await this.variantRepository.remove(variant);

    return {
      success: true,
      message: 'Variant deleted successfully',
    };
  }

  // ==================== IMAGES ====================

  async addImage(productId: string, dto: CreateProductImageDto): Promise<ServiceResponse<ProductImage>> {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const image = new ProductImage();
    Object.assign(image, {
      ...dto,
      productId,
    });

    const savedImage = await this.imageRepository.save(image);

    return {
      success: true,
      message: 'Image added successfully',
      data: savedImage,
    };
  }

  async removeImage(id: string): Promise<ServiceResponse<void>> {
    const image = await this.imageRepository.findOne({ where: { id } });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.imageRepository.remove(image);

    return {
      success: true,
      message: 'Image removed successfully',
    };
  }

  // ==================== Q&A ====================

  async getProductQuestions(productId: string): Promise<ServiceResponse<ProductQuestion[]>> {
    const questions = await this.questionRepository.find({
      where: { productId },
      relations: ['answers', 'user'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Questions retrieved successfully',
      data: questions,
    };
  }

  async askQuestion(productId: string, userId: string, question: string): Promise<ServiceResponse<ProductQuestion>> {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const productQuestion = new ProductQuestion();
    Object.assign(productQuestion, {
      productId,
      userId,
      questionText: question,
    });

    const savedQuestion = await this.questionRepository.save(productQuestion);

    return {
      success: true,
      message: 'Question submitted successfully',
      data: savedQuestion,
    };
  }

  async answerQuestion(questionId: string, userId: string, answer: string, isSellerAnswer: boolean = false): Promise<ServiceResponse<ProductAnswer>> {
    const question = await this.questionRepository.findOne({ where: { id: questionId } });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const productAnswer = new ProductAnswer();
    Object.assign(productAnswer, {
      questionId,
      userId,
      answerText: answer,
      isSellerAnswer,
    });

    const savedAnswer = await this.answerRepository.save(productAnswer);

    return {
      success: true,
      message: 'Answer submitted successfully',
      data: savedAnswer,
    };
  }

  // ==================== PRICE HISTORY ====================

  async getPriceHistory(productId: string): Promise<ServiceResponse<PriceHistory[]>> {
    const history = await this.priceHistoryRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Price history retrieved successfully',
      data: history,
    };
  }
}
