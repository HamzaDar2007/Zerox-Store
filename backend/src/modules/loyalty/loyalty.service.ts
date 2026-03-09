import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LoyaltyPoints } from './entities/loyalty-points.entity';
import { LoyaltyTier } from './entities/loyalty-tier.entity';
import { LoyaltyTransaction } from './entities/loyalty-transaction.entity';
import { ReferralCode } from './entities/referral-code.entity';
import { Referral } from './entities/referral.entity';
import { CreateLoyaltyTierDto } from './dto/create-loyalty-tier.dto';
import { UpdateLoyaltyTierDto } from './dto/update-loyalty-tier.dto';
import { CreateLoyaltyTransactionDto } from './dto/create-loyalty-transaction.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { LoyaltyTransactionType, ReferralStatus } from '@common/enums';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyPoints)
    private pointsRepository: Repository<LoyaltyPoints>,
    @InjectRepository(LoyaltyTier)
    private tierRepository: Repository<LoyaltyTier>,
    @InjectRepository(LoyaltyTransaction)
    private transactionRepository: Repository<LoyaltyTransaction>,
    @InjectRepository(ReferralCode)
    private referralCodeRepository: Repository<ReferralCode>,
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    private dataSource: DataSource,
  ) {}

  async getOrCreatePoints(
    userId: string,
  ): Promise<ServiceResponse<LoyaltyPoints>> {
    let points = await this.pointsRepository.findOne({
      where: { userId },
      relations: ['tier'],
    });
    if (!points) {
      const defaultTier = await this.tierRepository.findOne({
        where: { minPoints: 0 },
        order: { minPoints: 'ASC' },
      });
      points = new LoyaltyPoints();
      points.userId = userId;
      points.totalEarned = 0;
      points.totalRedeemed = 0;
      points.totalExpired = 0;
      points.availableBalance = 0;
      points.lifetimePoints = 0;
      points.tierId = defaultTier?.id || null;
      points = await this.pointsRepository.save(points);
    }
    return { success: true, message: 'Points retrieved', data: points };
  }

  async earnPoints(
    userId: string,
    dto: CreateLoyaltyTransactionDto,
  ): Promise<ServiceResponse<LoyaltyPoints>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const pointsRecord = await this.getOrCreatePoints(userId);
      const points = pointsRecord.data;
      points.totalEarned += dto.points;
      points.availableBalance += dto.points;
      points.lifetimePoints += dto.points;
      await this.checkAndUpdateTier(points);
      await queryRunner.manager.save(points);

      const transaction = new LoyaltyTransaction();
      transaction.userId = userId;
      transaction.type = LoyaltyTransactionType.EARNED;
      transaction.points = dto.points;
      transaction.balanceAfter = points.availableBalance;
      transaction.referenceType = dto.referenceType || null;
      transaction.referenceId = dto.referenceId || null;
      transaction.description = dto.description || null;
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: `${dto.points} points earned`,
        data: points,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async redeemPoints(
    userId: string,
    dto: { points: number; orderId?: string; description?: string },
  ): Promise<ServiceResponse<LoyaltyPoints>> {
    const pointsRecord = await this.getOrCreatePoints(userId);
    const points = pointsRecord.data;
    if (points.availableBalance < dto.points)
      throw new BadRequestException('Insufficient points');
    points.availableBalance -= dto.points;
    points.totalRedeemed += dto.points;
    await this.pointsRepository.save(points);

    const transaction = new LoyaltyTransaction();
    transaction.userId = userId;
    transaction.type = LoyaltyTransactionType.REDEEMED;
    transaction.points = -dto.points;
    transaction.balanceAfter = points.availableBalance;
    transaction.referenceType = 'redemption';
    transaction.referenceId = dto.orderId || null;
    transaction.description = dto.description || null;
    await this.transactionRepository.save(transaction);

    return {
      success: true,
      message: `${dto.points} points redeemed`,
      data: points,
    };
  }

  async getTransactions(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<ServiceResponse<LoyaltyTransaction[]>> {
    if (!Number.isFinite(page) || page < 1) page = 1;
    if (!Number.isFinite(limit) || limit < 1) limit = 20;
    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where: { userId },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      },
    );
    return {
      success: true,
      message: 'Transactions retrieved',
      data: transactions,
      meta: { total, page, limit },
    };
  }

  private async checkAndUpdateTier(points: LoyaltyPoints): Promise<void> {
    const tiers = await this.tierRepository.find({
      order: { minPoints: 'DESC' },
    });
    for (const tier of tiers) {
      if (points.lifetimePoints >= tier.minPoints) {
        points.tierId = tier.id;
        points.tierRecalculatedAt = new Date();
        break;
      }
    }
  }

  async getTiers(): Promise<ServiceResponse<LoyaltyTier[]>> {
    const tiers = await this.tierRepository.find({
      order: { minPoints: 'ASC' },
    });
    return { success: true, message: 'Tiers retrieved', data: tiers };
  }

  async createTier(
    dto: CreateLoyaltyTierDto,
  ): Promise<ServiceResponse<LoyaltyTier>> {
    const tier = new LoyaltyTier();
    Object.assign(tier, dto);
    const saved = await this.tierRepository.save(tier);
    return { success: true, message: 'Tier created', data: saved };
  }

  async updateTier(
    id: string,
    dto: UpdateLoyaltyTierDto,
  ): Promise<ServiceResponse<LoyaltyTier>> {
    const tier = await this.tierRepository.findOne({ where: { id } });
    if (!tier) throw new NotFoundException('Tier not found');
    Object.assign(tier, dto);
    const updated = await this.tierRepository.save(tier);
    return { success: true, message: 'Tier updated', data: updated };
  }

  async deleteTier(id: string): Promise<ServiceResponse<void>> {
    const result = await this.tierRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Tier not found');
    return { success: true, message: 'Tier deleted', data: undefined };
  }

  async getOrCreateReferralCode(
    userId: string,
  ): Promise<ServiceResponse<ReferralCode>> {
    let code = await this.referralCodeRepository.findOne({
      where: { userId, isActive: true },
    });
    if (!code) {
      code = new ReferralCode();
      code.userId = userId;
      code.code = await this.generateReferralCode();
      code.isActive = true;
      code = await this.referralCodeRepository.save(code);
    }
    return { success: true, message: 'Referral code retrieved', data: code };
  }

  async applyReferralCode(
    referredUserId: string,
    codeString: string,
  ): Promise<ServiceResponse<Referral>> {
    const code = await this.referralCodeRepository.findOne({
      where: { code: codeString, isActive: true },
    });
    if (!code) throw new NotFoundException('Invalid referral code');
    if (code.userId === referredUserId)
      throw new BadRequestException('Cannot use your own referral code');
    const existing = await this.referralRepository.findOne({
      where: { referredUserId },
    });
    if (existing) throw new BadRequestException('Referral already applied');

    const referral = new Referral();
    referral.referralCodeId = code.id;
    referral.referrerUserId = code.userId;
    referral.referredUserId = referredUserId;
    referral.status = ReferralStatus.PENDING;
    const saved = await this.referralRepository.save(referral);

    code.totalReferrals += 1;
    await this.referralCodeRepository.save(code);

    return { success: true, message: 'Referral applied', data: saved };
  }

  async completeReferral(
    referredUserId: string,
    _orderId: string,
  ): Promise<ServiceResponse<Referral>> {
    const referral = await this.referralRepository.findOne({
      where: { referredUserId, status: ReferralStatus.PENDING },
      relations: ['referralCode'],
    });
    if (!referral) throw new NotFoundException('No pending referral');
    referral.status = ReferralStatus.REWARDED;
    referral.rewardedAt = new Date();
    referral.pointsAwarded = 500;
    await this.referralRepository.save(referral);

    // Award points to referrer
    await this.earnPoints(referral.referrerUserId, {
      points: 500,
      referenceType: 'referral',
      description: 'Referral bonus',
    } as CreateLoyaltyTransactionDto);

    // Update referral code stats
    const code = await this.referralCodeRepository.findOne({
      where: { id: referral.referralCodeId },
    });
    if (code) {
      code.totalPointsEarned += 500;
      await this.referralCodeRepository.save(code);
    }

    return { success: true, message: 'Referral completed', data: referral };
  }

  async getReferrals(userId: string): Promise<ServiceResponse<Referral[]>> {
    const referrals = await this.referralRepository.find({
      where: { referrerUserId: userId },
      relations: ['referredUser'],
    });
    return { success: true, message: 'Referrals retrieved', data: referrals };
  }

  private async generateReferralCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code: string;
    do {
      code = Array.from(
        { length: 8 },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join('');
    } while (await this.referralCodeRepository.findOne({ where: { code } }));
    return code;
  }
}
