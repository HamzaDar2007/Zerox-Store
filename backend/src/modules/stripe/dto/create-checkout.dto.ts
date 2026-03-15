import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Order UUID',
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    example: 'https://example.com/success',
    description: 'Success redirect URL',
  })
  @IsString()
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({
    example: 'https://example.com/cancel',
    description: 'Cancel redirect URL',
  })
  @IsString()
  @IsNotEmpty()
  cancelUrl: string;
}
