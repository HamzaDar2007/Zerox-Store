import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { ReferralStatus } from '@common/enums';

export class UpdateReferralDto {
  @ApiPropertyOptional({ description: 'Referral status', enum: ReferralStatus })
  @IsOptional()
  @IsEnum(ReferralStatus)
  status?: ReferralStatus;
}
