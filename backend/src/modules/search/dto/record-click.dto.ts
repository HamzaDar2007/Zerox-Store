import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecordClickDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Clicked product UUID',
  })
  @IsUUID()
  productId: string;
}
