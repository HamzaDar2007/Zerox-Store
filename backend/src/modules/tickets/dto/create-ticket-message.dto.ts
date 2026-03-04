import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateTicketMessageDto {
  @ApiProperty({ description: 'Ticket ID' })
  @IsUuidString()
  ticketId: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Whether the message is from staff', default: false })
  @IsOptional()
  @IsBoolean()
  isStaff?: boolean;

  @ApiPropertyOptional({ description: 'Whether the message is internal (staff only)', default: false })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @ApiPropertyOptional({ description: 'File attachments', type: [Object] })
  @IsOptional()
  @IsArray()
  attachments?: Record<string, any>[];
}
