import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChatMessageDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Thread UUID',
  })
  @IsUUID()
  threadId: string;

  @ApiProperty({
    example: 'Hello, I have a question about my order',
    description: 'Message body',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body: string;

  @ApiPropertyOptional({
    example: 'https://example.com/screenshot.png',
    description: 'Attachment URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  attachmentUrl?: string;
}
