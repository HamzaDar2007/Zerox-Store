import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateCartDto {
  @ApiPropertyOptional({ description: 'User ID (for authenticated users)' })
  @IsOptional()
  @IsUuidString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Session ID (for guest users)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Currency code', default: 'PKR' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currencyCode?: string;

  @ApiPropertyOptional({ description: 'Voucher ID for discount' })
  @IsOptional()
  @IsUuidString()
  voucherId?: string;

  @ApiPropertyOptional({ description: 'Discount amount', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountAmount?: number;
}
