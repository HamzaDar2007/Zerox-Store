import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionSessionDto {
  @ApiProperty({ example: 'price_1234abc', description: 'Stripe price ID' })
  @IsString()
  @IsNotEmpty()
  priceId: string;

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
