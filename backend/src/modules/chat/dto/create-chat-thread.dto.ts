import {
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChatThreadDto {
  @ApiPropertyOptional({
    example: 'Question about order',
    description: 'Thread subject',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  subject?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Related order UUID',
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Related product UUID',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    example: ['uuid1', 'uuid2'],
    description: 'Participant user UUIDs',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  participantUserIds?: string[];
}
