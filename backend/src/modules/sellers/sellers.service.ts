import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller } from './entities/seller.entity';
import { Store } from './entities/store.entity';
import { NotificationHelperService } from '../notifications/notification-helper.service';
import { enforceOwnerOrAdmin } from '../../common/guards/ownership.helper';
import { MailService } from '../../common/modules/mail/mail.service';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from '../users/entities/user-role.entity';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Seller) private sellerRepo: Repository<Seller>,
    @InjectRepository(Store) private storeRepo: Repository<Store>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
    private notificationHelper: NotificationHelperService,
    private mailService: MailService,
  ) {}

  async createSeller(dto: Partial<Seller>): Promise<Seller> {
    dto.status = dto.status || 'pending';
    dto.commissionRate = dto.commissionRate ?? 10;
    const seller = this.sellerRepo.create(dto);
    const saved = await this.sellerRepo.save(seller);

    // Auto-assign seller role to the user
    if (dto.userId) {
      const sellerRole = await this.roleRepo.findOne({ where: { name: 'seller' } });
      if (sellerRole) {
        const existing = await this.userRoleRepo.findOne({
          where: { userId: dto.userId, roleId: sellerRole.id },
        });
        if (!existing) {
          const userRole = this.userRoleRepo.create({
            userId: dto.userId,
            roleId: sellerRole.id,
          });
          await this.userRoleRepo.save(userRole);
        }
      }
    }

    return saved;
  }

  private static readonly PUBLIC_SELLER_FIELDS: (keyof Seller)[] = [
    'id',
    'userId',
    'displayName',
    'status',
    'user',
  ];

  async findAllSellers(page = 1, limit = 20): Promise<Partial<Seller>[]> {
    const sellers = await this.sellerRepo.find({
      relations: ['user'],
      take: limit,
      skip: (page - 1) * limit,
    });
    return sellers.map((s) => this.stripSensitiveFields(s));
  }

  private stripSensitiveFields(seller: Seller): Partial<Seller> {
    const safe: any = {};
    for (const f of SellersService.PUBLIC_SELLER_FIELDS) {
      if ((seller as any)[f] !== undefined) safe[f] = (seller as any)[f];
    }
    if (safe.user) {
      const { passwordHash, ...userSafe } = safe.user;
      safe.user = userSafe;
    }
    return safe;
  }

  private async findSellerEntity(id: string): Promise<Seller> {
    const s = await this.sellerRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!s) throw new NotFoundException('Seller not found');
    return s;
  }

  async findSeller(id: string): Promise<Partial<Seller>> {
    const s = await this.findSellerEntity(id);
    return this.stripSensitiveFields(s);
  }

  async updateSeller(
    id: string,
    dto: Partial<Seller>,
    callerId?: string,
    callerRole?: string,
  ): Promise<Seller> {
    const s = await this.findSellerEntity(id);
    if (callerId) enforceOwnerOrAdmin(callerId, callerRole, s.userId);
    Object.assign(s, dto);
    const saved = await this.sellerRepo.save(s);

    if ((dto as any).status === 'approved' && s.userId) {
      this.notificationHelper
        .notify(s.userId, 'SELLER_APPROVED', {})
        .catch(() => {});
      // Send seller approved email
      if (s.user?.email) {
        this.mailService
          .sendSellerVerificationEmail(
            s.user.email,
            s.user.firstName || s.displayName || 'Seller',
            'approved',
          )
          .catch(() => {});
      }
    }

    return saved;
  }

  async removeSeller(id: string): Promise<void> {
    const s = await this.findSellerEntity(id);
    await this.sellerRepo.remove(s);
  }

  async approveSeller(id: string, approvedBy: string): Promise<Seller> {
    const s = await this.findSellerEntity(id);
    s.status = 'approved';
    s.approvedBy = approvedBy;
    const saved = await this.sellerRepo.save(s);

    if (s.userId) {
      this.notificationHelper
        .notify(s.userId, 'SELLER_APPROVED', {})
        .catch(() => {});
      if (s.user?.email) {
        this.mailService
          .sendSellerVerificationEmail(
            s.user.email,
            s.user.firstName || s.displayName || 'Seller',
            'approved',
          )
          .catch(() => {});
      }
    }

    return saved;
  }

  async createStore(dto: Partial<Store>): Promise<Store> {
    const store = this.storeRepo.create(dto);
    return this.storeRepo.save(store);
  }

  async createStoreForUser(
    userId: string,
    dto: Partial<Store>,
  ): Promise<Store> {
    const seller = await this.sellerRepo.findOne({ where: { userId } });
    if (!seller)
      throw new NotFoundException('Seller profile not found for this user');
    const store = this.storeRepo.create({ ...dto, sellerId: seller.id });
    return this.storeRepo.save(store);
  }

  async findAllStores(page = 1, limit = 20): Promise<Store[]> {
    return this.storeRepo.find({
      relations: ['seller'],
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findStore(id: string): Promise<Store> {
    const s = await this.storeRepo.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!s) throw new NotFoundException('Store not found');
    return s;
  }

  async findStoreBySlug(slug: string): Promise<Store> {
    const s = await this.storeRepo.findOne({
      where: { slug },
      relations: ['seller'],
    });
    if (!s) throw new NotFoundException('Store not found');
    return s;
  }

  async updateStore(
    id: string,
    dto: Partial<Store>,
    callerId?: string,
    callerRole?: string,
  ): Promise<Store> {
    const s = await this.findStore(id);
    if (callerId && s.seller)
      enforceOwnerOrAdmin(callerId, callerRole, s.seller.userId);
    Object.assign(s, dto);
    return this.storeRepo.save(s);
  }

  async removeStore(
    id: string,
    callerId?: string,
    callerRole?: string,
  ): Promise<void> {
    const s = await this.findStore(id);
    if (callerId && s.seller)
      enforceOwnerOrAdmin(callerId, callerRole, s.seller.userId);
    await this.storeRepo.remove(s);
  }
}
