import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSeoMetadataDto } from './create-seo-metadata.dto';

export class UpdateSeoMetadataDto extends PartialType(
  OmitType(CreateSeoMetadataDto, ['entityType', 'entityId'] as const),
) {}
