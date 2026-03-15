import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ConversationStatus } from '../../../common/enums/chat.enum';

export class UpdateChatThreadDto {
  @ApiPropertyOptional({
    example: 'closed',
    description: 'Thread status',
    enum: ConversationStatus,
  })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(ConversationStatus))
  status?: string;
}
