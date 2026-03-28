import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyReviewDto {
  @ApiProperty({
    example: 'Thank you for your feedback!',
    description: 'Seller reply text',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body: string;
}
