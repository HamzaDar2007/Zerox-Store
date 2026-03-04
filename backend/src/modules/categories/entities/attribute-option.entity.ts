import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Attribute } from './attribute.entity';

@Entity('attribute_options')
@Unique(['attributeId', 'value'])
export class AttributeOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'attribute_id', type: 'uuid' })
  attributeId: string;

  @ManyToOne(() => Attribute, (attr) => attr.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @Column({ type: 'varchar', length: 200 })
  value: string;

  @Column({ name: 'color_hex', type: 'varchar', length: 7, nullable: true })
  colorHex: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
