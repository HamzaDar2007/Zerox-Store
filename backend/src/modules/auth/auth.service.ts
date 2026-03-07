import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  RefreshTokenDto,
  PasswordResetDto,
  ResetPasswordDto,
} from './dto/refresh-token.dto';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';

import { SafeLogger } from '../../common/utils/logger.util';
import { ValidationUtil } from '../../common/utils/validation.util';
import { MailService } from '../../common/modules/mail/mail.service';

// Create a type for User without password
type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly mailService: MailService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ success: boolean; message: string; data: { accessToken: string; refreshToken: string; user: UserWithoutPassword } }> {
    ValidationUtil.validateEmail(dto.email);
    // ValidationUtil.validateString(dto.firstName, 'firstName', 2, 50);
    // ValidationUtil.validateString(dto.lastName, 'lastName', 2, 50);
    ValidationUtil.validatePassword(dto.password);

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const userResponse = await this.usersService.create({
      email: ValidationUtil.sanitizeString(dto.email.toLowerCase()),
      password: dto.password,
      name: ValidationUtil.sanitizeString(dto.name),
      phone: dto.phone,
    });

    SafeLogger.log(`User registered successfully: ${dto.email}`, 'AuthService');

    // Extract the actual user data from the service response
    const userData = userResponse.data || (userResponse as any);
    const { password: _pw, twoFactorSecret: _tfs, twoFactorBackupCodes: _tbc, ...userWithoutPassword } = userData;

    // Generate tokens so user is auto-logged-in after registration
    const payload = { sub: userData.id, email: userData.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = await this.generateRefreshToken(userData.id);

    // Send welcome email to customer + alert to admin (fire-and-forget)
    this.mailService.sendWelcomeEmail(dto.name || 'User', dto.email).catch(() => {});

    return {
      success: true,
      message: 'User registered successfully',
      data: { accessToken, refreshToken: refreshToken.refreshToken, user: userWithoutPassword },
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email, {
      includePassword: true,
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(
    dto: AuthCredentialsDto,
  ): Promise<{ success: boolean; message: string; data: LoginResponseDto }> {
    ValidationUtil.validateEmail(dto.email);
    ValidationUtil.validateString(dto.password, 'password', 1);

    const user = await this.usersService.findByEmail(
      dto.email.toLowerCase().trim(),
      {
        includePassword: true,
      },
    );
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is deactivated
    if (user.isActive === false) {
      throw new ForbiddenException('Account is deactivated. Please contact support.');
    }

    // Check if account is temporarily locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked. Please try again later.');
    }

    const { password: _pw, twoFactorSecret: _tfs, twoFactorBackupCodes: _tbc, ...userSafe } = user;
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = await this.generateRefreshToken(user.id);

    SafeLogger.log(`User logged in successfully: ${dto.email}`, 'AuthService');
    return {
      success: true,
      message: 'Login successful',
      data: { accessToken, refreshToken: refreshToken.refreshToken, user: userSafe },
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<{
    success: boolean;
    message: string;
    data: { accessToken: string };
  }> {
    ValidationUtil.validateString(dto.refreshToken, 'refreshToken');

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { refreshToken: dto.refreshToken, isValid: true },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const payload = {
      sub: refreshToken.user.id,
      email: refreshToken.user.email,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    SafeLogger.log(
      `Token refreshed for user: ${refreshToken.user.email}`,
      'AuthService',
    );
    return {
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken },
    };
  }

  async logout(
    refreshToken: string,
  ): Promise<{ success: boolean; message: string }> {
    ValidationUtil.validateString(refreshToken, 'refreshToken');

    const result = await this.refreshTokenRepository.update(
      { refreshToken: refreshToken },
      { isValid: false },
    );

    if (result.affected === 0) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    SafeLogger.log('User logged out successfully', 'AuthService');
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async requestPasswordReset(
    dto: PasswordResetDto,
  ): Promise<{ success: boolean; message: string; token?: string }> {
    ValidationUtil.validateEmail(dto.email);

    const user = await this.usersService.findByEmail(
      dto.email.toLowerCase().trim(),
    );

    // Always return the same response to prevent email enumeration
    if (user) {
      const resetToken = await this.jwtService.signAsync(
        { sub: user.id, type: 'password-reset' },
        { expiresIn: '1h' },
      );

      SafeLogger.log(
        `Password reset token generated for: ${dto.email}`,
        'AuthService',
      );

      // Send password reset email with the token link
      this.mailService.sendPasswordResetEmail(user.email, user.name || 'User', resetToken).catch(() => {});
    }

    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    dto: ResetPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    ValidationUtil.validateString(dto.token, 'token');
    ValidationUtil.validatePassword(dto.password);

    try {
      const payload = await this.jwtService.verifyAsync(dto.token);
      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      await this.usersService.updatePassword(payload.sub, hashedPassword);

      // Revoke all refresh tokens for this user for security
      await this.refreshTokenRepository.update(
        { userId: payload.sub },
        { isValid: false },
      );

      SafeLogger.log(
        `Password reset successful for user ID: ${payload.sub}`,
        'AuthService',
      );

      // Send password changed confirmation email (fire-and-forget)
      try {
        const user = await this.usersService.findByEmail(payload.email || '');
        if (user) {
          this.mailService.sendPasswordChangedEmail(user.email, user.name || 'User').catch(() => {});
        }
      } catch (_) { /* silently ignore */ }

      return {
        success: true,
        message:
          'Password has been changed successfully. Please login with your new password.',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  async getCurrentUser(
    userId: string,
  ): Promise<{ success: boolean; message: string; data: any }> {
    const user = await this.usersService.findOne(userId);
    const userData = user as any;
    const { password: _pw, twoFactorSecret: _tfs, twoFactorBackupCodes: _tbc, ...userWithoutPassword } = userData?.data || userData || {};
    return {
      success: true,
      message: 'User details retrieved successfully',
      data: userWithoutPassword,
    };
  }

  async getCurrentUserByEmail(email: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password: _pw, twoFactorSecret: _tfs, twoFactorBackupCodes: _tbc, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  private async generateRefreshToken(userId: string): Promise<RefreshToken> {
    const token = await this.jwtService.signAsync(
      { sub: userId, type: 'refresh' },
      { expiresIn: '7d' },
    );

    const refreshToken = this.refreshTokenRepository.create({
      refreshToken: token,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async getUserWithDetails(userId: string) {
    return this.usersService.findOneWithPermissions(userId);
  }
}
