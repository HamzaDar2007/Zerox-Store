import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEcommerceUtilityFunctions1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_generate_slug(input_text TEXT)
      RETURNS TEXT AS $$
      BEGIN
          RETURN LOWER(
              REGEXP_REPLACE(
                  REGEXP_REPLACE(
                      REGEXP_REPLACE(TRIM(input_text), '[^\\w\\s-]', '', 'g'),
                      '\\s+', '-', 'g'
                  ),
                  '-+', '-', 'g'
              )
          );
      END;
      $$ LANGUAGE plpgsql IMMUTABLE
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_generate_order_number()
      RETURNS TEXT AS $$
      BEGIN
          RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_generate_refund_number()
      RETURNS TEXT AS $$
      BEGIN
          RETURN 'RFN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('refund_number_seq')::TEXT, 6, '0');
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_generate_ticket_number()
      RETURNS TEXT AS $$
      BEGIN
          RETURN 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('ticket_number_seq')::TEXT, 6, '0');
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_generate_return_number()
      RETURNS TEXT AS $$
      BEGIN
          RETURN 'RET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('return_number_seq')::TEXT, 6, '0');
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_generate_dispute_number()
      RETURNS TEXT AS $$
      BEGIN
          RETURN 'DSP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('dispute_number_seq')::TEXT, 6, '0');
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_is_valid_email(email TEXT)
      RETURNS BOOLEAN AS $$
      BEGIN
          RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';
      END;
      $$ LANGUAGE plpgsql IMMUTABLE
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_calc_percentage(amount DECIMAL, percentage DECIMAL)
      RETURNS DECIMAL AS $$
      BEGIN
          RETURN ROUND((amount * percentage / 100), 2);
      END;
      $$ LANGUAGE plpgsql IMMUTABLE
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_current_user_id()
      RETURNS UUID AS $$
      BEGIN
          RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
      EXCEPTION WHEN OTHERS THEN
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql STABLE
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_current_seller_id()
      RETURNS UUID AS $$
      BEGIN
          RETURN NULLIF(current_setting('app.current_seller_id', TRUE), '')::UUID;
      EXCEPTION WHEN OTHERS THEN
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql STABLE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_current_seller_id()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_current_user_id()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_calc_percentage(DECIMAL, DECIMAL)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_is_valid_email(TEXT)`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_update_timestamp()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_generate_dispute_number()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_generate_return_number()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_generate_ticket_number()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_generate_refund_number()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_generate_order_number()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_generate_slug(TEXT)`);
  }
}
