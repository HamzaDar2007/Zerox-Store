import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionStatus } from '../../../common/enums/subscription.enum';

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({
    example: 'cancelled',
    description: 'New subscription status',
    maxLength: 20,
    enum: SubscriptionStatus,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(Object.values(SubscriptionStatus))
  status?: string;
}
