import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { TicketStatus, TicketPriority } from '@common/enums';

export class UpdateTicketDto {
  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @IsUuidString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Ticket status', enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ description: 'Ticket priority', enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ description: 'Assigned staff user ID' })
  @IsOptional()
  @IsUuidString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Customer satisfaction rating (1-5)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  satisfactionRating?: number;

  @ApiPropertyOptional({ description: 'Customer satisfaction feedback' })
  @IsOptional()
  @IsString()
  satisfactionFeedback?: string;
}
