import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsObject,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Target user UUID',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'push',
    description: 'Notification channel (push, email, sms)',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  channel: string;

  @ApiProperty({
    example: 'order_update',
    description: 'Notification type',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;

  @ApiPropertyOptional({
    example: 'Order Shipped!',
    description: 'Notification title',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({
    example: 'Your order #123 has been shipped',
    description: 'Notification body',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  body?: string;

  @ApiPropertyOptional({ example: '/orders/123', description: 'Action URL' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  actionUrl?: string;

  @ApiPropertyOptional({
    example: { orderId: '123' },
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
