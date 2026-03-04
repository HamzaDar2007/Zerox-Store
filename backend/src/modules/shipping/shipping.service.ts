import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingZone } from './entities/shipping-zone.entity';
import { ShippingMethod } from './entities/shipping-method.entity';
import { ShippingCarrier } from './entities/shipping-carrier.entity';
import { ShippingRate } from './entities/shipping-rate.entity';
import { DeliverySlot } from './entities/delivery-slot.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import {
  CreateShippingZoneDto,
  UpdateShippingZoneDto,
  CreateShippingMethodDto,
  UpdateShippingMethodDto,
  CreateShippingCarrierDto,
  UpdateShippingCarrierDto,
  CreateShippingRateDto,
  UpdateShippingRateDto,
  CreateDeliverySlotDto,
} from './dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingZone)
    private zoneRepository: Repository<ShippingZone>,
    @InjectRepository(ShippingMethod)
    private methodRepository: Repository<ShippingMethod>,
    @InjectRepository(ShippingCarrier)
    private carrierRepository: Repository<ShippingCarrier>,
    @InjectRepository(ShippingRate)
    private rateRepository: Repository<ShippingRate>,
    @InjectRepository(DeliverySlot)
    private slotRepository: Repository<DeliverySlot>,
  ) {}

  // ==================== SHIPPING ZONES ====================

  async createZone(dto: CreateShippingZoneDto): Promise<ServiceResponse<ShippingZone>> {
    const zone = new ShippingZone();
    Object.assign(zone, dto);
    const saved = await this.zoneRepository.save(zone);
    return { success: true, message: 'Shipping zone created', data: saved };
  }

  async findAllZones(): Promise<ServiceResponse<ShippingZone[]>> {
    const zones = await this.zoneRepository.find({ relations: ['rates'] });
    return { success: true, message: 'Shipping zones retrieved', data: zones };
  }

  async findOneZone(id: string): Promise<ServiceResponse<ShippingZone>> {
    const zone = await this.zoneRepository.findOne({ where: { id }, relations: ['rates'] });
    if (!zone) throw new NotFoundException('Shipping zone not found');
    return { success: true, message: 'Shipping zone retrieved', data: zone };
  }

  async updateZone(id: string, dto: UpdateShippingZoneDto): Promise<ServiceResponse<ShippingZone>> {
    const zone = await this.zoneRepository.findOne({ where: { id } });
    if (!zone) throw new NotFoundException('Shipping zone not found');
    Object.assign(zone, dto);
    const updated = await this.zoneRepository.save(zone);
    return { success: true, message: 'Shipping zone updated', data: updated };
  }

  async removeZone(id: string): Promise<ServiceResponse<void>> {
    const zone = await this.zoneRepository.findOne({ where: { id } });
    if (!zone) throw new NotFoundException('Shipping zone not found');
    await this.zoneRepository.remove(zone);
    return { success: true, message: 'Shipping zone deleted' };
  }

  // ==================== SHIPPING METHODS ====================

  async createMethod(dto: CreateShippingMethodDto): Promise<ServiceResponse<ShippingMethod>> {
    const method = new ShippingMethod();
    Object.assign(method, dto);
    // Auto-generate code from name if not provided
    if (!method.code) {
      method.code = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
        .substring(0, 50);
    }
    const saved = await this.methodRepository.save(method);
    return { success: true, message: 'Shipping method created', data: saved };
  }

  async findAllMethods(isActive?: boolean): Promise<ServiceResponse<ShippingMethod[]>> {
    const where = isActive !== undefined ? { isActive } : {};
    const methods = await this.methodRepository.find({ where, relations: ['rates'] });
    return { success: true, message: 'Shipping methods retrieved', data: methods };
  }

  async updateMethod(id: string, dto: UpdateShippingMethodDto): Promise<ServiceResponse<ShippingMethod>> {
    const method = await this.methodRepository.findOne({ where: { id } });
    if (!method) throw new NotFoundException('Shipping method not found');
    Object.assign(method, dto);
    const updated = await this.methodRepository.save(method);
    return { success: true, message: 'Shipping method updated', data: updated };
  }

  async removeMethod(id: string): Promise<ServiceResponse<void>> {
    const method = await this.methodRepository.findOne({ where: { id } });
    if (!method) throw new NotFoundException('Shipping method not found');
    await this.methodRepository.remove(method);
    return { success: true, message: 'Shipping method deleted' };
  }

  // ==================== SHIPPING CARRIERS ====================

  async createCarrier(dto: CreateShippingCarrierDto): Promise<ServiceResponse<ShippingCarrier>> {
    const carrier = new ShippingCarrier();
    Object.assign(carrier, dto);
    const saved = await this.carrierRepository.save(carrier);
    return { success: true, message: 'Shipping carrier created', data: saved };
  }

  async findAllCarriers(isActive?: boolean): Promise<ServiceResponse<ShippingCarrier[]>> {
    const where = isActive !== undefined ? { isActive } : {};
    const carriers = await this.carrierRepository.find({ where });
    return { success: true, message: 'Shipping carriers retrieved', data: carriers };
  }

  async updateCarrier(id: string, dto: UpdateShippingCarrierDto): Promise<ServiceResponse<ShippingCarrier>> {
    const carrier = await this.carrierRepository.findOne({ where: { id } });
    if (!carrier) throw new NotFoundException('Shipping carrier not found');
    Object.assign(carrier, dto);
    const updated = await this.carrierRepository.save(carrier);
    return { success: true, message: 'Shipping carrier updated', data: updated };
  }

  // ==================== SHIPPING RATES ====================

  async createRate(dto: CreateShippingRateDto): Promise<ServiceResponse<ShippingRate>> {
    const rate = new ShippingRate();
    Object.assign(rate, dto);
    const saved = await this.rateRepository.save(rate);
    return { success: true, message: 'Shipping rate created', data: saved };
  }

  async findRates(shippingZoneId?: string, shippingMethodId?: string): Promise<ServiceResponse<ShippingRate[]>> {
    const query = this.rateRepository.createQueryBuilder('rate')
      .leftJoinAndSelect('rate.shippingZone', 'zone')
      .leftJoinAndSelect('rate.shippingMethod', 'method');
    if (shippingZoneId) query.andWhere('rate.shippingZoneId = :shippingZoneId', { shippingZoneId });
    if (shippingMethodId) query.andWhere('rate.shippingMethodId = :shippingMethodId', { shippingMethodId });
    const rates = await query.getMany();
    return { success: true, message: 'Shipping rates retrieved', data: rates };
  }

  async updateRate(id: string, dto: UpdateShippingRateDto): Promise<ServiceResponse<ShippingRate>> {
    const rate = await this.rateRepository.findOne({ where: { id } });
    if (!rate) throw new NotFoundException('Shipping rate not found');
    Object.assign(rate, dto);
    const updated = await this.rateRepository.save(rate);
    return { success: true, message: 'Shipping rate updated', data: updated };
  }

  // ==================== DELIVERY SLOTS ====================

  async createSlot(dto: CreateDeliverySlotDto): Promise<ServiceResponse<DeliverySlot>> {
    const slot = new DeliverySlot();
    Object.assign(slot, dto);
    const saved = await this.slotRepository.save(slot);
    return { success: true, message: 'Delivery slot created', data: saved };
  }

  async getAvailableSlots(): Promise<ServiceResponse<DeliverySlot[]>> {
    const slots = await this.slotRepository.find({ where: { isActive: true } });
    return { success: true, message: 'Available slots retrieved', data: slots };
  }

  // ==================== SHIPPING CALCULATION ====================

  async calculateShipping(
    shippingZoneId: string,
    weight: number,
    totalAmount: number,
  ): Promise<ServiceResponse<{ options: any[] }>> {
    const rates = await this.rateRepository.find({
      where: { shippingZoneId },
      relations: ['shippingMethod'],
    });

    const options = rates
      .filter(rate => {
        if (rate.minOrderAmount && totalAmount < Number(rate.minOrderAmount)) return false;
        if (rate.maxOrderAmount && totalAmount > Number(rate.maxOrderAmount)) return false;
        return true;
      })
      .map(rate => {
        let cost = Number(rate.baseRate);
        if (rate.perKgRate) cost += weight * Number(rate.perKgRate);
        return {
          methodId: rate.shippingMethodId,
          methodName: rate.shippingMethod?.name,
          cost,
          estimatedDaysMin: rate.shippingMethod?.estimatedDaysMin,
          estimatedDaysMax: rate.shippingMethod?.estimatedDaysMax,
        };
      });

    return { success: true, message: 'Shipping options calculated', data: { options } };
  }
}
