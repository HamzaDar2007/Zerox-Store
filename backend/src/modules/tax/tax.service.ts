import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxZone } from './entities/tax-zone.entity';
import { TaxRate } from './entities/tax-rate.entity';
import { TaxClass } from './entities/tax-class.entity';
import { OrderTaxLine } from './entities/order-tax-line.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import {
  CreateTaxZoneDto,
  UpdateTaxZoneDto,
  CreateTaxRateDto,
  UpdateTaxRateDto,
  CreateTaxClassDto,
  UpdateTaxClassDto,
} from './dto';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(TaxZone)
    private zoneRepository: Repository<TaxZone>,
    @InjectRepository(TaxRate)
    private rateRepository: Repository<TaxRate>,
    @InjectRepository(TaxClass)
    private classRepository: Repository<TaxClass>,
    @InjectRepository(OrderTaxLine)
    private taxLineRepository: Repository<OrderTaxLine>,
  ) {}

  // ==================== TAX ZONES ====================

  async createZone(dto: CreateTaxZoneDto): Promise<ServiceResponse<TaxZone>> {
    const zone = new TaxZone();
    Object.assign(zone, dto);
    // Auto-set countryCode if not provided (default to 'PK')
    if (!zone.countryCode) {
      zone.countryCode = 'PK';
    }
    const saved = await this.zoneRepository.save(zone);
    return { success: true, message: 'Tax zone created', data: saved };
  }

  async findAllZones(): Promise<ServiceResponse<TaxZone[]>> {
    const zones = await this.zoneRepository.find({ relations: ['rates'] });
    return { success: true, message: 'Tax zones retrieved', data: zones };
  }

  async findOneZone(id: string): Promise<ServiceResponse<TaxZone>> {
    const zone = await this.zoneRepository.findOne({ where: { id }, relations: ['rates'] });
    if (!zone) throw new NotFoundException('Tax zone not found');
    return { success: true, message: 'Tax zone retrieved', data: zone };
  }

  async updateZone(id: string, dto: UpdateTaxZoneDto): Promise<ServiceResponse<TaxZone>> {
    const zone = await this.zoneRepository.findOne({ where: { id } });
    if (!zone) throw new NotFoundException('Tax zone not found');
    Object.assign(zone, dto);
    const updated = await this.zoneRepository.save(zone);
    return { success: true, message: 'Tax zone updated', data: updated };
  }

  async removeZone(id: string): Promise<ServiceResponse<void>> {
    const zone = await this.zoneRepository.findOne({ where: { id } });
    if (!zone) throw new NotFoundException('Tax zone not found');
    await this.zoneRepository.remove(zone);
    return { success: true, message: 'Tax zone deleted' };
  }

  // ==================== TAX RATES ====================

  async createRate(dto: CreateTaxRateDto): Promise<ServiceResponse<TaxRate>> {
    const rate = new TaxRate();
    Object.assign(rate, dto);
    const saved = await this.rateRepository.save(rate);
    return { success: true, message: 'Tax rate created', data: saved };
  }

  async findAllRates(taxZoneId?: string): Promise<ServiceResponse<TaxRate[]>> {
    const where = taxZoneId ? { taxZoneId } : {};
    const rates = await this.rateRepository.find({ where, relations: ['taxZone', 'taxClass'] });
    return { success: true, message: 'Tax rates retrieved', data: rates };
  }

  async updateRate(id: string, dto: UpdateTaxRateDto): Promise<ServiceResponse<TaxRate>> {
    const rate = await this.rateRepository.findOne({ where: { id } });
    if (!rate) throw new NotFoundException('Tax rate not found');
    Object.assign(rate, dto);
    const updated = await this.rateRepository.save(rate);
    return { success: true, message: 'Tax rate updated', data: updated };
  }

  async removeRate(id: string): Promise<ServiceResponse<void>> {
    const rate = await this.rateRepository.findOne({ where: { id } });
    if (!rate) throw new NotFoundException('Tax rate not found');
    await this.rateRepository.remove(rate);
    return { success: true, message: 'Tax rate deleted' };
  }

  // ==================== TAX CLASSES ====================

  async createClass(dto: CreateTaxClassDto): Promise<ServiceResponse<TaxClass>> {
    const taxClass = new TaxClass();
    Object.assign(taxClass, dto);
    const saved = await this.classRepository.save(taxClass);
    return { success: true, message: 'Tax class created', data: saved };
  }

  async findAllClasses(): Promise<ServiceResponse<TaxClass[]>> {
    const classes = await this.classRepository.find();
    return { success: true, message: 'Tax classes retrieved', data: classes };
  }

  async updateClass(id: string, dto: UpdateTaxClassDto): Promise<ServiceResponse<TaxClass>> {
    const taxClass = await this.classRepository.findOne({ where: { id } });
    if (!taxClass) throw new NotFoundException('Tax class not found');
    Object.assign(taxClass, dto);
    const updated = await this.classRepository.save(taxClass);
    return { success: true, message: 'Tax class updated', data: updated };
  }

  // ==================== TAX CALCULATION ====================

  async calculateTax(
    amount: number,
    countryCode: string,
    stateCode?: string,
    taxClassId?: string,
  ): Promise<ServiceResponse<{ taxAmount: number; taxRate: number; taxBreakdown: any[] }>> {
    const query = this.rateRepository
      .createQueryBuilder('rate')
      .leftJoin('rate.taxZone', 'zone')
      .where(':countryCode = ANY(zone.countries)', { countryCode });

    if (stateCode) {
      query.andWhere('(:stateCode = ANY(zone.states) OR zone.states = \'{}\')', { stateCode });
    }

    if (taxClassId) {
      query.andWhere('rate.taxClassId = :taxClassId', { taxClassId });
    }

    const rates = await query.getMany();

    let totalTaxRate = 0;
    const taxBreakdown: any[] = [];

    for (const rate of rates) {
      totalTaxRate += Number(rate.rate);
      taxBreakdown.push({
        name: rate.name,
        rate: rate.rate,
        amount: amount * (Number(rate.rate) / 100),
      });
    }

    const taxAmount = amount * (totalTaxRate / 100);

    return {
      success: true,
      message: 'Tax calculated',
      data: { taxAmount, taxRate: totalTaxRate, taxBreakdown },
    };
  }

  async getOrderTaxLines(orderId: string): Promise<ServiceResponse<OrderTaxLine[]>> {
    const taxLines = await this.taxLineRepository.find({ where: { orderId } });
    return { success: true, message: 'Order tax lines retrieved', data: taxLines };
  }
}
