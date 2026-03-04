import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  Matches,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, Gender } from '@common/enums';

export class CreateUserDto {
  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    maxLength: 150,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(150, { message: 'Email cannot exceed 150 characters' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({
    description:
      'Password (must contain at least 1 uppercase, 1 lowercase, and 1 number)',
    example: 'StrongPass123',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+923001234567',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone cannot exceed 20 characters' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: Gender,
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'Invalid gender' })
  gender?: Gender;
}
