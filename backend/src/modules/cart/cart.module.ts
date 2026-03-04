import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController, WishlistController, CheckoutController } from './cart.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Wishlist } from './entities/wishlist.entity';
import { CheckoutSession } from './entities/checkout-session.entity';
import { Product } from '../products/entities/product.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      Wishlist,
      CheckoutSession,
      Product,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [CartController, WishlistController, CheckoutController],
  providers: [CartService],
  exports: [CartService, TypeOrmModule],
})
export class CartModule {}
