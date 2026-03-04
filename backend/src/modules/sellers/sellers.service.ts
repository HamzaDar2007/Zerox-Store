import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller } from './entities/seller.entity';
import { Store } from './entities/store.entity';
import { SellerDocument } from './entities/seller-document.entity';
import { SellerWallet } from './entities/seller-wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { SellerViolation } from './entities/seller-violation.entity';
import { StoreFollower } from './entities/store-follower.entity';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { CreateSellerDocumentDto } from './dto/create-seller-document.dto';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import { VerificationStatus } from '@common/enums';
import { MailService } from '../../common/modules/mail/mail.service';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(SellerDocument)
    private documentRepository: Repository<SellerDocument>,
    @InjectRepository(SellerWallet)
    private walletRepository: Repository<SellerWallet>,
    @InjectRepository(WalletTransaction)
    private transactionRepository: Repository<WalletTransaction>,
    @InjectRepository(SellerViolation)
    private violationRepository: Repository<SellerViolation>,
    @InjectRepository(StoreFollower)
    private followerRepository: Repository<StoreFollower>,
    private readonly mailService: MailService,
  ) {}

  // ==================== SELLER CRUD ====================

  async createSeller(dto: CreateSellerDto, userId: string): Promise<ServiceResponse<Seller>> {
    const existingSeller = await this.sellerRepository.findOne({
      where: { userId },
    });

    if (existingSeller) {
      throw new ConflictException('User is already registered as a seller');
    }

    const seller = new Seller();
    Object.assign(seller, {
      ...dto,
      userId,
      verificationStatus: VerificationStatus.PENDING,
    });

    const savedSeller = await this.sellerRepository.save(seller);

    // Create default wallet for seller
    const wallet = new SellerWallet();
    Object.assign(wallet, {
      sellerId: savedSeller.id,
      balance: 0,
      pendingBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
    });
    await this.walletRepository.save(wallet);

    // Send seller application emails (fire-and-forget)
    this.sendSellerRegistrationEmails(savedSeller).catch(() => {});

    return {
      success: true,
      message: 'Seller registered successfully',
      data: savedSeller,
    };
  }

  async findAllSellers(): Promise<ServiceResponse<Seller[]>> {
    const sellers = await this.sellerRepository.find({
      relations: ['user', 'stores'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Sellers retrieved successfully',
      data: sellers,
    };
  }

  async findOneSeller(id: string): Promise<ServiceResponse<Seller>> {
    const seller = await this.sellerRepository.findOne({
      where: { id },
      relations: ['user', 'stores', 'wallet', 'documents'],
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return {
      success: true,
      message: 'Seller retrieved successfully',
      data: seller,
    };
  }

  async findSellerByUserId(userId: string): Promise<Seller | null> {
    return this.sellerRepository.findOne({
      where: { userId },
      relations: ['stores', 'wallet'],
    });
  }

  async updateSeller(id: string, dto: UpdateSellerDto): Promise<ServiceResponse<Seller>> {
    const seller = await this.sellerRepository.findOne({ where: { id } });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    Object.assign(seller, dto);
    const updatedSeller = await this.sellerRepository.save(seller);

    return {
      success: true,
      message: 'Seller updated successfully',
      data: updatedSeller,
    };
  }

  async removeSeller(id: string): Promise<ServiceResponse<void>> {
    const seller = await this.sellerRepository.findOne({ where: { id } });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    await this.sellerRepository.remove(seller);

    return {
      success: true,
      message: 'Seller deleted successfully',
    };
  }

  async verifySeller(
    id: string,
    status: VerificationStatus,
    verifiedBy: string,
    rejectionReason?: string,
  ): Promise<ServiceResponse<Seller>> {
    const seller = await this.sellerRepository.findOne({ where: { id } });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    seller.verificationStatus = status;
    seller.verifiedBy = verifiedBy;

    if (status === VerificationStatus.APPROVED) {
      seller.verifiedAt = new Date();
    } else if (status === VerificationStatus.REJECTED && rejectionReason) {
      seller.rejectionReason = rejectionReason;
    }

    const updatedSeller = await this.sellerRepository.save(seller);

    // Send seller verification email (fire-and-forget)
    this.sendSellerVerificationNotification(updatedSeller).catch(() => {});

    return {
      success: true,
      message: `Seller ${status.toLowerCase()} successfully`,
      data: updatedSeller,
    };
  }

  // ==================== STORE CRUD ====================

  async createStore(sellerId: string, dto: CreateStoreDto): Promise<ServiceResponse<Store>> {
    const seller = await this.sellerRepository.findOne({ where: { id: sellerId } });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const existingStore = await this.storeRepository.findOne({
      where: { slug: dto.slug },
    });

    if (existingStore) {
      throw new ConflictException('Store with this slug already exists');
    }

    const store = new Store();
    Object.assign(store, {
      ...dto,
      sellerId,
    });

    const savedStore = await this.storeRepository.save(store);

    return {
      success: true,
      message: 'Store created successfully',
      data: savedStore,
    };
  }

  async findAllStores(): Promise<ServiceResponse<Store[]>> {
    const stores = await this.storeRepository.find({
      relations: ['seller'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Stores retrieved successfully',
      data: stores,
    };
  }

  async findOneStore(id: string): Promise<ServiceResponse<Store>> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['seller'],
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return {
      success: true,
      message: 'Store retrieved successfully',
      data: store,
    };
  }

  async findStoreBySlug(slug: string): Promise<ServiceResponse<Store>> {
    const store = await this.storeRepository.findOne({
      where: { slug },
      relations: ['seller'],
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return {
      success: true,
      message: 'Store retrieved successfully',
      data: store,
    };
  }

  async updateStore(id: string, dto: UpdateStoreDto): Promise<ServiceResponse<Store>> {
    const store = await this.storeRepository.findOne({ where: { id } });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    Object.assign(store, dto);
    const updatedStore = await this.storeRepository.save(store);

    return {
      success: true,
      message: 'Store updated successfully',
      data: updatedStore,
    };
  }

  async removeStore(id: string): Promise<ServiceResponse<void>> {
    const store = await this.storeRepository.findOne({ where: { id } });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    await this.storeRepository.remove(store);

    return {
      success: true,
      message: 'Store deleted successfully',
    };
  }

  // ==================== DOCUMENTS ====================

  async addDocument(sellerId: string, dto: CreateSellerDocumentDto): Promise<ServiceResponse<SellerDocument>> {
    const seller = await this.sellerRepository.findOne({ where: { id: sellerId } });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const document = new SellerDocument();
    Object.assign(document, {
      ...dto,
      sellerId,
    });

    const savedDocument = await this.documentRepository.save(document);

    return {
      success: true,
      message: 'Document uploaded successfully',
      data: savedDocument,
    };
  }

  async getSellerDocuments(sellerId: string): Promise<ServiceResponse<SellerDocument[]>> {
    const documents = await this.documentRepository.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Documents retrieved successfully',
      data: documents,
    };
  }

  // ==================== WALLET ====================

  async getSellerWallet(sellerId: string): Promise<ServiceResponse<SellerWallet>> {
    const wallet = await this.walletRepository.findOne({
      where: { sellerId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      success: true,
      message: 'Wallet retrieved successfully',
      data: wallet,
    };
  }

  async getWalletTransactions(sellerId: string): Promise<ServiceResponse<WalletTransaction[]>> {
    const wallet = await this.walletRepository.findOne({ where: { sellerId } });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const transactions = await this.transactionRepository.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      message: 'Transactions retrieved successfully',
      data: transactions,
    };
  }

  // ==================== FOLLOWERS ====================

  async followStore(storeId: string, userId: string): Promise<ServiceResponse<StoreFollower>> {
    const store = await this.storeRepository.findOne({ where: { id: storeId } });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const existingFollow = await this.followerRepository.findOne({
      where: { storeId, userId },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this store');
    }

    const follower = new StoreFollower();
    Object.assign(follower, {
      storeId,
      userId,
    });

    const savedFollower = await this.followerRepository.save(follower);

    // Update follower count
    await this.storeRepository.increment({ id: storeId }, 'totalFollowers', 1);

    return {
      success: true,
      message: 'Store followed successfully',
      data: savedFollower,
    };
  }

  async unfollowStore(storeId: string, userId: string): Promise<ServiceResponse<void>> {
    const follower = await this.followerRepository.findOne({
      where: { storeId, userId },
    });

    if (!follower) {
      throw new NotFoundException('Not following this store');
    }

    await this.followerRepository.remove(follower);

    // Update follower count
    await this.storeRepository.decrement({ id: storeId }, 'totalFollowers', 1);

    return {
      success: true,
      message: 'Store unfollowed successfully',
    };
  }

  private async sendSellerRegistrationEmails(seller: Seller): Promise<void> {
    try {
      const full = await this.sellerRepository.findOne({
        where: { id: seller.id },
        relations: ['user'],
      });
      if (!full?.user?.email) return;
      await this.mailService.sendSellerApplicationReceivedEmail(
        full.user.email, full.user.name || 'Seller',
      );
      this.mailService.sendAdminNewSellerAlert(
        full.businessName || full.user.name || 'Seller', full.user.email,
      ).catch(() => {});
    } catch (_) { /* silently ignore */ }
  }

  private async sendSellerVerificationNotification(seller: Seller): Promise<void> {
    try {
      const full = await this.sellerRepository.findOne({
        where: { id: seller.id },
        relations: ['user'],
      });
      if (!full?.user?.email) return;
      await this.mailService.sendSellerVerificationEmail(
        full.user.email, full.user.name || 'Seller',
        full.verificationStatus, full.rejectionReason,
      );
    } catch (_) { /* silently ignore */ }
  }
}
