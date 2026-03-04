import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Language } from './language.entity';

@Entity('translations')
@Unique(['languageId', 'entityType', 'entityId', 'fieldName'])
export class Translation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'language_id', type: 'uuid' })
  languageId: string;

  @ManyToOne(() => Language, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'language_id' })
  language: Language;

  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ name: 'field_name', type: 'varchar', length: 100 })
  fieldName: string;

  @Column({ name: 'translated_value', type: 'text' })
  translatedValue: string;

  @Column({ name: 'is_auto_translated', type: 'boolean', default: false })
  isAutoTranslated: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
