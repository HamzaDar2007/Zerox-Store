import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateReferralDto {
  @ApiProperty({ description: 'Referred user ID (new user being referred)' })
  @IsUuidString()
  referredUserId: string;

  @ApiProperty({ description: 'Referral code used', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  code: string;
}
