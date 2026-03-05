import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStripeColumns1700000000030 implements MigrationInterface {
  name = 'AddStripeColumns1700000000030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add Stripe columns to subscriptions table
    const hasTable = await queryRunner.hasTable('subscriptions');
    if (hasTable) {
      const table = await queryRunner.getTable('subscriptions');

      if (!table?.findColumnByName('stripe_subscription_id')) {
        await queryRunner.addColumn(
          'subscriptions',
          new TableColumn({
            name: 'stripe_subscription_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          }),
        );
      }

      if (!table?.findColumnByName('stripe_customer_id')) {
        await queryRunner.addColumn(
          'subscriptions',
          new TableColumn({
            name: 'stripe_customer_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          }),
        );
      }

      if (!table?.findColumnByName('stripe_price_id')) {
        await queryRunner.addColumn(
          'subscriptions',
          new TableColumn({
            name: 'stripe_price_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          }),
        );
      }
    }

    // Add 'stripe' to payment_method enum if it doesn't exist (for payments & saved_payment_methods)
    await queryRunner.query(`
      DO $$ BEGIN
        -- Check if 'stripe' already exists in the payment_method_enum type
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'stripe'
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_method_enum')
        ) THEN
          ALTER TYPE payment_method_enum ADD VALUE IF NOT EXISTS 'stripe';
        END IF;
      EXCEPTION
        WHEN others THEN NULL;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('subscriptions');
    if (hasTable) {
      const table = await queryRunner.getTable('subscriptions');
      if (table?.findColumnByName('stripe_price_id')) {
        await queryRunner.dropColumn('subscriptions', 'stripe_price_id');
      }
      if (table?.findColumnByName('stripe_customer_id')) {
        await queryRunner.dropColumn('subscriptions', 'stripe_customer_id');
      }
      if (table?.findColumnByName('stripe_subscription_id')) {
        await queryRunner.dropColumn('subscriptions', 'stripe_subscription_id');
      }
    }
    // Note: PostgreSQL does not natively support removing enum values.
  }
}
