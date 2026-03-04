import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateDisputeMessageDto {
  @ApiProperty({ description: 'Dispute ID' })
  @IsNotEmpty()
  @IsUuidString()
  disputeId: string;

  @ApiProperty({ description: 'Sender ID' })
  @IsNotEmpty()
  @IsUuidString()
  senderId: string;

  @ApiProperty({ description: 'Message content' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Is internal message', default: false })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @ApiPropertyOptional({ description: 'Attachments as JSON array' })
  @IsOptional()
  @IsArray()
  attachments?: Record<string, any>[];
}
