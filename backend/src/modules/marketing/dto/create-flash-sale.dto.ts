import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { FlashSaleStatus } from '@common/enums';

export class CreateFlashSaleDto {
  @ApiProperty({ description: 'Flash sale name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Flash sale description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Flash sale status',
    enum: FlashSaleStatus,
  })
  @IsOptional()
  @IsEnum(FlashSaleStatus)
  status?: FlashSaleStatus;

  @ApiProperty({ description: 'Start date' })
  @IsNotEmpty()
  @IsDateString()
  startsAt: string;

  @ApiProperty({ description: 'End date' })
  @IsNotEmpty()
  @IsDateString()
  endsAt: string;

  @ApiPropertyOptional({ description: 'Banner image URL' })
  @IsOptional()
  @IsString()
  bannerImage?: string;
}
