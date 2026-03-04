import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateLanguageDto } from './create-language.dto';

export class UpdateLanguageDto extends PartialType(
  OmitType(CreateLanguageDto, ['code'] as const),
) {}
