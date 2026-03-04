import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsDateString,
  IsObject,
} from 'class-validator';
import { CampaignStatus, CampaignType } from '@common/enums';

export class CreateCampaignDto {
  @ApiProperty({ description: 'Campaign name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Campaign description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Campaign type', enum: CampaignType })
  @IsNotEmpty()
  @IsEnum(CampaignType)
  type: CampaignType;

  @ApiPropertyOptional({ description: 'Campaign status', enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiProperty({ description: 'Start date' })
  @IsNotEmpty()
  @IsDateString()
  startsAt: string;

  @ApiProperty({ description: 'End date' })
  @IsNotEmpty()
  @IsDateString()
  endsAt: string;

  @ApiPropertyOptional({ description: 'Banner image URL' })
  @IsOptional()
  @IsString()
  bannerImage?: string;

  @ApiPropertyOptional({ description: 'Landing page URL' })
  @IsOptional()
  @IsString()
  landingPageUrl?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
