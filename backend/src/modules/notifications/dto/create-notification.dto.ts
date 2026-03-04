import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsObject,
} from 'class-validator';
import { NotificationType, NotificationChannel, NotificationStatus } from '@common/enums';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsUuidString()
  userId: string;

  @ApiProperty({ description: 'Notification type', enum: NotificationType })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Notification channel', enum: NotificationChannel })
  @IsNotEmpty()
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({ description: 'Notification title' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Notification body' })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: 'Additional data as JSON' })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Notification status', enum: NotificationStatus })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;
}
