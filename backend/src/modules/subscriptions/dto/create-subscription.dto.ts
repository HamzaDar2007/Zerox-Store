import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Subscription plan UUID',
  })
  @IsUUID()
  planId: string;

  @ApiPropertyOptional({
    example: 'stripe',
    description: 'Payment gateway',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gateway?: string;

  @ApiPropertyOptional({
    example: 'sub_abc123',
    description: 'Gateway subscription ID',
  })
  @IsOptional()
  @IsString()
  gatewaySubId?: string;

  @ApiProperty({
    example: '2024-07-01T00:00:00Z',
    description: 'Current period start date',
  })
  @IsDateString()
  currentPeriodStart: Date;

  @ApiProperty({
    example: '2024-08-01T00:00:00Z',
    description: 'Current period end date',
  })
  @IsDateString()
  currentPeriodEnd: Date;

  @ApiPropertyOptional({
    example: '2024-07-15T00:00:00Z',
    description: 'Trial ends at',
  })
  @IsOptional()
  @IsDateString()
  trialEndsAt?: Date;

  @ApiPropertyOptional({ example: null, description: 'Cancellation date' })
  @IsOptional()
  @IsDateString()
  cancelledAt?: Date;
}
