import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('attribute_keys')
export class AttributeKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 200, unique: true })
  slug: string;

  @Column({ name: 'input_type', type: 'varchar', length: 30 })
  inputType: string;
}
