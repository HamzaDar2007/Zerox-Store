import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsIn,
  MaxLength,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionPlanDto {
  @ApiProperty({
    example: 'Premium Plan',
    description: 'Plan name',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({
    example: 'Full access to all features',
    description: 'Plan description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: 999.99, description: 'Plan price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'PKR', description: 'Currency code (ISO 3-letter)' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currency: string;

  @ApiProperty({
    example: 'monthly',
    description: 'Billing interval (daily, weekly, monthly, yearly)',
    maxLength: 20,
    enum: [
      'daily',
      'weekly',
      'monthly',
      'yearly',
      'day',
      'week',
      'month',
      'year',
    ],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'daily',
    'weekly',
    'monthly',
    'yearly',
    'day',
    'week',
    'month',
    'year',
  ])
  @MaxLength(20)
  interval: string;

  @ApiProperty({
    example: 1,
    description: 'Number of intervals per billing cycle',
  })
  @IsInt()
  intervalCount: number;

  @ApiPropertyOptional({ example: 14, description: 'Trial period in days' })
  @IsOptional()
  @IsInt()
  trialDays?: number;
}
