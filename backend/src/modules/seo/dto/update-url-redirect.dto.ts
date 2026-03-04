import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUrlRedirectDto } from './create-url-redirect.dto';

export class UpdateUrlRedirectDto extends PartialType(
  OmitType(CreateUrlRedirectDto, ['sourceUrl'] as const),
) {}
