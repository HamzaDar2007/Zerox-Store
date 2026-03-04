import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AttributeType } from '@common/enums';
import { AttributeGroup } from './attribute-group.entity';
import { AttributeOption } from './attribute-option.entity';

@Entity('attributes')
export class Attribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'attribute_group_id', type: 'uuid', nullable: true })
  attributeGroupId: string | null;

  @ManyToOne(() => AttributeGroup, (group) => group.attributes)
  @JoinColumn({ name: 'attribute_group_id' })
  attributeGroup: AttributeGroup | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({
    type: 'enum',
    enum: AttributeType,
    default: AttributeType.TEXT,
  })
  type: AttributeType;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit: string | null;

  @Column({ name: 'is_filterable', type: 'boolean', default: false })
  isFilterable: boolean;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ name: 'is_variant_attribute', type: 'boolean', default: false })
  isVariantAttribute: boolean;

  @OneToMany(() => AttributeOption, (option) => option.attribute)
  options: AttributeOption[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
