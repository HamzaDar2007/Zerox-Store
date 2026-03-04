import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ReviewHelpfulness } from './entities/review-helpfulness.entity';
import { ReviewReport } from './entities/review-report.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { ReviewStatus, ReviewReportReason } from '@common/enums';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { MailService } from '../../common/modules/mail/mail.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewHelpfulness)
    private helpfulnessRepository: Repository<ReviewHelpfulness>,
    @InjectRepository(ReviewReport)
    private reportRepository: Repository<ReviewReport>,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateReviewDto, userId: string): Promise<ServiceResponse<Review>> {
    // Check if user already reviewed this product
    const existing = await this.reviewRepository.findOne({
      where: { userId, productId: dto.productId },
    });

    if (existing) {
      throw new ConflictException('You have already reviewed this product');
    }

    const review = new Review();
    Object.assign(review, {
      ...dto,
      userId,
      status: ReviewStatus.PENDING,
    });

    const saved = await this.reviewRepository.save(review);

    // Send new review notification to seller (fire-and-forget)
    this.sendNewReviewNotification(saved).catch(() => {});

    return {
      success: true,
      message: 'Review submitted successfully',
      data: saved,
    };
  }

  async findAll(options?: {
    productId?: string;
    userId?: string;
    sellerId?: string;
    status?: ReviewStatus;
    minRating?: number;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<Review[]>> {
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.createdAt', 'DESC');

    if (options?.productId) {
      query.andWhere('review.productId = :productId', { productId: options.productId });
    }

    if (options?.userId) {
      query.andWhere('review.userId = :userId', { userId: options.userId });
    }

    if (options?.status) {
      query.andWhere('review.status = :status', { status: options.status });
    }

    if (options?.minRating) {
      query.andWhere('review.rating >= :minRating', { minRating: options.minRating });
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    const [reviews, total] = await query.getManyAndCount();

    return {
      success: true,
      message: 'Reviews retrieved successfully',
      data: reviews,
      meta: { total, page, limit },
    };
  }

  async findOne(id: string): Promise<ServiceResponse<Review>> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return {
      success: true,
      message: 'Review retrieved successfully',
      data: review,
    };
  }

  async update(id: string, dto: UpdateReviewDto, userId: string): Promise<ServiceResponse<Review>> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new BadRequestException('You can only edit your own reviews');
    }

    Object.assign(review, dto);
    const updated = await this.reviewRepository.save(review);

    return {
      success: true,
      message: 'Review updated successfully',
      data: updated,
    };
  }

  async remove(id: string, userId: string): Promise<ServiceResponse<void>> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);

    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }

  async updateStatus(id: string, status: ReviewStatus): Promise<ServiceResponse<Review>> {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.status = status;
    const updated = await this.reviewRepository.save(review);

    // Send review moderation status email (fire-and-forget)
    this.sendReviewStatusNotification(updated).catch(() => {});

    return {
      success: true,
      message: `Review ${status.toLowerCase()}`,
      data: updated,
    };
  }

  async markHelpful(reviewId: string, userId: string, isHelpful: boolean): Promise<ServiceResponse<void>> {
    const existing = await this.helpfulnessRepository.findOne({
      where: { reviewId, userId },
    });

    if (existing) {
      existing.isHelpful = isHelpful;
      await this.helpfulnessRepository.save(existing);
    } else {
      const helpfulness = new ReviewHelpfulness();
      Object.assign(helpfulness, {
        reviewId,
        userId,
        isHelpful,
      });
      await this.helpfulnessRepository.save(helpfulness);
    }

    // Update helpfulness counts on review
    const helpfulCount = await this.helpfulnessRepository.count({
      where: { reviewId, isHelpful: true },
    });
    const notHelpfulCount = await this.helpfulnessRepository.count({
      where: { reviewId, isHelpful: false },
    });

    await this.reviewRepository.update(reviewId, {
      helpfulCount,
      notHelpfulCount,
    });

    return {
      success: true,
      message: 'Helpfulness recorded',
    };
  }

  async reportReview(reviewId: string, userId: string, reason: ReviewReportReason, details?: string): Promise<ServiceResponse<ReviewReport>> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const report = new ReviewReport();
    Object.assign(report, {
      reviewId,
      reportedBy: userId,
      reason,
      details,
    });

    const saved = await this.reportRepository.save(report);

    return {
      success: true,
      message: 'Review reported successfully',
      data: saved,
    };
  }

  async getProductRatingSummary(productId: string): Promise<ServiceResponse<any>> {
    const reviews = await this.reviewRepository.find({
      where: { productId, status: ReviewStatus.APPROVED },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return {
      success: true,
      message: 'Rating summary retrieved',
      data: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    };
  }

  private async sendNewReviewNotification(review: Review): Promise<void> {
    try {
      const full = await this.reviewRepository.findOne({
        where: { id: review.id },
        relations: ['user', 'product'],
      });
      if (!full?.product?.name || !full?.user?.name) return;
      // For now, no direct seller user relation on product — skip seller email if not available
    } catch (_) { /* silently ignore */ }
  }

  private async sendReviewStatusNotification(review: Review): Promise<void> {
    try {
      const full = await this.reviewRepository.findOne({
        where: { id: review.id },
        relations: ['user', 'product'],
      });
      if (!full?.user?.email) return;
      await this.mailService.sendReviewStatusEmail(
        full.user.email, full.user.name || 'Customer',
        full.product?.name || 'Product', full.status,
      );
    } catch (_) { /* silently ignore */ }
  }
}
