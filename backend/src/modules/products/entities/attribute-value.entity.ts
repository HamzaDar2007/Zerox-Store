import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { AttributeKey } from './attribute-key.entity';

@Entity('attribute_values')
@Unique(['attributeKeyId', 'value'])
export class AttributeValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'attribute_key_id', type: 'uuid' })
  attributeKeyId: string;

  @ManyToOne(() => AttributeKey, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_key_id' })
  attributeKey: AttributeKey;

  @Column({ type: 'varchar', length: 200 })
  value: string;

  @Column({
    name: 'display_value',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  displayValue: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
