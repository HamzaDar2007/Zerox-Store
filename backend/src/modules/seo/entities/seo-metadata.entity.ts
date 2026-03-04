import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('seo_metadata')
@Unique(['entityType', 'entityId'])
export class SeoMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle: string | null;

  @Column({ name: 'meta_description', type: 'varchar', length: 500, nullable: true })
  metaDescription: string | null;

  @Column({ name: 'meta_keywords', type: 'text', array: true, nullable: true })
  metaKeywords: string[] | null;

  @Column({ name: 'canonical_url', type: 'varchar', length: 500, nullable: true })
  canonicalUrl: string | null;

  @Column({ name: 'og_title', type: 'varchar', length: 255, nullable: true })
  ogTitle: string | null;

  @Column({ name: 'og_description', type: 'varchar', length: 500, nullable: true })
  ogDescription: string | null;

  @Column({ name: 'og_image_url', type: 'varchar', length: 500, nullable: true })
  ogImageUrl: string | null;

  @Column({ name: 'og_type', type: 'varchar', length: 50, default: 'website' })
  ogType: string;

  @Column({ name: 'twitter_card_type', type: 'varchar', length: 30, nullable: true })
  twitterCardType: string | null;

  @Column({ name: 'twitter_title', type: 'varchar', length: 255, nullable: true })
  twitterTitle: string | null;

  @Column({ name: 'twitter_description', type: 'varchar', length: 500, nullable: true })
  twitterDescription: string | null;

  @Column({ name: 'twitter_image_url', type: 'varchar', length: 500, nullable: true })
  twitterImageUrl: string | null;

  @Column({ name: 'structured_data', type: 'jsonb', nullable: true })
  structuredData: Record<string, any> | null;

  @Column({ name: 'robots_directive', type: 'varchar', length: 100, default: 'index, follow' })
  robotsDirective: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
