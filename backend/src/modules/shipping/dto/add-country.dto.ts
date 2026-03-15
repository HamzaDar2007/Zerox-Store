import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCountryDto {
  @ApiProperty({ example: 'PK', description: 'ISO country code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  country: string;
}
