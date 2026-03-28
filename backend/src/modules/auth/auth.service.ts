import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthSession } from './entities/auth-session.entity';
import { AuthToken } from './entities/auth-token.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.entity';
import * as crypto from 'crypto';
import { NotificationHelperService } from '../notifications/notification-helper.service';
import { MailService } from '../../common/modules/mail/mail.service';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthSession) private sessionRepo: Repository<AuthSession>,
    @InjectRepository(AuthToken) private tokenRepo: Repository<AuthToken>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
    private jwtService: JwtService,
    private dataSource: DataSource,
    private notificationHelper: NotificationHelperService,
    private mailService: MailService,
  ) {}

  async register(dto: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
    const saved = await this.userRepo.save(user);

    // Send email verification token
    const rawVerifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenHash = crypto
      .createHash('sha256')
      .update(rawVerifyToken)
      .digest('hex');
    const verifyExpiresAt = new Date();
    verifyExpiresAt.setHours(verifyExpiresAt.getHours() + 24);
    const verifyToken = this.tokenRepo.create({
      userId: saved.id,
      tokenHash: verifyTokenHash,
      type: 'email_verification',
      expiresAt: verifyExpiresAt,
    });
    await this.tokenRepo.save(verifyToken);

    this.notificationHelper
      .notify(saved.id, 'WELCOME', { userName: dto.firstName || dto.email })
      .catch(() => {});
    this.mailService
      .sendWelcomeEmail(dto.firstName || 'User', dto.email)
      .catch(() => {});
    this.mailService
      .sendEmailVerification(dto.email, dto.firstName || 'User', rawVerifyToken)
      .catch(() => {});
    return { id: saved.id, email: saved.email };
  }

  async verifyEmail(tokenStr: string) {
    return this.dataSource.transaction(async (em) => {
      const tokenHash = crypto
        .createHash('sha256')
        .update(tokenStr)
        .digest('hex');
      const authToken = await em.findOne(AuthToken, {
        where: { tokenHash, type: 'email_verification' },
      });
      if (!authToken || authToken.usedAt || authToken.expiresAt < new Date()) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      const user = await em.findOne(User, { where: { id: authToken.userId } });
      if (!user) throw new NotFoundException('User not found');

      user.isEmailVerified = true;
      await em.save(user);

      authToken.usedAt = new Date();
      await em.save(authToken);

      return { message: 'Email verified successfully' };
    });
  }

  async login(
    email: string,
    password: string,
    meta?: { ip?: string; userAgent?: string },
  ) {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email })
      .getOne();
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is disabled');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const session = this.sessionRepo.create({
      userId: user.id,
      refreshToken: refreshTokenHash,
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
      expiresAt,
    });
    await this.sessionRepo.save(session);

    // Load user roles to include in response
    const userRoles = await this.userRoleRepo.find({
      where: { userId: user.id },
      relations: ['role'],
    });

    const ROLE_PRIORITY: Record<string, number> = {
      super_admin: 4,
      admin: 3,
      seller: 2,
      customer: 1,
    };
    const topRole =
      userRoles
        .map((ur) => ur.role?.name)
        .filter(Boolean)
        .sort(
          (a, b) => (ROLE_PRIORITY[b!] ?? 0) - (ROLE_PRIORITY[a!] ?? 0),
        )[0] ?? null;

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        role: topRole,
        roles: userRoles.map((ur) => ({
          id: ur.roleId,
          roleId: ur.roleId,
          role: ur.role ? { id: ur.role.id, name: ur.role.name } : undefined,
          grantedAt: ur.grantedAt,
        })),
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);

    return this.dataSource.transaction(async (em) => {
      const session = await em.findOne(AuthSession, {
        where: { refreshToken: tokenHash },
        relations: ['user'],
      });
      if (!session || session.revokedAt || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      session.revokedAt = new Date();
      await em.save(session);

      const newRefreshToken = crypto.randomBytes(32).toString('hex');
      const newTokenHash = hashToken(newRefreshToken);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const newSession = em.create(AuthSession, {
        userId: session.userId,
        refreshToken: newTokenHash,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        expiresAt,
      });
      await em.save(newSession);

      const payload = { sub: session.user.id, email: session.user.email };
      const accessToken = this.jwtService.sign(payload);

      return { accessToken, refreshToken: newRefreshToken };
    });
  }

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const session = await this.sessionRepo.findOne({
      where: { refreshToken: tokenHash },
    });
    if (session) {
      session.revokedAt = new Date();
      await this.sessionRepo.save(session);
    }
    return { message: 'Logged out' };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id: userId })
      .getOne();
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid)
      throw new UnauthorizedException('Current password is incorrect');

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepo.save(user);

    // Revoke all active sessions after password change
    await this.sessionRepo
      .createQueryBuilder()
      .update(AuthSession)
      .set({ revokedAt: new Date() })
      .where('userId = :userId AND revokedAt IS NULL', { userId })
      .execute();

    this.notificationHelper
      .notify(userId, 'PASSWORD_CHANGED', {})
      .catch(() => {});
    this.mailService
      .sendPasswordChangedEmail(user.email, user.firstName || 'User')
      .catch(() => {});
    return { message: 'Password changed' };
  }

  async createPasswordResetToken(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user)
      return { message: 'If the email exists, a reset link has been sent' };

    const raw = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const token = this.tokenRepo.create({
      userId: user.id,
      tokenHash,
      type: 'password_reset',
      expiresAt,
    });
    await this.tokenRepo.save(token);

    this.mailService
      .sendPasswordResetEmail(user.email, user.firstName || 'User', raw)
      .catch(() => {});

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(tokenStr: string, newPassword: string) {
    return this.dataSource.transaction(async (em) => {
      const tokenHash = crypto
        .createHash('sha256')
        .update(tokenStr)
        .digest('hex');
      const authToken = await em.findOne(AuthToken, {
        where: { tokenHash, type: 'password_reset' },
      });
      if (!authToken || authToken.usedAt || authToken.expiresAt < new Date()) {
        throw new BadRequestException('Invalid or expired token');
      }

      const user = await em.findOne(User, { where: { id: authToken.userId } });
      if (!user) throw new NotFoundException('User not found');

      user.passwordHash = await bcrypt.hash(newPassword, 12);
      await em.save(user);

      authToken.usedAt = new Date();
      await em.save(authToken);

      // Revoke all active sessions after password reset
      await em
        .createQueryBuilder()
        .update(AuthSession)
        .set({ revokedAt: new Date() })
        .where('userId = :userId AND revokedAt IS NULL', {
          userId: user.id,
        })
        .execute();

      return { message: 'Password reset successful' };
    });
  }
}
