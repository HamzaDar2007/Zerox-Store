import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { LoyaltyTransactionType } from '@common/enums';

export class CreateLoyaltyTransactionDto {
  @ApiProperty({ description: 'User ID' })
  @IsUuidString()
  userId: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: LoyaltyTransactionType,
  })
  @IsEnum(LoyaltyTransactionType)
  type: LoyaltyTransactionType;

  @ApiProperty({
    description: 'Points amount (positive for earn, negative for redeem)',
  })
  @IsInt()
  points: number;

  @ApiPropertyOptional({
    description: 'Reference entity type (e.g., order, review)',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  referenceType?: string;

  @ApiPropertyOptional({ description: 'Reference entity ID' })
  @IsOptional()
  @IsUuidString()
  referenceId?: string;

  @ApiPropertyOptional({ description: 'Transaction description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Points expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
