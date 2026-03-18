import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingZone } from './entities/shipping-zone.entity';
import { ShippingZoneCountry } from './entities/shipping-zone-country.entity';
import { ShippingMethod } from './entities/shipping-method.entity';
import { Shipment } from './entities/shipment.entity';
import { ShipmentEvent } from './entities/shipment-event.entity';
import { MailService } from '../../common/modules/mail/mail.service';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingZone) private zoneRepo: Repository<ShippingZone>,
    @InjectRepository(ShippingZoneCountry)
    private zoneCountryRepo: Repository<ShippingZoneCountry>,
    @InjectRepository(ShippingMethod)
    private methodRepo: Repository<ShippingMethod>,
    @InjectRepository(Shipment) private shipmentRepo: Repository<Shipment>,
    @InjectRepository(ShipmentEvent)
    private eventRepo: Repository<ShipmentEvent>,
    private mailService: MailService,
  ) {}

  async createZone(dto: Partial<ShippingZone>): Promise<ShippingZone> {
    const zone = this.zoneRepo.create(dto);
    return this.zoneRepo.save(zone);
  }

  async findAllZones(page = 1, limit = 50): Promise<ShippingZone[]> {
    return this.zoneRepo.find({
      order: { name: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findZone(id: string): Promise<ShippingZone> {
    const z = await this.zoneRepo.findOne({ where: { id } });
    if (!z) throw new NotFoundException('Shipping zone not found');
    return z;
  }

  async updateZone(
    id: string,
    dto: Partial<ShippingZone>,
  ): Promise<ShippingZone> {
    const z = await this.findZone(id);
    Object.assign(z, dto);
    return this.zoneRepo.save(z);
  }

  async addCountryToZone(
    zoneId: string,
    country: string,
  ): Promise<ShippingZoneCountry> {
    const zc = this.zoneCountryRepo.create({ zoneId, country });
    return this.zoneCountryRepo.save(zc);
  }

  async getZoneCountries(zoneId: string): Promise<ShippingZoneCountry[]> {
    return this.zoneCountryRepo.find({ where: { zoneId } });
  }

  async removeCountryFromZone(zoneId: string, country: string): Promise<void> {
    await this.zoneCountryRepo.delete({ zoneId, country });
  }

  async createMethod(dto: Partial<ShippingMethod>): Promise<ShippingMethod> {
    const m = this.methodRepo.create(dto);
    return this.methodRepo.save(m);
  }

  async findAllMethods(zoneId?: string, page = 1, limit = 50): Promise<ShippingMethod[]> {
    const where: any = {};
    if (zoneId) where.zoneId = zoneId;
    return this.methodRepo.find({
      where,
      relations: ['zone'],
      order: { name: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findMethod(id: string): Promise<ShippingMethod> {
    const m = await this.methodRepo.findOne({
      where: { id },
      relations: ['zone'],
    });
    if (!m) throw new NotFoundException('Shipping method not found');
    return m;
  }

  async updateMethod(
    id: string,
    dto: Partial<ShippingMethod>,
  ): Promise<ShippingMethod> {
    const m = await this.findMethod(id);
    Object.assign(m, dto);
    return this.methodRepo.save(m);
  }

  async createShipment(dto: Partial<Shipment>): Promise<Shipment> {
    dto.status = dto.status || 'pending';
    const s = this.shipmentRepo.create(dto);
    const saved = await this.shipmentRepo.save(s);
    // Load order + user relation to send email
    const full = await this.shipmentRepo.findOne({
      where: { id: saved.id },
      relations: ['order', 'order.user'],
    });
    if (full?.order?.user) {
      this.mailService
        .sendShipmentCreatedEmail(
          full.order.user.email,
          full.order.user.firstName || 'Customer',
          full.orderId,
          saved.trackingNumber || '',
          saved.carrier || '',
        )
        .catch(() => {});
    }
    return saved;
  }

  async findShipment(id: string): Promise<Shipment> {
    const s = await this.shipmentRepo.findOne({
      where: { id },
      relations: ['order', 'warehouse', 'shippingMethod'],
    });
    if (!s) throw new NotFoundException('Shipment not found');
    return s;
  }

  async findShipmentsByOrder(orderId: string): Promise<Shipment[]> {
    return this.shipmentRepo.find({
      where: { orderId },
      relations: ['warehouse', 'shippingMethod'],
    });
  }

  async updateShipment(id: string, dto: Partial<Shipment>): Promise<Shipment> {
    const s = await this.findShipment(id);
    Object.assign(s, dto);
    const saved = await this.shipmentRepo.save(s);
    if (dto.status) {
      const full = await this.shipmentRepo.findOne({
        where: { id },
        relations: ['order', 'order.user'],
      });
      if (full?.order?.user) {
        this.mailService
          .sendShipmentStatusUpdateEmail(
            full.order.user.email,
            full.order.user.firstName || 'Customer',
            full.orderId,
            saved.trackingNumber || '',
            dto.status,
          )
          .catch(() => {});
      }
    }
    return saved;
  }

  async addShipmentEvent(dto: Partial<ShipmentEvent>): Promise<ShipmentEvent> {
    const e = this.eventRepo.create(dto);
    return this.eventRepo.save(e);
  }

  async getShipmentEvents(shipmentId: string): Promise<ShipmentEvent[]> {
    return this.eventRepo.find({
      where: { shipmentId },
      order: { occurredAt: 'ASC' },
    });
  }
}
