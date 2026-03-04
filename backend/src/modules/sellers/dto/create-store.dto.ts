import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsBoolean,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ description: 'Seller ID' })
  @IsUuidString()
  @IsNotEmpty()
  sellerId: string;

  @ApiProperty({ description: 'Store name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({ description: 'Store slug (auto-generated if not provided)', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Banner URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bannerUrl?: string;

  @ApiPropertyOptional({ description: 'Store description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Return policy' })
  @IsOptional()
  @IsString()
  returnPolicy?: string;

  @ApiPropertyOptional({ description: 'Shipping policy' })
  @IsOptional()
  @IsString()
  shippingPolicy?: string;

  @ApiPropertyOptional({ description: 'Is store active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
