import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  module: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
