import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
} from 'class-validator';
import { TicketPriority } from '@common/enums';

export class CreateTicketDto {
  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsUuidString()
  categoryId?: string;

  @ApiProperty({ description: 'Ticket subject', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  subject: string;

  @ApiProperty({ description: 'Ticket description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Ticket priority',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ description: 'Related order ID' })
  @IsOptional()
  @IsUuidString()
  orderId?: string;

  @ApiPropertyOptional({ description: 'File attachments', type: [Object] })
  @IsOptional()
  @IsArray()
  attachments?: Record<string, any>[];
}
