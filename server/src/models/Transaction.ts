import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { License } from './License';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum TransactionType {
  LICENSE_PURCHASE = 'license_purchase',
  LICENSE_RENEWAL = 'license_renewal',
  COMMISSION_PAYOUT = 'commission_payout',
  REFUND = 'refund',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  licenseId: string | null;

  @ManyToOne(() => License, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'licenseId' })
  license: License | null;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  agentId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'agentId' })
  agent: User | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  commissionAmount: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  commissionRate: number | null;

  @Column({ type: 'boolean', default: false })
  commissionPaid: boolean;

  @Column({ type: 'timestamp', nullable: true })
  commissionPaidAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
