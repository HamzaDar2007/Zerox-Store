import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @ApiPropertyOptional({
    description: 'Enable or disable this notification type',
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Enable email notifications for this type',
  })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiPropertyOptional({
    description: 'Enable push notifications for this type',
  })
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @ApiPropertyOptional({
    description: 'Enable in-app notifications for this type',
  })
  @IsOptional()
  @IsBoolean()
  inApp?: boolean;
}
