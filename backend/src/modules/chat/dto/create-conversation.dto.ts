import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ConversationType, ConversationStatus } from '@common/enums';

export class CreateConversationDto {
  @ApiProperty({ description: 'Conversation type', enum: ConversationType })
  @IsNotEmpty()
  @IsEnum(ConversationType)
  type: ConversationType;

  @ApiProperty({ description: 'Customer ID' })
  @IsNotEmpty()
  @IsUuidString()
  customerId: string;

  @ApiPropertyOptional({ description: 'Store ID (for store conversations)' })
  @IsOptional()
  @IsUuidString()
  storeId?: string;

  @ApiPropertyOptional({ description: 'Order ID (for order-related conversations)' })
  @IsOptional()
  @IsUuidString()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Conversation subject' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @ApiPropertyOptional({ description: 'Conversation status', enum: ConversationStatus })
  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;
}
