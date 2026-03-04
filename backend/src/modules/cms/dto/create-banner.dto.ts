import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUrl,
  IsInt,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { BannerPosition, BannerLinkType } from '@common/enums';

export class CreateBannerDto {
  @ApiProperty({ description: 'Banner title', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Banner subtitle', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subtitle?: string;

  @ApiProperty({ description: 'Desktop image URL', maxLength: 500 })
  @IsUrl()
  @MaxLength(500)
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Mobile image URL', maxLength: 500 })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  mobileImageUrl?: string;

  @ApiPropertyOptional({ description: 'Link URL', maxLength: 500 })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  linkUrl?: string;

  @ApiPropertyOptional({ description: 'Link type', enum: BannerLinkType })
  @IsOptional()
  @IsEnum(BannerLinkType)
  linkType?: BannerLinkType;

  @ApiPropertyOptional({ description: 'Link target entity ID' })
  @IsOptional()
  @IsUuidString()
  linkTargetId?: string;

  @ApiProperty({
    description: 'Banner position',
    enum: BannerPosition,
    default: BannerPosition.HOMEPAGE_HERO,
  })
  @IsEnum(BannerPosition)
  position: BannerPosition;

  @ApiPropertyOptional({ description: 'Sort order for display', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Banner start date' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ description: 'Banner end date' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ description: 'Whether the banner is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
