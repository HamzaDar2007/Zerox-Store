import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from './entities/search-history.entity';
import { RecentlyViewed } from './entities/recently-viewed.entity';
import { ProductComparison } from './entities/product-comparison.entity';
import { ProductRecommendation } from './entities/product-recommendation.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(SearchHistory)
    private historyRepository: Repository<SearchHistory>,
    @InjectRepository(RecentlyViewed)
    private recentlyViewedRepository: Repository<RecentlyViewed>,
    @InjectRepository(ProductComparison)
    private comparisonRepository: Repository<ProductComparison>,
    @InjectRepository(ProductRecommendation)
    private recommendationRepository: Repository<ProductRecommendation>,
  ) {}

  async saveSearchHistory(
    userId: string,
    query: string,
  ): Promise<ServiceResponse<SearchHistory>> {
    const history = new SearchHistory();
    Object.assign(history, { userId, searchQuery: query });
    const saved = await this.historyRepository.save(history);
    return { success: true, message: 'Search saved', data: saved };
  }

  async getSearchHistory(
    userId: string,
    limit: number = 10,
  ): Promise<ServiceResponse<SearchHistory[]>> {
    if (!Number.isFinite(limit) || limit < 1) limit = 10;
    const history = await this.historyRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return {
      success: true,
      message: 'Search history retrieved',
      data: history,
    };
  }

  async clearSearchHistory(userId: string): Promise<ServiceResponse<void>> {
    await this.historyRepository.delete({ userId });
    return { success: true, message: 'Search history cleared' };
  }

  async addRecentlyViewed(
    userId: string,
    productId: string,
  ): Promise<ServiceResponse<RecentlyViewed>> {
    let item = await this.recentlyViewedRepository.findOne({
      where: { userId, productId },
    });
    if (item) {
      item.lastViewedAt = new Date();
      item.viewCount = (item.viewCount || 1) + 1;
    } else {
      item = new RecentlyViewed();
      Object.assign(item, {
        userId,
        productId,
        lastViewedAt: new Date(),
        viewCount: 1,
      });
    }
    const saved = await this.recentlyViewedRepository.save(item);
    return { success: true, message: 'Recently viewed updated', data: saved };
  }

  async getRecentlyViewed(
    userId: string,
    limit: number = 20,
  ): Promise<ServiceResponse<RecentlyViewed[]>> {
    if (!Number.isFinite(limit) || limit < 1) limit = 20;
    const items = await this.recentlyViewedRepository.find({
      where: { userId },
      relations: ['product'],
      order: { lastViewedAt: 'DESC' },
      take: limit,
    });
    return { success: true, message: 'Recently viewed retrieved', data: items };
  }

  async addToComparison(
    userId: string,
    productId: string,
  ): Promise<ServiceResponse<ProductComparison>> {
    // Find existing comparison or create new one
    let comparison = await this.comparisonRepository.findOne({
      where: { userId },
    });
    if (comparison) {
      // Add to existing product IDs if not already present
      if (!comparison.productIds.includes(productId)) {
        if (comparison.productIds.length >= 4) {
          // Remove oldest (first) product if already have 4
          comparison.productIds = [
            ...comparison.productIds.slice(1),
            productId,
          ];
        } else {
          comparison.productIds = [...comparison.productIds, productId];
        }
      }
    } else {
      comparison = new ProductComparison();
      Object.assign(comparison, { userId, productIds: [productId] });
    }
    const saved = await this.comparisonRepository.save(comparison);
    return { success: true, message: 'Added to comparison', data: saved };
  }

  async getComparison(
    userId: string,
  ): Promise<ServiceResponse<ProductComparison[]>> {
    const items = await this.comparisonRepository.find({
      where: { userId },
    });
    return { success: true, message: 'Comparison list retrieved', data: items };
  }

  async removeFromComparison(
    userId: string,
    productId: string,
  ): Promise<ServiceResponse<void>> {
    const comparison = await this.comparisonRepository.findOne({
      where: { userId },
    });
    if (comparison) {
      comparison.productIds = comparison.productIds.filter(
        (id) => id !== productId,
      );
      await this.comparisonRepository.save(comparison);
    }
    return { success: true, message: 'Removed from comparison' };
  }

  async getRecommendations(
    productId: string,
  ): Promise<ServiceResponse<ProductRecommendation[]>> {
    const recommendations = await this.recommendationRepository.find({
      where: { sourceProductId: productId },
      relations: ['recommendedProduct'],
      order: { score: 'DESC' },
      take: 20,
    });
    return {
      success: true,
      message: 'Recommendations retrieved',
      data: recommendations,
    };
  }
}
