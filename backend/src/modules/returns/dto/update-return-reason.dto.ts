import { PartialType } from '@nestjs/swagger';
import { CreateReturnReasonDto } from './create-return-reason.dto';

export class UpdateReturnReasonDto extends PartialType(CreateReturnReasonDto) {}
