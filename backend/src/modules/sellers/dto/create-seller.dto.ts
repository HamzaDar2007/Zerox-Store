import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayoutFrequency } from '@common/enums';

export class CreateSellerDto {
  @ApiProperty({ description: 'User ID', example: 'uuid' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({ description: 'Business name', maxLength: 200 })
  @IsString()
  @IsNotEmpty({ message: 'Business name is required' })
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  businessName: string;

  @ApiPropertyOptional({
    description: 'Business name in Arabic',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  businessNameAr?: string;

  @ApiPropertyOptional({ description: 'CNIC number', maxLength: 15 })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  @Matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/, {
    message: 'CNIC must be in format 12345-1234567-1',
  })
  cnic?: string;

  @ApiPropertyOptional({ description: 'CNIC front image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cnicFrontImage?: string;

  @ApiPropertyOptional({ description: 'CNIC back image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cnicBackImage?: string;

  @ApiPropertyOptional({ description: 'Bank name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({ description: 'Bank account number' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  bankAccountNumber?: string;

  @ApiPropertyOptional({ description: 'Bank account title' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankAccountTitle?: string;

  @ApiPropertyOptional({ description: 'IBAN' })
  @IsOptional()
  @IsString()
  @MaxLength(34)
  bankIban?: string;

  @ApiPropertyOptional({ description: 'SWIFT code' })
  @IsOptional()
  @IsString()
  @MaxLength(11)
  bankSwift?: string;

  @ApiPropertyOptional({
    enum: PayoutFrequency,
    default: PayoutFrequency.WEEKLY,
  })
  @IsOptional()
  @IsEnum(PayoutFrequency)
  payoutFrequency?: PayoutFrequency;

  @ApiPropertyOptional({
    description: 'Commission rate percentage',
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;
}
