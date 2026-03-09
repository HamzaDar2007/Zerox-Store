import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * NOTE: This migration has been disabled.
 * Database enums are no longer used - TypeScript enums are now located in src/common/enums/
 *
 * All enums are organized by module:
 * - user.enum.ts - User roles, gender, login status
 * - seller.enum.ts - Seller verification, documents, violations
 * - product.enum.ts - Product status, attributes, warranty
 * - order.enum.ts - Order and order item statuses
 * - payment.enum.ts - Payment methods and statuses
 * - And 17 more module-specific enum files...
 *
 * Import them using: import { UserRole, ProductStatus } from '@common/enums';
 */
export class CreateEcommerceEnums1700000000002 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {
    // Database enums migration disabled - using TypeScript enums instead
    // All enums are now in src/common/enums/ organized by module
    console.log(
      '✓ Enum migration skipped - using TypeScript enums from src/common/enums/',
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No-op - TypeScript enums don't need database cleanup
  }
}
