import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { enforceOwnerOrAdmin } from '../../common/guards/ownership.helper';
import { MailService } from '../../common/modules/mail/mail.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    private mailService: MailService,
  ) {}

  async create(dto: Partial<Review>): Promise<Review> {
    const review = this.reviewRepo.create(dto);
    const saved = await this.reviewRepo.save(review);
    // Send review confirmation email
    if (dto.userId && dto.productId) {
      const full = await this.reviewRepo.findOne({
        where: { id: saved.id },
        relations: ['user', 'product'],
      });
      if (full?.user?.email) {
        this.mailService
          .sendReviewStatusEmail(
            full.user.email,
            full.user.firstName || 'Customer',
            full.product?.name || 'Product',
            'submitted',
          )
          .catch(() => {});
      }
    }
    return saved;
  }

  async findAll(options?: {
    productId?: string;
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Review[]> {
    const where: any = {};
    if (options?.productId) where.productId = options.productId;
    if (options?.userId) where.userId = options.userId;
    if (options?.status) where.status = options.status;
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    return this.reviewRepo.find({
      where,
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['product', 'user'],
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(
    id: string,
    dto: Partial<Review>,
    callerId?: string,
    callerRole?: string,
  ): Promise<Review> {
    const review = await this.findOne(id);
    if (callerId) enforceOwnerOrAdmin(callerId, callerRole, review.userId);
    Object.assign(review, dto);
    return this.reviewRepo.save(review);
  }

  async remove(
    id: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<void> {
    const review = await this.findOne(id);
    if (callerId) enforceOwnerOrAdmin(callerId, callerRole, review.userId);
    await this.reviewRepo.remove(review);
  }

  async getProductRatingSummary(
    productId: string,
  ): Promise<{ avg: number; count: number }> {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.productId = :productId', { productId })
      .andWhere('r.status = :status', { status: 'approved' })
      .getRawOne();
    return {
      avg: parseFloat(result?.avg) || 0,
      count: parseInt(result?.count, 10) || 0,
    };
  }
}
