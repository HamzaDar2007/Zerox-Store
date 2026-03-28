import { IsString, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCouponScopeDto {
  @ApiProperty({
    example: 'product',
    description: 'Scope type (product, category, user)',
  })
  @IsString()
  @IsNotEmpty()
  scopeType: string;

  @ApiPropertyOptional({ description: 'Target user UUID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Target product UUID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ description: 'Target category UUID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
