import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { DisputeEvidenceType } from '@common/enums';

export class CreateDisputeEvidenceDto {
  @ApiProperty({ description: 'Dispute ID' })
  @IsNotEmpty()
  @IsUuidString()
  disputeId: string;

  @ApiProperty({ description: 'User ID who submitted evidence' })
  @IsNotEmpty()
  @IsUuidString()
  submittedBy: string;

  @ApiProperty({ description: 'Evidence type', enum: DisputeEvidenceType })
  @IsNotEmpty()
  @IsEnum(DisputeEvidenceType)
  type: DisputeEvidenceType;

  @ApiPropertyOptional({ description: 'File URL' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Description of evidence' })
  @IsOptional()
  @IsString()
  description?: string;
}
