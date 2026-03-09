import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { RedirectType } from '@common/enums';

export class CreateUrlRedirectDto {
  @ApiProperty({
    description: 'Source URL path to redirect from',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  sourceUrl: string;

  @ApiProperty({ description: 'Target URL to redirect to', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  targetUrl: string;

  @ApiPropertyOptional({
    description: 'Redirect type',
    enum: RedirectType,
    default: RedirectType.PERMANENT_301,
  })
  @IsOptional()
  @IsEnum(RedirectType)
  redirectType?: RedirectType;

  @ApiPropertyOptional({
    description: 'Whether the redirect is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
