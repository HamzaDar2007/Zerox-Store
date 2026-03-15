import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchQuery } from './entities/search-query.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(SearchQuery) private searchRepo: Repository<SearchQuery>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async logSearch(dto: Partial<SearchQuery>): Promise<SearchQuery> {
    const sq = this.searchRepo.create(dto);
    return this.searchRepo.save(sq);
  }

  async getHistory(userId: string, limit = 20): Promise<SearchQuery[]> {
    return this.searchRepo.find({
      where: { userId },
      order: { searchedAt: 'DESC' },
      take: limit,
    });
  }

  async getPopularSearches(limit = 20): Promise<any[]> {
    return this.searchRepo
      .createQueryBuilder('sq')
      .select('sq.query', 'query')
      .addSelect('COUNT(*)', 'count')
      .groupBy('sq.query')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async recordClick(
    id: string,
    productId: string,
    callerId?: string,
  ): Promise<SearchQuery | null> {
    const sq = await this.searchRepo.findOne({ where: { id } });
    if (sq) {
      if (callerId && sq.userId && sq.userId !== callerId) return null;
      sq.clickedProduct = productId;
      return this.searchRepo.save(sq);
    }
    return null;
  }

  /**
   * Full-text product search using PostgreSQL ILIKE + tsquery.
   * Returns matching products with relevance scoring.
   */
  async searchProducts(
    query: string,
    options?: {
      page?: number;
      limit?: number;
      categoryId?: string;
      storeId?: string;
    },
  ): Promise<{ data: Product[]; total: number; query: string }> {
    const pg = options?.page || 1;
    const lm = options?.limit || 20;

    const qb = this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.store', 'store')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.brand', 'brand');

    // Full-text search on name, short/full description, slug
    qb.where(
      '(p.name ILIKE :q OR p.shortDesc ILIKE :q OR p.fullDesc ILIKE :q OR p.slug ILIKE :q)',
      { q: `%${query}%` },
    );

    if (options?.categoryId) {
      qb.andWhere('p.categoryId = :categoryId', {
        categoryId: options.categoryId,
      });
    }
    if (options?.storeId) {
      qb.andWhere('p.storeId = :storeId', { storeId: options.storeId });
    }

    qb.skip((pg - 1) * lm)
      .take(lm)
      .orderBy('p.name', 'ASC');

    const [data, total] = await qb.getManyAndCount();
    return { data, total, query };
  }
}
