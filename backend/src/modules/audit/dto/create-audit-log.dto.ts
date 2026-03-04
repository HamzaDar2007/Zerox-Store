import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsIP,
  MaxLength,
} from 'class-validator';
import { AuditAction } from '@common/enums';

export class CreateAuditLogDto {
  @ApiPropertyOptional({ description: 'User ID who performed the action' })
  @IsOptional()
  @IsUuidString()
  userId?: string;

  @ApiProperty({ description: 'Action performed', enum: AuditAction })
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({ description: 'Entity type affected', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  entityType: string;

  @ApiPropertyOptional({ description: 'Entity ID affected' })
  @IsOptional()
  @IsUuidString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Previous values before change', type: Object })
  @IsOptional()
  oldValues?: Record<string, any>;

  @ApiPropertyOptional({ description: 'New values after change', type: Object })
  @IsOptional()
  newValues?: Record<string, any>;

  @ApiPropertyOptional({ description: 'List of changed field names', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  changedFields?: string[];

  @ApiPropertyOptional({ description: 'Client IP address' })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Client user agent' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsOptional()
  @IsUuidString()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Action description' })
  @IsOptional()
  @IsString()
  description?: string;
}
