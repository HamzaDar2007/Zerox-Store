import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CampaignProduct } from './entities/campaign-product.entity';
import { FlashSale } from './entities/flash-sale.entity';
import { FlashSaleProduct } from './entities/flash-sale-product.entity';
import { Voucher } from './entities/voucher.entity';
import { VoucherUsage } from './entities/voucher-usage.entity';
import { VoucherCondition } from './entities/voucher-condition.entity';
import { VoucherProduct } from './entities/voucher-product.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { CreateCampaignDto, UpdateCampaignDto, CreateFlashSaleDto, CreateVoucherDto } from './dto';
import { CampaignType } from '@common/enums';

@Injectable()
export class MarketingService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(CampaignProduct)
    private campaignProductRepository: Repository<CampaignProduct>,
    @InjectRepository(FlashSale)
    private flashSaleRepository: Repository<FlashSale>,
    @InjectRepository(FlashSaleProduct)
    private flashSaleProductRepository: Repository<FlashSaleProduct>,
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    @InjectRepository(VoucherUsage)
    private voucherUsageRepository: Repository<VoucherUsage>,
    @InjectRepository(VoucherCondition)
    private voucherConditionRepository: Repository<VoucherCondition>,
    @InjectRepository(VoucherProduct)
    private voucherProductRepository: Repository<VoucherProduct>,
  ) {}

  // ==================== CAMPAIGNS ====================

  async createCampaign(dto: CreateCampaignDto): Promise<ServiceResponse<Campaign>> {
    const campaign = new Campaign();
    Object.assign(campaign, dto);
    const saved = await this.campaignRepository.save(campaign);
    return { success: true, message: 'Campaign created successfully', data: saved };
  }

  async findAllCampaigns(options?: { isActive?: boolean; page?: number; limit?: number }): Promise<ServiceResponse<Campaign[]>> {
    const query = this.campaignRepository.createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.products', 'products')
      .orderBy('campaign.createdAt', 'DESC');

    if (options?.isActive !== undefined) {
      query.andWhere('campaign.isActive = :isActive', { isActive: options.isActive });
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    const [campaigns, total] = await query.getManyAndCount();
    return { success: true, message: 'Campaigns retrieved', data: campaigns, meta: { total, page, limit } };
  }

  async findOneCampaign(id: string): Promise<ServiceResponse<Campaign>> {
    const campaign = await this.campaignRepository.findOne({ where: { id }, relations: ['products'] });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return { success: true, message: 'Campaign retrieved', data: campaign };
  }

  async updateCampaign(id: string, dto: UpdateCampaignDto): Promise<ServiceResponse<Campaign>> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    Object.assign(campaign, dto);
    const updated = await this.campaignRepository.save(campaign);
    return { success: true, message: 'Campaign updated', data: updated };
  }

  // ==================== FLASH SALES ====================

  async createFlashSale(dto: CreateFlashSaleDto): Promise<ServiceResponse<FlashSale>> {
    const flashSale = new FlashSale();
    Object.assign(flashSale, dto);
    const saved = await this.flashSaleRepository.save(flashSale);
    return { success: true, message: 'Flash sale created successfully', data: saved };
  }

  async getActiveFlashSales(): Promise<ServiceResponse<FlashSale[]>> {
    const now = new Date();
    const flashSales = await this.flashSaleRepository.find({
      where: {
        startsAt: LessThanOrEqual(now),
        endsAt: MoreThanOrEqual(now),
        isActive: true,
      },
      relations: ['products'],
    });
    return { success: true, message: 'Active flash sales retrieved', data: flashSales };
  }

  async findOneFlashSale(id: string): Promise<ServiceResponse<FlashSale>> {
    const flashSale = await this.flashSaleRepository.findOne({ where: { id }, relations: ['products'] });
    if (!flashSale) throw new NotFoundException('Flash sale not found');
    return { success: true, message: 'Flash sale retrieved', data: flashSale };
  }

  // ==================== VOUCHERS ====================

  async createVoucher(dto: CreateVoucherDto): Promise<ServiceResponse<Voucher>> {
    const existingVoucher = await this.voucherRepository.findOne({ where: { code: dto.code } });
    if (existingVoucher) throw new BadRequestException('Voucher code already exists');

    const voucher = new Voucher();
    const { endsAt, ...rest } = dto as any;
    Object.assign(voucher, rest);
    if (endsAt) {
      voucher.expiresAt = endsAt;
    }
    const saved = await this.voucherRepository.save(voucher);
    return { success: true, message: 'Voucher created successfully', data: saved };
  }

  async findAllVouchers(options?: { isActive?: boolean; page?: number; limit?: number }): Promise<ServiceResponse<Voucher[]>> {
    const query = this.voucherRepository.createQueryBuilder('voucher')
      .orderBy('voucher.createdAt', 'DESC');

    if (options?.isActive !== undefined) {
      query.andWhere('voucher.isActive = :isActive', { isActive: options.isActive });
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    const [vouchers, total] = await query.getManyAndCount();
    return { success: true, message: 'Vouchers retrieved', data: vouchers, meta: { total, page, limit } };
  }

  async findVoucherByCode(code: string): Promise<ServiceResponse<Voucher>> {
    const voucher = await this.voucherRepository.findOne({
      where: { code },
      relations: ['conditions', 'products'],
    });
    if (!voucher) throw new NotFoundException('Voucher not found');
    return { success: true, message: 'Voucher retrieved', data: voucher };
  }

  async validateVoucher(code: string, userId: string, orderTotal: number): Promise<ServiceResponse<{ valid: boolean; discount: number; message: string }>> {
    const voucher = await this.voucherRepository.findOne({
      where: { code, isActive: true },
      relations: ['conditions'],
    });

    if (!voucher) {
      return { success: true, message: 'Invalid voucher', data: { valid: false, discount: 0, message: 'Voucher not found' } };
    }

    const now = new Date();
    if (voucher.startsAt && now < voucher.startsAt) {
      return { success: true, message: 'Voucher not yet active', data: { valid: false, discount: 0, message: 'Voucher not yet active' } };
    }
    if (voucher.expiresAt && now > voucher.expiresAt) {
      return { success: true, message: 'Voucher expired', data: { valid: false, discount: 0, message: 'Voucher has expired' } };
    }

    if (voucher.totalLimit) {
      const usageCount = await this.voucherUsageRepository.count({ where: { voucherId: voucher.id } });
      if (usageCount >= voucher.totalLimit) {
        return { success: true, message: 'Voucher limit reached', data: { valid: false, discount: 0, message: 'Voucher usage limit reached' } };
      }
    }

    if (voucher.minOrderAmount && orderTotal < Number(voucher.minOrderAmount)) {
      return { success: true, message: 'Minimum not met', data: { valid: false, discount: 0, message: `Minimum order amount is ${voucher.minOrderAmount}` } };
    }

    let discount = 0;
    if (voucher.type === 'percentage') {
      discount = orderTotal * (Number(voucher.discountValue) / 100);
      if (voucher.maxDiscount) {
        discount = Math.min(discount, Number(voucher.maxDiscount));
      }
    } else {
      discount = Number(voucher.discountValue);
    }

    return { success: true, message: 'Voucher valid', data: { valid: true, discount, message: 'Voucher applied successfully' } };
  }

  async applyVoucher(code: string, userId: string, orderId: string): Promise<ServiceResponse<VoucherUsage>> {
    const voucher = await this.voucherRepository.findOne({ where: { code } });
    if (!voucher) throw new NotFoundException('Voucher not found');

    const usage = new VoucherUsage();
    Object.assign(usage, {
      voucherId: voucher.id,
      userId,
      orderId,
    });

    const saved = await this.voucherUsageRepository.save(usage);
    return { success: true, message: 'Voucher applied', data: saved };
  }
}
