import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsIP,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateUserActivityLogDto {
  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsUuidString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Session ID', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sessionId?: string;

  @ApiProperty({ description: 'Activity type (e.g., view, click, search)', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  activityType: string;

  @ApiPropertyOptional({ description: 'Entity type viewed/interacted with', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID viewed/interacted with' })
  @IsOptional()
  @IsUuidString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Additional activity metadata', type: Object })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Client IP address' })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Client user agent' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Device type (desktop, mobile, tablet)', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  deviceType?: string;

  @ApiPropertyOptional({ description: 'Referrer URL', maxLength: 500 })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  referrerUrl?: string;

  @ApiPropertyOptional({ description: 'Current page URL', maxLength: 500 })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  pageUrl?: string;
}
