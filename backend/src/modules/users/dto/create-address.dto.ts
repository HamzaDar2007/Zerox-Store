import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiPropertyOptional({
    description: 'Label for the address (e.g., Home, Office)',
    example: 'Home',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Label must be a string' })
  @MaxLength(50, { message: 'Label cannot exceed 50 characters' })
  label?: string;

  @ApiProperty({
    description: 'Full name for delivery',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(100, { message: 'Full name cannot exceed 100 characters' })
  fullName: string;

  @ApiProperty({
    description: 'Phone number for delivery',
    example: '+923001234567',
    maxLength: 20,
  })
  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required' })
  @MaxLength(20, { message: 'Phone cannot exceed 20 characters' })
  phone: string;

  @ApiProperty({
    description: 'Country',
    example: 'Pakistan',
    maxLength: 100,
  })
  @IsString({ message: 'Country must be a string' })
  @IsNotEmpty({ message: 'Country is required' })
  @MaxLength(100, { message: 'Country cannot exceed 100 characters' })
  country: string;

  @ApiProperty({
    description: 'Province/State',
    example: 'Punjab',
    maxLength: 100,
  })
  @IsString({ message: 'Province must be a string' })
  @IsNotEmpty({ message: 'Province is required' })
  @MaxLength(100, { message: 'Province cannot exceed 100 characters' })
  province: string;

  @ApiProperty({
    description: 'City',
    example: 'Lahore',
    maxLength: 100,
  })
  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  city: string;

  @ApiPropertyOptional({
    description: 'Area/Neighborhood',
    example: 'DHA Phase 5',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Area must be a string' })
  @MaxLength(100, { message: 'Area cannot exceed 100 characters' })
  area?: string;

  @ApiProperty({
    description: 'Street address',
    example: 'House #123, Street 45',
  })
  @IsString({ message: 'Street address must be a string' })
  @IsNotEmpty({ message: 'Street address is required' })
  streetAddress: string;

  @ApiPropertyOptional({
    description: 'Postal/ZIP code',
    example: '54000',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  @MaxLength(20, { message: 'Postal code cannot exceed 20 characters' })
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 31.5204,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: 74.3587,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Delivery instructions',
    example: 'Ring the doorbell twice',
  })
  @IsOptional()
  @IsString({ message: 'Delivery instructions must be a string' })
  deliveryInstructions?: string;

  @ApiPropertyOptional({
    description: 'Set as default shipping address',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isDefaultShipping must be a boolean' })
  isDefaultShipping?: boolean;

  @ApiPropertyOptional({
    description: 'Set as default billing address',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isDefaultBilling must be a boolean' })
  isDefaultBilling?: boolean;
}
