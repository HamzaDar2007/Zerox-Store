import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import {
  CartController,
  WishlistController,
  CouponsController,
  FlashSalesController,
} from './cart.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Coupon } from './entities/coupon.entity';
import { CouponScope } from './entities/coupon-scope.entity';
import { FlashSale } from './entities/flash-sale.entity';
import { FlashSaleItem } from './entities/flash-sale-item.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      Wishlist,
      WishlistItem,
      Coupon,
      CouponScope,
      FlashSale,
      FlashSaleItem,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [CartController, WishlistController, CouponsController, FlashSalesController],
  providers: [CartService],
  exports: [CartService, TypeOrmModule],
})
export class CartModule {}
