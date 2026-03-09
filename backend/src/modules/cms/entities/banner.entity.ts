import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BannerPosition, BannerLinkType } from '@common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  subtitle: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500 })
  imageUrl: string;

  @Column({
    name: 'mobile_image_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  mobileImageUrl: string | null;

  @Column({ name: 'link_url', type: 'varchar', length: 500, nullable: true })
  linkUrl: string | null;

  @Column({
    name: 'link_type',
    type: 'enum',
    enum: BannerLinkType,
    nullable: true,
  })
  linkType: BannerLinkType | null;

  @Column({ name: 'link_target_id', type: 'uuid', nullable: true })
  linkTargetId: string | null;

  @Column({
    type: 'enum',
    enum: BannerPosition,
    default: BannerPosition.HOMEPAGE_HERO,
  })
  position: BannerPosition;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'view_count', type: 'integer', default: 0 })
  viewCount: number;

  @Column({ name: 'click_count', type: 'integer', default: 0 })
  clickCount: number;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
