import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateReferralCodeDto {
  @ApiProperty({ description: 'User ID who owns this referral code' })
  @IsUuidString()
  userId: string;

  @ApiPropertyOptional({ description: 'Custom referral code (auto-generated if not provided)', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[A-Z0-9]+$/, { message: 'code must be uppercase alphanumeric' })
  code?: string;

  @ApiPropertyOptional({ description: 'Whether the code is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
