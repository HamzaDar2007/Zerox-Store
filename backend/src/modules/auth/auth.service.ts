import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto, ResendVerificationDto } from './dto/verify-email.dto';
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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<{
    success: boolean;
    message: string;
    data: {
      accessToken: string;
      refreshToken: string;
      user: UserWithoutPassword;
    };
  }> {
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
    const {
      password: _pw,
      twoFactorSecret: _tfs,
      twoFactorBackupCodes: _tbc,
      ...userWithoutPassword
    } = userData;

    // Generate tokens so user is auto-logged-in after registration
    const payload = { sub: userData.id, email: userData.email };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = await this.generateRefreshToken(userData.id);

    // Send welcome email to customer + alert to admin (fire-and-forget)
    this.mailService
      .sendWelcomeEmail(dto.name || 'User', dto.email)
      .catch(() => {});

    // Send email verification link (fire-and-forget)
    const verificationToken = await this.jwtService.signAsync(
      { sub: userData.id, email: userData.email, type: 'email-verification' },
      { expiresIn: '24h' },
    );
    this.mailService
      .sendEmailVerification(dto.email, dto.name || 'User', verificationToken)
      .catch(() => {});

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        accessToken,
        refreshToken: refreshToken.refreshToken,
        user: userWithoutPassword,
      },
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
      // Increment login attempts and lock account after 5 failures
      const attempts = (user.loginAttempts || 0) + 1;
      const updateData: Partial<User> = { loginAttempts: attempts };
      if (attempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lockout
      }
      await this.userRepository.update({ id: user.id }, updateData);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockedUntil) {
      await this.userRepository.update(
        { id: user.id },
        {
          loginAttempts: 0,
          lockedUntil: null,
        },
      );
    }

    // Check if account is deactivated
    if (user.isActive === false) {
      throw new ForbiddenException(
        'Account is deactivated. Please contact support.',
      );
    }

    // Check if account is temporarily locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException(
        'Account is temporarily locked. Please try again later.',
      );
    }

    const {
      password: _pw,
      twoFactorSecret: _tfs,
      twoFactorBackupCodes: _tbc,
      ...userSafe
    } = user;
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = await this.generateRefreshToken(user.id);

    SafeLogger.log(`User logged in successfully: ${dto.email}`, 'AuthService');
    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken: refreshToken.refreshToken,
        user: userSafe,
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<{
    success: boolean;
    message: string;
    data: { accessToken: string; refreshToken: string };
  }> {
    ValidationUtil.validateString(dto.refreshToken, 'refreshToken');

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { refreshToken: dto.refreshToken, isValid: true },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Invalidate the old refresh token (token rotation)
    refreshToken.isValid = false;
    await this.refreshTokenRepository.save(refreshToken);

    const payload = {
      sub: refreshToken.user.id,
      email: refreshToken.user.email,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Generate a new refresh token
    const newRefreshToken = await this.generateRefreshToken(
      refreshToken.user.id,
    );

    SafeLogger.log(
      `Token refreshed for user: ${refreshToken.user.email}`,
      'AuthService',
    );
    return {
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken, refreshToken: newRefreshToken.refreshToken },
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
      this.mailService
        .sendPasswordResetEmail(user.email, user.name || 'User', resetToken)
        .catch(() => {});
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
          this.mailService
            .sendPasswordChangedEmail(user.email, user.name || 'User')
            .catch(() => {});
        }
      } catch (_) {
        /* silently ignore */
      }

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
    const {
      password: _pw,
      twoFactorSecret: _tfs,
      twoFactorBackupCodes: _tbc,
      ...userWithoutPassword
    } = userData?.data || userData || {};
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
    const {
      password: _pw,
      twoFactorSecret: _tfs,
      twoFactorBackupCodes: _tbc,
      ...userWithoutPassword
    } = user as any;
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

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name', 'password'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(userId, hashedPassword);

    // Revoke all refresh tokens for security
    await this.refreshTokenRepository.update({ userId }, { isValid: false });

    // Send confirmation email (fire-and-forget)
    this.mailService
      .sendPasswordChangedEmail(user.email, user.name || 'User')
      .catch(() => {});

    SafeLogger.log(`Password changed for user ID: ${userId}`, 'AuthService');
    return {
      success: true,
      message: 'Password changed successfully. Please login again.',
    };
  }

  async verifyEmail(
    dto: VerifyEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(dto.token);
      if (payload.type !== 'email-verification') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isEmailVerified) {
        return { success: true, message: 'Email is already verified' };
      }

      await this.userRepository.update(
        { id: user.id },
        {
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        },
      );

      SafeLogger.log(`Email verified for user: ${user.email}`, 'AuthService');
      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async resendVerificationEmail(
    dto: ResendVerificationDto,
  ): Promise<{ success: boolean; message: string }> {
    // Always return same response to prevent email enumeration
    const user = await this.usersService.findByEmail(
      dto.email.toLowerCase().trim(),
    );

    if (user && !user.isEmailVerified) {
      const verificationToken = await this.jwtService.signAsync(
        { sub: user.id, email: user.email, type: 'email-verification' },
        { expiresIn: '24h' },
      );
      this.mailService
        .sendEmailVerification(
          user.email,
          user.name || 'User',
          verificationToken,
        )
        .catch(() => {});
    }

    return {
      success: true,
      message:
        'If an account with that email exists and is not yet verified, a new verification link has been sent.',
    };
  }
}
