import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWishlistDto {
  @ApiPropertyOptional({
    example: 'Birthday Wishlist',
    description: 'Wishlist name',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether the wishlist is publicly visible',
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
