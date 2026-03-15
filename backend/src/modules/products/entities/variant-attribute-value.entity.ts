import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { AttributeKey } from './attribute-key.entity';
import { AttributeValue } from './attribute-value.entity';

@Entity('variant_attribute_values')
export class VariantAttributeValue {
  @PrimaryColumn({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @PrimaryColumn({ name: 'attribute_key_id', type: 'uuid' })
  attributeKeyId: string;

  @ManyToOne(() => AttributeKey, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_key_id' })
  attributeKey: AttributeKey;

  @Column({ name: 'attribute_value_id', type: 'uuid' })
  attributeValueId: string;

  @ManyToOne(() => AttributeValue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_value_id' })
  attributeValue: AttributeValue;
}
