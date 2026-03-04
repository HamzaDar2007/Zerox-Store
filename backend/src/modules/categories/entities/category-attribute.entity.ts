import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Category } from './category.entity';
import { Attribute } from './attribute.entity';

@Entity('category_attributes')
@Unique(['categoryId', 'attributeId'])
export class CategoryAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'attribute_id', type: 'uuid' })
  attributeId: string;

  @ManyToOne(() => Attribute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: Attribute;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;
}
