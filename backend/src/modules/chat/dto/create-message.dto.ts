import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { MessageType, MessageSenderType } from '@common/enums';

export class CreateMessageDto {
  @ApiProperty({ description: 'Conversation ID' })
  @IsNotEmpty()
  @IsUuidString()
  conversationId: string;

  @ApiProperty({ description: 'Sender ID' })
  @IsNotEmpty()
  @IsUuidString()
  senderId: string;

  @ApiProperty({ description: 'Sender type', enum: MessageSenderType })
  @IsNotEmpty()
  @IsEnum(MessageSenderType)
  senderType: MessageSenderType;

  @ApiPropertyOptional({ description: 'Message type', enum: MessageType })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({ description: 'Message content' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Message attachments' })
  @IsOptional()
  @IsArray()
  attachments?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Is system message', default: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
