import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { NotificationType, NotificationChannel } from '@common/enums';

export class CreateNotificationTemplateDto {
  @ApiProperty({ description: 'Template code (unique)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  code: string;

  @ApiProperty({ description: 'Template name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Notification type', enum: NotificationType })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({ description: 'Notification channels', type: [String], enum: NotificationChannel })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels?: NotificationChannel[];

  @ApiPropertyOptional({ description: 'Email subject' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @ApiPropertyOptional({ description: 'Plain text body' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ description: 'HTML body for emails' })
  @IsOptional()
  @IsString()
  htmlBody?: string;

  @ApiPropertyOptional({ description: 'SMS body (max 160 chars)' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  smsBody?: string;

  @ApiPropertyOptional({ description: 'Push notification title' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pushTitle?: string;

  @ApiPropertyOptional({ description: 'Push notification body' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  pushBody?: string;

  @ApiPropertyOptional({ description: 'Template variables' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
