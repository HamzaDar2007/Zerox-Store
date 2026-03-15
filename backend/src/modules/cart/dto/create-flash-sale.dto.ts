import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDate,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFlashSaleDto {
  @ApiProperty({
    example: 'Summer Flash Sale',
    description: 'Sale name',
    maxLength: 300,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string;

  @ApiProperty({
    example: '2024-07-01T00:00:00Z',
    description: 'Sale start date',
  })
  @Type(() => Date)
  @IsDate()
  startsAt: Date;

  @ApiProperty({
    example: '2024-07-03T23:59:59Z',
    description: 'Sale end date',
  })
  @Type(() => Date)
  @IsDate()
  endsAt: Date;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the sale is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
