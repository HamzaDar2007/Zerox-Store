import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Attribute } from '../../categories/entities/attribute.entity';
import { AttributeOption } from '../../categories/entities/attribute-option.entity';

@Entity('product_attributes')
export class ProductAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.attributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'attribute_id', type: 'uuid' })
  attributeId: string;

  @ManyToOne(() => Attribute)
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @Column({ name: 'attribute_option_id', type: 'uuid', nullable: true })
  attributeOptionId: string | null;

  @ManyToOne(() => AttributeOption)
  @JoinColumn({ name: 'attribute_option_id' })
  attributeOption: AttributeOption | null;

  @Column({ name: 'value_text', type: 'text', nullable: true })
  valueText: string | null;

  @Column({ name: 'value_numeric', type: 'decimal', precision: 14, scale: 4, nullable: true })
  valueNumeric: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
