import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReturnRequestDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Order UUID',
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    example: 'Product arrived damaged',
    description: 'Return reason',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reason: string;
}
