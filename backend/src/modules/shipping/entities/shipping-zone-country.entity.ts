import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ShippingZone } from './shipping-zone.entity';

@Entity('shipping_zone_countries')
export class ShippingZoneCountry {
  @PrimaryColumn({ name: 'zone_id', type: 'uuid' })
  zoneId: string;

  @ManyToOne(() => ShippingZone, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone_id' })
  zone: ShippingZone;

  @PrimaryColumn({ type: 'char', length: 2 })
  country: string;
}
