import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/modules/auth/auth.service';
import { UsersService } from 'src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from 'src/modules/auth/entities/refresh-token.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { MailService } from 'src/common/modules/mail/mail.service';
import * as bcrypt from 'bcryptjs';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: any;
  let jwtService: any;
  let refreshTokenRepo: any;
  let userRepo: any;
  let mailService: any;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      updatePassword: jest.fn(),
      findOneWithPermissions: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-token'),
      verifyAsync: jest.fn(),
    };

    refreshTokenRepo = {
      create: jest.fn().mockReturnValue({ refreshToken: 'mock-refresh' }),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    userRepo = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    mailService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
      sendEmailVerification: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordChangedEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepo,
        },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('changePassword', () => {
    it('should change password when current password is correct', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        password: 'hashed-old',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new');

      const result = await service.changePassword('user-1', {
        currentPassword: 'OldPass1!',
        newPassword: 'NewPass1!',
      });

      expect(result.success).toBe(true);
      expect(usersService.updatePassword).toHaveBeenCalledWith(
        'user-1',
        'hashed-new',
      );
      expect(refreshTokenRepo.update).toHaveBeenCalledWith(
        { userId: 'user-1' },
        { isValid: false },
      );
    });

    it('should throw BadRequestException when current password is wrong', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'user-1',
        password: 'hashed-old',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'WrongPass1!',
          newPassword: 'NewPass1!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword('non-existent', {
          currentPassword: 'OldPass1!',
          newPassword: 'NewPass1!',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-1',
        type: 'email-verification',
      });
      userRepo.findOne.mockResolvedValue({
        id: 'user-1',
        isEmailVerified: false,
      });

      const result = await service.verifyEmail({ token: 'valid-token' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email verified successfully');
      expect(userRepo.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        expect.objectContaining({ isEmailVerified: true }),
      );
    });

    it('should return success if already verified', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-1',
        type: 'email-verification',
      });
      userRepo.findOne.mockResolvedValue({
        id: 'user-1',
        isEmailVerified: true,
      });

      const result = await service.verifyEmail({ token: 'valid-token' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email is already verified');
      expect(userRepo.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid token type', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-1',
        type: 'password-reset',
      });

      await expect(
        service.verifyEmail({ token: 'wrong-type-token' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(
        service.verifyEmail({ token: 'expired-token' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should send verification email for unverified user', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        isEmailVerified: false,
      });

      const result = await service.resendVerificationEmail({
        email: 'test@test.com',
      });

      expect(result.success).toBe(true);
      expect(mailService.sendEmailVerification).toHaveBeenCalled();
    });

    it('should NOT send email for already-verified user', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        isEmailVerified: true,
      });

      const result = await service.resendVerificationEmail({
        email: 'test@test.com',
      });

      expect(result.success).toBe(true);
      expect(mailService.sendEmailVerification).not.toHaveBeenCalled();
    });

    it('should NOT reveal if email exists (anti-enumeration)', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.resendVerificationEmail({
        email: 'nobody@test.com',
      });

      expect(result.success).toBe(true);
      expect(mailService.sendEmailVerification).not.toHaveBeenCalled();
    });
  });

  describe('login brute-force protection', () => {
    it('should increment login attempts on failed password', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: 'hashed',
        isActive: true,
        loginAttempts: 2,
        lockedUntil: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(userRepo.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        expect.objectContaining({ loginAttempts: 3 }),
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: 'hashed',
        isActive: true,
        loginAttempts: 4,
        lockedUntil: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(userRepo.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        expect.objectContaining({
          loginAttempts: 5,
          lockedUntil: expect.any(Date),
        }),
      );
    });

    it('should reject login for locked accounts even with wrong password', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: 'hashed',
        isActive: true,
        loginAttempts: 5,
        lockedUntil: new Date(Date.now() + 10 * 60 * 1000),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Wrong password still throws UnauthorizedException (increments attempts further)
      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reset login attempts on successful login', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: 'hashed',
        isActive: true,
        loginAttempts: 3,
        lockedUntil: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      refreshTokenRepo.save.mockResolvedValue({
        refreshToken: 'new-refresh-token',
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'correct',
      });

      expect(result.success).toBe(true);
      expect(userRepo.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        expect.objectContaining({ loginAttempts: 0, lockedUntil: null }),
      );
    });
  });
});
