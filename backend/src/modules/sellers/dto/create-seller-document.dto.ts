import { IsUuidString } from '@common/decorators/is-uuid-string.decorator';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SellerDocType } from '@common/enums';

export class CreateSellerDocumentDto {
  @ApiProperty({ description: 'Seller ID' })
  @IsUuidString()
  @IsNotEmpty()
  sellerId: string;

  @ApiProperty({ enum: SellerDocType })
  @IsEnum(SellerDocType)
  @IsNotEmpty()
  documentType: SellerDocType;

  @ApiProperty({ description: 'Document file URL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  fileUrl: string;

  @ApiPropertyOptional({ description: 'Document expiry date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
