import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token received via email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Verification token is required' })
  @Transform(({ value }) => value?.trim())
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'Email address to resend verification link',
    example: 'user@example.com',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;
}
