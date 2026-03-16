import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Auditable } from '../../common/interceptor/audit.interceptor';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or email already exists',
  })
  @Auditable({ action: 'REGISTER', tableName: 'users' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns access and refresh tokens',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Auditable({ action: 'LOGIN', tableName: 'auth_sessions' })
  login(@Body() dto: AuthCredentialsDto, @Req() req: any) {
    return this.authService.login(dto.email, dto.password, {
      ip: req.ip,
      userAgent: req.headers?.['user-agent'],
    });
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'New token pair returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @Public()
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change password (requires authentication)' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or old password incorrect',
  })
  @Auditable({ action: 'CHANGE_PASSWORD', tableName: 'users' })
  changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: any) {
    return this.authService.changePassword(
      user.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  @Post('forgot-password')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Request a password reset token via email' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if account exists)',
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.createPasswordResetToken(dto.email);
  }

  @Post('reset-password')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Reset password using token from email' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('verify-email')
  @Public()
  @ApiOperation({ summary: 'Verify email address using token from email' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { token: { type: 'string' } },
      required: ['token'],
    },
  })
  verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
