import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuthModule } from './modules/auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import databaseConfig from './config/database.config';
import { PermissionsModule } from './modules/permissions/permissions.module';

// Global Guards and Interceptors

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RolePermissionsModule } from './modules/role-permissions/role-permissions.module';
import { SharedModule } from './modules/shared/shared.module';
import { GuardsModule } from './common/modules/guards.module';

// Feature Modules
import { CartModule } from './modules/cart/cart.module';
import { ChatModule } from './modules/chat/chat.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { I18nModule } from './modules/i18n/i18n.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { CmsModule } from './modules/cms/cms.module';
import { TaxModule } from './modules/tax/tax.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { SystemModule } from './modules/system/system.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { SearchModule } from './modules/search/search.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ProductsModule } from './modules/products/products.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SeoModule } from './modules/seo/seo.module';
import { OperationsModule } from './modules/operations/operations.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BundlesModule } from './modules/bundles/bundles.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { AuditModule } from './modules/audit/audit.module';
import { MailModule } from './common/modules/mail/mail.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
      expandVariables: true,
    }),

    // Database Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL', 60000), // 1 minute
            limit: config.get<number>('THROTTLE_LIMIT', 100), // 100 requests
          },
        ],
      }),
    }),
    // Core modules
    MailModule,
    GuardsModule,
    SharedModule,
    UsersModule,
    RolesModule,
    AuthModule,
    PermissionsModule,
    RolePermissionsModule,

    // Feature modules
    CartModule,
    ChatModule,
    CategoriesModule,
    I18nModule,
    DisputesModule,
    CmsModule,
    TaxModule,
    ShippingModule,
    SubscriptionsModule,
    SystemModule,
    TicketsModule,
    SearchModule,
    SellersModule,
    ReviewsModule,
    ProductsModule,
    ReturnsModule,
    OrdersModule,
    PaymentsModule,
    SeoModule,
    OperationsModule,
    MarketingModule,
    NotificationsModule,
    BundlesModule,
    InventoryModule,
    LoyaltyModule,
    AuditModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [
    // Global Rate Limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // Global Authentication Guard (Optional - Uncomment if needed)
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },

    // Global Roles Guard (Optional - Uncomment if needed)
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },

    // Global Permissions Guard (Optional - Uncomment if needed)
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionsGuard,
    // },

    // Global Response Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {}
