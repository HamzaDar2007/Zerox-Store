import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { UserAddress } from './entities/address.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
    @InjectRepository(UserAddress) private addressRepo: Repository<UserAddress>,
  ) {}

  async create(dto: Partial<User> & { password?: string }): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already exists');
    if (dto.password) {
      dto.passwordHash = await bcrypt.hash(dto.password, 12);
      delete dto.password;
    }
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: User[]; total: number }> {
    const qb = this.userRepo.createQueryBuilder('u');
    if (options?.search) {
      qb.where(
        'u.email ILIKE :s OR u.firstName ILIKE :s OR u.lastName ILIKE :s',
        { s: `%${options.search}%` },
      );
    }
    const p = options?.page || 1;
    const l = options?.limit || 20;
    qb.skip((p - 1) * l)
      .take(l)
      .orderBy('u.email', 'ASC');
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async update(id: string, dto: Partial<User> & { password?: string }): Promise<User> {
    const user = await this.findOne(id);
    // Check for email uniqueness if email is being changed
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email already exists');
      user.isEmailVerified = false;
    }
    // Hash password if provided
    if (dto.password) {
      dto.passwordHash = await bcrypt.hash(dto.password, 12);
      delete dto.password;
    }
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
  }

  async assignRole(
    userId: string,
    roleId: string,
    grantedBy?: string,
  ): Promise<UserRole> {
    const ur = this.userRoleRepo.create({ userId, roleId, grantedBy });
    return this.userRoleRepo.save(ur);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await this.userRoleRepo.delete({ userId, roleId });
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.userRoleRepo.find({ where: { userId }, relations: ['role'] });
  }

  async createAddress(
    userId: string,
    dto: Partial<UserAddress>,
  ): Promise<UserAddress> {
    const addr = this.addressRepo.create({ ...dto, userId });
    return this.addressRepo.save(addr);
  }

  async getAddresses(userId: string): Promise<UserAddress[]> {
    return this.addressRepo.find({ where: { userId } });
  }

  async updateAddress(
    id: string,
    dto: Partial<UserAddress>,
    callerId?: string,
  ): Promise<UserAddress> {
    const addr = await this.addressRepo.findOne({ where: { id } });
    if (!addr) throw new NotFoundException('Address not found');
    if (callerId && addr.userId !== callerId)
      throw new ForbiddenException('You do not have access to this address');
    Object.assign(addr, dto);
    return this.addressRepo.save(addr);
  }

  async removeAddress(id: string, callerId?: string): Promise<void> {
    const addr = await this.addressRepo.findOne({ where: { id } });
    if (!addr) throw new NotFoundException('Address not found');
    if (callerId && addr.userId !== callerId)
      throw new ForbiddenException('You do not have access to this address');
    await this.addressRepo.remove(addr);
  }
}
